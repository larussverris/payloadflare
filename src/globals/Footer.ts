import type { GlobalConfig } from 'payload'
import * as blocks from '@/blocks/config'

export const Footer: GlobalConfig = {
  slug: 'footer',
  versions: true,
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'layout',
      type: 'blocks',
      blocks: Object.values(blocks),
      // Add the block slugs allowed in the footer, e.g. ['text', 'image'].
      filterOptions: () => [],
    },
  ],
}
