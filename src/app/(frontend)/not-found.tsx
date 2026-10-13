import config from '@payload-config'
import { getPayload } from 'payload'

import { BlocksRenderer } from '@/components/BlocksRenderer'

export default async function NotFound() {
  let blocks: Page['layout']
  let title: string | undefined
  try {
    const payload = await getPayload({ config })
    const page = await payload.findGlobal({
      slug: 'not-found-page',
      draft: false,
      overrideAccess: false,
    })

    blocks = page.layout
    title = page.title
  } catch (error) {
    console.error('Unable to load the 404 page content.', error)
  }

  return (
    <>
      {title && <title>{title}</title>}
      <BlocksRenderer blocks={blocks} />
    </>
  )
}
import type { Page } from '@/payload-types'
