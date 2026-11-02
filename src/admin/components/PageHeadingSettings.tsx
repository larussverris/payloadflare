/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates.
 */

'use client'

import { DrawerToggler, useDocumentInfo } from '@payloadcms/ui'

export const pageSettingsSlug = (id: number | string | undefined) =>
  `page-settings-${id ?? 'create'}`

export function PageHeadingSettings() {
  const { id } = useDocumentInfo()

  return (
    <DrawerToggler
      aria-label="Page settings"
      buttonStyle="ghost"
      className="page-heading-settings"
      slug={pageSettingsSlug(id)}
    >
      Settings
    </DrawerToggler>
  )
}
