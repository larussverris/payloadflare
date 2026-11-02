/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates. This route renders
 * authenticated page drafts for the path supplied in the query string.
 * Customize content in Payload and block implementations in src/blocks/.
 */

import { notFound } from 'next/navigation'
import { cache } from 'react'

import { getPreviewContext } from '@/utilities/getPreviewContext'
import { renderBlocks } from '@/utilities/renderBlocks'

type Props = { searchParams: Promise<{ path?: string | string[] }> }

async function getPathname(searchParams: Props['searchParams']) {
  const { path = '/' } = await searchParams
  if (
    typeof path !== 'string' ||
    !path.startsWith('/') ||
    path.startsWith('//') ||
    /[\\?#\r\n]/.test(path)
  ) {
    notFound()
  }
  return path.slice(1)
}

const findPageByPath = cache(async (pathname: string) => {
  const segments = pathname ? pathname.split('/') : []
  const slug = segments.at(-1)
  const isHome = segments.length === 0

  const { payload, user } = await getPreviewContext()
  const {
    docs: [page],
  } = await payload.find({
    collection: 'pages',
    depth: 2,
    context: { computeHierarchyPaths: true },
    // Explicitly select the native path so all ancestors are included in this beta.
    select: { _h_slugPath: true, isHome: true, layout: true },
    draft: true,
    user,
    limit: 1,
    pagination: false,
    where: isHome
      ? { isHome: { equals: true } }
      : { and: [{ slug: { equals: slug } }, { isHome: { not_equals: true } }] },
  })
  if (isHome) return page ?? null
  return page?._h_slugPath === pathname ? page : null
})

export default async function PreviewPage({ searchParams }: Props) {
  const page = await findPageByPath(await getPathname(searchParams))
  if (page) return renderBlocks(page.layout)

  const { payload, user } = await getPreviewContext()
  const notFoundPage = await payload.findGlobal({
    slug: 'not-found-page',
    draft: true,
    user,
  })

  return renderBlocks(notFoundPage.layout)
}
