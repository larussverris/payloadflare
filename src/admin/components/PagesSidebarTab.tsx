/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates.
 */

import type { SidebarTabServerProps } from 'payload'
import { PagesSidebarTree } from './PagesSidebarTree'

export async function PagesSidebarTab({ payload, req, user }: SidebarTabServerProps) {
  if (!user) return null
  const result = await payload.find({
    collection: 'pages', depth: 0, draft: true, limit: 250, overrideAccess: false,
    select: { isHome: true, title: true, parent: true, _status: true },
    sort: ['-isHome', 'title', 'id'], user: req?.user ?? user,
  })
  return <PagesSidebarTree
    adminRoute={payload.config.routes.admin}
    hasMore={result.hasNextPage}
    pages={result.docs.map(page => ({
      id: page.id, title: page.title || String(page.id),
      isHome: page.isHome === true, _status: page._status,
      parentId: typeof page.parent === 'object' ? page.parent?.id : page.parent,
    }))}
  />
}
