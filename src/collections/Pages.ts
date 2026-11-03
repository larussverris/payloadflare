import type { CollectionConfig } from 'payload'
import { getPagePreviewURL, pageHooks } from './Pages/hooks'
import * as blocks from '@/blocks/config'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig = {
  slug: 'pages',
  // Page relationships need a label and public path for links, without loading the full page content.
  defaultPopulate: {
    title: true,
    path: true,
    isHome: true,
    _h_slugPath: true,
    slug: true,
    parent: true,
  },
  select: ({ operation, req }) => {
    if (operation === 'read') req.context.computeHierarchyPaths = true
    return undefined
  },
  orderable: true,
  hierarchy: {
    parentFieldName: 'parent',
    slugField: 'slug',
    allowHasMany: false,
    admin: {
      injectSidebarTab: false,
      useHeaderButton: false,
      components: { Icon: '@payloadcms/ui#DocumentIcon' },
    },
  },
  versions: { drafts: { autosave: { interval: 200 } } },
  admin: {
    livePreview: {
      openByDefault: true,
      url: ({ data, req }) => getPagePreviewURL(data.id, req),
    },
    group: false,
    components: {
      beforeList: ['/admin/components/PagesListPreferences#PagesListPreferences'],
      edit: {
        beforeDocumentControls: ['/admin/components/PageHeadingSettings#PageHeadingSettings'],
      },
    },
    useAsTitle: 'title',
    defaultColumns: ['title', '_status', 'updatedAt', 'path'],
    listSearchableFields: ['title', 'slug'],
  },
  access: {
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
  },
  hooks: pageHooks,
  fields: [
    {
      name: 'path',
      type: 'text',
      virtual: true,
      admin: { readOnly: true },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      hasMany: false,
      index: true,
      label: 'Parent page',
      admin: {
        components: { Field: '/admin/components/PageSettingsDrawer#PageParentField' },
        condition: (data) => data.isHome !== true,
      },
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    {
      name: 'title',
      type: 'text',
      label: 'Page name',
      required: true,
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: Object.values(blocks),
    },
    {
      type: 'row',
      admin: {
        components: { Field: '/admin/components/PageSettingsDrawer#PageSettingsDrawer' },
      },
      fields: [
        {
          type: 'group',
          label: false,
          fields: [
            {
              name: 'slug',
              type: 'slug',
              useAsSlug: 'title',
              admin: { position: 'main', condition: (data) => data.isHome !== true },
            },
            {
              name: 'isHome',
              type: 'checkbox',
              label: 'Homepage',
              defaultValue: false,
              index: true,
              admin: {
                components: { Field: '/admin/components/PageHomepageField#PageHomepageField' },
              },
            },
          ],
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
            MetaTitleField({}),
            MetaDescriptionField({}),
            MetaImageField({ relationTo: 'media' }),
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
