'use client'

import type { CheckboxFieldClientProps } from 'payload'
import {
  ConfirmationModal,
  FieldError,
  useConfig,
  useDocumentEvents,
  useDocumentInfo,
  useField,
  useFormFields,
  useModal,
} from '@payloadcms/ui'
import { useEffect, useId, useState } from 'react'
import { usePayloadSDK } from '../hooks/usePayloadSDK'
import { HomeIcon } from '@/admin/icons/HomeIcon'

type Homepage = { id: number | string; title: string }

export function PageHomepageField({ path, readOnly }: CheckboxFieldClientProps) {
  const { disabled, setValue, showError, value } = useField<boolean>({ path })
  const { openModal } = useModal()
  const modalSlug = `confirm-homepage-${useId()}`
  const isReadOnly = readOnly || disabled
  const { id } = useDocumentInfo()
  const { config: { routes: { admin } } } = useConfig()
  const sdk = usePayloadSDK()
  const title = useFormFields(([fields]) => fields.title?.value as string) || 'Untitled'
  const { mostRecentUpdate } = useDocumentEvents()
  const [homepage, setHomepage] = useState<Homepage | null>()
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    async function loadHomepage() {
      try {
        const { docs } = await sdk.find({
          collection: 'pages',
          where: { isHome: { equals: true } },
          select: { title: true },
          depth: 0,
          draft: true,
          limit: 1,
        }, { signal: controller.signal })
        setHomepage(docs[0] ?? null)
        setLoadError(false)
      } catch {
        if (!controller.signal.aborted) setLoadError(true)
      }
    }
    void loadHomepage()
    return () => controller.abort()
  }, [sdk, id, mostRecentUpdate, value])

  function renderHomepageDescription() {
    if (value) return 'This page is your homepage.'
    if (loadError) return 'Could not load the current homepage.'
    if (homepage === undefined) return 'Loading current homepage…'
    if (!homepage || String(homepage.id) === String(id)) return 'No homepage is currently set.'
    return (
      <>The current homepage is <a href={`${admin}/collections/pages/${homepage.id}`}>{homepage.title}</a></>
    )
  }

  return (
    <div className="field-type page-homepage">
      <div className="page-homepage__label">Homepage</div>
      <p className="page-homepage__description" aria-live="polite">
        {renderHomepageDescription()}
      </p>
      {!value && <button
        type="button"
        className="banner banner--type-default banner--has-action page-homepage__button"
        disabled={isReadOnly}
        onClick={() => {
          if (isReadOnly) return
          openModal(modalSlug)
        }}
      >
        <HomeIcon />
        <span className="banner__content">
          {`Make “${title}” Your Homepage`}
        </span>
      </button>}
      <FieldError path={path} showError={showError} />
      <ConfirmationModal
        body="This page will become the homepage at /. It will replace the current homepage, which will return to its regular page URL. This change may be saved automatically."
        confirmLabel="Make homepage"
        heading="Change the homepage?"
        modalSlug={modalSlug}
        onConfirm={() => {
          if (!isReadOnly && !value) setValue(true)
        }}
      />
    </div>
  )
}
