import type { Plugin } from 'payload'

export const openLivePreviewByDefault: Plugin = (config) => ({
  ...config,
  collections: config.collections?.map((collection) => {
    if (!collection.admin?.livePreview?.url) return collection

    return {
      ...collection,
      admin: {
        ...collection.admin,
        livePreview: {
          ...collection.admin.livePreview,
          openByDefault: true,
        },
      },
    }
  }),
})
