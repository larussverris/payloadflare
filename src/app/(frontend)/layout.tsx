import { OrganizationSchema } from '@/components/OrganizationSchema'
import { getPreferences } from '@/utilities/getPreferences'
import React from 'react'
import type { Metadata } from 'next'
import config from '@payload-config'
import { draftMode } from 'next/headers'
import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { refresh } from 'next/cache'

import './globals.css'

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const { pageLanguage } = await getPreferences()
  const { isEnabled } = await draftMode()
  const { serverURL } = await config

  async function refreshPreview() {
    'use server'
    if ((await draftMode()).isEnabled) refresh()
  }

  return (
    <html lang={pageLanguage || 'en'}>
      <head>
        <OrganizationSchema />
      </head>
      <body>
        {isEnabled && <RefreshRouteOnSave refresh={refreshPreview} serverURL={serverURL!} />}
        <main>{children}</main>
      </body>
    </html>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const { serverURL } = await config
  const { favicon, meta } = await getPreferences()
  const metadata: Metadata = {
    metadataBase: new URL(serverURL),
    title: meta?.title,
    description: meta?.description,
  }

  if (favicon && typeof favicon === 'object' && favicon.url) {
    metadata.icons = { icon: { url: favicon.url, type: favicon.mimeType || undefined } }
  }

  return metadata
}
