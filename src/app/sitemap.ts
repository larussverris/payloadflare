import type { MetadataRoute } from 'next'
import config from '@payload-config'
import { getPayload } from 'payload'

// Prevent a cached sitemap from omitting newly published pages or listing deleted/unpublished pages.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    draft: false,
    overrideAccess: false,
    depth: 0,
    pagination: false,
    select: { breadcrumbs: true, updatedAt: true },
    where: { _status: { equals: 'published' } },
  })
  const siteURL = process.env.NEXT_PUBLIC_SERVER_URL!

  const entries: MetadataRoute.Sitemap = []
  for (const page of docs) {
    const pathname = page.breadcrumbs?.at(-1)?.url
    const { updatedAt } = page
    if (!pathname || pathname === '/404') continue
    entries.push({
      url: new URL(pathname, siteURL).href,
      lastModified: updatedAt,
    })
  }

  return entries
}
