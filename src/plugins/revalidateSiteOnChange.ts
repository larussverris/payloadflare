import type { Plugin } from 'payload'

import { revalidateSite } from '@/hooks/revalidateSite'

export const revalidateSiteOnChange: Plugin = (config) => ({
  ...config,
  collections: config.collections?.map((collection) => ({
    ...collection,
    hooks: {
      ...collection.hooks,
      afterChange: [...(collection.hooks?.afterChange ?? []), revalidateSite],
      afterDelete: [...(collection.hooks?.afterDelete ?? []), revalidateSite],
    },
  })),
  globals: config.globals?.map((global) => ({
    ...global,
    hooks: {
      ...global.hooks,
      afterChange: [...(global.hooks?.afterChange ?? []), revalidateSite],
    },
  })),
})
