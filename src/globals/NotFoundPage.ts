import type { GlobalConfig } from 'payload'
import * as blocks from '@/blocks/config'

export const NotFoundPage: GlobalConfig = {
  slug: 'not-found-page',
  label: '404 Page',
  versions: { drafts: { autosave: { interval: 100 } } },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    group: false,
    livePreview: {
      openByDefault: true,
      url: '/preview?path=/not-found-preview',
    },
  },
  fields: [
    {
      name: 'layout',
      type: 'blocks',
      admin: { initCollapsed: true },
      blocks: Object.values(blocks),
    },
  ],
}
