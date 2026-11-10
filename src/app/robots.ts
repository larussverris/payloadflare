/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates. This file serves
 * the default crawler rules and sitemap URL using the configured server URL.
 */

import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    host: process.env.NEXT_PUBLIC_SERVER_URL,
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/preview'],
    },
    sitemap: new URL('/sitemap.xml', process.env.NEXT_PUBLIC_SERVER_URL).href,
  }
}
