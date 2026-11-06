import type { CollectionConfig, Where } from 'payload'
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
  // Page relationships need a label and native hierarchy path, without full page content.
  defaultPopulate: {
    title: true,
    _h_slugPath: true,
    slug: true,
    parent: true,
  },
  defaultSort: 'title',
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
  versions: { drafts: { autosave: { interval: 500 } } },
  admin: {
    group: false,
    livePreview: {
      openByDefault: true,
      url: ({ data }) => {
        if (!data._h_slugPath) return null
        const path = `/${data._h_slugPath}`
        return `/preview?${new URLSearchParams({ path })}`
      },
    },
    components: {
      beforeList: ['/admin/components/PagesListPreferences#PagesListPreferences'],
      edit: {
        beforeDocumentControls: ['/admin/components/PageHeadingSettings#PageHeadingSettings'],
      },
    },
    useAsTitle: 'title',
    defaultColumns: ['title', '_h_slugPath', '_status', 'updatedAt'],
    listSearchableFields: ['title', 'slug'],
  },
  access: {
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
  },
  fields: [
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      hasMany: false,
      index: true,
      label: 'Parent page',
      admin: {
        condition: (data) => data.slug !== 'home',
        components: { Field: '/admin/components/PageSettingsDrawer#PageParentField' },
      },
      filterOptions: ({ id }): Where => ({
        and: [
          { slug: { not_equals: 'home' } },
          ...(id == null ? [] : [{ id: { not_equals: id } }]),
        ],
      }),
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
              admin: { position: 'main', condition: (data) => data.slug !== 'home' },
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
