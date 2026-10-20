'use client'

import { PayloadAdminBar } from '@payloadcms/admin-bar'
import type { PayloadAdminBarProps } from '@payloadcms/admin-bar'

import { PayloadLogo } from '@payloadcms/ui/shared'
import { useSyncExternalStore, type CSSProperties } from 'react'

// A window's frame context does not change during its lifetime.
const subscribe = () => () => undefined

function PreviewAdminBar(props: PayloadAdminBarProps) {
  const isStandalone = useSyncExternalStore(
    subscribe,
    () => window.self === window.top,
    () => false,
  )
  if (!isStandalone) return null

  return (
    <PayloadAdminBar
      {...props}
      logo={<PayloadLogo />}
      logoProps={{
        style: { '--color-text': 'currentColor', height: '32px' } as CSSProperties,
      }}
    />
  )
}

export { PreviewAdminBar }
