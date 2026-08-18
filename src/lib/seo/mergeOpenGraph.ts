/**
 * Open Graph metadata controls how links look when this site is shared on
 * social media and messaging apps. Replace the placeholder defaults below
 * with this site's name and description. Pages can pass their own values to
 * `mergeOpenGraph`; those values override these defaults.
 *
 * This follows the Open Graph protocol using the Next.js Metadata API.
 * Learn more: https://ogp.me/
 */
import type { Metadata } from 'next'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Your website description.',
  siteName: 'Your Website Name',
  title: 'Your Website Name',
}

export const mergeOpenGraph = (openGraph?: Metadata['openGraph']): Metadata['openGraph'] => ({
  ...defaultOpenGraph,
  ...openGraph,
  images: openGraph?.images ?? defaultOpenGraph?.images,
})
