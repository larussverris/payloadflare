export type SidebarPage = {
  id: number | string
  title: string
  parentId?: number | string | null
  _order?: string | null
  isHome?: boolean
  _status?: 'draft' | 'published' | null
}

type OrderedPage = { id: number | string; _order?: string | null; isHome?: boolean | null }

export function comparePages(a: OrderedPage, b: OrderedPage) {
  if (Boolean(a.isHome) !== Boolean(b.isHome)) return a.isHome ? -1 : 1
  if (a._order !== b._order) {
    if (!a._order) return 1
    if (!b._order) return -1
    return a._order < b._order ? -1 : 1
  }
  return String(a.id).localeCompare(String(b.id), undefined, { numeric: true })
}
