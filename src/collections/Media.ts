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
      headers.set('Cloudflare-CDN-Cache-Control', 'no-store')

      if (!headers.get('Content-Type')?.startsWith('image/')) {
        return headers
      }

      // This collection permits public reads. Cache the same Payload URL
      // at the edge so repeat visitors do not need another Payload/R2 read.
      headers.set(
        'Cache-Control',
        process.env.NODE_ENV === 'production'
          ? 'public, max-age=2592000, s-maxage=2592000'
          : 'no-store',
      )
      headers.set(
        'Cloudflare-CDN-Cache-Control',
        process.env.NODE_ENV === 'production' ? 'public, s-maxage=2592000' : 'no-store',
      )

      return headers
    },
  },
}
