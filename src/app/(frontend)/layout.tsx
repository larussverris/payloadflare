import { getPreferences } from '@/utilities/getPreferences'
import React from 'react'
import type { Metadata } from 'next'
import config from '@payload-config'
import { LivePreview } from '@/admin/live-preview/LivePreview'
import { generateOrganizationSchema } from '@/lib/seo/generateOrganizationSchema'

import './globals.css'

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const { serverURL } = await config
  const { business, pageLanguage } = await getPreferences()
  const organization = generateOrganizationSchema(business, serverURL)

  return (
    <html lang={pageLanguage || 'en'}>
      <head>
        {organization && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organization).replace(/</g, '\\u003c'),
            }}
          />
        )}
      </head>
      <body>
        <LivePreview origin={serverURL}>
          <main>{children}</main>
        </LivePreview>
      </body>
    </html>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const { serverURL } = await config
  const { favicon, meta } = await getPreferences()
  const metadata: Metadata = {
    metadataBase: new URL(serverURL),
    title: meta?.title || 'Your Website Name',
    description: meta?.description || undefined,
  }

  if (favicon && typeof favicon === 'object' && favicon.url) {
    metadata.icons = { icon: { url: favicon.url, type: favicon.mimeType || undefined } }
  }

  return metadata
}
