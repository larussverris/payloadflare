import NextImage from 'next/image'

import type { ImageBlock as ImageBlockProps } from '@/payload-types'

export function ImageBlock({ image, caption }: ImageBlockProps) {
  if (!image || typeof image !== 'object' || !image.url) return null

  return (
    <figure>
      <NextImage
        src={image.url}
        alt={image.alt}
        unoptimized={image.mimeType === 'image/svg+xml'}
        width={image.width || 1200}
        height={image.height || 800}
      />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
