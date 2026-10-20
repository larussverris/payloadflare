import type { CollectionConfig } from 'payload'
import { APIError, ValidationError } from 'payload'
import { getFolderSegments, getPagePathFromFolder } from '@/lib/pages/getPagePath'
import { assertPagePathAvailable } from '@/lib/pages/assertPagePathAvailable'

export const Folders: CollectionConfig = {
  slug: 'folders',
  labels: { singular: 'Folder', plural: 'Folders' },
  versions: false,
  admin: { group: false, useAsTitle: 'name' },
  access: {
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        const [pages, childFolders] = await Promise.all([
          req.payload.count({
            collection: 'pages',
            where: { folder: { equals: id } },
            overrideAccess: true,
            req,
          }),
          req.payload.count({
            collection: 'folders',
            where: { parent: { equals: id } },
            overrideAccess: true,
            req,
          }),
        ])
        if (pages.totalDocs > 0 || childFolders.totalDocs > 0) {
          throw new APIError('Move this folder’s pages and subfolders before deleting it.', 400)
        }
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Folder name' },
    {
      name: 'slug',
      type: 'slug',
      useAsSlug: 'name',
      required: true,
      unique: true,
      index: true,
      validate: (value: unknown) =>
        (typeof value === 'string' && /^[a-zA-Z0-9-]+$/.test(value)) ||
        'Use only letters, numbers, and dashes.',
      hooks: {
        beforeChange: [
          async ({ data, originalDoc, req, value }) => {
            if (typeof value !== 'string') return value
            const slug = value
            if (slug === 'home') {
              throw new ValidationError({
                errors: [{ path: 'slug', message: 'Enter one folder URL segment, such as team.' }],
              })
            }

            const parent = data?.parent !== undefined ? data.parent : originalDoc?.parent
            const parentID = typeof parent === 'object' ? parent?.id : parent
            let segments: string[]
            try {
              segments = await getFolderSegments(
                parentID,
                (id) =>
                  req.payload.findByID({
                    collection: 'folders',
                    id,
                    depth: 0,
                    overrideAccess: true,
                    req,
                  }),
                new Set(originalDoc ? [String(originalDoc.id)] : []),
              )
            } catch (error) {
              throw new ValidationError({
                errors: [{ path: 'parent', message: (error as Error).message }],
              })
            }
            assertPagePathAvailable(getPagePathFromFolder(slug, segments))

            return value
          },
        ],
      },
    },
    {
      name: 'folderURLPreview',
      type: 'ui',
      admin: { components: { Field: '/components/admin/FolderURLPreview#FolderURLPreview' } },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'folders',
      index: true,
      label: 'Parent folder',
    },
  ],
}
