import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
}
