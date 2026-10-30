import { unstable_cache } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { renderBlocks } from '@/utilities/renderBlocks'
import type { NotFoundPage } from '@/payload-types'

const getNotFoundPage = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    return payload.findGlobal({
      slug: 'not-found-page',
      draft: false,
      overrideAccess: false,
    })
  },
  ['not-found-page'],
  { revalidate: 3600 },
)

export default async function NotFound() {
  let page: NotFoundPage | undefined
  try {
    page = await getNotFoundPage()
  } catch (error) {
    console.error('Unable to load the 404 page content.', error)
  }

  return renderBlocks(page?.layout)
}
