/**
 * Template-maintained package. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates. Configure which
 * upload collection receives Cloudflare thumbnails in src/payload.config.ts.
 */

import type { GetAdminThumbnail, Plugin } from 'payload'

const adminThumbnail: GetAdminThumbnail = ({ doc }) => {
  if (typeof doc.mimeType !== 'string' || typeof doc.url !== 'string' || !doc.url) return null

  if (doc.mimeType.startsWith('video/')) {
    const source = new URL(doc.url, process.env.NEXT_PUBLIC_SERVER_URL).href
    return `/cdn-cgi/media/mode=frame,time=0s,width=320,height=320,fit=cover,format=jpg/${source}`
  }

  if (!doc.mimeType.startsWith('image/')) return null
  if (doc.mimeType === 'image/svg+xml') return doc.url

  const source = doc.url.startsWith('/') ? doc.url.slice(1) : doc.url
  return `/cdn-cgi/image/width=320,height=320,fit=cover,quality=80,format=auto/${source}`
}

/** Adds Cloudflare image and video thumbnails to the selected upload collection. */
export function cloudflareMediaThumbnails({
  collection: collectionSlug,
}: {
  collection: string
}): Plugin {
  return (config) => {
    // Skip in development
    if (process.env.NODE_ENV === 'development') return config

    return {
      ...config,
      collections: config.collections?.map((collection) => {
        if (collection.slug !== collectionSlug || !collection.upload) return collection

        return {
          ...collection,
          upload: {
            ...(typeof collection.upload === 'object' ? collection.upload : {}),
            adminThumbnail,
          },
        }
      }),
    }
  }
}
