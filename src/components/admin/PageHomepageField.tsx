'use client'

import type { CheckboxFieldClientProps } from 'payload'
import {
  CheckboxInput,
  ConfirmationModal,
  FieldDescription,
  FieldError,
  useField,
  useModal,
} from '@payloadcms/ui'
import { useId, useState } from 'react'

export function PageHomepageField({ field, path, readOnly }: CheckboxFieldClientProps) {
  const { disabled, setValue, showError, value } = useField<boolean>({ path })
  const { openModal } = useModal()
  const modalSlug = `confirm-homepage-${useId()}`
  const [nextValue, setNextValue] = useState<boolean | null>(null)
  const isReadOnly = readOnly || disabled

  return (
    <div className="field-type checkbox">
      <CheckboxInput
        checked={Boolean(value)}
        Error={<FieldError path={path} showError={showError} />}
        label={field.label}
        name={path}
        onToggle={() => {
          if (isReadOnly) return
          setNextValue(!value)
          openModal(modalSlug)
        }}
        readOnly={isReadOnly}
        required={field.required}
      />
      <FieldDescription description={field.admin?.description} path={path} />
      <ConfirmationModal
        body={
          nextValue
            ? 'This page will become the homepage at /. It will replace the current homepage, which will return to its regular page URL. This change may be saved automatically.'
            : 'This page will stop being the homepage and return to its regular page URL. If no other page is set as the homepage, visitors to / will see a not-found page. This change may be saved automatically.'
        }
        confirmLabel={nextValue ? 'Make homepage' : 'Remove as homepage'}
        heading={nextValue ? 'Change the homepage?' : 'Remove the homepage?'}
        modalSlug={modalSlug}
        onCancel={() => setNextValue(null)}
        onConfirm={() => {
          if (!isReadOnly && nextValue !== null) setValue(nextValue)
          setNextValue(null)
        }}
      />
    </div>
  )
}
