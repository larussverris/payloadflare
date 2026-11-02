/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates.
 */

'use client'

import type { ClientField, RelationshipFieldClientProps, RowFieldClientProps } from 'payload'
import {
  Button,
  ChevronIcon,
  Drawer,
  DrawerContentContainer,
  RenderFields,
  RelationshipField,
  useConfig,
  useDocumentInfo,
  useFormFields,
  useModal,
  useTranslation,
} from '@payloadcms/ui'
import { createContext, useContext, useEffect } from 'react'

import { pageSettingsSlug } from './PageHeadingSettings'

const InPageSettings = createContext(false)

function PageParentField(props: RelationshipFieldClientProps) {
  return useContext(InPageSettings) ? <RelationshipField {...props} /> : null
}

function PageSettingsFields(props: RowFieldClientProps) {
  const { config } = useConfig()
  const parent = config.collections.find(collection => collection.slug === 'pages')?.fields
    .find(field => 'name' in field && field.name === 'parent')
  const fields = props.field.fields.map((field): ClientField =>
    parent?.type === 'relationship' && field.type === 'group' && !('name' in field)
      ? {
        ...field,
        fields: [parent, ...field.fields],
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

function PageSettingsDrawer(props: RowFieldClientProps) {
  const { id } = useDocumentInfo()
  const { closeModal, openModal } = useModal()
  const { t } = useTranslation()
  const slug = pageSettingsSlug(id)
  const hasSettingsErrors = useFormFields(([fields]) =>
    Object.entries(fields).some(
      ([path, field]) =>
        (['slug', 'parent', 'isHome'].includes(path) || path.startsWith('meta.')) &&
        field.valid === false,
    ),
  )

  useEffect(() => {
    if (hasSettingsErrors) openModal(slug)
  }, [hasSettingsErrors, openModal, slug])



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
        </div>
      }
    >
      <DrawerContentContainer>
        <PageSettingsFields {...props} />
      </DrawerContentContainer>
    </Drawer>
  )
}

export { PageParentField, PageSettingsDrawer }
