import type { GlobalConfig } from 'payload'

import { revalidatePage } from '@/hooks/revalidatePage'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: { group: 'Website' },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  versions: true,
  hooks: { afterChange: [revalidatePage] },
  fields: [
    {
      type: 'collapsible',
      label: 'Search & sharing',
      admin: { initCollapsed: false },
      fields: [
        {
          name: 'siteName',
          type: 'text',
          label: 'Site name',
          defaultValue: 'Your Website Name',
          admin: {
            description:
              'The website name used in sharing previews and as the fallback homepage title.',
          },
        },
        {
          name: 'defaultDescription',
          type: 'textarea',
          label: 'Default description',
          admin: {
            description: 'Used in search and sharing previews when a page has no SEO description.',
          },
        },
        {
          name: 'defaultSharingImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Default sharing image',
          filterOptions: { mimeType: { contains: 'image/' } },
          admin: {
            description: 'Used when a page has no SEO image. Recommended size: 1200 × 630 pixels.',
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Business information',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'group',
          name: 'business',
          label: false,
          admin: {
            description:
              'Public company details for search engines. Add the business name to enable this. Only fill in details that apply to your company.',
          },
          fields: [
            { name: 'name', type: 'text', label: 'Business name' },
            { name: 'legalName', type: 'text', label: 'Legal company name' },
            { name: 'description', type: 'textarea', label: 'Business description' },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Company logo',
              filterOptions: { mimeType: { contains: 'image/' } },
              admin: { description: 'Use your company logo, rather than a social sharing photo.' },
            },
            { name: 'email', type: 'email', label: 'Public contact email' },
            {
              name: 'telephone',
              type: 'text',
              label: 'Public phone number',
              admin: { description: 'Include the country code, for example +354.' },
            },
            {
              name: 'address',
              type: 'group',
              label: 'Business address',
              fields: [
                { name: 'streetAddress', type: 'text', label: 'Street address' },
                { name: 'addressLocality', type: 'text', label: 'Town or city' },
                { name: 'postalCode', type: 'text', label: 'Postal code' },
                {
                  name: 'addressCountry',
                  type: 'text',
                  label: 'Country code',
                  admin: { description: 'Two-letter country code, for example IS for Iceland.' },
                },
              ],
            },
            {
              name: 'profiles',
              type: 'array',
              label: 'Official profiles',
              admin: {
                description:
                  'Links to official company profiles, such as Facebook, Instagram, or LinkedIn.',
              },
              fields: [
                {
                  name: 'url',
                  type: 'text',
                  label: 'Profile URL',
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Advanced',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'llmsText',
          label: 'AI information (llms.txt)',
          type: 'textarea',
          admin: {
            description:
              'Information about the website for AI tools, published automatically at /llms.txt. You can usually leave this unchanged. Leave blank to disable the file.',
          },
        },
      ],
    },
  ],
}
