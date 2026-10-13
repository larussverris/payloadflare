import type { CollectionBeforeChangeHook } from 'payload'

/** The plugin populates breadcrumbs first, including on cascading child updates. */
export const syncPagePathname: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (originalDoc?.kind === 'home') {
    data.pathname = '/'
    return data
  }
  const slug = data.slug === undefined ? originalDoc?.slug : data.slug
  data.pathname = slug ? data.breadcrumbs?.at(-1)?.url || null : null
  return data
}
