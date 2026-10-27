import type { DragMoveEvent } from '@dnd-kit/core'

export type TreeDropTarget = { id: string; placement: 'before' | 'after' | 'inside' }

export function getTreeDropTarget(
  { active, over, activatorEvent, delta }: DragMoveEvent,
  ids: string[],
  homeKey?: string,
): TreeDropTarget | null {
  if (!over || over.id === active.id || !ids.includes(String(over.id))) return null
  const id = String(over.id)
  let placement: TreeDropTarget['placement'] =
    id === 'root' ? 'inside' : ids.indexOf(id) > ids.indexOf(String(active.id)) ? 'after' : 'before'
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
    const fraction = (y - top) / height
    placement =
      id === 'root' ? 'inside' : fraction < 0.25 ? 'before' : fraction > 0.75 ? 'after' : 'inside'
  }
  if (id === homeKey) placement = 'after'
  return { id, placement }
}
