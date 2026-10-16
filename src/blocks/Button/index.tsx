import Link from 'next/link'

import type { ButtonBlock as ButtonBlockProps } from '@/payload-types'
import { getContactURL } from '@/lib/links/getContactURL'
import { getLinkURL } from '@/lib/links/getLinkURL'
import { getWebsiteURL } from '@/lib/links/getWebsiteURL'

export function ButtonBlock({ label, type, page, url, file, phone, email, newTab }: ButtonBlockProps) {
  const media = file && typeof file === 'object' ? file : null
  let href: string | null = null
  switch (type) {
    case 'phone':
      href = getContactURL('phone', phone)
      break
    case 'email':
      href = getContactURL('email', email)
      break
    case 'download':
      href = getLinkURL(media?.url)
      break
    case 'page':
      href = page && typeof page === 'object' ? getLinkURL(page.breadcrumbs?.at(-1)?.url) : null
      break
    case 'url':
      href = getWebsiteURL(url)
      break
  }

  if (!href || !label) return null

  const isDownload = type === 'download'
  const opensNewTab = (type === 'page' || type === 'url') && Boolean(newTab)
  const props = {
    className: 'button-link',
    href,
    download: isDownload ? media?.filename || true : undefined,
    target: opensNewTab ? '_blank' : undefined,
    rel: opensNewTab ? 'noopener noreferrer' : undefined,
    children: (
      <>
        {label}
        {opensNewTab && <span className="button-link-new-tab"> (opens in a new tab)</span>}
      </>
    ),
  }

  return (
    <div className="button-block">
      {(type === 'page' || type === 'url') && href.startsWith('/')
        ? <Link {...props} />
        : <a {...props} />}
    </div>
  )
}
