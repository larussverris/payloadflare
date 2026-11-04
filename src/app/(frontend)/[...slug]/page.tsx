/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates.
 * Manage page content in Payload and block implementations in src/blocks/.
 */

import type { Metadata } from 'next'
import { cacheLife } from 'next/cache'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getPreferences } from '@/utilities/getPreferences'
import { renderBlocks } from '@/utilities/renderBlocks'

type Props = { params: Promise<{ slug: string[] }> }

async function queryPage(pathname: string, draft: boolean) {
  'use cache'
  cacheLife('hours')

  const slug = pathname.split('/').at(-1)!

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    overrideAccess: draft,
    draft,
    depth: 2,
    context: { computeHierarchyPaths: true },
    // Explicitly select the native path so all ancestors are included in this beta.
    select: {
      _h_slugPath: true,
      // This beta needs status to compute draft ancestor paths correctly.
      _status: true,
      slug: true,
      title: true,
      meta: true,
      layout: true,
    },
    pagination: false,
    where: { slug: { equals: slug } },
  })
  return docs.find((page) => page._h_slugPath === pathname) ?? null
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const pathname = slug.join('/')
  const { isEnabled } = await draftMode()
  const page = await queryPage(pathname, isEnabled)
  if (!page) notFound()

  return renderBlocks(page.layout)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await queryPage(slug.join('/'), false)
  if (!page) return {}

  const settings = await getPreferences()
  const path = page.slug === 'home' ? '/' : `/${page._h_slugPath}`
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
