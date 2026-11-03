import type { Field, Plugin, UIField } from 'payload'

type Options = {
  collections: string[]
  replace?: [RegExp, string]
}

/** Show the saved hierarchy URL immediately after a collection's slug field. */
export function pathPreview({ collections, replace }: Options): Plugin {
  const preview: UIField = {
    name: 'pathPreview',
    type: 'ui',
    admin: {
      components: {
        Field: {
          path: '@payloadflare/path-preview/client#PathPreview',
          clientProps: replace
            ? {
                pattern: replace[0].source,
                flags: replace[0].flags,
                replacement: replace[1],
              }
            : {},
        },
      },
    },
  }

  function addPreview(fields: Field[]): Field[] {
    return fields.flatMap((field): Field[] => {
      if ('fields' in field) field = { ...field, fields: addPreview(field.fields) }
      if (field.type === 'tabs') {
        field = {
          ...field,
          tabs: field.tabs.map((tab) => ({ ...tab, fields: addPreview(tab.fields) })),
        }
      }
      return 'name' in field && field.name === 'slug' ? [field, preview] : [field]
    })
  }

  return (config) => ({
    ...config,
    collections: config.collections?.map((collection) =>
      collections.includes(collection.slug)
        ? {
            ...collection,
            fields: addPreview(collection.fields),
            hooks: {
              ...collection.hooks,
              beforeOperation: [
                ...(collection.hooks?.beforeOperation ?? []),
                ({ context, req }) => {
                  if (req.user) context.computeHierarchyPaths = true
                },
              ],
            },
          }
        : collection,
    ),
  })
}
