/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates.
 */

'use client'

import {
  Button,
  ChevronIcon,
  DocumentIcon,
  Link,
  MenuSeparator,
  PlusIcon,
  SidebarRow,
  toast,
  useAuth,
  useDocumentEvents,
  usePathname,
  usePreferences,
  useRouteTransition,
  useRouter,
} from '@payloadcms/ui'
import { PREFERENCE_KEYS } from 'payload/shared'
import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { comparePages, type SidebarPage } from '@/admin/utilities/pageTree'
import { usePayloadSDK } from '../hooks/usePayloadSDK'
import { HomeIcon } from '@/admin/icons/HomeIcon'

function PagesSidebarTree({ adminRoute, pages }: { adminRoute: string; pages: SidebarPage[] }) {
  const sdk = usePayloadSDK()
  const router = useRouter()
  const { permissions } = useAuth()
  const canCreate = Boolean(permissions?.collections?.pages?.create)
  const refresh = useCallback(() => router.refresh(), [router])
  const pathname = usePathname()
  const { startRouteTransition } = useRouteTransition()
  const { setPreference } = usePreferences()
  const { mostRecentUpdate } = useDocumentEvents()
  const lastDocumentEvent = useRef(mostRecentUpdate)
  const [creatingPage, setCreatingPage] = useState(false)
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())
  const pageRoute = `${adminRoute}/collections/pages/`
  const currentPageID = pathname.startsWith(pageRoute)
    ? decodeURIComponent(pathname.slice(pageRoute.length).split('/')[0])
    : null

  useEffect(() => {
    if (mostRecentUpdate === lastDocumentEvent.current) return
    lastDocumentEvent.current = mostRecentUpdate
    if (['pages', 'preferences'].includes(mostRecentUpdate?.entitySlug ?? '')) refresh()
  }, [mostRecentUpdate, refresh])

  const rememberPagesTab = useCallback(() => {
    void setPreference(PREFERENCE_KEYS.NAV_SIDEBAR_ACTIVE_TAB, { activeTab: 'site-pages' }).catch(
      () => undefined,
    )
  }, [setPreference])
  const createPage = async () => {
    if (creatingPage) return
    setCreatingPage(true)
    try {
      const page = await sdk.create({
        collection: 'pages',
        draft: true,
        data: { title: 'Untitled', slug: '' },
      })
      rememberPagesTab()
      startRouteTransition(() => {
        void router.push(`${pageRoute}${page.id}`)
      })
      refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create page.')
    } finally {
      setCreatingPage(false)
    }
  }
  // Group and sort only when the server supplies new page data.
  const byParent = useMemo(() => {
    const pageIDs = new Set(pages.map((page) => String(page.id)))
    const groups = new Map<string, SidebarPage[]>()
    for (const page of pages) {
      const parent =
        page.isHome || page.parentId == null || !pageIDs.has(String(page.parentId))
          ? 'root'
          : String(page.parentId)
      const siblings = groups.get(parent) ?? []
      siblings.push(page)
      groups.set(parent, siblings)
    }
    for (const siblings of groups.values()) siblings.sort(comparePages)
    return groups
  }, [pages])

  const visiblePages = useMemo(() => {
    const rows: { page: SidebarPage; depth: number; hasChildren: boolean; expanded: boolean }[] = []
    const visited = new Set<string>()
    const visit = (parent: string, depth: number) => {
      for (const page of byParent.get(parent) ?? []) {
        const id = String(page.id)
        if (visited.has(id)) continue
        visited.add(id)
        const hasChildren = byParent.has(id)
        const expanded = !collapsed.has(id)
        rows.push({ page, depth, hasChildren, expanded })
        if (hasChildren && expanded) visit(id, depth + 1)
      }
    }
    visit('root', 0)
    return rows
  }, [byParent, collapsed])

  const toggle = useCallback((id: string) => {
    setCollapsed((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return (
    <nav aria-label="Pages" className="hierarchy-sidebar-tab pages-sidebar">
      <section aria-label="Pages" className="tree">
        <div className="tree__all-option-wrapper">
          <SidebarRow
            as="h2"
            className="tree__all-option pages-sidebar__section-title"
            title="Pages"
          />
          {canCreate && (
            <Button
              buttonStyle="ghost"
              className="tree__create-button"
              aria-label="Create new page"
              margin={false}
              type="button"
              disabled={creatingPage}
              onClick={() => void createPage()}
            >
              <PlusIcon size={24} />
            </Button>
          )}
        </div>
        <ul className="pages-sidebar__list">
          {visiblePages.map(({ page, depth, hasChildren, expanded }) => (
            <PageTreeRow
              key={page.id}
              id={String(page.id)}
              title={page.title}
              isHome={Boolean(page.isHome)}
              href={`${pageRoute}${encodeURIComponent(String(page.id))}`}
              depth={depth}
              hasChildren={hasChildren}
              expanded={expanded}
              selected={String(page.id) === currentPageID}
              onToggle={toggle}
              onNavigate={rememberPagesTab}
            />
          ))}
        </ul>
      </section>
      <MenuSeparator />
      <section aria-label="Utility pages" className="tree">
        <div className="tree__all-option-wrapper">
          <SidebarRow
            as="h2"
            className="tree__all-option pages-sidebar__section-title"
            title="Utility pages"
          />
        </div>
        <SidebarRow
          as={Link}
          href={`${adminRoute}/globals/not-found-page`}
          selected={pathname === `${adminRoute}/globals/not-found-page`}
          icon={<DocumentIcon size={16} />}
          className="pages-sidebar__utility-link"
          title="404"
          onClick={rememberPagesTab}
          prefetch={false}
        />
      </section>
    </nav>
  )
}

type PageTreeRowProps = {
  id: string
  title: string
  isHome: boolean
  href: string
  depth: number
  hasChildren: boolean
  expanded: boolean
  selected: boolean
  onToggle: (id: string) => void
  onNavigate: () => void
}

// Scalar props let unchanged rows survive fresh server results as well as local state changes.
const PageTreeRow = memo(function PageTreeRow({
  id,
  title,
  isHome,
  href,
  depth,
  hasChildren,
  expanded,
  selected,
  onToggle,
  onNavigate,
}: PageTreeRowProps) {
  const ref = useRef<HTMLLIElement>(null)
  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: 'nearest' })
  }, [selected])
  return (
    <li className="tree-node" ref={ref} style={{ '--tree-depth': depth } as CSSProperties}>
      <div className="tree-node__content-wrapper">
        <div
          className={`tree-node__content sidebar-row${selected ? ' sidebar-row--selected' : ''}`}
        >
          <button
            type="button"
            className="tree-node__toggle"
            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${title}`}
            aria-expanded={hasChildren ? expanded : undefined}
            disabled={!hasChildren}
            onClick={() => onToggle(id)}
          >
            <ChevronIcon direction={expanded ? 'down' : 'right'} size={16} />
          </button>
          <Link
            draggable={false}
            aria-current={selected ? 'page' : undefined}
            href={href}
            className="tree-node__node-trigger"
            onClick={onNavigate}
            prefetch={false}
          >
            <span aria-hidden="true" className="sidebar-row__icon">
              {isHome ? <HomeIcon /> : <DocumentIcon size={16} />}
            </span>
            <span className="tree-node__title sidebar-row__title">{title}</span>
          </Link>
        </div>
      </div>
    </li>
  )
})

export { PagesSidebarTree }
