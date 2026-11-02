import type { DragMoveEvent } from '@dnd-kit/core'
import type { SidebarPage } from './pageTree'

export type TreeDropTarget = { id: string }

export function getTreeDropTarget(
  { active, over, activatorEvent, delta }: DragMoveEvent,
  ids: string[],
  pages: SidebarPage[],
): TreeDropTarget | null {
  if (!over || over.id === active.id || !ids.includes(String(over.id))) return null
  const id = String(over.id)
  const pageByID = new Map(pages.map(page => [String(page.id), page]))
  const source = pageByID.get(String(active.id).slice(5))
  const destination = id === 'root' ? null : pageByID.get(id.slice(5))
  if (!source || source.isHome || (id !== 'root' && !destination) || destination?.isHome) return null
  if (String(source.parentId ?? 'root') === String(destination?.id ?? 'root')) return null

  // A page cannot become a child of itself or any of its descendants.
  const visited = new Set<string>()
  let ancestor = destination
  while (ancestor) {
    const key = String(ancestor.id)
    if (key === String(source.id) || visited.has(key)) return null
    visited.add(key)
    ancestor = ancestor.parentId == null ? undefined : pageByID.get(String(ancestor.parentId))
  }

  if (
    'clientY' in activatorEvent &&
    typeof activatorEvent.clientY === 'number' &&
    'clientX' in activatorEvent &&
    typeof activatorEvent.clientX === 'number'
  ) {
    const x = activatorEvent.clientX + delta.x
    const y = activatorEvent.clientY + delta.y
    const { top, bottom, left, right, height } = over.rect
    if (x < left || x > right || y < top - 4 || y > bottom + 4 || height <= 0) return null
  }

  return { id }
}
