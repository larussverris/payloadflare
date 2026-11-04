/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates.
 * Manage 404 page content in the NotFoundPage global.
 */

import { cacheLife } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'

import { renderBlocks } from '@/utilities/renderBlocks'

async function findNotFoundPage(draft = false) {
  const payload = await getPayload({ config })
  return payload.findGlobal({
    slug: 'not-found-page',
    disableErrors: true,
    draft,
    overrideAccess: draft,
  })
}

async function getNotFoundPage() {
  'use cache'
  cacheLife('hours')

  return findNotFoundPage()
}

export default async function NotFound() {
  const { isEnabled } = await draftMode()
  const page = await (isEnabled ? findNotFoundPage(true) : getNotFoundPage())

  return renderBlocks(page?.layout)
}
