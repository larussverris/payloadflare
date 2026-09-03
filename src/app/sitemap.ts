import type { MetadataRoute } from 'next'
import config from '@payload-config'
import { getPayload } from 'payload'

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL!

/**
 * Add one entry for every public page that search engines should discover.
 *
 * Static routes can be added directly below. For CMS-backed routes, initialize Payload with
 * `getPayload({ config })`, use `payload.find()` to retrieve the public documents, and map
 * their slugs and `updatedAt` values to `url` and `lastModified` sitemap entries. Use
 * `changeFrequency`, `priority`, and language alternates where they accurately describe a page.
 *
 * Docs: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })

  return [
    {
      url: siteUrl,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
}
