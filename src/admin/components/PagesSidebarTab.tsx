/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates.
 */

import type { SidebarTabServerProps } from 'payload'
import { PagesSidebarTree } from './PagesSidebarTree'

export async function PagesSidebarTab({ payload, req, user }: SidebarTabServerProps) {
  if (!user) return null
  const result = await payload.find({
    collection: 'pages',
    depth: 0,
    draft: true,
    limit: 250,
    select: { slug: true, title: true, parent: true, _status: true },
    sort: ['title', 'id'],
    user: req?.user ?? user,
  })
  return (
    <PagesSidebarTree
      adminRoute={payload.config.routes.admin}
      pages={result.docs.map((page) => ({
        id: page.id,
        title: page.title || String(page.id),
        isHome: page.slug === 'home',
        _status: page._status,
        parentId: typeof page.parent === 'object' ? page.parent?.id : page.parent,
      }))}
    />
  )
}
