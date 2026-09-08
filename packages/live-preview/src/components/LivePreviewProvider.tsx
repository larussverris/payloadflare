import 'server-only'

import { draftMode } from 'next/headers'
import type { ReactNode } from 'react'
import { Fragment } from 'react'

import { exitPreviewAction } from '../server/exitPreviewAction'
import { PreviewAdminBar } from './PreviewAdminBar'

type LivePreviewProviderProps = {
  children: ReactNode
  origin: string
}

/** Wrap the frontend layout once to show draft status and refresh after saves. */
async function LivePreviewProvider(props: LivePreviewProviderProps) {
  const { isEnabled } = await draftMode()

  if (isEnabled) {
    return (
      <Fragment>
        <PreviewAdminBar
          cmsURL={props.origin}
          preview
          onPreviewExit={exitPreviewAction}
          style={{ position: 'sticky' }}
        />
        {props.children}
      </Fragment>
    )
  }

  return props.children
}

export { LivePreviewProvider }
