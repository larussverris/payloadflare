'use client'

import { useEffect, useState } from 'react'
import type { Folder } from '@/payload-types'
import { getFolderSegments } from '@/lib/pages/getPagePath'

export function useFolderSegments(
  folderValue: number | string | { id: number | string } | null | undefined,
) {
  const folderID = (typeof folderValue === 'object' ? folderValue?.id : folderValue) ?? null
  const [result, setResult] = useState<{
    error: boolean
    id: string
    segments: string[]
  } | null>(null)

  useEffect(() => {
    if (folderID === null) return
    const controller = new AbortController()
    async function loadFolderPath() {
      try {
        const segments = await getFolderSegments(folderID, async (id) => {
          const response = await fetch(`/api/folders/${encodeURIComponent(id)}?depth=0`, {
            credentials: 'same-origin',
            signal: controller.signal,
          })
          if (!response.ok) throw new Error('Could not load folder')
          return response.json() as Promise<Folder>
        })
        setResult({ id: String(folderID), segments, error: false })
      } catch {
        if (!controller.signal.aborted)
          setResult({ id: String(folderID), segments: [], error: true })
      }
    }
    void loadFolderPath()
    return () => controller.abort()
  }, [folderID])

  return {
    error: folderID !== null && result?.id === String(folderID) && result.error,
    loading: folderID !== null && result?.id !== String(folderID),
    segments: folderID === null ? [] : result?.id === String(folderID) ? result.segments : [],
  }
}
