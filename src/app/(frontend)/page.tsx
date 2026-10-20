import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { BlocksRenderer } from '@/components/BlocksRenderer'
import { findPage, getPageMetadata } from '@/lib/pages/findPage'

export default async function HomePage() {
  const { isEnabled } = await draftMode()
  const page = await findPage({ isHome: { equals: true } }, isEnabled)
  if (!page) notFound()

  return <BlocksRenderer blocks={page.layout} />
}

export async function generateMetadata() {
  const { isEnabled } = await draftMode()
  const page = await findPage({ isHome: { equals: true } }, isEnabled)
  if (!page) notFound()

  return getPageMetadata(page, '/')
}
