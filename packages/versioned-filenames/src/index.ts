import { extname } from 'node:path'
import type { CollectionBeforeOperationHook, Plugin } from 'payload'

export interface VersionedFilenamesOptions {
  /** Slugs of upload collections that should receive random filenames. Defaults to `media`. */
  collections?: string[]
}

const versionFilename: CollectionBeforeOperationHook = ({ operation, req }) => {
  if ((operation !== 'create' && operation !== 'update') || !req.file) {
    return
  }

  req.file.name = `${crypto.randomUUID().replaceAll('-', '')}${extname(req.file.name)}`
}

export const versionedFilenames = (
  { collections = ['media'] }: VersionedFilenamesOptions = {},
): Plugin => {
  const selected = new Set(collections)

  return (config) => ({
    ...config,
    collections: config.collections?.map((collection) => {
      if (!selected.has(collection.slug) || !collection.upload) {
        return collection
      }

      const beforeOperation = collection.hooks?.beforeOperation ?? []

      return {
        ...collection,
        hooks: {
          ...collection.hooks,
          // Run after existing hooks, including hooks that prepare a replacement file.
          beforeOperation: beforeOperation.includes(versionFilename)
            ? beforeOperation
            : [...beforeOperation, versionFilename],
        },
      }
    }),
  })
}
