import 'server-only'

import { draftMode } from 'next/headers'

import { exitPreviewAction } from '../server/exitPreviewAction'
import { PreviewAdminBar } from './PreviewAdminBar'

type LivePreviewProps = {
  origin: string
}

/** Render once in the frontend layout to show draft status and refresh after saves. */
async function LivePreview(props: LivePreviewProps) {
  const { isEnabled } = await draftMode()

  if (!isEnabled) return null

  return (
    <PreviewAdminBar
      cmsURL={props.origin}
      preview
      onPreviewExit={exitPreviewAction}
      style={{ position: 'sticky' }}
    />
  )
}

export { LivePreview }
