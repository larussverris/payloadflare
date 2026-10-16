import React from 'react'
import type { Metadata } from 'next'
import config from '@payload-config'
import { getPayload } from 'payload'
import { LivePreview } from '@payloadflare/live-preview/next'
import { generateOrganizationSchema } from '@/lib/seo/generateOrganizationSchema'

import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config })
  const { favicon } = await payload.findGlobal({
    slug: 'preferences',
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
  const payload = await getPayload({ config })
  const { business } = await payload.findGlobal({
    slug: 'preferences',
    depth: 1,
    overrideAccess: false,
  })
  const organization = generateOrganizationSchema(business, process.env.NEXT_PUBLIC_SERVER_URL!)

  return (
    <html lang="en">
      <head>
        {organization && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, '\\u003c') }}
          />
        )}
      </head>
      <body>
        <LivePreview origin={process.env.NEXT_PUBLIC_SERVER_URL!}>
          <main>{children}</main>
        </LivePreview>
      </body>
    </html>
  )
}
