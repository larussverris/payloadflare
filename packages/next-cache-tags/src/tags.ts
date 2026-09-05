import type { Payload } from 'payload'
import type {
  CacheTagSource,
  CollectionCacheTagDependencySource,
  GlobalCacheTagDependencySource,
} from './types'

/** Creates the identifier shared by collection cache tags and dependency graph entries. */
function collectionSource(slug: string): CollectionCacheTagDependencySource {
  return `collection:${slug}`
}

/** Creates a global identifier that stays distinct from a collection with the same slug. */
function globalSource(slug: string): GlobalCacheTagDependencySource {
  return `global:${slug}`
}

/**
 * Returns one tag per requested source, keeping the order of first appearance.
 * Related sources are handled during invalidation, so reads need no graph traversal.
 * Example: two { collection: 'posts' } arguments produce just ['collection:posts'].
 */
function getCacheTags(...sources: CacheTagSource[]): string[] {
  const tags = new Set<string>()

  for (const source of sources) {
    if (source.collection !== undefined) {
      tags.add(collectionSource(source.collection))
    } else {
      tags.add(globalSource(source.global))
    }
  }

  return [...tags]
}

/**
 * Adds the tag helper as a read-only property on the initialized Payload instance.
 * Fails if the name is already in use, rather than replacing another extension.
 */
function installGetCacheTags(payload: Payload): void {
  if ('getCacheTags' in payload) {
    throw new Error('Cannot install payload.getCacheTags(): the property is already defined.')
  }

  Object.defineProperty(payload, 'getCacheTags', {
    configurable: false, // Prevent deletion or redefinition of the method.
    enumerable: false, // Keep it out of Object.keys(payload) and object spreads.
    value: getCacheTags,
    writable: false, // Prevent replacement through ordinary assignment.
  })
}

export { collectionSource, globalSource, installGetCacheTags }
