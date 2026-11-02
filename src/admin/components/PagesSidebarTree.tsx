/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates.
 */

'use client'

import { useDndMonitor, type DragMoveEvent } from '@dnd-kit/core'
import {
  Button, ChevronIcon, DocumentIcon, DraggableSortable, DragHandleIcon, Link,
  NavGroup, Popup, PopupList, toast, useDocumentEvents,
  useDraggableSortable, usePreferences, useRouteTransition, useRouter, useSidebarTabs,
} from '@payloadcms/ui'
import { usePathname, useRouter as useNextRouter } from 'next/navigation'
import { PREFERENCE_KEYS } from 'payload/shared'
import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { comparePages, type SidebarPage } from '@/admin/utilities/pageTree'
import { getTreeDropTarget, type TreeDropTarget } from '@/admin/utilities/treeDrop'
import { usePayloadSDK } from '../hooks/usePayloadSDK'
import { HomeIcon } from '@/admin/icons/HomeIcon'

type Branch = { page: SidebarPage; children: Branch | null }[]

function PagesSidebarTree({ adminRoute, hasMore, pages: initialPages }: {
  adminRoute: string; hasMore: boolean; pages: SidebarPage[]
}) {
  const sdk = usePayloadSDK()
  const router = useRouter()
  const { refresh: refreshRoute } = useNextRouter()
  const sidebarTabs = useSidebarTabs()
  const reloadTabContent = sidebarTabs?.reloadTabContent
  const refresh = useCallback(() => {
    reloadTabContent?.('site-pages')
    refreshRoute()
  }, [reloadTabContent, refreshRoute])
  const pathname = usePathname()
  const { startRouteTransition } = useRouteTransition()
  const { setPreference } = usePreferences()
  const { mostRecentUpdate } = useDocumentEvents()
  const lastDocumentEvent = useRef(mostRecentUpdate)
  const [moving, setMoving] = useState(false)
  const [creatingPage, setCreatingPage] = useState(false)
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())
  const [dropTarget, setDropTarget] = useState<TreeDropTarget | null>(null)
  const [savedMoves, setSavedMoves] = useState<{
    pages: SidebarPage[]; items: Record<string, Pick<SidebarPage, 'parentId'>>
  } | null>(null)
  const overrides = savedMoves?.pages === initialPages ? savedMoves.items : {}
  const pages = initialPages.map(page => ({ ...page, ...overrides[`page:${page.id}`] }))
  const pageByID = new Map(pages.map(page => [String(page.id), page]))
  const currentPageRef = useRef<HTMLLIElement>(null)
  const pageRoute = `${adminRoute}/collections/pages/`
  const currentPageID = pathname.startsWith(pageRoute)
    ? decodeURIComponent(pathname.slice(pageRoute.length).split('/')[0]) : null

  useEffect(() => {
    currentPageRef.current?.scrollIntoView({ block: 'nearest' })
  }, [currentPageID, collapsed])
  useEffect(() => {
    if (mostRecentUpdate === lastDocumentEvent.current) return
    lastDocumentEvent.current = mostRecentUpdate
    if (mostRecentUpdate?.entitySlug === 'pages') refresh()
  }, [mostRecentUpdate, refresh])

  const navigate = async (event: MouseEvent<Element>, href: string) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    await setPreference(PREFERENCE_KEYS.NAV_SIDEBAR_ACTIVE_TAB, { activeTab: 'site-pages' }).catch(() => undefined)
    startRouteTransition(() => { void router.push(href) })
  }
  const createPage = async () => {
    if (creatingPage) return
    setCreatingPage(true)
    try {
      const page = await sdk.create({ collection: 'pages', draft: true, data: { title: 'Untitled', slug: '' } })
      await setPreference(PREFERENCE_KEYS.NAV_SIDEBAR_ACTIVE_TAB, { activeTab: 'site-pages' }).catch(() => undefined)
      startRouteTransition(() => { void router.push(`${pageRoute}${page.id}`) })
      refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create page.')
    } finally { setCreatingPage(false) }
  }
  const saveMove = async (id: string, target: TreeDropTarget) => {
    if (moving) return
    const source = pageByID.get(id.slice(5))
    const destination = target.id === 'root' ? null : pageByID.get(target.id.slice(5))
    if (!source || source.isHome || (target.id !== 'root' && !destination)) return
    setMoving(true)
    const toastID = toast.loading('Saving move…')
    try {
      const parentId = destination?.id ?? null
      const saved = await sdk.update({
        collection: 'pages', id: Number(source.id), draft: source._status === 'draft',
        data: { parent: parentId == null ? null : Number(parentId) },
      })
      const savedParentId = typeof saved.parent === 'object' ? saved.parent?.id : saved.parent
      const items = { ...overrides, [id]: { parentId: savedParentId ?? null } }
      setSavedMoves({ pages: initialPages, items })
      setCollapsed(previous => {
        const next = new Set(previous)
        if (parentId != null) next.delete(String(parentId))
        return next
      })
      refresh()
      toast.success('Move saved.', { id: toastID })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save the move.', { id: toastID })
    } finally { setMoving(false) }
  }

  const ancestors = new Set<string>()
  let ancestor = currentPageID ? pageByID.get(currentPageID)?.parentId : null
  while (ancestor != null && !ancestors.has(String(ancestor))) {
    ancestors.add(String(ancestor))
    ancestor = pageByID.get(String(ancestor))?.parentId
  }
  const byParent = new Map<string, SidebarPage[]>()
  for (const page of pages) {
    const key = page.isHome || page.parentId == null || !pageByID.has(String(page.parentId))
      ? 'root' : String(page.parentId)
    const siblings = byParent.get(key) ?? []
    siblings.push(page)
    byParent.set(key, siblings)
  }
  const visibleIDs = ['root']
  const buildBranch = (parent: string, visited = new Set<string>()): Branch =>
    [...(byParent.get(parent) ?? [])].sort(comparePages)
      .filter(page => !visited.has(String(page.id)))
      .map(page => {
        const key = String(page.id)
        visibleIDs.push(`page:${key}`)
        return { page, children: collapsed.has(key) ? null : buildBranch(key, new Set([...visited, key])) }
      })
  const tree = buildBranch('root')
  const toggle = (id: string) => setCollapsed(previous => {
    const next = new Set(previous)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })
  const renderBranch = (branch: Branch, depth: number): ReactNode => (
    <ul className="pages-sidebar__list">
      {branch.map(({ page, children }) => {
        const key = String(page.id), dragID = `page:${key}`
        const href = `${pageRoute}${encodeURIComponent(key)}`
        const isCurrent = key === currentPageID
        const hasChildren = byParent.has(key)
        return (
          <li className="pages-sidebar__item" key={key} ref={isCurrent ? currentPageRef : undefined}>
            <TreeDragRow id={dragID} disabled={moving || page.isHome} dropInside={dropTarget?.id === dragID}>
              {({ attributes, listeners }) => <>
                {!page.isHome && <button {...attributes} {...listeners} aria-label={`Move ${page.title}`}
                  className="pages-sidebar__drag-handle" disabled={moving} type="button"><DragHandleIcon size={16} /></button>}
                <div data-current-ancestor={ancestors.has(key) || undefined}>
                  <Link draggable={false} aria-current={isCurrent ? 'page' : undefined} href={href}
                    className={`nav__link pages-sidebar__page-link${isCurrent ? ' nav__link--selected' : ''}`}
                    onClick={event => void navigate(event, href)} prefetch={false}
                    style={{ paddingInlineStart: `calc(var(--spacer-3) + ${depth * 16 + 8}px)` }}>
                    <span aria-hidden="true" className="pages-sidebar__node-icon">
                      {page.isHome ? <HomeIcon /> : <DocumentIcon size={16} />}
                    </span>
                    <span className="nav__link-label">{page.title}</span>
                  </Link>

                </div>
                {hasChildren && <Button type="button" buttonStyle="ghost" className="pages-sidebar__expand"
                  icon={<ChevronIcon direction={children ? 'down' : 'right'} size={24} />} round margin={false}
                  aria-label={`${children ? 'Collapse' : 'Expand'} ${page.title}`} aria-expanded={children !== null}
                  onClick={() => toggle(key)} />}
              </>}
            </TreeDragRow>
            {children && children.length > 0 && renderBranch(children, depth + 1)}

          </li>
        )
      })}
    </ul>
  )

  return (
    <nav aria-label="Pages" className="pages-sidebar">
      <div className="nav__header">
        <Popup caret={false} horizontalAlign="left" popupType="menu" verticalAlign="bottom"
          renderButton={({ active, ...ariaProps }) => <Button {...ariaProps} aria-label="Pages menu"
            buttonStyle="ghost" className="user-menu__trigger user-menu__trigger--with-title"
            margin={false} selected={active} type="button">Pages</Button>}>
          <PopupList.MenuItem><PopupList.Button href={`${adminRoute}/collections/pages?view=all`}>All pages</PopupList.Button></PopupList.MenuItem>
        </Popup>
        <div className="pages-sidebar__actions">
          <Button aria-label="Add page" buttonStyle="ghost" icon="plus" round margin={false}
            type="button" disabled={creatingPage} onClick={() => void createPage()} />
        </div>
      </div>
      <NavGroup label="Pages" isOpen>
        <DraggableSortable className="pages-sidebar__sortable" ids={visibleIDs}
          sortingStrategy={() => null} renderDragOverlay={() => null}
          onDragEnd={({ event }) => {
            const target = getTreeDropTarget(event, visibleIDs, pages)
            if (target) void saveMove(String(event.active.id), target)
          }}>
          <TreeDragMonitor ids={visibleIDs} pages={pages} onChange={target => {
            setDropTarget(previous => previous?.id === target?.id ? previous : target)
          }} />
          <TreeDragRow id="root" dropInside={dropTarget?.id === 'root'}>{() => <div aria-hidden="true" className="pages-sidebar__root-drop" />}</TreeDragRow>
          {renderBranch(tree, 0)}
        </DraggableSortable>
        {hasMore && <p className="pages-sidebar__hint">Showing the first 250 pages.</p>}
      </NavGroup>
      <NavGroup label="Utility pages" isOpen>
        <div className="nav__link-wrapper"><Link href={`${adminRoute}/globals/not-found-page`}
          className={`nav__link${pathname === `${adminRoute}/globals/not-found-page` ? ' nav__link--selected' : ''}`}
          onClick={event => void navigate(event, `${adminRoute}/globals/not-found-page`)} prefetch={false}>
          <span aria-hidden="true" className="pages-sidebar__node-icon"><DocumentIcon size={16} /></span>
          <span className="nav__link-label">404</span>
        </Link></div>
      </NavGroup>
    </nav>
  )
}

type DragRowState = Pick<ReturnType<typeof useDraggableSortable>, 'attributes' | 'listeners'>
function TreeDragRow({ id, disabled, dropInside, children }: {
  id: string; disabled?: boolean; dropInside?: boolean; children: (state: DragRowState) => ReactNode
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggableSortable({ id, disabled })
  return <div ref={setNodeRef} data-drop-inside={dropInside || undefined}
    className={`pages-sidebar__folder-row${id === 'root' ? ' pages-sidebar__root-row' : ''}${isDragging ? ' pages-sidebar__row--dragging' : ''}`}>
    {children({ attributes, listeners })}
  </div>
}
function TreeDragMonitor({ ids, pages, onChange }: {
  ids: string[]; pages: SidebarPage[]; onChange: (target: TreeDropTarget | null) => void
}) {
  const update = (event: DragMoveEvent) => onChange(getTreeDropTarget(event, ids, pages))
  useDndMonitor({ onDragMove: update, onDragOver: update, onDragEnd: () => onChange(null), onDragCancel: () => onChange(null) })
  return null
}

export { PagesSidebarTree }
