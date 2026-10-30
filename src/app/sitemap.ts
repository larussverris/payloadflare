/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates. Sitemap entries
 * are generated automatically from published pages in Payload.
 */

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
        _h_slugPath: true,
        updatedAt: true,
      },
      where: {
        _status: { equals: 'published' },
        isHome: { not_equals: true },
      },
    })
    const siteURL = payload.config.serverURL

    const entries: MetadataRoute.Sitemap = [{ url: new URL('/', siteURL).href }]
    for (const page of docs) {
      if (!page._h_slugPath) continue

      entries.push({
        url: new URL(`/${page._h_slugPath}`, siteURL).href,
        lastModified: page.updatedAt,
      })
    }

    return entries
  },
  ['sitemap'],
  { revalidate: 3600 },
)

export default sitemap
