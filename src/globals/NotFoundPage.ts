import type { BlockSlug, GlobalConfig } from 'payload'
import * as blocks from '@/blocks/config'

export const NotFoundPage: GlobalConfig = {
  slug: 'not-found-page',
  label: '404 Page',
  versions: { drafts: { autosave: { interval: 500 } } },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    group: false,
    livePreview: {
      openByDefault: true,
      url: '/preview?path=/_not-found',
    },
  },
  fields: [
    {
      name: 'layout',
      type: 'blocks',
      blocks: Object.values(blocks).map((block) => block.slug as BlockSlug),
      // Set the block slugs allowed on the 404 page.
      filterOptions: () => [],
    },
  ],
}
