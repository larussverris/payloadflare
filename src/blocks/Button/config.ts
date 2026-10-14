import type { Block } from 'payload'

import { linkFields } from '../../fields/link'

export const Button: Block = {
  slug: 'button',
  interfaceName: 'ButtonBlock',
  fields: linkFields,
}
