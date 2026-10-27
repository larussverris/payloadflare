import type { Metadata } from 'next'
import { getPreferences } from '@/utilities/getPreferences'
import { draftMode } from 'next/headers'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { renderBlocks } from '@/utilities/renderBlocks'

type Props = { params: Promise<{ slug?: string[] }> }

// Cache each page path. Next.js bypasses this cache in Draft Mode.
const findPageByPath = unstable_cache(
  async (segments: string[], isPreview: boolean) => {
    const pathname = segments.join('/')
    const slug = segments.at(-1)
    const isHome = segments.length === 0

    const payload = await getPayload({ config })
    const {
      docs: [page],
    } = await payload.find({
      collection: 'pages',
      context: { computeHierarchyPaths: true },
      draft: isPreview,
      limit: 1,
      pagination: false,
      overrideAccess: isPreview,
      where: isHome
        ? { isHome: { equals: true } }
        : { and: [{ slug: { equals: slug } }, { isHome: { not_equals: true } }] },
    })
    if (isHome) return page ?? null
    return page?._h_slugPath === pathname ? page : null
  },
  undefined,
  {
    revalidate: 3600,
  },
)

export default async function Page({ params }: Props) {
  const { slug = [] } = await params
  const { isEnabled } = await draftMode()
  const page = await findPageByPath(slug, isEnabled)
  if (!page) notFound()

  return renderBlocks(page.layout)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug = [] } = await params
  const { isEnabled } = await draftMode()
  const page = await findPageByPath(slug, isEnabled)
  if (!page) notFound()

  const settings = await getPreferences()
  const path = `/${slug.join('/')}`
  const title = page.meta?.title || page.title

  const description = page.meta?.description || settings.meta?.description || undefined
  const metadata: Metadata = {
    title,
    ...(page.meta?.description ? { description: page.meta.description } : {}),
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      title,
      description,
      siteName: settings.meta?.title || undefined,
      url: path,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }

  const image = page.meta?.image || settings.meta?.image
  if (image && typeof image === 'object' && image.url) {
    const sharingImage = {
      url: image.url,
      alt: image.alt,
      width: image.width ?? undefined,
      height: image.height ?? undefined,
    }

    metadata.openGraph = { ...metadata.openGraph, images: [sharingImage] }
    metadata.twitter = {
      ...metadata.twitter,
      card: 'summary_large_image',
      images: [sharingImage],
    }
  }

  return metadata
}
