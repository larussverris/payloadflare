'use client'

import type { PayloadAdminBarProps } from '@payloadcms/admin-bar'
import { isDocumentEvent, ready } from '@payloadcms/live-preview'
import { useRouter } from 'next/navigation'
import type { CSSProperties, ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { PreviewAdminBar } from './PreviewAdminBar'

type LivePreviewShellProps = PayloadAdminBarProps & {
  children: ReactNode
  cmsURL: string
}

const shellStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100dvh',
}

const iframeStyle: CSSProperties = {
  border: 0,
  flex: 1,
  minHeight: 0,
  width: '100%',
}

function LivePreviewShell(props: LivePreviewShellProps) {
  const { children, cmsURL, ...adminBarProps } = props
  const { refresh: refreshCurrentPage } = useRouter()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const hasSentReadyMessageRef = useRef(false)
  const [shouldRenderIframe, setShouldRenderIframe] = useState(false)

  const refreshPreview = useCallback(() => {
    const isTopLevelPage = window.self === window.top

    if (isTopLevelPage) {
      iframeRef.current?.contentWindow?.location.reload()
      return
    }

    refreshCurrentPage()
  }, [refreshCurrentPage])

  useEffect(() => {
    const isTopLevelPage = window.self === window.top

    if (!isTopLevelPage) return

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShouldRenderIframe(true)
  }, [])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (isDocumentEvent(event, cmsURL)) {
        refreshPreview()
      }
    }

    window.addEventListener('message', handleMessage)

    if (!hasSentReadyMessageRef.current) {
      hasSentReadyMessageRef.current = true
      ready({ serverURL: cmsURL })
    }

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [cmsURL, refreshPreview])

  // Inside an iframe, render the website directly to avoid nesting another iframe.
  if (!shouldRenderIframe) return children

  return (
    <div style={shellStyle}>
      <PreviewAdminBar {...adminBarProps} cmsURL={cmsURL} />
      <iframe
        ref={iframeRef}
        src={window.location.href}
        style={iframeStyle}
        title="Website preview"
      />
    </div>
  )
}

export { LivePreviewShell }
