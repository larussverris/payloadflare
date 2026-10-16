import type { Page } from '@/payload-types'

import { ButtonBlock } from '@/blocks/Button'
import { HeroBlock } from '@/blocks/Hero'
import { ImageBlock } from '@/blocks/Image'
import { NotFoundBlock } from '@/blocks/NotFound'
import { TextBlock } from '@/blocks/Text'
import { VideoBlock } from '@/blocks/Video'

const blockComponents = {
  button: ButtonBlock,
  hero: HeroBlock,
  image: ImageBlock,
  notFound: NotFoundBlock,
  text: TextBlock,
  video: VideoBlock,
}

export function BlocksRenderer({ blocks }: { blocks: Page['layout'] }) {
  return blocks?.map((block, index) => {
    switch (block.blockType) {
      case 'button': return <blockComponents.button key={block.id ?? index} {...block} />
      case 'hero': return <blockComponents.hero key={block.id ?? index} {...block} />
      case 'image': return <blockComponents.image key={block.id ?? index} {...block} />
      case 'notFound': return <blockComponents.notFound key={block.id ?? index} {...block} />
      case 'text': return <blockComponents.text key={block.id ?? index} {...block} />
      case 'video': return <blockComponents.video key={block.id ?? index} {...block} />
    }
  })
}
