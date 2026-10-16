import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { resolvePagePath } from '@/lib/pages/resolvePagePath'
import { createParentField } from '@payloadcms/plugin-nested-docs'

import { Hero } from '../blocks/Hero/config'
import { Image } from '../blocks/Image/config'
import { NotFound } from '../blocks/NotFound/config'
import { Text } from '../blocks/Text/config'
import { Video } from '../blocks/Video/config'
import {
  canChangePageBlocks,
  canChangePagePath,
  canCreatePage,
  canDeletePage,
  canReadPage,
  canUpdatePage,
} from './Pages/access'
import { validatePageChanges } from './Pages/hooks/validatePageChanges'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    components: {
      edit: {
        beforeDocumentControls: ['/components/admin/CollapsePageNav#CollapsePageNav'],
        editMenuItems: ['/components/admin/PageDetailsMenuItems#PageDetailsMenuItems'],
      },
    },
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status'],
    listSearchableFields: ['title', 'slug'],
    preview: async (data, { req }) => {
      const pathname = await resolvePagePath(data, req)
      return pathname ? `/api/preview?${new URLSearchParams({ path: pathname })}` : null
    },
    livePreview: {
      url: ({ data, req }) => resolvePagePath(data, req),
    },
  },
  access: {
    create: canCreatePage,
    read: canReadPage,
    update: canUpdatePage,
    delete: canDeletePage,
  },
  hooks: {
    beforeChange: [validatePageChanges],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'layout',
      type: 'blocks',
      access: { update: canChangePageBlocks },
      blocks: [Hero, Text, Image, Video, NotFound],
    },
    {
      name: 'meta',
      type: 'group',
      label: 'SEO',
      admin: { components: { Field: '/components/admin/PageDetailsDrawer#PageSEODrawer' } },
      fields: [
        OverviewField({ titlePath: 'meta.title' }),
        MetaTitleField({ hasGenerateFn: false }),
        MetaDescriptionField({ hasGenerateFn: false }),
        MetaImageField({ relationTo: 'media', hasGenerateFn: false }),
        PreviewField({ hasGenerateFn: true, titlePath: 'meta.title' }),
      ],
    },
    {
      type: 'collapsible',
      label: 'Settings',
      admin: { components: { Field: '/components/admin/PageDetailsDrawer#PageSettingsDrawer' } },
      fields: [
        slugField({ position: 'main' }),
        createParentField('pages', {
          label: 'Parent page',
          access: { update: canChangePagePath },
          admin: {
            description: 'Leave empty for a top-level page.',
          },
        }),
      ],
    },
  ],
}
