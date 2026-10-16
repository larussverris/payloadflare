'use client'

import { PopupList, useModal } from '@payloadcms/ui'

export function PageDetailsMenuItems() {
  const { openModal } = useModal()

  return (
    <PopupList.ButtonGroup>
      <PopupList.Button onClick={() => openModal('page-seo')}>SEO</PopupList.Button>
      <PopupList.Button onClick={() => openModal('page-settings')}>Settings</PopupList.Button>
    </PopupList.ButtonGroup>
  )
}
