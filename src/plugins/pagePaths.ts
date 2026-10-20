import type { CollectionConfig, Plugin } from 'payload'

import { resolvePagePath } from '@/lib/pages/resolvePagePath'

/** Add a calculated URL to pages with slug, folder, and isHome fields. */
export const pagePaths =
  ({ collection: collectionSlug }: { collection: string }): Plugin =>
  (config) => ({
    ...config,
    collections: config.collections?.map((collection) => {
      if (collection.slug !== collectionSlug) return collection

      return {
        ...collection,
        // Include the source fields whenever the calculated URL is selected.
        select: (({ select }) => {
          if (!select || select.path === false) return select
          const sources = ['slug', 'folder', 'isHome'] as const
          if (Object.values(select).some((value) => value === true)) {
            return select.path === true
              ? { ...select, slug: true, folder: true, isHome: true }
              : select
          }
          const fields = { ...select }
          for (const source of sources) delete fields[source]
          return fields
        }) as NonNullable<CollectionConfig['select']>,

        fields: [
          ...collection.fields,
          {
            name: 'path',
            type: 'text',
            label: 'Page URL',
            virtual: true,
            hooks: {
              afterRead: [({ siblingData, req }) => resolvePagePath(siblingData, req)],
            },
            admin: { hidden: true, readOnly: true },
          },
        ],
      }
    }),
  })
