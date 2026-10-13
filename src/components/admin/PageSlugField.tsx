'use client'

import type { SlugFieldClientProps } from 'payload'

import { SlugField, useFormFields } from '@payloadcms/ui'

export function PageSlugField(props: SlugFieldClientProps) {
  const isHome = useFormFields(([fields]) => fields.kind?.value === 'home')

  return (
    <SlugField
      {...props}
      field={{
        ...props.field,
        admin: {
          ...props.field.admin,
          readOnly: isHome || props.readOnly || props.field.admin?.readOnly,
        },
      }}
    />
  )
}
