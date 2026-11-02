type SidebarPage = {
  id: number | string
  title: string
  parentId?: number | string | null
  isHome?: boolean
  _status?: 'draft' | 'published' | null
}

const titleCollator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })

export function comparePages(a: SidebarPage, b: SidebarPage) {
  if (Boolean(a.isHome) !== Boolean(b.isHome)) return a.isHome ? -1 : 1
  return titleCollator.compare(a.title, b.title) || titleCollator.compare(String(a.id), String(b.id))
}

export type { SidebarPage }
