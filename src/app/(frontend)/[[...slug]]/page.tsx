import config from '@payload-config'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { BlocksRenderer } from '@/components/BlocksRenderer'
import { generatePageMetadata } from '@/lib/seo/generatePageMetadata'

type Props = { params: Promise<{ slug?: string[] }> }

export default async function Page({ params }: Props) {
  const { slug } = await params
  const { isEnabled } = await draftMode()
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    limit: 1,
    pagination: false,
    overrideAccess: isEnabled,
    context: { livePreview: true },
    where: { slug: { equals: slug?.join('/') || '/' } },
  })
  const page = docs[0]
  if (!page) notFound()

  return <BlocksRenderer blocks={page.layout} />
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const pageSlug = slug?.join('/') || '/'
  const { isEnabled } = await draftMode()
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    limit: 1,
    pagination: false,
    overrideAccess: isEnabled,
    context: { livePreview: true },
    where: { slug: { equals: pageSlug } },
  })
  const page = docs[0]
  if (!page) notFound()

  const settings = await payload.findGlobal({
    slug: 'site-settings',
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
