import { cacheLife } from 'next/cache'
import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  'use cache'

  cacheLife('hours')

  return [
    {
      url: siteUrl,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
}
