import type { ComponentType } from 'react'
import * as blockRenderers from '@/blocks'
import type { BlockData } from '@/blocks/types'

/** Renders saved blocks using the site's registry, throwing if a renderer is missing. */
export function renderBlocks(blocks: readonly BlockData[] | null | undefined) {
  return blocks?.map((block, index) => {
    if (!Object.hasOwn(blockRenderers, block.blockType)) {
      throw new Error(`Missing renderer for block: ${block.blockType}`)
    }

    // The registry checks each component's props. Dynamic indexing loses the
    // relationship between the discriminant and props, so restore it here.
    const Component = blockRenderers[block.blockType] as ComponentType<BlockData>

    return <Component key={block.id ?? index} {...block} />
  })
}
