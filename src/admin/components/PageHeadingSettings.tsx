'use client'

import { DrawerToggler, useDocumentDrawerContext, useDocumentInfo } from '@payloadcms/ui'

export const pageSettingsSlug = (id: number | string | undefined) =>
  `page-settings-${id ?? 'create'}`

export const sidebarPageSettingsSlug = (id: number | string) => `sidebar-page-settings-${id}`
export const isSidebarPageSettings = (slug?: string) => slug?.startsWith('sidebar-page-settings-') === true

export function PageHeadingSettings() {
  const { id } = useDocumentInfo()
  const { drawerSlug } = useDocumentDrawerContext()
  if (isSidebarPageSettings(drawerSlug)) return null

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
