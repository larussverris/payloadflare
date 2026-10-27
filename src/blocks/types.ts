import type { ComponentType } from 'react'
import type { Config } from '@/payload-types'

export type BlockData = Config['blocks'][keyof Config['blocks']]

// Each registered schema requires a renderer accepting its generated data type.
export type BlockRenderers = {
  [Slug in keyof Config['blocks']]: ComponentType<Config['blocks'][Slug]>
}

type CheckBlockRenderers<Registry extends BlockRenderers> = Registry

// Validate every generated block, even if it is not currently used by a page.
// This type-only lookup does not load frontend components into Payload config.
export type RegisteredBlockRenderers = CheckBlockRenderers<typeof import('@/blocks')>
