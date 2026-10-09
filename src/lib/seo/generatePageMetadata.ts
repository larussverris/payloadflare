import type { Metadata } from 'next'

import type { Config, Page } from '@/payload-types'
import { getPagePath } from '@/lib/pages/getPagePath'

type Props = {
  page: Page
  settings: Config['globals']['site-settings']
  slug: string
  siteURL: string
  isPreview: boolean
}

export function generatePageMetadata({
  page,
  settings,
  slug,
  siteURL,
  isPreview,
}: Props): Metadata {
  const siteName = settings.siteName || 'Your Website Name'
  let title = page.title || siteName
  if (page.meta?.title) {
    title = page.meta.title
  } else if (slug === '/') {
    title = siteName
  }

  const description = page.meta?.description || settings.defaultDescription || undefined
  const path = getPagePath(slug)
  const metadata: Metadata = {
    metadataBase: new URL(siteURL),
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      title,
      description,
      siteName,
      url: path,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }

  const image = page.meta?.image || settings.defaultSharingImage
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

  if (isPreview) {
    metadata.robots = { index: false, follow: false }
  }

  return metadata
}
