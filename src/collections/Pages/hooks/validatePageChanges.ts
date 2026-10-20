import type { CollectionBeforeChangeHook } from 'payload'

export const validatePageChanges: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (data.isHome === true) {
    // Use the same request so nested writes share the current transaction.
    await req.payload.update({
      collection: 'pages',
      where: {
        and: [
          { isHome: { equals: true } },
          ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
        ],
      },
      data: { isHome: false },
      overrideAccess: true,
      req,
    })
  }

  return data
}
