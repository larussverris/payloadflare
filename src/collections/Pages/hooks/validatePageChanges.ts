import type { CollectionBeforeChangeHook } from 'payload'
import { ValidationError } from 'payload'

const reservedPaths = new Set(['/', '/404'])

export const validatePageChanges: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  if (req.context.pageSeed) return data

  const previousPath = originalDoc?.breadcrumbs?.at(-1)?.url
  const nextPath = data.breadcrumbs?.at(-1)?.url ?? previousPath

  if (
    typeof data.slug === 'string' &&
    data.slug !== originalDoc?.slug &&
    (data.slug.trim() === '' || data.slug.includes('/') || data.slug === '.' || data.slug === '..')
  ) {
    throw new ValidationError({
      errors: [{ path: 'slug', message: 'Enter one URL segment, such as team. The / and /404 URLs are reserved.' }],
    })
  }

  if (operation === 'create' && reservedPaths.has(String(nextPath))) {
    throw new Error('Home and 404 are reserved pages.')
  }

  if (operation === 'update' && reservedPaths.has(String(previousPath)) && nextPath !== previousPath) {
    throw new Error('The URL of this system page cannot be changed.')
  }

  if (operation === 'update' && !reservedPaths.has(String(previousPath)) && reservedPaths.has(String(nextPath))) {
    throw new Error('This URL is reserved for a system page.')
  }

  if (operation === 'create' && data.layout?.some((block: { blockType: string }) => block.blockType === 'notFound')) {
    throw new Error('Only the 404 page can use the Not Found block.')
  }

  if (operation === 'update' && data.layout !== undefined) {
    const hasNotFound = data.layout.some((block: { blockType: string }) => block.blockType === 'notFound')
    if (previousPath === '/404') {
      if (data.layout.length !== 1 || data.layout[0]?.blockType !== 'notFound') {
        throw new Error('The 404 page must keep its one Not Found block.')
      }
    } else if (hasNotFound) {
      throw new Error('Only the 404 page can use the Not Found block.')
    }
  }

  return data
}
