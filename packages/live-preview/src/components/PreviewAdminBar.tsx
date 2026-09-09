'use client'

import { PayloadAdminBar } from '@payloadcms/admin-bar'
import type { PayloadAdminBarProps } from '@payloadcms/admin-bar'
import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'

type PreviewAdminBarProps = PayloadAdminBarProps & { cmsURL: string }

function PreviewAdminBar(props: PreviewAdminBarProps) {
  const { refresh } = useRouter()
  const [showBar, setShowBar] = useState(false)

  useEffect(() => {
    // Check after hydration so the bar never flashes inside Payload's preview iframe.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowBar(window.self === window.top)
  }, [])

  return (
    <Fragment>
      <RefreshRouteOnSave refresh={refresh} serverURL={props.cmsURL} />
      {showBar && <PayloadAdminBar {...props} />}
    </Fragment>
  )
}

export { PreviewAdminBar }
