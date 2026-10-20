import type { Folder } from '@/payload-types'

/** Read parents one at a time so paths are independent of relationship population depth. */
export async function getFolderSegments(
  folderID: number | string | null | undefined,
  loadFolder: (id: number | string) => Promise<Folder>,
  visited = new Set<string>(),
): Promise<string[]> {
  const segments: string[] = []
  while (folderID != null) {
    const key = String(folderID)
    if (visited.has(key)) throw new Error('A folder cannot contain itself or its descendants.')
    visited.add(key)
    const folder = await loadFolder(folderID)
    segments.unshift(folder.slug)
    folderID = typeof folder.parent === 'object' ? folder.parent?.id : folder.parent
  }
  return segments
}

export function getPagePathFromFolder(slug: string, folderSegments: string[]): string {
  return `/${[...folderSegments, slug].join('/')}`
}
