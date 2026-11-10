'use client'

import { Banner, LinkIcon, useDocumentInfo } from '@payloadcms/ui'

type Props = { pattern?: string; flags?: string; replacement?: string }

export function PathPreview({ pattern, flags, replacement = '' }: Props) {
  const { data } = useDocumentInfo()
  if (!data?._h_slugPath) return null
  const savedPath = `/${data._h_slugPath}`
  const path = pattern ? savedPath.replace(new RegExp(pattern, flags), replacement) : savedPath
  const url = new URL(path, process.env.NEXT_PUBLIC_SERVER_URL)

  return (
    <div aria-live="polite" style={{ marginBlock: 12, overflowWrap: 'anywhere' }}>
      <a href={url.href} target="_blank" rel="noopener noreferrer">
        <Banner icon={<LinkIcon />} type="default">
          {url.host}
          {path}
        </Banner>
      </a>
    </div>
  )
}
