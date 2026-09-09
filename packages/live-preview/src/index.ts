import type { CollectionConfig, Config, GlobalConfig, Plugin } from 'payload'

import { withDraftDefaults } from './server/drafts'
import { previewEndpoint } from './server/endpoints'
import { createLivePreviewURL } from './server/preview'
import { installPreviewReads } from './server/reads'

type LivePreviewPluginOptions = {
  collections?: string[]
  globals?: string[]
  /** Default autosave interval in milliseconds; existing schema settings take priority. */
  autosaveInterval?: number
}

/** Add draft defaults and route the collection's preview URL through authenticated Draft Mode. */
function configureCollection(collection: CollectionConfig, interval: number): CollectionConfig {
  const configured = withDraftDefaults(collection, interval)
  const source = collection.admin?.livePreview?.url
  if (source == null) return configured

  const url = createLivePreviewURL(source)
  const admin = { ...collection.admin }
  admin.livePreview = { ...admin.livePreview, url }

  return { ...configured, admin }
}

/** Apply the same preview setup to a global while preserving its other admin settings. */
function configureGlobal(global: GlobalConfig, interval: number): GlobalConfig {
  const configured = withDraftDefaults(global, interval)
  const source = global.admin?.livePreview?.url
  if (source == null) return configured

  const url = createLivePreviewURL(source)
  const admin = { ...global.admin }
  admin.livePreview = { ...admin.livePreview, url }

  return { ...configured, admin }
}

function validateTargets(config: Config, collections: Set<string>, globals: Set<string>) {
  for (const slug of collections) {
    const registered = config.collections?.some((collection) => collection.slug === slug)
    if (!registered) {
      throw new Error(
        `Live preview: unknown collection "${slug}". Register it before selecting it.`,
      )
    }
  }

  for (const slug of globals) {
    const registered = config.globals?.some((global) => global.slug === slug)
    if (!registered) {
      throw new Error(`Live preview: unknown global "${slug}". Register it before selecting it.`)
    }
  }
}

function validateEndpoints(config: Config) {
  for (const endpoint of [previewEndpoint]) {
    const conflict = config.endpoints?.some((existing) => {
      return existing.path === endpoint.path && existing.method === endpoint.method
    })

    if (conflict) {
      throw new Error(`Live preview endpoint conflicts with existing GET ${endpoint.path}.`)
    }
  }
}

function livePreviewPlugin(options: LivePreviewPluginOptions = {}): Plugin {
  const collections = new Set(options.collections ?? [])
  const globals = new Set(options.globals ?? [])
  const interval = options.autosaveInterval ?? 100

  if (!Number.isFinite(interval) || interval <= 0) {
    throw new Error('Live preview autosaveInterval must be a positive number of milliseconds.')
  }

  return (config) => {
    // Catch missing schemas and route collisions before installing the preview endpoint.
    validateTargets(config, collections, globals)
    validateEndpoints(config)

    const configured = { ...config }
    configured.endpoints = [...(config.endpoints ?? []), previewEndpoint]

    configured.collections = config.collections?.map((collection) => {
      if (!collections.has(collection.slug)) return collection
      return configureCollection(collection, interval)
    })

    configured.globals = config.globals?.map((global) => {
      if (!globals.has(global.slug)) return global
      return configureGlobal(global, interval)
    })

    configured.onInit = async (payload) => {
      // Make opted-in queries preview-aware before the application's own initialization runs.
      installPreviewReads(payload, { collections, globals })
      await config.onInit?.(payload)
    }

    return configured
  }
}

export { livePreviewPlugin }
export type { LivePreviewPluginOptions }
