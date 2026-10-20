import type { GlobalConfig } from 'payload'

import { Hero } from '@/blocks/Hero/config'
import { Image } from '@/blocks/Image/config'
import { Text } from '@/blocks/Text/config'
import { Video } from '@/blocks/Video/config'

export const NotFoundPage: GlobalConfig = {
  slug: 'not-found-page',
  label: '404 Page',
  authorship: false,
  versions: { drafts: { autosave: { interval: 100 } } },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  admin: {
    group: false,
    livePreview: {
      openByDefault: true,
      url: '/api/preview?path=/not-found-preview',
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: '404 Page',
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Layout',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              defaultValue: [
                {
                  blockType: 'hero',
                  heading: 'Page not found',
                  subheading: 'The page you are looking for does not exist.',
                },
              ],
              admin: { initCollapsed: true },
              blocks: [Hero, Text, Image, Video],
            },
          ],
        },
      ],
    },
  ],
}
