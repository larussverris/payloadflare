import { unstable_cache } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { renderBlocks } from '@/utilities/renderBlocks'

const getNotFoundPage = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    return payload.findGlobal({
      slug: 'not-found-page',
      disableErrors: true,
    })
  },
  ['not-found-page'],
  { revalidate: 3600 },
)

export default async function NotFound() {
  const page = await getNotFoundPage()

  return renderBlocks(page?.layout)
}
