/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates. This layout handles
 * authenticated preview refreshes and noindex metadata. Customize the site's
 * layout in src/app/(frontend)/layout.tsx.
 */

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import type { Metadata } from 'next'
import { refresh } from 'next/cache'
import type { ReactNode } from 'react'

import { getPreviewContext } from '@/utilities/getPreviewContext'

export default async function PreviewLayout({ children }: { children: ReactNode }) {
  const { payload } = await getPreviewContext()

  async function refreshPreviewAction() {
    'use server'
    await getPreviewContext()
    refresh()
  }

  return (
    <>
      <RefreshRouteOnSave refresh={refreshPreviewAction} serverURL={payload.config.serverURL!} />
      {children}
    </>
  )
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}
