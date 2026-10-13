import React from 'react'
import type { Metadata } from 'next'
import config from '@payload-config'
import { getPayload } from 'payload'
import { LivePreview } from '@payloadflare/live-preview/next'

import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config })
  const { favicon } = await payload.findGlobal({
    slug: 'site-settings',
    depth: 1,
    overrideAccess: false,
  })

  if (!favicon || typeof favicon !== 'object' || !favicon.url) return {}

  return {
    icons: { icon: { url: favicon.url, type: favicon.mimeType || undefined } },
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <LivePreview origin={process.env.NEXT_PUBLIC_SERVER_URL!}>
          <main>{children}</main>
        </LivePreview>
      </body>
    </html>
  )
}
