import type { CollectionConfig } from 'payload'
import { revalidatePage } from '@/hooks/revalidatePage'
import { getPagePath } from '@/lib/pages/getPagePath'

import { Image } from '../blocks/Image/config'
import { Video } from '../blocks/Video/config'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    group: 'Website',
    useAsTitle: 'title',
    livePreview: {
      url: ({ data }) => {
        if (!data.slug) return null
        return getPagePath(data.slug)
      },
    },
  },
  access: {
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
  },
  hooks: {
    afterChange: [revalidatePage],
    afterDelete: [revalidatePage],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'Use / for the homepage, about for /about, or about/team for /about/team.',
      },
      required: true,
      unique: true,
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [Image, Video],
    },
  ],
}
