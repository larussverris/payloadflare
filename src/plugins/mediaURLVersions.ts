import type { CollectionAfterReadHook, Plugin } from 'payload'

function versionURL(value: unknown, version: string) {
  if (typeof value !== 'string' || !value) return value
  const hashIndex = value.indexOf('#')
  const hash = hashIndex < 0 ? '' : value.slice(hashIndex)
  const url = hashIndex < 0 ? value : value.slice(0, hashIndex)
  const queryIndex = url.indexOf('?')
  const pathname = queryIndex < 0 ? url : url.slice(0, queryIndex)
  const query = new URLSearchParams(queryIndex < 0 ? '' : url.slice(queryIndex + 1))
  query.set('v', version)
  return `${pathname}?${query}${hash}`
}

/** Version response URLs without changing the stored filename or file contents. */
export const versionMediaURLs: CollectionAfterReadHook = ({ doc }) => {
  const timestamp = typeof doc.updatedAt === 'string' ? Date.parse(doc.updatedAt) : NaN
  if (!Number.isFinite(timestamp)) return doc
  const version = String(timestamp)

  for (const key of ['url', 'thumbnailURL']) {
    if (typeof doc[key] === 'string') doc[key] = versionURL(doc[key], version)
  }
  for (const size of Object.values(doc.sizes ?? {})) {
    if (size && typeof size === 'object' && 'url' in size) {
      size.url = versionURL(size.url, version)
    }
  }
  return doc
}

/** Adds updatedAt-based URL versions to the selected upload collections. */
export const mediaURLVersions = ({ collections }: { collections: string[] }): Plugin =>
  (config) => {
    const selected = new Set(collections)
    for (const slug of selected) {
      const collection = config.collections?.find((entry) => entry.slug === slug)
      if (!collection?.upload) {
        throw new Error(`[mediaURLVersions] "${slug}" must identify an upload collection.`)
      }
      if (collection.timestamps === false) {
        throw new Error(`[mediaURLVersions] "${slug}" requires timestamps for updatedAt.`)
      }
    }

    return {
      ...config,
      collections: config.collections?.map((collection) => {
        if (!selected.has(collection.slug)) return collection
        const afterRead = collection.hooks?.afterRead ?? []
        return {
          ...collection,
          hooks: {
            ...collection.hooks,
            afterRead: afterRead.includes(versionMediaURLs)
              ? afterRead
              : [...afterRead, versionMediaURLs],
          },
        }
      }),
    }
  }
