import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPreferences } from '@/lib/getPreferences'
import { getPayload, type Where } from 'payload'

import { generatePageMetadata } from '@/lib/seo/generatePageMetadata'
import type { Page } from '@/payload-types'

export async function findPage(where: Where, isPreview: boolean) {
  if (!isPreview) return findPublishedPage(where)
  return queryPage(where, true)
}

const findPublishedPage = unstable_cache(
  (where: Where) => queryPage(where, false),
  ['published-page'],
  { tags: ['site'], revalidate: 3600 },
)

async function queryPage(where: Where, isPreview: boolean) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    draft: isPreview,
    limit: 1,
    pagination: false,
    overrideAccess: isPreview,
    where,
  })

  return docs[0] ?? null
}

export async function findPageByPath(segments: string[], isPreview: boolean) {
  const pathname = `/${segments.join('/')}`
  const slug = segments.at(-1)
  if (!slug) return null

  const page = await findPage(
    { and: [{ slug: { equals: slug } }, { isHome: { not_equals: true } }] },
    isPreview,
  )
  return page?.path === pathname ? page : null
}

export async function getPageMetadata(page: Page, path: string) {
  const settings = await getPreferences()

  return generatePageMetadata({
    page,
    settings,
    path,
    siteURL: process.env.NEXT_PUBLIC_SERVER_URL!,
  })
}
