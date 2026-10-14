import type { Field } from 'payload'

import { getContactURL } from '../lib/links/getContactURL'
import { getWebsiteURL } from '../lib/links/getWebsiteURL'

type LinkData = { type?: string }
type LinkValidationOptions = { siblingData?: LinkData }
const isLink = (data: LinkData) => data.type === 'page' || data.type === 'url'

export const linkFields: Field[] = [
  {
    name: 'label',
    label: 'Button text',
    admin: { description: 'What visitors will see, such as Contact us or Download brochure.' },
    type: 'text',
    required: true,
  },
  {
    name: 'type',
    label: 'What should this button do?',
    type: 'select',
    defaultValue: 'page',
    required: true,
    options: [
      { label: 'Open a page', value: 'page' },
      { label: 'Open a website', value: 'url' },
      { label: 'Download a file', value: 'download' },
      { label: 'Call a number', value: 'phone' },
      { label: 'Send an email', value: 'email' },
    ],
  },
  {
    name: 'page',
    label: 'Which page?',
    type: 'relationship',
    relationTo: 'pages',
    maxDepth: 1,
    admin: {
      condition: (_, siblingData) => siblingData.type === 'page',
    },
    validate: (value: unknown, { siblingData }: LinkValidationOptions) =>
      siblingData?.type !== 'page' || value != null || 'Choose a page.',
  },
  {
    name: 'url',
    label: 'Website address',
    type: 'text',
    admin: {
      condition: (_, siblingData) => siblingData.type === 'url',
      description: 'For example example.com. We add https:// for you. You can also use /path.',
    },
    validate: (value: unknown, { siblingData }: LinkValidationOptions) =>
      siblingData?.type !== 'url' ||
      Boolean(getWebsiteURL(value)) || 'Enter a website address, such as example.com.',
  },
  {
    name: 'file',
    label: 'Which file?',
    type: 'upload',
    relationTo: 'media',
    maxDepth: 1,
    admin: {
      condition: (_, siblingData) => siblingData.type === 'download',
    },
    validate: (value: unknown, { siblingData }: LinkValidationOptions) =>
      siblingData?.type !== 'download' ||
      value != null || 'Choose a file.',
  },
  {
    name: 'phone',
    label: 'Phone number',
    type: 'text',
    admin: {
      condition: (_, siblingData) => siblingData.type === 'phone',
      description: 'Include the country code, for example +354 555 1234.',
    },
    validate: (value: unknown, { siblingData }: LinkValidationOptions) =>
      siblingData?.type !== 'phone' || Boolean(getContactURL('phone', value)) ||
      'Enter a valid phone number.',
  },
  {
    name: 'email',
    label: 'Email address',
    type: 'text',
    admin: {
      condition: (_, siblingData) => siblingData.type === 'email',
      description: 'For example hello@example.com. Visitors will open their email app.',
    },
    validate: (value: unknown, { siblingData }: LinkValidationOptions) =>
      siblingData?.type !== 'email' || Boolean(getContactURL('email', value)) ||
      'Enter a valid email address.',
  },
  {
    name: 'newTab',
    label: 'Open in a new tab',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      condition: (_, siblingData) => isLink(siblingData),
      description: 'Keep this page open and open the destination in a new tab.',
    },
  },
]
