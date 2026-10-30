/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates. This file serves
 * the default crawler rules and sitemap URL using the configured server URL.
 */

import type { MetadataRoute } from 'next'
import config from '@payload-config'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { serverURL } = await config

  return {
    host: serverURL,
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/preview'],
    },
    sitemap: new URL('/sitemap.xml', serverURL).href,
  }
}
