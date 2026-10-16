import { BlocksRenderer } from '@/components/BlocksRenderer'
import { findPublishedPageByPath } from '@/lib/pages/findPublishedPageByPath'

export default async function NotFound() {
  let page: Awaited<ReturnType<typeof findPublishedPageByPath>> = undefined
  try {
    page = await findPublishedPageByPath('/404')
  } catch (error) {
    console.error('Unable to load the 404 page content.', error)
  }

  return page ? <BlocksRenderer blocks={page.layout} /> : <h1>Page not found</h1>
}
