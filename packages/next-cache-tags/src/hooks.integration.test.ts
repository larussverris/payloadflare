import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createLocalReq,
  restoreVersionOperation,
  restoreVersionOperationGlobal,
  updateOperationGlobal,
  type PayloadRequest,
} from 'payload'

const { revalidateTag } = vi.hoisted(() => ({ revalidateTag: vi.fn() }))
vi.mock('next/cache', () => ({ revalidateTag }))

import { createTestFixture } from './test-fixture'

let fixture: Awaited<ReturnType<typeof createTestFixture>>

/** Creates a public post, then clears the setup's invalidation calls. */
async function createPublishedPost() {
  const post = await fixture.payload.create({
    collection: 'posts',
    data: { title: 'Original', _status: 'published' },
  })
  revalidateTag.mockClear()
  return post
}

/** Asserts exact delivery so duplicate or unrelated invalidations cannot go unnoticed. */
function expectTags(...tags: string[]) {
  expect(revalidateTag.mock.calls).toEqual(tags.map((tag) => [tag, 'max']))
}

describe.sequential('draft hooks with real Payload operations', () => {
  beforeAll(async () => {
    fixture = await createTestFixture()
  }, 30000)

  afterAll(async () => {
    await fixture?.close()
  })

  beforeEach(async () => {
    delete fixture.hooks.postBeforeChange
    delete fixture.hooks.settingsBeforeChange
    await fixture.payload.updateGlobal({
      slug: 'settings',
      data: { title: 'Original', _status: 'published' },
    })
    revalidateTag.mockClear()
  })

  it.each([false, true])(
    'keeps a published post unchanged on a draft save (autosave: %s)',
    async (autosave) => {
      const post = await createPublishedPost()
      await fixture.payload.update({
        collection: 'posts',
        id: post.id,
        draft: true,
        autosave,
        data: { title: 'Revision', _status: 'draft' },
      })

      expectTags()
      const published = await fixture.payload.findByID({
        collection: 'posts',
        id: post.id,
        draft: false,
      })
      const draft = await fixture.payload.findByID({
        collection: 'posts',
        id: post.id,
        draft: true,
      })
      expect(published.title).toBe('Original')
      expect(draft.title).toBe('Revision')
    },
  )

  it('skips an initial draft and invalidates an initial published post', async () => {
    await fixture.payload.create({ collection: 'posts', draft: true, data: { title: 'Draft' } })
    expectTags()
    await fixture.payload.create({
      collection: 'posts',
      data: { title: 'Public', _status: 'published' },
    })
    expectTags('collection:posts')
  })

  it.each([false, true])('invalidates publication even with draft: %s', async (draft) => {
    const post = await createPublishedPost()
    await fixture.payload.update({
      collection: 'posts',
      id: post.id,
      draft,
      data: { title: 'Published revision', _status: 'published' },
    })
    expectTags('collection:posts')
    const published = await fixture.payload.findByID({
      collection: 'posts',
      id: post.id,
      draft: false,
    })
    expect(published.title).toBe('Published revision')
  })

  it('invalidates unpublishing after a newer post draft was saved', async () => {
    const post = await createPublishedPost()
    await fixture.payload.update({
      collection: 'posts',
      id: post.id,
      draft: true,
      data: { title: 'Revision' },
    })
    revalidateTag.mockClear()
    await fixture.payload.update({ collection: 'posts', id: post.id, data: { _status: 'draft' } })
    expectTags('collection:posts')
    const publicPosts = await fixture.payload.find({
      collection: 'posts',
      where: { and: [{ id: { equals: post.id } }, { _status: { equals: 'published' } }] },
    })
    expect(publicPosts.docs).toHaveLength(0)
  })

  it('does not let a nested post read overwrite an outer draft write', async () => {
    const post = await createPublishedPost()
    fixture.hooks.postBeforeChange = async ({ data, req }) => {
      await req.payload.findByID({ collection: 'posts', id: post.id, draft: false, req })
      return data
    }
    await fixture.payload.update({
      collection: 'posts',
      id: post.id,
      draft: true,
      data: { title: 'Revision' },
    })
    expectTags()
  })

  it('keeps an outer unpublish eligible when its hook saves another post draft', async () => {
    const outer = await createPublishedPost()
    const inner = await createPublishedPost()
    fixture.hooks.postBeforeChange = async ({ data, req, originalDoc }) => {
      if (originalDoc.id === outer.id) {
        await req.payload.update({
          collection: 'posts',
          id: inner.id,
          req,
          draft: true,
          data: { title: 'Nested draft' },
        })
      }
      return data
    }
    await fixture.payload.update({ collection: 'posts', id: outer.id, data: { _status: 'draft' } })
    expectTags('collection:posts')
  })

  it.each([false, true])(
    'keeps published settings unchanged on a draft save (autosave: %s)',
    async (autosave) => {
      const { payload } = fixture
      const data = { title: 'Revision', _status: 'draft' }
      if (autosave) {
        // The global Local API does not forward autosave in 3.88. Exercise the operation
        // used by the HTTP handler so the flag actually reaches Payload's version writer.
        const globalConfig = payload.globals.config.find((global) => global.slug === 'settings')!
        await updateOperationGlobal({
          slug: 'settings',
          globalConfig,
          draft: true,
          autosave: true,
          data,
          overrideAccess: true,
          req: await createLocalReq({}, payload),
        })
      } else {
        await payload.updateGlobal({ slug: 'settings', draft: true, data })
      }
      expectTags()
      expect((await fixture.payload.findGlobal({ slug: 'settings', draft: false })).title).toBe(
        'Original',
      )
      expect((await fixture.payload.findGlobal({ slug: 'settings', draft: true })).title).toBe(
        'Revision',
      )
    },
  )

  it.each([false, true])('invalidates global publication even with draft: %s', async (draft) => {
    await fixture.payload.updateGlobal({
      slug: 'settings',
      draft,
      data: { title: 'Published revision', _status: 'published' },
    })
    expectTags('global:settings')
    expect((await fixture.payload.findGlobal({ slug: 'settings', draft: false })).title).toBe(
      'Published revision',
    )
  })

  it('invalidates unpublishing after a newer global draft was saved', async () => {
    await fixture.payload.updateGlobal({
      slug: 'settings',
      draft: true,
      data: { title: 'Revision' },
    })
    revalidateTag.mockClear()
    await fixture.payload.updateGlobal({ slug: 'settings', data: { _status: 'draft' } })
    expectTags('global:settings')
    expect((await fixture.payload.findGlobal({ slug: 'settings', draft: false }))._status).toBe(
      'draft',
    )
  })

  it('does not let a nested global read overwrite an outer draft write', async () => {
    fixture.hooks.settingsBeforeChange = async ({ data, req }) => {
      await req.payload.findGlobal({ slug: 'settings', req })
      return data
    }
    await fixture.payload.updateGlobal({
      slug: 'settings',
      draft: true,
      data: { title: 'Revision' },
    })
    expectTags()
  })

  it('keeps an outer global unpublish eligible after a nested draft write', async () => {
    fixture.hooks.settingsBeforeChange = async ({ data, req }) => {
      if (data.title === 'Outer') {
        await req.payload.updateGlobal({
          slug: 'settings',
          req,
          draft: true,
          data: { title: 'Inner' },
        })
      }
      return data
    }
    await fixture.payload.updateGlobal({
      slug: 'settings',
      data: { title: 'Outer', _status: 'draft' },
    })
    expectTags('global:settings')
  })

  it('does not let a nested global publication change an outer draft decision', async () => {
    fixture.hooks.settingsBeforeChange = async ({ data, req }) => {
      if (data.title === 'Outer') {
        await req.payload.updateGlobal({
          slug: 'settings',
          req,
          data: { title: 'Inner', _status: 'published' },
        })
      }
      return data
    }
    await fixture.payload.updateGlobal({ slug: 'settings', draft: true, data: { title: 'Outer' } })
    expectTags('global:settings')
    expect((await fixture.payload.findGlobal({ slug: 'settings', draft: false })).title).toBe(
      'Inner',
    )
  })

  it('does not leave a failed global draft decision on a reused request', async () => {
    const req: Partial<PayloadRequest> = { context: {} }
    fixture.hooks.settingsBeforeChange = () => {
      throw new Error('Rejected revision')
    }
    await expect(
      fixture.payload.updateGlobal({
        slug: 'settings',
        req,
        draft: true,
        data: { title: 'Rejected' },
      }),
    ).rejects.toThrow('Rejected revision')
    expectTags()
    delete fixture.hooks.settingsBeforeChange
    await fixture.payload.updateGlobal({ slug: 'settings', req, data: { _status: 'draft' } })
    expectTags('global:settings')
  })

  it('invalidates an author update even if draft: true is passed to a collection without drafts', async () => {
    const author = await fixture.payload.create({ collection: 'authors', data: { name: 'Before' } })
    revalidateTag.mockClear()
    await fixture.payload.update({
      collection: 'authors',
      id: author.id,
      draft: true,
      data: { name: 'After' },
    })
    expectTags('collection:authors', 'collection:posts')
  })

  it.each([false, true])('restores a post version with draft: %s', async (draft) => {
    const { payload } = fixture
    const post = await createPublishedPost()
    const versions = await payload.findVersions({
      collection: 'posts',
      where: { parent: { equals: post.id } },
      limit: 1,
    })
    await payload.update({
      collection: 'posts',
      id: post.id,
      data: { title: 'Current', _status: 'published' },
    })
    revalidateTag.mockClear()

    if (draft) {
      // The collection Local API accepts draft but drops it in 3.88. Pass it to the
      // exported operation to actually test a restoration that only saves a version.
      await restoreVersionOperation({
        collection: payload.collections.posts,
        id: versions.docs[0].id,
        draft,
        overrideAccess: true,
        req: await createLocalReq({}, payload),
      })
    } else {
      await payload.restoreVersion({ collection: 'posts', id: versions.docs[0].id })
    }

    expectTags(...(draft ? [] : ['collection:posts']))
    expect((await payload.findByID({ collection: 'posts', id: post.id, draft: false })).title).toBe(
      draft ? 'Current' : 'Original',
    )
    expect((await payload.findByID({ collection: 'posts', id: post.id, draft: true })).title).toBe(
      'Original',
    )
  })

  it.each([false, true])(
    'invalidates global restoration with draft: %s because it changes the main document',
    async (draft) => {
      const { payload } = fixture
      const versions = await payload.findGlobalVersions({
        slug: 'settings',
        limit: 1,
        sort: '-createdAt',
      })
      await payload.updateGlobal({
        slug: 'settings',
        data: { title: 'Current', _status: 'published' },
      })
      revalidateTag.mockClear()

      if (draft) {
        // As with autosave, the global Local API omits this flag in 3.88.
        const globalConfig = payload.globals.config.find((global) => global.slug === 'settings')!
        await restoreVersionOperationGlobal({
          id: versions.docs[0].id,
          draft,
          globalConfig,
          overrideAccess: true,
          req: await createLocalReq({}, payload),
        })
      } else {
        await payload.restoreGlobalVersion({ slug: 'settings', id: versions.docs[0].id })
      }

      expectTags('global:settings')
      expect((await payload.findGlobal({ slug: 'settings', draft: false })).title).toBe('Original')
    },
  )

  it.each([false, true])(
    'invalidates a successful bulk update once, unless draft: %s',
    async (draft) => {
      const first = await createPublishedPost()
      const second = await createPublishedPost()
      const result = await fixture.payload.update({
        collection: 'posts',
        where: { id: { in: [first.id, second.id] } },
        draft,
        data: { title: 'Bulk revision', _status: draft ? 'draft' : 'published' },
      })
      expect(result.docs).toHaveLength(2)
      expect(result.errors).toHaveLength(0)
      expectTags(...(draft ? [] : ['collection:posts']))
    },
  )

  it('invalidates a partially successful bulk write once', async () => {
    const first = await createPublishedPost()
    const second = await createPublishedPost()
    fixture.hooks.postBeforeChange = ({ data, originalDoc }) => {
      if (originalDoc.id === first.id) throw new Error('Rejected post')
      return data
    }
    const result = await fixture.payload.update({
      collection: 'posts',
      where: { id: { in: [first.id, second.id] } },
      data: { title: 'Bulk revision', _status: 'published' },
    })
    expect(result.docs).toHaveLength(1)
    expect(result.errors).toHaveLength(1)
    expectTags('collection:posts')
  })

  it('skips invalidation when every document in a bulk write fails', async () => {
    const post = await createPublishedPost()
    fixture.hooks.postBeforeChange = () => {
      throw new Error('Rejected post')
    }
    const result = await fixture.payload.update({
      collection: 'posts',
      where: { id: { equals: post.id } },
      data: { title: 'Rejected', _status: 'published' },
    })
    expect(result.docs).toHaveLength(0)
    expect(result.errors).toHaveLength(1)
    expectTags()
  })

  it('invalidates when the collection Local API drops a restore draft flag in Payload 3.88', async () => {
    const { payload } = fixture
    const post = await createPublishedPost()
    const versions = await payload.findVersions({
      collection: 'posts',
      where: { parent: { equals: post.id } },
      limit: 1,
    })
    await payload.update({
      collection: 'posts',
      id: post.id,
      data: { title: 'Current', _status: 'published' },
    })
    revalidateTag.mockClear()

    await payload.restoreVersion({ collection: 'posts', id: versions.docs[0].id, draft: true })

    expectTags('collection:posts')
    expect((await payload.findByID({ collection: 'posts', id: post.id, draft: false })).title).toBe(
      'Original',
    )
  })

  it('skips an initial global draft without requiring a previous public document', async () => {
    // This global is deliberately left untouched by the shared setup.
    const { payload } = fixture
    await payload.updateGlobal({
      slug: 'announcement',
      draft: true,
      data: { title: 'First draft' },
    })
    expectTags()
    expect((await payload.findGlobal({ slug: 'announcement', draft: true })).title).toBe(
      'First draft',
    )
    expect((await payload.findGlobal({ slug: 'announcement', draft: false })).title).not.toBe(
      'First draft',
    )
  })
})
