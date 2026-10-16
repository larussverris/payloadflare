import { getParents } from '@payloadcms/plugin-nested-docs'
import type { PayloadRequest } from 'payload'

import { getPagePath } from './getPagePath'

/** Resolve current form data, including an unsaved slug or parent selection. */
export async function resolvePagePath(data: Record<string, unknown>, req: PayloadRequest) {
  if (data.slug === '/') return '/'
  if (typeof data.slug !== 'string' || !data.slug) return null
  const collection = req.payload.collections.pages.config
  const parents = await getParents(req, {}, collection, data)
  return getPagePath([...parents, data].map((doc) => String(doc.slug || '')).join('/'))
}
