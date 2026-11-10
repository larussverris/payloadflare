import type { BlockSlug, GlobalConfig } from 'payload'
import * as blocks from '@/blocks/config'

export const Header: GlobalConfig = {
  slug: 'header',
  versions: true,
  access: {
    read: () => true,
  },
  admin: {
    livePreview: {
      openByDefault: true,
      url: '/preview?path=/',
    },
  },
  fields: [
    {
      name: 'layout',
      type: 'blocks',
      blocks: Object.values(blocks).map((block) => block.slug as BlockSlug),
      // Add the block slugs allowed in the header, e.g. ['text', 'image'].
      filterOptions: () => [],
    },
  ],
}
