'use client'

import type { CollapsibleFieldClientComponent, GroupFieldClientComponent } from 'payload'
import { Drawer, DrawerContentContainer, RenderFields } from '@payloadcms/ui'
import type { ComponentProps } from 'react'

type DrawerFieldProps = ComponentProps<GroupFieldClientComponent> | ComponentProps<CollapsibleFieldClientComponent>

function PageDetailsDrawer({
  field,
  forceRender,
  indexPath = '',
  path = '',
  permissions,
  readOnly,
  schemaPath = '',
  slug,
  title,
}: DrawerFieldProps & { slug: string; title: string }) {
  return (
    <Drawer slug={slug} title={title}>
      <DrawerContentContainer>
        <RenderFields
          fields={field.fields}
          forceRender={forceRender}
          parentIndexPath={indexPath}
          parentPath={path}
          parentSchemaPath={schemaPath}
          permissions={permissions ?? true}
          readOnly={readOnly}
        />
      </DrawerContentContainer>
    </Drawer>
  )
}

export const PageSEODrawer: GroupFieldClientComponent = (props) => (
  <PageDetailsDrawer {...props} slug="page-seo" title="SEO" />
)

export const PageSettingsDrawer: CollapsibleFieldClientComponent = (props) => (
  <PageDetailsDrawer {...props} slug="page-settings" title="Settings" />
)
