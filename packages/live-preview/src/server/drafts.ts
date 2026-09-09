import type { CollectionConfig, GlobalConfig } from 'payload'

type Versions = Exclude<CollectionConfig['versions'], boolean | undefined>
type Drafts = Exclude<Versions['drafts'], boolean | undefined>

/**
 * Enable drafts and autosave for live preview while preserving explicit settings.
 *
 * Defaults when no settings exist:
 * ```ts
 * versions: {
 *   drafts: {
 *     autosave: { interval },
 *   },
 * }
 * ```
 */
function withDraftDefaults<T extends CollectionConfig | GlobalConfig>(
  schema: T,
  interval: number,
): T {
  if (schema.versions === false) return schema

  let versions: Versions = {}
  if (typeof schema.versions === 'object') {
    versions = { ...schema.versions }
  }
  if (versions.drafts === false) return schema

  let drafts: Drafts = {}
  if (typeof versions.drafts === 'object') {
    drafts = { ...versions.drafts }
  }

  if (drafts.autosave !== false) {
    let autosave = { interval }
    if (typeof drafts.autosave === 'object') {
      autosave = { ...autosave, ...drafts.autosave }
    }
    drafts.autosave = autosave
  }

  versions.drafts = drafts
  return { ...schema, versions }
}

export { withDraftDefaults }
