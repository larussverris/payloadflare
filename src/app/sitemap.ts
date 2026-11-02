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
      depth: 0,
      pagination: false,
      select: {
        path: true,
        updatedAt: true,
      },
    })

    const entries: MetadataRoute.Sitemap = []
    for (const page of docs) {
      if (!page.path) continue

      entries.push({
        url: new URL(page.path, payload.config.serverURL).href,
        lastModified: page.updatedAt,
      })
    }

    return entries
  },
  ['sitemap'],
  { revalidate: 3600 },
)

export default sitemap
