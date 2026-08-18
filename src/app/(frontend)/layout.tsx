import type { Metadata } from 'next'
import React from 'react'

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
        <main>{children}</main>
      </body>
    </html>
  )
}
