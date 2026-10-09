import type { Page } from '@/payload-types'

import { ImageBlock } from '@/blocks/Image/Component'
import { VideoBlock } from '@/blocks/Video/Component'

export function BlocksRenderer({ blocks }: { blocks: Page['layout'] }) {
  return blocks?.map((block, index) => {
    switch (block.blockType) {
      case 'image':
        return <ImageBlock key={block.id ?? index} {...block} />
      case 'video':
        return <VideoBlock key={block.id ?? index} {...block} />
      default:
        return null
    }
  })
}
