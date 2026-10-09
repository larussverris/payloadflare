import type { MetadataRoute } from 'next'
import config from '@payload-config'
import { getPayload } from 'payload'
import { getPagePath } from '@/lib/pages/getPagePath'

// Prevent a cached sitemap from omitting newly published pages or listing deleted/unpublished pages.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    draft: false,
    depth: 0,
    pagination: false,
    select: { slug: true, updatedAt: true },
    where: { _status: { equals: 'published' } },
  })
  const siteURL = process.env.NEXT_PUBLIC_SERVER_URL!

  const entries: MetadataRoute.Sitemap = []

  for (const page of docs) {
    const { slug, updatedAt } = page
    if (!slug) continue

    const path = getPagePath(slug)
    entries.push({
      url: new URL(path, siteURL).href,
      lastModified: updatedAt,
    })
  }

  return entries
}
