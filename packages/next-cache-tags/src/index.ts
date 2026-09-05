import type { Config, Plugin } from 'payload'
import { buildDependents } from './dependencies'
import { installCollectionHooks, installGlobalHooks } from './hooks'
import { collectionSource, globalSource, installGetCacheTags } from './tags'
import type { CacheTagDependencySource, PayloadNextCacheTagsOptions } from './types'

// A symbol keeps this internal marker separate from Payload's normal config properties.
// Symbol.for reuses the same key if this module is loaded more than once in the process.
const CONFIGURED = Symbol.for('@payloadflare/next-cache-tags/configured')
type PluginConfig = Config & { [CONFIGURED]?: boolean }

/**
 * Creates a Payload plugin that tags cached reads and invalidates related sources on writes.
 * Applications still choose which queries to cache and provide their cache keys.
 */
function payloadNextCacheTags(options: PayloadNextCacheTagsOptions = {}): Plugin {
  return (config: PluginConfig) => {
    // Repeated registration keeps the first setup and does not append duplicate hooks.
    if (config[CONFIGURED]) return config
    Object.defineProperty(config, CONFIGURED, { value: true })

    const collections = config.collections ?? []
    const globals = config.globals ?? []
    const knownSources = new Set<CacheTagDependencySource>()
    const excludedSources = new Set<CacheTagDependencySource>()

    for (const collection of collections) {
      knownSources.add(collectionSource(collection.slug))
    }
    for (const global of globals) {
      knownSources.add(globalSource(global.slug))
    }
    for (const slug of options.exclude?.collections ?? []) {
      excludedSources.add(collectionSource(slug))
    }
    for (const slug of options.exclude?.globals ?? []) {
      excludedSources.add(globalSource(slug))
    }
    for (const source of excludedSources) {
      if (!knownSources.has(source)) {
        throw new Error(`Unknown cache-tag exclusion source: ${source}`)
      }
    }

    // Excluded sources still belong in the graph: excluding posts stops post writes
    // from triggering invalidation, but an author edit can still invalidate cached posts.
    // This sees the schema available now, so plugins that add fields must run before this one.
    const dependents = buildDependents(collections, globals, knownSources, options.dependencies)

    for (const collection of collections) {
      const source = collectionSource(collection.slug)
      if (excludedSources.has(source)) continue
      installCollectionHooks(collection, source, dependents)
    }
    for (const global of globals) {
      const source = globalSource(global.slug)
      if (excludedSources.has(source)) continue
      installGlobalHooks(global, source, dependents)
    }

    const previousOnInit = config.onInit
    // The Payload instance only exists at initialization time. Install its method then,
    // before calling the application's initializer, which may already need to use it.
    config.onInit = async (payload) => {
      installGetCacheTags(payload)
      await previousOnInit?.(payload)
    }

    return config
  }
}

export { payloadNextCacheTags }

export type {
  CacheTagDependencySource,
  CacheTagSource,
  CollectionCacheTagDependencySource,
  GlobalCacheTagDependencySource,
  PayloadNextCacheTagsOptions,
} from './types'
