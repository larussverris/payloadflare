'use client'

import { Button, DocumentIcon, DragHandleIcon, FolderIcon, GearIcon, Link, NavGroup, Popup, PopupList, toast, useConfig, useDocumentDrawer, useDocumentEvents, useNav, usePreferences, useRouteTransition, useRouter } from '@payloadcms/ui'
import { DraggableSortable } from '@payloadcms/ui/elements/DraggableSortable'
import { DraggableSortableItem } from '@payloadcms/ui/elements/DraggableSortable/DraggableSortableItem'
import { usePathname, useRouter as useNextRouter } from 'next/navigation'
import { PREFERENCE_KEYS } from 'payload/shared'
import { useEffect, useRef, useState, type ComponentProps, type MouseEvent, type ReactNode } from 'react'

import { sidebarPageSettingsSlug } from './PageHeadingSettings'

type SidebarPage = {
  isHome?: boolean
  id: number | string
  folderId?: null | number | string
  title: string
}

type SidebarFolder = {
  id: number | string
  name: string
  parentId?: null | number | string
}

type SidebarBranch = {
  folders: { folder: SidebarFolder; children: SidebarBranch | null }[]
  pages: SidebarPage[]
}

export function PagesSidebarTree({
  adminRoute, folders: initialFolders, hasMore, pages: initialPages,
}: {
  adminRoute: string
  folders: SidebarFolder[]
  hasMore: boolean
  pages: SidebarPage[]
}) {
  const { config: { routes: { api: apiRoute } } } = useConfig()
  const [moving, setMoving] = useState(false)
  const [folderOverrides, setFolderOverrides] = useState<Record<string, Partial<SidebarFolder>>>({})
  const folders = initialFolders.map((folder) => ({ ...folder, ...folderOverrides[String(folder.id)] }))
  const [pageOverrides, setPageOverrides] = useState<Record<string, Partial<SidebarPage>>>({})
  const pages = initialPages.map((page) => ({ ...page, ...pageOverrides[String(page.id)] }))
  const pathname = usePathname()
  const router = useRouter()
  const { refresh } = useNextRouter()
  const { mostRecentUpdate } = useDocumentEvents()
  const lastDocumentEvent = useRef(mostRecentUpdate)
  const { startRouteTransition } = useRouteTransition()
  const { setNavOpen } = useNav()
  const { setPreference } = usePreferences()
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())
  const currentPageRef = useRef<HTMLLIElement>(null)
  const pageRoute = `${adminRoute}/collections/pages/`
  const currentPageID = pathname.startsWith(pageRoute)
    ? decodeURIComponent(pathname.slice(pageRoute.length).split('/')[0])
    : null

  useEffect(() => {
    currentPageRef.current?.scrollIntoView({ block: 'nearest' })
  }, [currentPageID, collapsed])

  useEffect(() => {
    if (mostRecentUpdate === lastDocumentEvent.current) return
    lastDocumentEvent.current = mostRecentUpdate
    if (mostRecentUpdate?.entitySlug === 'pages' || mostRecentUpdate?.entitySlug === 'folders') {
      refresh()
    }
  }, [mostRecentUpdate, refresh])
  const navigateFromPages = async (
    event: MouseEvent<Element>, href: string, closeSidebar = false,
  ) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    event.preventDefault()
    if (closeSidebar) setNavOpen(false, true)
    // The next editor reads the selected tab on the server, so finish saving it first.
    await setPreference(PREFERENCE_KEYS.NAV_SIDEBAR_ACTIVE_TAB, { activeTab: 'site-pages' })
      .catch(() => undefined)
    startRouteTransition(() => { void router.push(href) })
  }
  const saveMove = async (
    collection: 'pages' | 'folders',
    id: number | string,
    data: { folder: number | string | null } | { parent: number | string | null },
    destinationID: number | string | null,
    onSaved: () => void,
  ) => {
    setMoving(true)
    const toastID = toast.loading('Saving move…')
    const errorMessage = `Could not move ${collection === 'pages' ? 'page' : 'folder'}.`
    try {
      const response = await fetch(`${apiRoute}/${collection}/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { errors?: { message?: string }[] } | null
        throw new Error(result?.errors?.[0]?.message || errorMessage)
      }
      onSaved()
      setCollapsed((previous) => {
        const next = new Set(previous)
        if (destinationID != null) next.delete(String(destinationID))
        return next
      })
      toast.success('Move saved.', { id: toastID })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : errorMessage, { id: toastID })
    } finally {
      setMoving(false)
    }
  }
  const movePage = async (page: SidebarPage, folderId: number | string | null) => {
    if (moving || page.isHome || String(page.folderId ?? '') === String(folderId ?? '')) return
    await saveMove('pages', page.id, { folder: folderId }, folderId, () => {
      setPageOverrides((previous) => ({ ...previous, [String(page.id)]: { ...previous[String(page.id)], folderId } }))
    })
  }
  const moveFolder = async (folder: SidebarFolder, parentId: number | string | null) => {
    if (moving || String(folder.parentId ?? '') === String(parentId ?? '')) return
    let ancestor = parentId
    const visited = new Set<string>([String(folder.id)])
    while (ancestor != null) {
      if (visited.has(String(ancestor))) {
        toast.error('A folder cannot be moved into itself or one of its subfolders.')
        return
      }
      visited.add(String(ancestor))
      ancestor = folders.find((candidate) => String(candidate.id) === String(ancestor))?.parentId ?? null
    }
    await saveMove('folders', folder.id, { parent: parentId }, parentId, () => {
      setFolderOverrides((previous) => ({ ...previous, [String(folder.id)]: { parentId } }))
    })
  }
  const folderById = new Map(folders.map((folder) => [String(folder.id), folder]))
  const currentPage = pages.find((page) => String(page.id) === currentPageID)
  const currentPageAncestors = new Set<string>()
  let currentFolder = currentPage?.folderId == null
    ? undefined : folderById.get(String(currentPage.folderId))
  while (currentFolder && !currentPageAncestors.has(String(currentFolder.id))) {
    currentPageAncestors.add(String(currentFolder.id))
    currentFolder = currentFolder.parentId == null
      ? undefined : folderById.get(String(currentFolder.parentId))
  }
  const foldersByParent = new Map<string, SidebarFolder[]>()
  const pagesByFolder = new Map<string, SidebarPage[]>()

  for (const folder of folders) {
    const key = folder.parentId != null && folderById.has(String(folder.parentId))
      ? String(folder.parentId) : 'root'
    const siblings = foldersByParent.get(key) ?? []
    siblings.push(folder)
    foldersByParent.set(key, siblings)
  }
  for (const page of pages) {
    const key = page.folderId != null && folderById.has(String(page.folderId))
      ? String(page.folderId) : 'root'
    const siblings = pagesByFolder.get(key) ?? []
    siblings.push(page)
    pagesByFolder.set(key, siblings)
  }

  // Build visible branches and sortable IDs together so their order always agrees.
  const visibleIDs = ['root']
  const buildBranch = (parentId: string, ancestors: Set<string>): SidebarBranch => {
    const branchPages = [...(pagesByFolder.get(parentId) ?? [])]
      .sort((a, b) => a.isHome ? -1 : b.isHome ? 1 : a.title.localeCompare(b.title))
    const firstPages = parentId === 'root' ? branchPages.filter((page) => page.isHome) : []
    firstPages.forEach((page) => visibleIDs.push(`page:${page.id}`))
    const branchFolders = [...(foldersByParent.get(parentId) ?? [])]
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter((folder) => !ancestors.has(String(folder.id)))
      .map((folder) => {
        const key = String(folder.id)
        visibleIDs.push(`folder:${key}`)
        return {
          folder,
          children: collapsed.has(key) ? null : buildBranch(key, new Set([...ancestors, key])),
        }
      })
    branchPages.filter((page) => parentId !== 'root' || !page.isHome)
      .forEach((page) => visibleIDs.push(`page:${page.id}`))
    return { folders: branchFolders, pages: branchPages }
  }
  const tree = buildBranch('root', new Set())

  const renderBranch = (branch: SidebarBranch, depth: number) => {
    return (
      <ul className="pages-sidebar__list">
        {depth === 0 && branch.pages.filter((page) => page.isHome).map(renderPage)}
        {branch.folders.map(({ folder, children }) => {
          const key = String(folder.id)
          const isCurrentAncestor = currentPageAncestors.has(key)
          const isOpen = children !== null
          const href = `${adminRoute}/collections/folders/${encodeURIComponent(key)}`
          return (
            <li className="pages-sidebar__item" key={`folder-${key}`}>
              <TreeDragRow id={`folder:${folder.id}`} disabled={moving}>
                {({ attributes, listeners }) => <>
                <button
                  {...attributes}
                  {...listeners}
                  aria-label={`Move ${folder.name}`}
                  className="pages-sidebar__drag-handle"
                  disabled={moving}
                  type="button"
                ><DragHandleIcon size={16} /></button>
                <div data-current-ancestor={isCurrentAncestor || undefined}>
                <button
                  aria-expanded={isOpen}
                  aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${folder.name}`}
                  className={`nav__link pages-sidebar__folder-toggle${pathname === href ? ' nav__link--selected' : ''}`}
                  style={{ paddingInlineStart: `calc(var(--spacer-3) + ${depth * 16 + 8}px)` }}
                  onClick={() => setCollapsed((previous) => {
                    const next = new Set(previous)
                    if (next.has(key)) next.delete(key)
                    else next.add(key)
                    return next
                  })}
                  type="button"
                >
                  <span aria-hidden="true" className="pages-sidebar__node-icon"><FolderIcon size={16} /></span>
                  <span className="nav__link-label">{folder.name}</span>
                </button>
                <TreeSettingsDrawer collectionSlug="folders" id={folder.id} title={folder.name} />
                </div>
                </>}
              </TreeDragRow>
              {children && renderBranch(children, depth + 1)}
            </li>
          )
        })}
        {branch.pages.filter((page) => depth !== 0 || !page.isHome).map(renderPage)}
      </ul>
    )

    function renderPage(page: SidebarPage) {
      const href = `${adminRoute}/collections/pages/${encodeURIComponent(page.id)}`
      const isCurrent = String(page.id) === currentPageID
      return (
        <li className="pages-sidebar__item" key={`page-${page.id}`} ref={isCurrent ? currentPageRef : undefined}>
          <TreeDragRow id={`page:${page.id}`} disabled={moving || page.isHome}>
          {({ attributes, listeners }) => <>
          {!page.isHome && (
            <button
              {...attributes}
              {...listeners}
              aria-label={`Move ${page.title}`}
              className="pages-sidebar__drag-handle"
              disabled={moving}
              type="button"
            ><DragHandleIcon size={16} /></button>
          )}
          <Link
            draggable={false}
            aria-current={isCurrent ? 'page' : undefined}
            href={href}
            className={`nav__link pages-sidebar__page-link${isCurrent ? ' nav__link--selected' : ''}`}
            onClick={(event) => void navigateFromPages(event, href, true)}
            prefetch={false}
            style={{ paddingInlineStart: `calc(var(--spacer-3) + ${depth * 16 + 8}px)` }}
          >
            <span aria-hidden="true" className="pages-sidebar__node-icon">
              {page.isHome ? (
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16" data-fpl-icon-size="16">
                  <path fill="currentColor" fillRule="evenodd" d="M7.336 2.422a1 1 0 0 1 1.328 0l4 3.555-.332.374.332-.374a1 1 0 0 1 .336.747V12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V9H7v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6.725a1 1 0 0 1 .336-.748zM8 3.169 4 6.725V12h2V9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h2V6.725z" clipRule="evenodd" />
                </svg>
              ) : <DocumentIcon size={16} />}
            </span>
            <span className="nav__link-label">{page.title}</span>
          </Link>
          {isCurrent ? (
            <button
              aria-label={`Settings for ${page.title}`}
              className="pages-sidebar__folder-settings"
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('page-settings:open', { detail: String(page.id) }))}
            ><GearIcon size={16} /></button>
          ) : (
            <TreeSettingsDrawer collectionSlug="pages" id={page.id} title={page.title} />
          )}
          </>}
          </TreeDragRow>
        </li>
      )
    }
  }

  return (
    <nav aria-label="Pages" className="pages-sidebar">
      <div className="nav__header">
        <Popup
          caret={false}
          horizontalAlign="left"
          popupType="menu"
          renderButton={({ active, ...ariaProps }) => (
            <Button
              {...ariaProps}
              aria-label="Pages menu"
              buttonStyle="ghost"
              className="user-menu__trigger user-menu__trigger--with-title"
              margin={false}
              selected={active}
              type="button"
            >Pages</Button>
          )}
          verticalAlign="bottom"
        >
          <PopupList.MenuItem>
            <PopupList.Button href={`${adminRoute}/collections/pages?view=all`}>
              All pages
            </PopupList.Button>
          </PopupList.MenuItem>
        </Popup>
        <div className="pages-sidebar__actions">
          <Popup
            caret={false}
            horizontalAlign="right"
            popupType="menu"
            verticalAlign="bottom"
            renderButton={({ active, ...ariaProps }) => (
              <Button
                {...ariaProps}
                aria-label="Add page or folder"
                buttonStyle="ghost"
                icon="plus"
                round
                margin={false}
                selected={active}
                type="button"
              />
            )}
          >
            <PopupList.MenuItem>
              <PopupList.Button
                href={`${adminRoute}/collections/pages/create`}
                onClick={(event) => { if (event) void navigateFromPages(event, `${adminRoute}/collections/pages/create`) }}
              >Add page</PopupList.Button>
            </PopupList.MenuItem>
            <PopupList.MenuItem>
              <PopupList.Button
                href={`${adminRoute}/collections/folders/create`}
                onClick={(event) => { if (event) void navigateFromPages(event, `${adminRoute}/collections/folders/create`) }}
              >Add folder</PopupList.Button>
            </PopupList.MenuItem>
          </Popup>
        </div>
      </div>
      <NavGroup label="Pages" isOpen>
        <DraggableSortable
          className="pages-sidebar__sortable"
          ids={visibleIDs}
          onDragEnd={({ event: { active, over } }) => {
            if (!over || active.id === over.id) return
            const targetFolder = folders.find((folder) => `folder:${folder.id}` === over.id)
            const targetPage = pages.find((page) => `page:${page.id}` === over.id)
            if (over.id !== 'root' && !targetFolder && !targetPage) return
            const destinationID = targetFolder?.id ?? targetPage?.folderId ?? null
            const draggedFolder = folders.find((folder) => `folder:${folder.id}` === active.id)
            if (draggedFolder) void moveFolder(draggedFolder, destinationID)
            else {
              const page = pages.find((page) => `page:${page.id}` === active.id)
              if (page) void movePage(page, destinationID)
            }
          }}

        >
          <TreeDragRow id="root">
            {() => <div aria-hidden="true" className="pages-sidebar__root-drop" />}
          </TreeDragRow>
        {renderBranch(tree, 0)}
        </DraggableSortable>
        {hasMore && <p className="pages-sidebar__hint">Showing the first 250 pages or folders.</p>}
      </NavGroup>
      <NavGroup label="Utility pages" isOpen>
        <div className="nav__link-wrapper">
          <Link
            aria-current={pathname === `${adminRoute}/globals/not-found-page` ? 'page' : undefined}
            className={`nav__link${pathname === `${adminRoute}/globals/not-found-page` ? ' nav__link--selected' : ''}`}
            href={`${adminRoute}/globals/not-found-page`}
            onClick={(event) => void navigateFromPages(event, `${adminRoute}/globals/not-found-page`, true)}
            prefetch={false}
          >
            <span aria-hidden="true" className="pages-sidebar__node-icon"><DocumentIcon size={16} /></span>
            <span className="nav__link-label">404</span>
          </Link>
        </div>
      </NavGroup>
    </nav>
  )
}

function TreeSettingsDrawer({ collectionSlug, id, title }: {
  collectionSlug: 'folders' | 'pages'
  id: number | string
  title: string
}) {
  const router = useNextRouter()
  const [DocumentDrawer, DocumentDrawerToggler] = useDocumentDrawer({
    collectionSlug,
    drawerSlug: collectionSlug === 'pages' ? sidebarPageSettingsSlug(id) : undefined,
    id: typeof id === 'number' ? id : Number(id),
  })

  return (
    <>
      <DocumentDrawerToggler
        aria-label={`Settings for ${title}`}
        buttonStyle="link"
        className="pages-sidebar__folder-settings"
      >
        <span aria-hidden="true"><GearIcon size={16} /></span>
      </DocumentDrawerToggler>
      <DocumentDrawer onDelete={() => router.refresh()} />
    </>
  )
}

type DragRowState = Parameters<ComponentProps<typeof DraggableSortableItem>['children']>[0]

function TreeDragRow({ id, disabled, children }: {
  id: string
  disabled?: boolean
  children: (state: DragRowState) => ReactNode
}) {
  return (
    <DraggableSortableItem id={id} disabled={disabled}>
      {(state) => (
        <div ref={state.setNodeRef} className={`pages-sidebar__folder-row${id === 'root' ? ' pages-sidebar__root-row' : ''}${state.isDragging ? ' pages-sidebar__row--dragging' : ''}`} style={{ transform: id === 'root' ? undefined : state.transform, transition: state.transition }}>
          {children(state)}
        </div>
      )}
    </DraggableSortableItem>
  )
}

