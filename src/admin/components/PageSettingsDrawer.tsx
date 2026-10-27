'use client'

import type { BlocksFieldClientProps, ClientField, RelationshipFieldClientProps, RowFieldClientProps } from 'payload'
import {
  Button,
  BlocksField,
  ChevronIcon,
  DocumentControls,
  Drawer,
  DrawerContentContainer,
  RenderFields,
  RelationshipField,
  useConfig,
  useDocumentInfo,
  useDocumentDrawerContext,
  useFormFields,
  useModal,
  useTranslation,
} from '@payloadcms/ui'
import { createContext, useContext, useEffect } from 'react'

import { isSidebarPageSettings, pageSettingsSlug } from './PageHeadingSettings'

const InPageSettings = createContext(false)

function PageParentField(props: RelationshipFieldClientProps) {
  return useContext(InPageSettings) ? <RelationshipField {...props} /> : null
}

function PageLayoutField(props: BlocksFieldClientProps) {
  const { drawerSlug } = useDocumentDrawerContext()
  return isSidebarPageSettings(drawerSlug) ? null : <BlocksField {...props} />
}

function PageSettingsDrawer(props: RowFieldClientProps) {
  const { drawerSlug } = useDocumentDrawerContext()
  return isSidebarPageSettings(drawerSlug) ? <PageSettingsFields {...props} /> : <PageSettingsModal {...props} />
}

function PageSettingsFields(props: RowFieldClientProps) {
  const { config } = useConfig()
  const parent = config.collections.find(collection => collection.slug === 'pages')?.fields
    .find(field => 'name' in field && field.name === 'parent')
  const fields = props.field.fields.map((field): ClientField =>
    parent?.type === 'relationship' && field.type === 'group' && !('name' in field)
      ? {
        ...field,
        fields: [field.fields[0], parent, ...field.fields.slice(1)],
      }
      : field,
  )
  return (
    <InPageSettings value={true}>
      <RenderFields
        fields={fields}
        parentIndexPath={props.indexPath ?? ''}
        parentPath={props.parentPath ?? ''}
        parentSchemaPath={props.parentSchemaPath ?? ''}
        permissions={props.permissions ?? {}}
        readOnly={props.readOnly}
      />
    </InPageSettings>
  )
}

function PageSettingsModal(props: RowFieldClientProps) {
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
        (['title', 'slug', 'parent', 'isHome'].includes(path) || path.startsWith('meta.')) &&
        field.valid === false,
    ),
  )

  useEffect(() => {
    if (hasSettingsErrors) openModal(slug)
  }, [hasSettingsErrors, openModal, slug])

  useEffect(() => {
    const openSettings = (event: Event) => {
      if ((event as CustomEvent<string>).detail === String(id)) openModal(slug)
    }
    window.addEventListener('page-settings:open', openSettings)
    return () => window.removeEventListener('page-settings:open', openSettings)
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
        <PageSettingsFields {...props} />
      </DrawerContentContainer>
    </Drawer>
  )
}

export { PageParentField, PageLayoutField, PageSettingsDrawer }
