'use client'

import { Banner, LinkIcon, useConfig, useDocumentInfo } from '@payloadcms/ui'

export function PathPreview() {
  const {
    config: { serverURL },
  } = useConfig()
  const { data } = useDocumentInfo()
  const path = typeof data?.path === 'string' ? data.path : null

  const url = path ? new URL(path, serverURL).href : undefined
  const title = url ? `${new URL(url).host}${path}` : ''

  return (
    <div aria-live="polite" className="page-slug-control__url">
      <Banner icon={<LinkIcon />} to={url} type="default">
        {title}
      </Banner>
    </div>
  )
}
