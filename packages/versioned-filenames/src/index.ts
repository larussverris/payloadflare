import { extname } from 'node:path'
import type { CollectionBeforeOperationHook, Plugin } from 'payload'

interface VersionedFilenamesOptions {
  /** Slugs of upload collections that should receive random filenames. Defaults to `media`. */
  collections?: string[]
}

const versionFilename: CollectionBeforeOperationHook = ({ args, operation, req }) => {
  if ((operation !== 'create' && operation !== 'update') || !req.file) {
    return
  }

  const data = args.data as Record<string, unknown> | undefined
  args.data = { ...data, displayFilename: req.file.name } as typeof args.data
  req.file.name = `${crypto.randomUUID().replaceAll('-', '')}${extname(req.file.name)}`
  return args
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
      const fields = [...collection.fields]
      if (!fields.some((field) => 'name' in field && field.name === 'filename')) {
        fields.unshift({ name: 'filename', type: 'text', admin: { disabled: true } })
      }
      if (!fields.some((field) => 'name' in field && field.name === 'displayFilename')) {
        fields.unshift({
          name: 'displayFilename',
          label: 'Original filename',
          type: 'text',
          access: {
            read: ({ req }) => Boolean(req.user),
          },
          hooks: {
            afterRead: [({ siblingData, value }) => {
              if (typeof value === 'string' && value.trim() && value !== 'display_filename') {
                return value
              }
              return typeof siblingData.filename === 'string' ? siblingData.filename : value
            }],
          },
          admin: {
            description: 'The name of the uploaded file. Only signed-in users can see it.',
            readOnly: true,
          },
        })
      }

      return {
        ...collection,
        fields,
        admin: {
          ...collection.admin,
          useAsTitle: collection.admin?.useAsTitle ?? 'displayFilename',
          defaultColumns: collection.admin?.defaultColumns ?? [
            'displayFilename',
            ...(fields.some((field) => 'name' in field && field.name === 'alt') ? ['alt'] : []),
            'updatedAt',
            'createdAt',
          ],
        },
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

export type { VersionedFilenamesOptions }
