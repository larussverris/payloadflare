import type { Metadata } from 'next'

import type { Config, Page } from '@/payload-types'

type Props = {
  page: Pick<Page, 'title' | 'meta'>
  settings: Config['globals']['preferences']
  path: string
  siteURL: string
}

export function generatePageMetadata({ page, settings, path, siteURL }: Props): Metadata {
  const siteTitle = settings.meta?.title || 'Your Website Name'
  const title = page.meta?.title || page.title || siteTitle

  const description = page.meta?.description || settings.meta?.description || undefined
  const metadata: Metadata = {
    metadataBase: new URL(siteURL),
    title,
    description,
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
