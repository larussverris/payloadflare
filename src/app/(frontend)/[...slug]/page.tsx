import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { BlocksRenderer } from '@/components/BlocksRenderer'
import { findPageByPath, getPageMetadata } from '@/lib/pages/findPage'

type Props = { params: Promise<{ slug: string[] }> }

export default async function Page({ params }: Props) {
  const { slug } = await params
  const { isEnabled } = await draftMode()
  const page = await findPageByPath(slug, isEnabled)
  if (!page) notFound()

  return <BlocksRenderer blocks={page.layout} />
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const { isEnabled } = await draftMode()
  const page = await findPageByPath(slug, isEnabled)
  if (!page) notFound()

  return getPageMetadata(page, `/${slug.join('/')}`)
}
