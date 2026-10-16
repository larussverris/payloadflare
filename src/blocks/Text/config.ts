import type { Block } from 'payload'

export const Text: Block = {
  slug: 'text',
  interfaceName: 'TextBlock',
  fields: [
    { name: 'heading', type: 'text' },
    { name: 'body', type: 'textarea' },
  ],
}
