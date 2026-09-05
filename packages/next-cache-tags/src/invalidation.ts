import { revalidateTag } from 'next/cache'
import { affectedSources, type Dependents } from './dependencies'
import type { CacheTagDependencySource } from './types'

/**
 * Marks the changed source and its dependents stale, calling Next.js once per tag.
 * The 'max' profile allows cached content to be served while it refreshes in the background.
 */
function invalidateSource(changed: CacheTagDependencySource, dependents: Dependents): void {
  // Graph identifiers are already the exact tags attached to reads by getCacheTags().
  // Next.js finds matching cache entries; this plugin does not fetch dependent documents.
  for (const source of affectedSources(changed, dependents)) {
    revalidateTag(source, 'max')
  }
}

export { invalidateSource }
