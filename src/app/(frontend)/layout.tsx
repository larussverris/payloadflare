import React from 'react'
import type { Metadata } from 'next'
import { getPreferences } from '@/lib/getPreferences'
import { LivePreview } from '@/components/live-preview/LivePreview'
import { generateOrganizationSchema } from '@/lib/seo/generateOrganizationSchema'

import './globals.css'

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const { business, pageLanguage } = await getPreferences()
  const organization = generateOrganizationSchema(business, process.env.NEXT_PUBLIC_SERVER_URL!)

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
        <LivePreview origin={process.env.NEXT_PUBLIC_SERVER_URL!}>
          <main>{children}</main>
        </LivePreview>
      </body>
    </html>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const { favicon } = await getPreferences()

  if (!favicon || typeof favicon !== 'object' || !favicon.url) return {}

  return {
    icons: { icon: { url: favicon.url, type: favicon.mimeType || undefined } },
  }
}
