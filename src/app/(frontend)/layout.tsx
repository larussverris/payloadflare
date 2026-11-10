import { OrganizationSchema } from '@/components/OrganizationSchema'
import { getPreferences } from '@/utilities/getPreferences'
import { renderBlocks } from '@/utilities/renderBlocks'
import React from 'react'
import type { Metadata } from 'next'
import config from '@payload-config'
import { draftMode } from 'next/headers'
import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { refresh, unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import './globals.css'

const getHeader = unstable_cache(
  async (draft: boolean) => {
    const payload = await getPayload({ config })
    return payload.findGlobal({
      slug: 'header',
      depth: 2,
      disableErrors: true,
      draft,
      overrideAccess: draft,
    })
  },
  ['header'],
  { revalidate: 3600 },
)

const getFooter = unstable_cache(
  async (draft: boolean) => {
    const payload = await getPayload({ config })
    return payload.findGlobal({
      slug: 'footer',
      depth: 2,
      disableErrors: true,
      draft,
      overrideAccess: draft,
    })
  },
  ['footer'],
  { revalidate: 3600 },
)

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const { pageLanguage } = await getPreferences()
  const { isEnabled } = await draftMode()
  const [header, footer] = await Promise.all([
    getHeader(isEnabled),
    getFooter(isEnabled),
  ])

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
        {isEnabled && (
          <RefreshRouteOnSave
            refresh={refreshPreview}
            serverURL={process.env.NEXT_PUBLIC_SERVER_URL}
          />
        )}
        <header>{renderBlocks(header?.layout)}</header>
        <main>{children}</main>
        <footer>{renderBlocks(footer?.layout)}</footer>
      </body>
    </html>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const { favicon, meta } = await getPreferences()
  const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL),
    title: meta?.title,
    description: meta?.description,
  }

  if (favicon && typeof favicon === 'object' && favicon.url) {
    metadata.icons = { icon: { url: favicon.url, type: favicon.mimeType || undefined } }
  }

  return metadata
}
