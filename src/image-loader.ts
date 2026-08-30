import type { ImageLoaderProps } from 'next/image'

const normalizeSrc = (src: string) => {
  const normalized = src.startsWith('/') ? src.slice(1) : src

  try {
    return encodeURI(decodeURI(normalized))
  } catch {
    return encodeURI(normalized)
  }
}

export default function cloudflareLoader({ src, width, quality }: ImageLoaderProps) {
  const params = [`width=${width}`, `quality=${quality ?? 85}`, 'format=auto']
  if (process.env.NODE_ENV === 'development') {
    // Serve the original image when using `next dev`
    return `${src}?${params.join('&')}`
  }
  // Cloudflare Image Transformations must be enabled for the production zone.
  // https://developers.cloudflare.com/images/optimization/transformations/overview/
  return `/cdn-cgi/image/${params.join(',')}/${normalizeSrc(src)}`
}
