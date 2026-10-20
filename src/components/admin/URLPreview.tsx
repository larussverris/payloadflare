'use client'

import { Banner, LinkIcon } from '@payloadcms/ui'

export function URLPreview({ error, loading, pathname }: {
  error: boolean
  loading: boolean
  pathname: string
}) {
  const siteHost = new URL(process.env.NEXT_PUBLIC_SERVER_URL!).host
  const title = error ? 'Folder URL unavailable' : loading ? 'Loading URL…' : `${siteHost}${pathname}`
  return (
    <div aria-live="polite" className="page-slug-control__url">
      <Banner
        icon={<LinkIcon />}
        to={error || loading ? undefined : new URL(pathname, process.env.NEXT_PUBLIC_SERVER_URL!).href}
        type="default"
      >
        {title}
      </Banner>
    </div>
  )
}
