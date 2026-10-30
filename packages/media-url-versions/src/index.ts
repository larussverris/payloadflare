/**
 * Template-maintained package. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates. Configure which
 * collections receive media URL versioning in src/payload.config.ts.
 */

import type { CollectionAfterReadHook, Plugin } from 'payload'

/** Version the main file URL without changing the filename or other media URLs. */
export const versionMediaURLs: CollectionAfterReadHook = ({ doc, req }) => {
  if (typeof doc.url !== 'string' || !doc.url) return doc
  if (typeof doc.updatedAt !== 'string') return doc

  const timestamp = Date.parse(doc.updatedAt)
  if (!Number.isFinite(timestamp)) return doc

  const url = new URL(doc.url, req.payload.config.serverURL)
  url.searchParams.set('v', String(timestamp))

  // Keep root-relative URLs relative; preserve the origin on absolute URLs.
  if (doc.url.startsWith('/') && !doc.url.startsWith('//')) {
    doc.url = `${url.pathname}${url.search}${url.hash}`
  } else {
    doc.url = url.href
  }

  return doc
}

/** Adds updatedAt-based URL versions to the selected upload collections. */
export function mediaURLVersions({ collections }: { collections: string[] }): Plugin {
  return (config) => {
    const updatedCollections = config.collections?.map((collection) => {
      if (!collections.includes(collection.slug)) return collection

      const existingHooks = collection.hooks?.afterRead ?? []

      return {
        ...collection,
        hooks: {
          ...collection.hooks,
          afterRead: [...existingHooks, versionMediaURLs],
        },
      }
    })

    return { ...config, collections: updatedCollections }
  }
}
