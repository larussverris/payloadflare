import type { MetadataRoute } from 'next'
import { unstable_cache } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

const sitemap = unstable_cache(
  async (): Promise<MetadataRoute.Sitemap> => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'pages',
      draft: false,
      overrideAccess: false,
      depth: 0,
      pagination: false,
      select: {
        path: true,
        slug: true,
        folder: true,
        isHome: true,
        updatedAt: true,
      },
      where: {
        _status: { equals: 'published' },
        isHome: { not_equals: true },
      },
    })
    const siteURL = process.env.NEXT_PUBLIC_SERVER_URL!

    const entries: MetadataRoute.Sitemap = [{ url: new URL('/', siteURL).href }]
    for (const page of docs) {
      if (!page.path) continue

      entries.push({
        url: new URL(page.path, siteURL).href,
        lastModified: page.updatedAt,
      })
    }

    return entries
  },
  ['sitemap'],
  { tags: ['site'], revalidate: 3600 },
)

export default sitemap
