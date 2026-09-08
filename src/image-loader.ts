import type { ImageLoaderProps } from 'next/image'

export default function cloudflareLoader({ src, width, quality }: ImageLoaderProps) {
  if (process.env.NODE_ENV === 'development') {
    // Serve the original image when using `next dev`
    return src
  }

  const params = [`width=${width}`, `quality=${quality ?? 85}`, 'format=auto']
  const normalizedSrc = src.startsWith('/') ? src.slice(1) : src

  // Cloudflare Image Transformations must be enabled for the production zone.
  // https://developers.cloudflare.com/images/optimization/transformations/overview/
  return `/cdn-cgi/image/${params.join(',')}/${normalizedSrc}`
}
