/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates. Manage site
 * preferences in Payload; this helper handles fetching and caching them.
 */

import config from '@payload-config'
import { cacheLife } from 'next/cache'
import { getPayload } from 'payload'

export async function getPreferences() {
  'use cache'
  cacheLife('hours')

  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'preferences', depth: 1 })
}
