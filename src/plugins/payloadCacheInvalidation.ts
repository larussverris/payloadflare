import { revalidateTag } from 'next/cache'
import { fieldHasSubFields, fieldIsBlockType } from 'payload/shared'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  Field,
  GlobalSlug,
  GlobalAfterChangeHook,
  Plugin,
} from 'payload'

export type PayloadCacheInvalidationPluginOptions = {
  /** Globals whose Cache Component tags should be invalidated after changes. */
  globals: GlobalSlug[]
}

const getGlobalTag = (slug: string) => `payload-global:${slug}`

const findCollectionDependencies = (fields: Field[], dependencies = new Set<string>()) => {
  for (const field of fields) {
    if (field.type === 'relationship' || field.type === 'upload') {
      const collections = Array.isArray(field.relationTo) ? field.relationTo : [field.relationTo]
      collections.forEach((collection) => dependencies.add(collection))
    }

    if (field.type === 'join') {
      const collections = Array.isArray(field.collection) ? field.collection : [field.collection]
      collections.forEach((collection) => dependencies.add(collection))
    }

    if (fieldHasSubFields(field)) {
      findCollectionDependencies(field.fields, dependencies)
    } else if (fieldIsBlockType(field)) {
      field.blocks.forEach((block) => findCollectionDependencies(block.fields, dependencies))
    } else if (field.type === 'tabs') {
      field.tabs.forEach((tab) => findCollectionDependencies(tab.fields, dependencies))
    }
  }

  return dependencies
}

const revalidateTags = (tags: string[]) => {
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 })
  }
}

/**
 * Payload accepts `versions` as either a boolean or an options object. Drafts
 * exist only when the options object has a truthy `drafts` setting.
 */
const hasDrafts = (versions: unknown) =>
  typeof versions === 'object' &&
  versions !== null &&
  'drafts' in versions &&
  Boolean(versions.drafts)

/**
 * Collections without drafts always affect public content. For draft-enabled
 * collections, invalidate when the new document is published or when the
 * previous document was published. The latter covers unpublishing a document.
 */
const revalidateCollectionAfterChange =
  (drafts: boolean, tags: string[]): CollectionAfterChangeHook =>
  async ({ doc, previousDoc }) => {
    if (!drafts || doc?._status === 'published' || previousDoc?._status === 'published') {
      revalidateTags(tags)
    }

    return doc
  }

/**
 * Deleting an unpublished draft cannot change the public site. A published
 * document deletion must invalidate cached pages that may still reference it.
 */
const revalidateCollectionAfterDelete =
  (drafts: boolean, tags: string[]): CollectionAfterDeleteHook =>
  async ({ doc }) => {
    if (!drafts || doc?._status === 'published') {
      revalidateTags(tags)
    }

    return doc
  }

// Globals use the same publish/unpublish rules as collection documents.
const revalidateGlobalAfterChange =
  (drafts: boolean, tag: string): GlobalAfterChangeHook =>
  async ({ doc, previousDoc }) => {
    if (!drafts || doc?._status === 'published' || previousDoc?._status === 'published') {
      revalidateTags([tag])
    }

    return doc
  }

/**
 * Add targeted invalidation hooks to cached globals and to collections whose
 * documents are populated into those globals.
 *
 * Existing hooks are spread before these hooks so plugins and collection
 * configuration already present in the project continue to run.
 */
export const payloadCacheInvalidationPlugin =
  (options: PayloadCacheInvalidationPluginOptions): Plugin =>
  (config) => {
    const cachedGlobalSlugs = new Set<string>(options.globals)
    const tagsByCollection = new Map<string, Set<string>>()

    for (const global of config.globals ?? []) {
      if (!cachedGlobalSlugs.has(global.slug)) continue

      for (const collection of findCollectionDependencies(global.fields)) {
        const tags = tagsByCollection.get(collection) ?? new Set<string>()
        tags.add(getGlobalTag(global.slug))
        tagsByCollection.set(collection, tags)
      }
    }

    return {
      ...config,
      collections: config.collections?.map((collection) => {
        const tags = tagsByCollection.get(collection.slug)
        if (!tags?.size) return collection

        const drafts = hasDrafts(collection.versions)
        const collectionTags = [...tags]

        return {
          ...collection,
          hooks: {
            ...collection.hooks,
            afterChange: [
              ...(collection.hooks?.afterChange ?? []),
              revalidateCollectionAfterChange(drafts, collectionTags),
            ],
            afterDelete: [
              ...(collection.hooks?.afterDelete ?? []),
              revalidateCollectionAfterDelete(drafts, collectionTags),
            ],
          },
        }
      }),
      globals: config.globals?.map((global) => {
        if (!cachedGlobalSlugs.has(global.slug)) return global

        const drafts = hasDrafts(global.versions)
        const tag = getGlobalTag(global.slug)

        return {
          ...global,
          hooks: {
            ...global.hooks,
            afterChange: [
              ...(global.hooks?.afterChange ?? []),
              revalidateGlobalAfterChange(drafts, tag),
            ],
          },
        }
      }),
    }
  }
