import type { CollectionSlug, GlobalSlug } from 'payload'

/** A collection source identifier used in an explicit dependency map. */
type CollectionCacheTagDependencySource = `collection:${string}`

/** A global source identifier used in an explicit dependency map. */
type GlobalCacheTagDependencySource = `global:${string}`

/** A collection or global source identifier used in an explicit dependency map. */
type CacheTagDependencySource = CollectionCacheTagDependencySource | GlobalCacheTagDependencySource

/**
 * A Payload collection or global whose data is read by a cached query.
 * The optional `never` properties prevent passing both collection and global in one object.
 * Payload's generated slug types provide autocomplete for each kind of source.
 */
type CacheTagSource =
  { collection: CollectionSlug; global?: never } | { collection?: never; global: GlobalSlug }

/** Configuration for {@link payloadNextCacheTags}. */
type PayloadNextCacheTagsOptions = {
  /**
   * Additional source dependencies that cannot be inferred from Payload field configuration.
   * A key depends on every source in its value array.
   * For example, 'collection:posts': ['collection:authors'] refreshes posts when an author changes.
   * Partial makes entries optional; readonly allows callers to pass arrays declared `as const`.
   */
  dependencies?: Partial<Record<CacheTagDependencySource, readonly CacheTagDependencySource[]>>
  /** Sources whose writes should not automatically invalidate cache tags. */
  exclude?: {
    collections?: readonly CollectionSlug[]
    globals?: readonly GlobalSlug[]
  }
}

// Extend Payload's TypeScript interface so callers can use the method without a cast.
// This declaration adds no runtime behavior; installGetCacheTags supplies the actual method.
declare module 'payload' {
  interface BasePayload {
    /** Returns Next.js Data Cache tags for the Payload sources read by a cached query. */
    getCacheTags(...sources: CacheTagSource[]): string[]
  }
}

export type {
  CollectionCacheTagDependencySource,
  GlobalCacheTagDependencySource,
  CacheTagDependencySource,
  CacheTagSource,
  PayloadNextCacheTagsOptions,
}
