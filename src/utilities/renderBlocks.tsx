/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates. Add custom blocks
 * in src/blocks/ and register them in src/blocks/config.ts and src/blocks/index.tsx.
 */

import type { ComponentType } from 'react'
import * as blockRenderers from '@/blocks'
import type { BlockData } from '@/blocks/types'

/** Renders saved blocks, skipping any without a registered implementation. */
export function renderBlocks(blocks: readonly BlockData[] | null | undefined) {
  return blocks?.map((block, index) => {
    if (!Object.hasOwn(blockRenderers, block.blockType)) {
      return null
    }

    // The registry checks each component's props. Dynamic indexing loses the
    // relationship between the discriminant and props, so restore it here.
    const Component = blockRenderers[block.blockType] as ComponentType<BlockData>

    return <Component key={block.id ?? index} {...block} />
  })
}
