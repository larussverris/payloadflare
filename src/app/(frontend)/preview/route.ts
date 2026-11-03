/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates.
 * Configure preview URLs in Payload collection and global configs.
 */

import { draftMode } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

import config from '@payload-config'
import { getPayload } from 'payload'

export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) notFound()
  const url = new URL(request.url)
  const destination = new URL(url.searchParams.get('path') || '/', url.origin)
  if (destination.origin !== url.origin) notFound()

  const draft = await draftMode()
  draft.enable()
  redirect(destination.href)
}

export async function POST() {
  const draft = await draftMode()
  draft.disable()
  return new Response(null, { status: 204 })
}
