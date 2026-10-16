import config from '@payload-config'
import { getPayload } from 'payload'

import { BlocksRenderer } from '@/components/BlocksRenderer'
import type { Page } from '@/payload-types'

export default async function NotFound() {
  let page: Page | undefined
  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'pages',
      draft: false,
      limit: 1,
      pagination: false,
      overrideAccess: false,
      where: { slug: { equals: '404' } },
    })
    page = docs[0]
  } catch (error) {
    console.error('Unable to load the 404 page content.', error)
  }

  return page ? <BlocksRenderer blocks={page.layout} /> : <h1>Page not found</h1>
}
