import type { CollectionConfig, GlobalConfig } from 'payload'

type Versions = Exclude<CollectionConfig['versions'], boolean | undefined>
type Drafts = Exclude<Versions['drafts'], boolean | undefined>

/**
 * Enable drafts and autosave for a collection or global selected in the plugin.
 * This lets developers use live preview without configuring versions themselves.
 *
 * When no settings exist, the result is equivalent to:
 *
 * versions: {
 *   drafts: {
 *     autosave: { interval },
 *   },
 * }
 *
 * The plugin supplies the interval, which defaults to 100 ms. Existing developer
 * settings take priority over these defaults:
 *
 * - versions: false leaves the entire schema unchanged.
 * - drafts: false leaves the entire schema unchanged.
 * - autosave: false keeps autosave disabled.
 * - A custom autosave interval replaces the plugin's default interval.
 * - Other version, draft, and autosave settings are preserved.
 *
 * Payload accepts booleans or objects for these settings, so the checks below
 * separate explicit disabling from objects whose settings need to be preserved.
 *
 * The function copies the objects it updates instead of modifying the developer's
 * original schema. It returns the same kind of schema it received: a collection
 * stays a collection, and a global stays a global.
 */
function withDraftDefaults<T extends CollectionConfig | GlobalConfig>(schema: T, interval: number): T {
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
