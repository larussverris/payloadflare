import { revalidatePath } from 'next/cache'
import type { PayloadRequest, Plugin } from 'payload'

type HookArgs<T> = { doc: T; previousDoc?: T; req: PayloadRequest }

function revalidateSite<T>({ doc, req }: HookArgs<T>): T {
  if (!req.context.disableRevalidate) {
    revalidatePath('/', 'layout')
  }
  return doc
}

function revalidateAfterSave<T>(args: HookArgs<T>): T {
  const { doc, previousDoc, req } = args
  if (req.query?.autosave === true || req.query?.autosave === 'true') return doc
  // Schemas without drafts (media, settings) take effect immediately.
  if (
    typeof doc === 'object' &&
    doc !== null &&
    '_status' in doc &&
    doc._status !== 'published' &&
    !(
      typeof previousDoc === 'object' &&
      previousDoc !== null &&
      '_status' in previousDoc &&
      previousDoc._status === 'published'
    )
  ) {
    return doc
  }
  return revalidateSite(args)
}

export const revalidateSiteOnSave =
  ({ collections = [], globals = [] }: { collections?: string[]; globals?: string[] }): Plugin =>
  (config) => ({
    ...config,
    collections: config.collections?.map((collection) => {
      if (!collections.includes(collection.slug)) return collection
      return {
        ...collection,
        hooks: {
          ...collection.hooks,
          afterChange: [...(collection.hooks?.afterChange ?? []), revalidateAfterSave],
          afterDelete: [...(collection.hooks?.afterDelete ?? []), revalidateSite],
        },
      }
    }),
    globals: config.globals?.map((global) => {
      if (!globals.includes(global.slug)) return global
      return {
        ...global,
        hooks: {
          ...global.hooks,
          afterChange: [...(global.hooks?.afterChange ?? []), revalidateAfterSave],
        },
      }
    }),
  })
