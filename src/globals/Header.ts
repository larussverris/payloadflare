import type { GlobalConfig } from 'payload'
import * as blocks from '@/blocks/config'

export const Header: GlobalConfig = {
  slug: 'header',
  versions: true,
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'layout',
      type: 'blocks',
      blocks: Object.values(blocks),
      // Add the block slugs allowed in the header, e.g. ['text', 'image'].
      filterOptions: () => [],
    },
  ],
}
