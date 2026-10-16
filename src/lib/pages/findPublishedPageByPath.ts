import config from '@payload-config'
import { getPayload } from 'payload'
import type { Page } from '@/payload-types'

export async function findPublishedPageByPath(pathname: string): Promise<Page | undefined> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1,
    pagination: false,
    overrideAccess: false,
    where: getPagePathQuery(pathname),
  })
  return docs[0]
}

export function getPagePathQuery(pathname: string) {
  return {
    'breadcrumbs.url': { equals: pathname },
    slug: {
      equals: pathname === '/' ? '/' : decodeURIComponent(pathname.split('/').filter(Boolean).at(-1) || ''),
    },
  }
}
