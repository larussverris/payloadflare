import { unstable_cache } from 'next/cache'
import config from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

import { BlocksRenderer } from '@/components/BlocksRenderer'
import type { NotFoundPage } from '@/payload-types'

const getPublishedNotFoundPage = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    return payload.findGlobal({ slug: 'not-found-page', draft: false, overrideAccess: false })
  },
  ['not-found-page'],
  { tags: ['site'], revalidate: 3600 },
)

export default async function NotFound() {
  const { isEnabled } = await draftMode()
  let page: NotFoundPage | undefined
  try {
    page = isEnabled
      ? await (
          await getPayload({ config })
        ).findGlobal({
          slug: 'not-found-page',
          draft: isEnabled,
          overrideAccess: isEnabled,
        })
      : await getPublishedNotFoundPage()
  } catch (error) {
    console.error('Unable to load the 404 page content.', error)
  }

  if (page?.layout?.length) return <BlocksRenderer blocks={page.layout} />

  return (
    <section>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
    </section>
  )
}
