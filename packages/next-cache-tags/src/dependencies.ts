import type { CollectionConfig, Field, GlobalConfig } from 'payload'
import { collectionSource, globalSource } from './tags'
import type { CacheTagDependencySource as Source, PayloadNextCacheTagsOptions } from './types'

// Keys are sources that changed; values are sources whose cached data may now be stale.
// If a post includes its author, the map stores 'collection:authors' → Set { 'collection:posts' }.
type Dependents = ReadonlyMap<Source, ReadonlySet<Source>>

/**
 * Builds a reverse dependency map from schema fields and explicit dependencies.
 * For example, editing an author's name also invalidates posts that can display that name.
 */
function buildDependents(
  collections: CollectionConfig[],
  globals: GlobalConfig[],
  knownSources: ReadonlySet<Source>,
  explicitDependencies: PayloadNextCacheTagsOptions['dependencies'],
): Dependents {
  const dependents = new Map<Source, Set<Source>>()

  /** Records that a change to the referenced source can affect its owner. */
  function recordDependency(owner: Source, referenced: Source): void {
    // Invalidation already includes the changed source, so it needs no edge to itself.
    if (owner === referenced) return

    let owners = dependents.get(referenced)
    if (!owners) {
      owners = new Set<Source>()
      dependents.set(referenced, owners)
    }
    // Several fields may reference the same source. A Set keeps only one edge per owner.
    owners.add(owner)
  }

  /** Adds field dependencies for this owner, ignoring targets outside the configured sources. */
  function recordFields(owner: Source, fields: Field[]): void {
    for (const slug of referencedCollections(fields)) {
      const referenced = collectionSource(slug)
      if (knownSources.has(referenced)) recordDependency(owner, referenced)
    }
  }

  for (const collection of collections) {
    recordFields(collectionSource(collection.slug), collection.fields)
  }
  for (const global of globals) {
    recordFields(globalSource(global.slug), global.fields)
  }

  // Options are written as owner → references, the direction a developer reads the schema.
  // recordDependency reverses those edges so a write can find the owners it affects.
  for (const [key, references] of Object.entries(explicitDependencies ?? {})) {
    // Object.entries widens keys to string; the membership check below validates the source.
    const owner = key as Source
    if (!knownSources.has(owner)) {
      throw new Error(`Unknown cache-tag dependency source: ${owner}`)
    }
    for (const referenced of references ?? []) {
      if (!knownSources.has(referenced)) {
        throw new Error(`Unknown cache-tag dependency source: ${referenced}`)
      }
      recordDependency(owner, referenced)
    }
  }

  return dependents
}

/**
 * Collects relationship, upload, and join targets, including fields nested in containers.
 * Rich-text features and application reads need explicit dependencies in the plugin options.
 */
function referencedCollections(fields: Field[]): string[] {
  const collections: string[] = []

  for (const field of fields) {
    if (field.type === 'relationship' || field.type === 'upload') {
      const targets = field.relationTo
      // A field can target one collection or several; treat both forms as a list.
      collections.push(...(Array.isArray(targets) ? targets : [targets]))
    }
    if (field.type === 'join') {
      // A join exposes documents from this collection, so their changes affect the owner too.
      const targets = field.collection
      collections.push(...(Array.isArray(targets) ? targets : [targets]))
    }
    // Groups, arrays, rows, and collapsibles hold child fields directly in `fields`.
    // Blocks and tabs put them one level deeper, so each needs its own traversal below.
    if ('fields' in field) {
      collections.push(...referencedCollections(field.fields))
    }
    if (field.type === 'blocks') {
      for (const block of field.blocks) {
        collections.push(...referencedCollections(block.fields))
      }
    }
    if (field.type === 'tabs') {
      for (const tab of field.tabs) {
        collections.push(...referencedCollections(tab.fields))
      }
    }
  }

  return collections
}

/**
 * Returns the changed source and every source that depends on it, directly or indirectly.
 * Each source is visited once, so overlapping paths and cycles cannot repeat work.
 */
function affectedSources(changed: Source, dependents: Dependents): Source[] {
  const affected = new Set<Source>([changed])
  const pending = [changed]

  // `pending` is a work queue that grows as we discover dependents. Reading its current
  // length each time lets this same loop follow authors → posts → site settings.
  for (let index = 0; index < pending.length; index++) {
    const current = pending[index]
    for (const owner of dependents.get(current) ?? []) {
      // Mark sources when queued, so even a cycle cannot keep adding them to the queue.
      if (affected.has(owner)) continue
      affected.add(owner)
      pending.push(owner)
    }
  }

  return [...affected]
}

export { buildDependents, affectedSources }

export type { Dependents }
