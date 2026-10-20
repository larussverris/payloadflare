import type { SidebarTabServerProps } from 'payload'

import { PagesSidebarTree } from './PagesSidebarTree'

export async function PagesSidebarTab({ payload, req, user }: SidebarTabServerProps) {
  if (!user) return null

  const [result, folderResult] = await Promise.all([
    payload.find({
      collection: 'pages', depth: 0, draft: true, limit: 250, overrideAccess: false,
      select: { isHome: true, title: true, folder: true },
      sort: 'title', user: req?.user ?? user,
    }),
    payload.find({
      collection: 'folders', depth: 0, limit: 250, overrideAccess: false,
      select: { name: true, parent: true },
      sort: 'name', user: req?.user ?? user,
    }),
  ])

  return (
    <PagesSidebarTree
      adminRoute={payload.config.routes.admin}
      folders={folderResult.docs.map((folder) => ({
        id: folder.id,
        name: folder.name,
        parentId: typeof folder.parent === 'object' ? folder.parent?.id : folder.parent,
      }))}
      hasMore={result.hasNextPage || folderResult.hasNextPage}
      pages={result.docs.map((page) => ({
        id: page.id,
        isHome: page.isHome === true,
        folderId: typeof page.folder === 'object' ? page.folder?.id : page.folder,
        title: page.title || String(page.id),
      }))}
    />
  )
}
