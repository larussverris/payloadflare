// Site-wide settings for search and sharing defaults, the browser icon, public business details,
// and optional AI information published at /llms.txt.
import type { GlobalConfig } from 'payload'
import {
  OverviewField,
  MetaTitleField,
  MetaDescriptionField,
  MetaImageField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Preferences: GlobalConfig = {
  slug: 'preferences',
  label: 'Preferences',
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Search & sharing',
          fields: [
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
              label: 'Browser icon (favicon)',
              filterOptions: {
                mimeType: {
                  in: ['image/png', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'],
                },
              },
              admin: {
                description:
                  'The small icon shown in browser tabs and bookmarks. Choose a square PNG, SVG, or ICO image.',
              },
            },
            {
              name: 'meta',
              type: 'group',
              label: false,
              admin: {
                description:
                  'Default search and sharing information. Individual pages can override these values in their SEO tab.',
              },
              fields: [
                OverviewField({}),
                MetaTitleField({ hasGenerateFn: false }),
                MetaDescriptionField({ hasGenerateFn: false }),
                MetaImageField({ relationTo: 'media', hasGenerateFn: false }),
                PreviewField({ hasGenerateFn: true }),
              ],
            },
          ],
        },
        {
          label: 'Business details',
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
                  admin: {
                    description: 'Use your company logo, rather than a social sharing photo.',
                  },
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
                      admin: {
                        description: 'Two-letter country code, for example IS for Iceland.',
                      },
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
          label: 'Advanced',
          fields: [
            {
              type: 'collapsible',
              label: 'AI information (llms.txt)',
              admin: { initCollapsed: true },
              fields: [
                {
                  name: 'enableLlmsText',
                  label: 'Enable AI information (llms.txt)',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    description:
                      'Publish information about your website for AI tools at /llms.txt.',
                  },
                },
                {
                  name: 'llmsText',
                  label: 'AI information (llms.txt)',
                  type: 'textarea',
                  admin: {
                    condition: (data) => Boolean(data.enableLlmsText),
                    description:
                      'The text published at /llms.txt. Turning off AI information keeps this text for later.',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
