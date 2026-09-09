import 'server-only'

import { draftMode } from 'next/headers'
import type { ReactNode } from 'react'

import { exitPreviewAction } from '../server/exitPreviewAction'
import { LivePreviewShell } from './LivePreviewShell'

type LivePreviewProps = {
  children: ReactNode
  origin: string
}

/** Render once in the frontend layout to show draft status and refresh after saves. */
async function LivePreview(props: LivePreviewProps) {
  const { isEnabled } = await draftMode()

  // If Draft Mode is not enabled, render the page normally.
  if (!isEnabled) return props.children

  return (
    <LivePreviewShell
      cmsURL={props.origin}
      preview
      onPreviewExit={exitPreviewAction}
      style={{ position: 'relative', zIndex: 'unset' }}
    >
      {props.children}
    </LivePreviewShell>
  )
}

export { LivePreview }
