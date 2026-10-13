import type { CollectionConfig } from 'payload'
import { slugField, ValidationError } from 'payload'
import { slugify } from 'payload/shared'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { revalidateSite } from '@/hooks/revalidateSite'
import { resolvePagePath } from '@/lib/pages/resolvePagePath'
import { syncPagePathname } from '@/hooks/syncPagePathname'
import { createParentField, createBreadcrumbsField } from '@payloadcms/plugin-nested-docs'

import { Image } from '../blocks/Image/config'
import { Video } from '../blocks/Video/config'

export const Pages: CollectionConfig = {
  slug: 'pages',
  defaultSort: 'pathname',
  admin: {
    group: 'Website',
    components: {
      afterList: ['/components/admin/SystemPageCards#SystemPageCards'],
    },
    useAsTitle: 'title',
    defaultColumns: ['title', 'pathname', '_status'],
    listSearchableFields: ['title', 'pathname'],
    preview: async (data, { req }) => {
      const pathname = await resolvePagePath(data, req)
      return pathname ? `/api/preview?${new URLSearchParams({ path: pathname })}` : null
    },
    livePreview: {
      openByDefault: true,
      url: ({ data, req }) => resolvePagePath(data, req),
    },
  },
  access: {
    delete: ({ req }) => req.user ? { kind: { not_equals: 'home' } } : false,
    read: ({ req }) =>
      req.user
        ? true
        : {
            _status: { equals: 'published' },
          },
  },
  hooks: {
    beforeChange: [syncPagePathname],
    afterChange: [revalidateSite],
    afterDelete: [revalidateSite],
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      options: ['page', 'home'],
      defaultValue: 'page',
      required: true,
      access: { create: () => false, update: () => false },
      admin: { hidden: true, disableBulkEdit: true, disableListFilter: true },
      hooks: { beforeDuplicate: [() => 'page'] },
    },
    MetaTitleField({
      hasGenerateFn: false,
      overrides: { required: true, localized: false },
    }),
    {
      name: 'pathname',
      label: 'URL',
      type: 'text',
      unique: true,
      hooks: { beforeDuplicate: [() => null] },
      admin: { hidden: true },
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
              admin: { disableListColumn: true },
              blocks: [Image, Video],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'meta',
              type: 'group',
              label: 'SEO',
              fields: [
                OverviewField({ titlePath: 'title' }),
                MetaDescriptionField({ hasGenerateFn: false }),
                MetaImageField({ relationTo: 'media', hasGenerateFn: false }),
                PreviewField({ hasGenerateFn: true, titlePath: 'title' }),
              ],
            },
          ],
        },
        {
          label: 'Settings',
          fields: [
            slugField({
              position: 'main',
              disableUnique: true,
              slugify: ({ valueToSlugify }) =>
                valueToSlugify === '/' ? '/' : slugify(valueToSlugify),
              overrides: (field) => {
                const generate = field.fields.find((child) => 'name' in child && child.name === 'generateSlug')
                if (generate?.type === 'checkbox') {
                  generate.access = { update: ({ doc }) => doc?.kind !== 'home' }
                  generate.hooks = { ...generate.hooks, beforeDuplicate: [() => false] }
                }
                const slug = field.fields.find((child) => 'name' in child && child.name === 'slug')
                if (slug?.type === 'text') {
                  slug.access = { update: ({ doc }) => doc?.kind !== 'home' }
                  slug.hooks = {
                    ...slug.hooks,
                    beforeValidate: [({ value, originalDoc, path }) => {
                      if (originalDoc?.kind === 'home' || value === originalDoc?.slug) return value
                      if (typeof value === 'string' && (
                        value.trim().replaceAll('/', '') === '' ||
                        value.includes('/') || value === '.' || value === '..'
                      )) {
                        throw new ValidationError({
                          errors: [{ path: path.join('.'), message: 'Enter one URL segment, such as team. Choose its parent separately. The / URL is reserved for Home.' }],
                        })
                      }
                      return value
                    }],
                    beforeDuplicate: [({ value }) => `${value === '/' ? 'home' : value || 'page'}-copy-${crypto.randomUUID().slice(0, 8)}`],
                  }
                  slug.admin = {
                    ...slug.admin,
                    components: {
                      ...slug.admin?.components,
                      Field: {
                        path: '/components/admin/PageSlugField#PageSlugField',
                        clientProps: { useAsSlug: 'title' },
                      },
                    },
                    description:
                      'Use one URL segment, such as team. Choose a parent for /about/team. Edit the Home entry in Pages.',
                  }
                }
                return field
              },
            }),
            createParentField('pages', {
              label: 'Parent page',
              access: { update: ({ doc }) => doc?.kind !== 'home' },
              filterOptions: ({ id }) =>
                id
                  ? {
                      id: { not_equals: id },
                      'breadcrumbs.doc': { not_in: [id] },
                    }
                  : true,
              admin: {
                condition: (data) => data.kind !== 'home',
                description: 'Leave empty for a top-level page.',
              },
            }),
          ],
        },
      ],
    },
    createBreadcrumbsField('pages', { admin: { hidden: true } }),
  ],
}
