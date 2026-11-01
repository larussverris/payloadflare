/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates. Reuse this helper
 * to authenticate preview requests and access Payload.
 */

import 'server-only'

import config from '@payload-config'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'

// Memoize only within this render. Every preview read must verify the session.
export const getPreviewContext = cache(async () => {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) notFound()

  return { payload, user }
})
