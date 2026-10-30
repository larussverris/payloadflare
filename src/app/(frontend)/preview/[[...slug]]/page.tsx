/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates. This route renders
 * authenticated page drafts and the 404 draft for unmatched paths. Customize
 * content in Payload and block implementations in src/blocks/.
 */

import type { Metadata } from 'next'
import { cache } from 'react'

import { getPreviewContext } from '@/utilities/getPreviewContext'
import { renderBlocks } from '@/utilities/renderBlocks'

type Props = { params: Promise<{ slug?: string[] }> }

const getPreviewContent = cache(async (pathname: string) => {
  const { payload, user } = await getPreviewContext()
  const isHome = pathname === ''
  const slug = pathname.split('/').at(-1)
  const {
    docs: [page],
  } = await payload.find({
    collection: 'pages',
    context: { computeHierarchyPaths: true },
    select: { _h_slugPath: true, isHome: true, title: true, meta: true, layout: true },
    draft: true,
    overrideAccess: false,
    user,
    limit: 1,
    pagination: false,
    where: isHome
      ? { isHome: { equals: true } }
      : { and: [{ slug: { equals: slug } }, { isHome: { not_equals: true } }] },
  })

  if (page && (isHome || page._h_slugPath === pathname)) {
    return {
      title: page.meta?.title || page.title,
      layout: page.layout,
      canonical: `/${pathname}`,
    }
  }

  const notFoundPage = await payload.findGlobal({
    slug: 'not-found-page',
    draft: true,
    overrideAccess: false,
    user,
  })
  return {
    title: notFoundPage.title,
    layout: notFoundPage.layout,
    canonical: undefined,
  }
})

export default async function PreviewPage({ params }: Props) {
  const { slug = [] } = await params
  const page = await getPreviewContent(slug.join('/'))
  return renderBlocks(page.layout)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug = [] } = await params
  const page = await getPreviewContent(slug.join('/'))
  return {
    title: page.title,
    alternates: page.canonical ? { canonical: page.canonical } : undefined,
    robots: { index: false, follow: false },
  }
}
