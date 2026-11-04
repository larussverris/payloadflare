/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates. Sitemap entries
 * are generated automatically from published pages in Payload.
 */

import type { MetadataRoute } from 'next'
import { unstable_cache } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

async function sitemap() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    context: { computeHierarchyPaths: true },
    depth: 0,
    pagination: false,
    select: {
      _h_slugPath: true,
      slug: true,
      parent: true,
      updatedAt: true,
    },
  })

  const entries: MetadataRoute.Sitemap = []
  for (const page of docs) {
    if (!page._h_slugPath) continue
    const path = `/${page._h_slugPath.replace(/^home$/, '')}`

    entries.push({
      url: new URL(path, payload.config.serverURL).href,
      lastModified: page.updatedAt,
    })
  }

  return entries
}

export default unstable_cache(sitemap, ['sitemap'], { revalidate: 3600 })
