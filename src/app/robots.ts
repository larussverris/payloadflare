import { cacheLife } from 'next/cache'
import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL

export default async function robots(): Promise<MetadataRoute.Robots> {
  'use cache'

  cacheLife('max')

  return {
    host: siteUrl,
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
