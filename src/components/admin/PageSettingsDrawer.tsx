'use client'

import type { BlocksFieldClientProps, GroupFieldClientProps } from 'payload'
import {
  Button,
  BlocksField,
  ChevronIcon,
  DocumentControls,
  Drawer,
  DrawerContentContainer,
  GroupField,
  useDocumentDrawerContext,
  useDocumentInfo,
  useFormFields,
  useModal,
  useTranslation,
} from '@payloadcms/ui'
import { useEffect } from 'react'

import { isSidebarPageSettings, pageSettingsSlug } from './PageHeadingSettings'

export function PageLayoutField(props: BlocksFieldClientProps) {
  const { drawerSlug } = useDocumentDrawerContext()
  return isSidebarPageSettings(drawerSlug) ? null : <BlocksField {...props} />
}

export function PageSettingsDrawer(props: GroupFieldClientProps) {
  const { drawerSlug } = useDocumentDrawerContext()
  if (isSidebarPageSettings(drawerSlug)) {
    return <GroupField {...props} field={{ ...props.field, label: '' }} />
  }
  return <PageSettingsModal {...props} />
}

function PageSettingsModal(props: GroupFieldClientProps) {
  const {
    id,
    apiURL,
    collectionSlug,
    data,
    disableActions,
    disableCreate,
    docPermissions,
    hasPublishPermission,
    hasSavePermission,
    isEditing,
    isTrashed,
    redirectAfterDelete,
    redirectAfterDuplicate,
    redirectAfterRestore,
  } = useDocumentInfo()
  const { closeModal, openModal } = useModal()
  const { t } = useTranslation()
  const slug = pageSettingsSlug(id)
  const hasSettingsErrors = useFormFields(([fields]) =>
    Object.entries(fields).some(
      ([path, field]) =>
        (['title', 'slug', 'folder', 'isHome'].includes(path) || path.startsWith('meta.')) &&
        field.valid === false,
    ),
  )

  useEffect(() => {
    if (hasSettingsErrors) openModal(slug)
  }, [hasSettingsErrors, openModal, slug])

  useEffect(() => {
    const url = new URL(window.location.href)
    const frame =
      url.searchParams.get('settings') === '1'
        ? requestAnimationFrame(() => openModal(slug))
        : undefined
    const openSettings = (event: Event) => {
      if ((event as CustomEvent<string>).detail === String(id)) openModal(slug)
    }
    window.addEventListener('page-settings:open', openSettings)
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame)
      window.removeEventListener('page-settings:open', openSettings)
    }
  }, [id, openModal, slug])

  return (
    <Drawer
      slug={slug}
      Header={
        <div className="drawer__header">
          <Button
            aria-label={t('general:close')}
            buttonStyle="ghost"
            className="drawer__header__close"
            icon={<ChevronIcon direction="left" size={24} />}
            onClick={() => closeModal(slug)}
          />
          <h2 className="drawer__header__title">Page settings</h2>
          <div className="drawer__header__actions">
            <DocumentControls
              apiURL={apiURL ?? ''}
              data={data}
              disableActions={disableActions || isTrashed}
              disableCreate={disableCreate}
              hasPublishPermission={hasPublishPermission}
              hasSavePermission={hasSavePermission}
              id={id}
              isEditing={isEditing}
              isInDrawer
              isTrashed={isTrashed}
              permissions={docPermissions ?? null}
              readOnlyForIncomingUser={props.readOnly}
              redirectAfterDelete={redirectAfterDelete}
              redirectAfterDuplicate={redirectAfterDuplicate}
              redirectAfterRestore={redirectAfterRestore}
              slug={collectionSlug ?? 'pages'}
              variant="drawerHeaderActions"
            />
          </div>
        </div>
      }
    >
      <DrawerContentContainer>
        <GroupField {...props} field={{ ...props.field, label: '' }} />
      </DrawerContentContainer>
    </Drawer>
  )
}
