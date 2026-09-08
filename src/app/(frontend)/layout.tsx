import type { Metadata } from 'next'
import React from 'react'
import { LivePreviewProvider } from '@payloadflare/live-preview/next'

import { mergeOpenGraph } from '@/lib/seo/mergeOpenGraph'

import './styles.css'

export const metadata: Metadata = {
  description: 'Your website description.',
  openGraph: mergeOpenGraph(),
  title: 'Your Website Name',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <LivePreviewProvider origin={process.env.NEXT_PUBLIC_SERVER_URL!}>
          <main>{children}</main>
        </LivePreviewProvider>
      </body>
    </html>
  )
}
