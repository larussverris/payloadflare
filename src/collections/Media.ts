import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // These are not supported on Workers yet due to lack of sharp
    crop: false,
    focalPoint: false,
    modifyResponseHeaders: ({ headers }) => {
      // Cache all public media in browsers, but only images at Cloudflare's edge.
      headers.set('Cache-Control', 'public, max-age=2592000')
      headers.set('Cloudflare-CDN-Cache-Control', 'no-store')

      if (!headers.get('Content-Type')?.startsWith('image/')) {
        return headers
      }

      headers.set('Cloudflare-CDN-Cache-Control', 'public, s-maxage=2592000')

      return headers
    },
  },
}
