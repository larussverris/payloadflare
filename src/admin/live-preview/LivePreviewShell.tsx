'use client'

import type { PayloadAdminBarProps } from '@payloadcms/admin-bar'
import { isDocumentEvent, ready } from '@payloadcms/live-preview'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'

import { PreviewAdminBar } from './PreviewAdminBar'

type LivePreviewShellProps = PayloadAdminBarProps & {
  children: ReactNode
  cmsURL: string
}

function LivePreviewShell({ children, cmsURL, ...adminBarProps }: LivePreviewShellProps) {
  const { refresh } = useRouter()
  const hasSentReadyMessageRef = useRef(false)

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (isDocumentEvent(event, cmsURL)) refresh()
    }

    window.addEventListener('message', handleMessage)
    if (!hasSentReadyMessageRef.current) {
      hasSentReadyMessageRef.current = true
      ready({ serverURL: cmsURL })
    }
    return () => window.removeEventListener('message', handleMessage)
  }, [cmsURL, refresh])

  return (
    <>
      <PreviewAdminBar {...adminBarProps} cmsURL={cmsURL} />
      {children}
    </>
  )
}

export { LivePreviewShell }
