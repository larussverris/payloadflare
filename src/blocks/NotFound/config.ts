import type { Block } from 'payload'

export const NotFound: Block = {
  slug: 'notFound',
  labels: { singular: 'Not Found', plural: 'Not Found' },
  interfaceName: 'NotFoundBlock',
  fields: [
    { name: 'heading', type: 'text', required: true, defaultValue: 'Page not found' },
    { name: 'message', type: 'textarea', defaultValue: 'The page you are looking for does not exist.' },
  ],
}
