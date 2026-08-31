import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL

export default function robots(): MetadataRoute.Robots {
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
