import type { CollectionConfig, GlobalConfig } from 'payload'

type Versions = CollectionConfig['versions'] | GlobalConfig['versions']
type DraftWrite = {
  versions: Versions
  draft?: boolean
  data: unknown
}

/** Reads publication status without assuming that a hook supplied a normal document. */
function readStatus(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) return undefined
  return '_status' in data ? data._status : undefined
}

/** Keeps localized publication conservative until each locale workflow has integration coverage. */
function hasLocalizedStatus(versions: Versions): boolean {
  const drafts = typeof versions === 'object' && versions.drafts
  return typeof drafts === 'object' && drafts.localizeStatus === true
}

/**
 * Only an ordinary draft-enabled update with draft: true can skip invalidation.
 * Publishing overrides that flag. Unknown status shapes also stay eligible for invalidation.
 */
function isDraftOnlyUpdate({ versions, draft, data }: DraftWrite): boolean {
  if (typeof versions !== 'object' || !versions.drafts || !draft || hasLocalizedStatus(versions)) {
    return false
  }

  const status = readStatus(data)
  return status === undefined || status === 'draft'
}

export { hasLocalizedStatus, isDraftOnlyUpdate, readStatus }
