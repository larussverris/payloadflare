'use client'

import { useNav } from '@payloadcms/ui'
import { useEffect } from 'react'

export function CollapsePageNav() {
  const { hydrated, setNavOpen } = useNav()

  useEffect(() => {
    if (hydrated) setNavOpen(false)
  }, [hydrated, setNavOpen])

  return null
}
