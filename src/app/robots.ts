import type { MetadataRoute } from 'next'
import config from '@payload-config'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { serverURL } = await config

  return {
    host: serverURL,
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: new URL('/sitemap.xml', serverURL).href,
  }
}
