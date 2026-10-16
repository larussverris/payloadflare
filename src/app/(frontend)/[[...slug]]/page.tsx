import config from '@payload-config'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { BlocksRenderer } from '@/components/BlocksRenderer'
import { getPagePath } from '@/lib/pages/getPagePath'
import { generatePageMetadata } from '@/lib/seo/generatePageMetadata'
function getPagePathQuery(pathname: string) {
  return {
    'breadcrumbs.url': { equals: pathname },
    slug: {
      equals: pathname === '/' ? 'home' : decodeURIComponent(pathname.split('/').filter(Boolean).at(-1) || ''),
    },
  }
}

type Props = { params: Promise<{ slug?: string[] }> }

export default async function Page({ params }: Props) {
  const { slug = [] } = await params
  const { isEnabled } = await draftMode()
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    draft: isEnabled,
    limit: 1,
    pagination: false,
    overrideAccess: isEnabled,
    context: { livePreview: true },
    where: getPagePathQuery(getPagePath(slug.join('/'))),
  })
  const page = docs[0]
  if (!page) notFound()

  return <BlocksRenderer blocks={page.layout} />
}

export async function generateMetadata({ params }: Props) {
  const { slug = [] } = await params
  const pageSlug = slug.join('/')
  const { isEnabled } = await draftMode()
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    draft: isEnabled,
    limit: 1,
    pagination: false,
    overrideAccess: isEnabled,
    context: { livePreview: true },
    where: getPagePathQuery(getPagePath(pageSlug)),
  })
  const page = docs[0]
  if (!page) notFound()

  const settings = await payload.findGlobal({
    slug: 'preferences',
    depth: 1,
    overrideAccess: false,
  })

  return generatePageMetadata({
    page,
    settings,
    slug: pageSlug,
    siteURL: process.env.NEXT_PUBLIC_SERVER_URL!,
    isPreview: isEnabled,
  })
}
