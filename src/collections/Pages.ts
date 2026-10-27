import type { CollectionConfig } from 'payload'
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
      url: async ({ data, req }) => {
        if (!data.id) return null
        const page = await req.payload.findByID({
          collection: 'pages',
          id: data.id,
          draft: true,
          depth: 0,
          select: { _h_slugPath: true, isHome: true },
          req,
        })
        const pathname = page.isHome ? '/' : page._h_slugPath ? `/${page._h_slugPath}` : null
        return pathname ? `/api/preview?${new URLSearchParams({ path: pathname })}` : null
      },
    },
    group: false,
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
  hooks: {
    beforeOperation: [({ args, operation, context }) => {
      if (operation === 'read') {
        const select = 'select' in args ? args.select as Record<string, unknown> | undefined : undefined
        if (!select) context.computeHierarchyPaths = true
        // Beta 4 does not auto-select native slug fields when computing hierarchy paths.
        if (select?._h_slugPath === true || select?._h_titlePath === true) select.slug = true
      }
      return args
    }],
    beforeChange: [async ({ data, originalDoc, req }) => {
      if ((data.isHome ?? originalDoc?.isHome) === true) data.parent = null
      if (data.isHome === true) {
        // Use the same request so nested writes share the current transaction.
        await req.payload.update({
          collection: 'pages',
          where: {
            and: [
              { isHome: { equals: true } },
              ...(originalDoc?.id ? [{ id: { not_equals: originalDoc.id } }] : []),
            ],
          },
          data: { isHome: false },
          overrideAccess: true,
          req,
        })
      }
      return data
    }],
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
        components: { Field: '/admin/components/PageSettingsDrawer#PageParentField' },
        condition: data => data.isHome !== true,
      },
      filterOptions: ({ id }) => id ? { id: { not_equals: id } } : true,
    },
    {
      name: 'layout',
      type: 'blocks',
      admin: {
        initCollapsed: true,
        components: { Field: '/admin/components/PageSettingsDrawer#PageLayoutField' },
      },
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
              name: 'title',
              type: 'text',
              label: 'Page name',
              defaultValue: () => 'Untitled',
              required: true,
            },
            {
              name: 'slug',
              type: 'slug',
              useAsSlug: 'title',
              admin: { position: 'main', condition: (data) => data.isHome !== true },
            },
            {
              name: 'pageURLPreview',
              type: 'ui',
              admin: {
                components: {
                  Field: {
                    path: '/admin/components/PathPreview#PathPreview',
                    clientProps: { pathField: '_h_slugPath' },
                  },
                },
                condition: (data) => data.isHome !== true,
              },
            },
            {
              name: 'homepageURLPreview',
              type: 'ui',
              admin: {
                condition: (data) => data.isHome === true,
                components: {
                  Field: {
                    path: '/admin/components/PathPreview#PathPreview',
                    clientProps: { pathname: '/' },
                  },
                },
              },
            },
            {
              name: 'isHome',
              type: 'checkbox',
              label: 'Homepage',
              defaultValue: false,
              index: true,
              admin: {
                description: 'Serve this page at /. Replaces the current homepage when saved.',
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
