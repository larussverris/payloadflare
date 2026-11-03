/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates.
 * Manage 404 page content in the NotFoundPage global.
 */

import { unstable_cache } from 'next/cache'
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

const getNotFoundPage = unstable_cache(findNotFoundPage, ['not-found-page'], { revalidate: 3600 })

export default async function NotFound() {
  const { isEnabled } = await draftMode()
  const page = await (isEnabled ? findNotFoundPage(true) : getNotFoundPage())

  return renderBlocks(page?.layout)
}
