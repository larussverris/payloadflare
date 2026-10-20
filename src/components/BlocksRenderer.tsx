import type { Page } from '@/payload-types'

import { HeroBlock } from '@/blocks/Hero'
import { ImageBlock } from '@/blocks/Image'
import { TextBlock } from '@/blocks/Text'
import { VideoBlock } from '@/blocks/Video'

const blockComponents = {
  hero: HeroBlock,
  image: ImageBlock,
  text: TextBlock,
  video: VideoBlock,
}

export function BlocksRenderer({ blocks }: { blocks: Page['layout'] }) {
  return blocks?.map((block, index) => {
    switch (block.blockType) {
      case 'hero': return <blockComponents.hero key={block.id ?? index} {...block} />
      case 'image': return <blockComponents.image key={block.id ?? index} {...block} />
      case 'text': return <blockComponents.text key={block.id ?? index} {...block} />
      case 'video': return <blockComponents.video key={block.id ?? index} {...block} />
    }
  })
}
