'use client'

import { Banner, LinkIcon, useConfig, useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useState } from 'react'
import { usePayloadSDK } from '../hooks/usePayloadSDK'

export function PathPreview({ pathField = 'path', pathname: fixedPath }: { pathField?: string; pathname?: string }) {
  const { config: { serverURL } } = useConfig()
  const { collectionSlug, id, data } = useDocumentInfo()
  const sdk = usePayloadSDK()
  const key = `${collectionSlug}:${id}:${data?.updatedAt}:${pathField}`
  const [result, setResult] = useState<{ key: string; path: string | null }>()
  const savedPath = fixedPath ?? data?.[pathField]
  const path = typeof savedPath === 'string' ? savedPath : result?.key === key ? result.path : undefined

  useEffect(() => {
    if (typeof savedPath === 'string' || !collectionSlug || id == null) return
    const controller = new AbortController()
    async function loadPath() {
      try {
        const response = await sdk.request({
          method: 'GET',
          path: `/${collectionSlug}/${encodeURIComponent(id!)}`,
          args: { select: { [pathField]: true }, draft: true },
          init: { signal: controller.signal },
        })
        const doc: Record<string, unknown> = await response.json()
        setResult({ key, path: typeof doc[pathField] === 'string' ? doc[pathField] : null })
      } catch {
        if (!controller.signal.aborted) setResult({ key, path: null })
      }
    }
    void loadPath()
    return () => controller.abort()
  }, [collectionSlug, id, key, pathField, savedPath, sdk])

  const pathname = path ? `/${path.replace(/^\/+/, '')}` : null
  const url = pathname ? new URL(pathname, serverURL).href : undefined
  const title = url ? `${new URL(url).host}${pathname}`
    : id == null ? 'Save to preview URL.' : path === undefined ? 'Loading URL…' : 'URL unavailable.'

  return (
    <div aria-live="polite" className="page-slug-control__url">
      <Banner icon={<LinkIcon />} to={url} type="default">{title}</Banner>
    </div>
  )
}
