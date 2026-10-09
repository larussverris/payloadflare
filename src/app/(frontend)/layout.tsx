import React from 'react'
import { LivePreview } from '@payloadflare/live-preview/next'

import './styles.css'

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
