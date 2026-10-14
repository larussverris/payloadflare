import type { Page } from '@/payload-types'

import { ButtonBlock } from '@/blocks/Button'
import { ImageBlock } from '@/blocks/Image'
import { VideoBlock } from '@/blocks/Video'

export function BlocksRenderer({ blocks }: { blocks: Page['layout'] }) {
  return blocks?.map((block, index) => {
    switch (block.blockType) {
      case 'button':
        return <ButtonBlock key={block.id ?? index} {...block} />
      case 'image':
        return <ImageBlock key={block.id ?? index} {...block} />
      case 'video':
        return <VideoBlock key={block.id ?? index} {...block} />
      default:
        return null
    }
  })
}
