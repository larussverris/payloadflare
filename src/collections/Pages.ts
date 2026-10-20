import type { CollectionConfig } from 'payload'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { resolvePagePath } from '@/lib/pages/resolvePagePath'
import { assertPagePathAvailable } from '@/lib/pages/assertPagePathAvailable'

import { Hero } from '../blocks/Hero/config'
import { Image } from '../blocks/Image/config'
import { Text } from '../blocks/Text/config'
import { Video } from '../blocks/Video/config'
import { validatePageChanges } from './Pages/hooks/validatePageChanges'

export const Pages: CollectionConfig = {
  slug: 'pages',
  orderable: true,
  labels: { singular: 'Page', plural: 'Pages' },
  authorship: false,
  versions: { drafts: { autosave: { interval: 200 } } },
  admin: {
    group: false,
    components: {
      beforeList: ['/components/admin/PagesListPreferences#PagesListPreferences'],
      edit: {
        beforeDocumentControls: ['/components/admin/PageHeadingSettings#PageHeadingSettings'],
      },
    },
    useAsTitle: 'title',
    defaultColumns: ['title', 'path', '_status', 'updatedAt'],
    listSearchableFields: ['title', 'slug'],
    livePreview: {
      openByDefault: true,
      url: async ({ data, req }) => {
        const path = await resolvePagePath(data, req)
        return path ? `/api/preview?${new URLSearchParams({ path })}` : null
      },
    },
  },
  access: {
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
  },
  hooks: {
    beforeChange: [validatePageChanges],
  },
  fields: [
    {
      name: 'layout',
      type: 'blocks',
      admin: {
        initCollapsed: true,
        components: { Field: '/components/admin/PageSettingsDrawer#PageLayoutField' },
      },
      blocks: [Hero, Text, Image, Video],
    },
    {
      type: 'group',
      label: 'Page settings',
      admin: {
        components: { Field: '/components/admin/PageSettingsDrawer#PageSettingsDrawer' },
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'isHome',
          type: 'checkbox',
          label: 'Homepage',
          defaultValue: false,
          index: true,
          admin: {
            description: 'Serve this page at /. Replaces the current homepage when saved.',
            components: { Field: '/components/admin/PageHomepageField#PageHomepageField' },
          },
        },
        {
          name: 'folder',
          type: 'relationship',
          relationTo: 'folders',
          hasMany: false,
          index: true,
          localized: false,
          label: 'Parent folder',
          admin: {
            // The homepage is served at / regardless of its stored parent folder.
            condition: (data) => data.isHome !== true,
          },
        },
        {
          name: 'slug',
          type: 'slug',
          useAsSlug: 'title',
          validate: (value: unknown) =>
            (typeof value === 'string' && /^[a-zA-Z0-9-]+$/.test(value)) ||
            'Use only letters, numbers, and dashes.',
          hooks: {
            beforeChange: [
              async ({ data, originalDoc, req, value }) => {
                // Payload generates the slug before this hook, including for a new draft.
                if (data) {
                  const page = { ...originalDoc, ...data, slug: value }
                  assertPagePathAvailable(await resolvePagePath(page, req))
                }
                return value
              },
            ],
          },
          admin: {
            position: 'main',
            // The homepage is served at /; keep its slug for when it becomes a regular page.
            condition: (data) => data.isHome !== true,
          },
        },
        {
          name: 'pageURLPreview',
          type: 'ui',
          admin: {
            components: { Field: '/components/admin/PageURLPreview#PageURLPreview' },
          },
        },
        {
          name: 'meta',
          type: 'group',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({ hasGenerateFn: false }),
            MetaDescriptionField({ hasGenerateFn: false }),
            MetaImageField({ relationTo: 'media', hasGenerateFn: false }),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
  ],
}
