import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CollectionConfig, Config, Payload } from 'payload'

const { revalidateTag } = vi.hoisted(() => ({ revalidateTag: vi.fn() }))

vi.mock('next/cache', () => ({ revalidateTag }))

import { payloadNextCacheTags } from './index'

// Authors → posts comes from the schema; posts → settings is explicit.
const createConfig = (): Config =>
  payloadNextCacheTags({
    dependencies: {
      'global:site-settings': ['collection:posts'],
    },
  })({
    collections: [
      { slug: 'authors', fields: [] },
      {
        slug: 'posts',
        versions: { drafts: true },
        fields: [
          {
            type: 'group',
            fields: [{ name: 'author', relationTo: 'authors', type: 'relationship' }],
          },
        ],
      },
    ],
    globals: [{ slug: 'site-settings', fields: [] }],
  } as never) as Config

/** Finds a fixture collection, failing explicitly if the test setup is missing it. */
const collectionBySlug = (config: Config, slug: string) => {
  const collection = config.collections?.find((candidate) => candidate.slug === slug)
  if (!collection) throw new Error(`Missing test collection: ${slug}`)
  return collection
}

/** Exercises the collection adapter with a completed update event. */
function finishUpdate(collection: CollectionConfig, data = {}, draft = false) {
  return collection.hooks?.afterOperation?.at(-1)?.({
    collection,
    operation: 'updateByID',
    args: { data, draft },
    result: data,
  } as never)
}

describe('payloadNextCacheTags', () => {
  beforeEach(() => revalidateTag.mockReset())

  it('installs a read-only source-tag method during Payload initialization', async () => {
    const config = createConfig()
    const payload = {} as Payload

    await config.onInit?.(payload)

    expect(
      payload.getCacheTags(
        { collection: 'posts' },
        { collection: 'posts' },
        { global: 'site-settings' },
      ),
    ).toEqual(['collection:posts', 'global:site-settings'])
    expect(() => Object.assign(payload, { getCacheTags: () => [] })).toThrow()
  })

  it('invalidates the changed source and transitive dependents after a public change', () => {
    const config = createConfig()
    const authors = collectionBySlug(config, 'authors')
    finishUpdate(authors)

    expect(revalidateTag).toHaveBeenCalledTimes(3)
    expect(revalidateTag).toHaveBeenCalledWith('collection:authors', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('collection:posts', 'max')
    expect(revalidateTag).toHaveBeenCalledWith('global:site-settings', 'max')
  })

  it('does not invalidate an unpublished draft save, but does invalidate publication', () => {
    const config = createConfig()
    const posts = collectionBySlug(config, 'posts')
    finishUpdate(posts, { _status: 'draft' }, true)
    expect(revalidateTag).not.toHaveBeenCalled()

    finishUpdate(posts, { _status: 'published' }, true)
    expect(revalidateTag).toHaveBeenCalledWith('collection:posts', 'max')
  })

  it('validates explicit dependency identifiers', () => {
    expect(() =>
      payloadNextCacheTags({
        dependencies: { 'collection:posts': ['collection:not-configured'] },
      })({
        collections: [{ slug: 'posts', fields: [] }],
      } as never),
    ).toThrow('Unknown cache-tag dependency source: collection:not-configured')
  })

  it('preserves existing hooks and makes tags available to the original initializer', async () => {
    const afterChange = vi.fn()
    const afterOperation = vi.fn()
    const onInit = vi.fn((payload: Payload) => {
      expect(payload.getCacheTags({ collection: 'authors' })).toEqual(['collection:authors'])
    })
    const config = payloadNextCacheTags()({
      collections: [
        {
          slug: 'authors',
          fields: [],
          hooks: { afterChange: [afterChange], afterOperation: [afterOperation] },
        },
      ],
      onInit,
    } as never) as Config
    const authors = collectionBySlug(config, 'authors')

    expect(authors.hooks?.afterChange?.[0]).toBe(afterChange)
    expect(authors.hooks?.afterChange).toHaveLength(1)
    expect(authors.hooks?.afterOperation?.[0]).toBe(afterOperation)
    expect(authors.hooks?.afterOperation).toHaveLength(2)
    expect(payloadNextCacheTags()(config)).toBe(config)
    expect(authors.hooks?.afterChange).toHaveLength(1)
    expect(authors.hooks?.afterOperation?.[0]).toBe(afterOperation)
    expect(authors.hooks?.afterOperation).toHaveLength(2)

    const payload = {} as Payload
    await config.onInit?.(payload)
    expect(onInit).toHaveBeenCalledWith(payload)
  })

  it('excludes write hooks without excluding tags or dependency edges', async () => {
    const config = payloadNextCacheTags({ exclude: { collections: ['posts'] } })({
      collections: [
        { slug: 'authors', fields: [] },
        {
          slug: 'posts',
          fields: [{ name: 'author', type: 'relationship', relationTo: 'authors' }],
        },
      ],
    } as never) as Config
    const payload = {} as Payload
    await config.onInit?.(payload)

    expect(collectionBySlug(config, 'posts').hooks).toBeUndefined()
    expect(payload.getCacheTags({ collection: 'posts' })).toEqual(['collection:posts'])

    const doc = { id: 'deleted-author' }
    const authors = collectionBySlug(config, 'authors')
    expect(authors.hooks?.afterDelete?.at(-1)?.({ doc } as never)).toBe(doc)
    expect(revalidateTag.mock.calls).toEqual([
      ['collection:authors', 'max'],
      ['collection:posts', 'max'],
    ])
  })

  it('preserves a global result while invalidating its dependents', () => {
    const config = payloadNextCacheTags({
      dependencies: { 'collection:posts': ['global:site-settings'] },
    })({
      collections: [{ slug: 'posts', fields: [] }],
      globals: [{ slug: 'site-settings', fields: [] }],
    } as never) as Config
    const hooks = config.globals?.[0].hooks
    const context = {}
    const doc = { title: 'Settings' }

    hooks?.beforeOperation?.at(-1)?.({ args: {}, req: { context } } as never)
    expect(hooks?.afterChange?.at(-1)?.({ doc, req: { context } } as never)).toBe(doc)
    expect(revalidateTag.mock.calls).toEqual([
      ['global:site-settings', 'max'],
      ['collection:posts', 'max'],
    ])
  })
})
