import type { PayloadRequest } from 'payload'
import type { Folder } from '@/payload-types'

import { getFolderSegments, getPagePathFromFolder } from './getPagePath'

/** Resolve editor form data, including an unsaved slug or folder selection. */
export async function resolvePagePath(
  data: Record<string, unknown>,
  req: Partial<PayloadRequest> & Pick<PayloadRequest, 'payload'>,
) {
  if (data.isHome === true) return '/'
  if (typeof data.slug !== 'string' || !data.slug) return null
  const folderValue = data.folder as Folder | number | null | undefined
  const folderID = typeof folderValue === 'object' ? folderValue?.id : folderValue
  const folderSegments = await getFolderSegments(folderID, (id) =>
    req.payload.findByID({ collection: 'folders', id, depth: 0, overrideAccess: true, req }),
  )
  return getPagePathFromFolder(data.slug, folderSegments)
}
