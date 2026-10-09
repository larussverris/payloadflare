import type { Block } from 'payload'

export const Video: Block = {
  slug: 'video',
  interfaceName: 'VideoBlock',
  fields: [
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: { mimeType: { contains: 'video/' } },
    },
    { name: 'caption', type: 'text' },
    {
      name: 'captions',
      label: 'Closed captions',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { equals: 'text/vtt' } },
      admin: { description: 'Optional WebVTT (.vtt) file for accessible video captions.' },
    },
    {
      name: 'captionsLanguage',
      type: 'text',
      defaultValue: 'en',
      admin: { description: 'Language code for the captions, such as en or is.' },
    },
  ],
}
