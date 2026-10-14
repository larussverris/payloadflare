// Stores the editable blocks shown when a requested website page does not exist.
// Accessible through Pages in the admin.
import type { GlobalConfig } from 'payload'
import { MetaTitleField } from '@payloadcms/plugin-seo/fields'

import { Button } from '../blocks/Button/config'
import { Image } from '../blocks/Image/config'
import { Video } from '../blocks/Video/config'
import { revalidateSite } from '../hooks/revalidateSite'

export const NotFoundPage: GlobalConfig = {
  slug: 'not-found-page',
  label: '404 Page',
  admin: {
    group: false,
    components: {
      elements: {
        beforeDocumentControls: ['/components/admin/SystemPageBreadcrumb#SystemPageBreadcrumb'],
      },
    },
  },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  versions: true,
  hooks: { afterChange: [revalidateSite] },
  fields: [
    MetaTitleField({
      hasGenerateFn: false,
      overrides: { required: true, localized: false, defaultValue: 'Page not found' },
    }),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Layout',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [Image, Video, Button],
            },
          ],
        },
      ],
    },
  ],
}
