'use client'

import { PayloadAdminBar } from '@payloadcms/admin-bar'
import type { PayloadAdminBarProps } from '@payloadcms/admin-bar'

import { PayloadLogo } from './PayloadLogo'

function PreviewAdminBar(props: PayloadAdminBarProps) {
  return <PayloadAdminBar {...props} logo={<PayloadLogo />} />
}

export { PreviewAdminBar }
