'use client'

import { useConfig, useDocumentInfo, useStepNav } from '@payloadcms/ui'
import { useEffect } from 'react'

export function SystemPageBreadcrumb() {
  const { globalSlug } = useDocumentInfo()
  const { config } = useConfig()
  const { stepNav, setStepNav } = useStepNav()
  const parentURL = `${config.routes.admin}/collections/pages`
  const globalURL = `${config.routes.admin}/globals/${globalSlug}`

  useEffect(() => {
    // Preserve Payload's document breadcrumb and prepend its custom parent.
    if (stepNav[0]?.url !== parentURL && stepNav.some((item) => item.url === globalURL)) {
      setStepNav([{ label: 'Pages', url: parentURL }, ...stepNav])
    }
  }, [globalURL, setStepNav, stepNav, parentURL])

  return null
}
