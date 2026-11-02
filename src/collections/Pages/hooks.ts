import type { CollectionConfig, PayloadRequest } from 'payload'

export async function getPagePreviewURL(id: unknown, req: PayloadRequest) {
  if (typeof id !== 'number' && typeof id !== 'string') return null
  const { path } = await req.payload.findByID({
    collection: 'pages',
    id,
    draft: true,
    depth: 0,
    req,
  })
  return path ? `/preview?${new URLSearchParams({ path })}` : null
}

export const pageHooks: NonNullable<CollectionConfig['hooks']> = {
  // Native hierarchy afterRead runs after custom afterRead hooks in this beta.
  // afterOperation sees its completed paths, including on populated relationships.
  afterOperation: [
    ({ operation, result }) => {
      if (operation !== 'find' && operation !== 'findByID') return result
      const docs = operation === 'find' ? result.docs : result ? [result] : []
      for (const doc of docs) {
        doc.path = doc.isHome ? '/' : doc._h_slugPath ? `/${doc._h_slugPath}` : null
      }
      return result
    },
  ],
  beforeChange: [
    async ({ data, originalDoc, req }) => {
      if ((data.isHome ?? originalDoc?.isHome) === true) data.parent = null
      if (data.isHome !== true) return data

      // Use the same request so nested writes share the current transaction.
      await req.payload.update({
        collection: 'pages',
        where: {
          isHome: { equals: true },
          ...(originalDoc?.id ? { id: { not_equals: originalDoc.id } } : {}),
        },
        data: { isHome: false },
        overrideAccess: true,
        req,
      })
      return data
    },
  ],
}
