import type { CollectionConfig, GlobalConfig } from 'payload'
import type { Dependents } from './dependencies'
import { hasLocalizedStatus, isDraftOnlyUpdate, readStatus } from './drafts'
import { invalidateSource } from './invalidation'
import type { CacheTagDependencySource as Source } from './types'

/**
 * Uses each completed collection operation's own arguments to decide whether to invalidate.
 * afterOperation runs before transaction commit; this hook does not guarantee delivery after commit.
 */
function installCollectionHooks(
  collection: CollectionConfig,
  source: Source,
  dependents: Dependents,
): void {
  const hooks = (collection.hooks ??= {})

  hooks.afterOperation = [
    ...(hooks.afterOperation ?? []),
    (event) => {
      const { operation, result } = event
      const versions = event.collection.versions

      // Reads and authentication operations cannot change the cached public document.
      if (
        operation !== 'create' &&
        operation !== 'update' &&
        operation !== 'updateByID' &&
        operation !== 'restoreVersion'
      ) {
        return result
      }

      // Bulk updates report successful documents separately from failures.
      if (event.operation === 'update' && event.result.docs.length === 0) return result

      if (operation === 'create') {
        // Creation always writes a main document. Skip only a clearly unpublished draft.
        if (
          versions &&
          versions.drafts &&
          !hasLocalizedStatus(versions) &&
          readStatus(result) === 'draft'
        ) {
          return result
        }
      } else if (event.operation === 'restoreVersion') {
        // Payload 3.88 restores collections to the versions table only when draft is true.
        if (event.args.draft && !hasLocalizedStatus(versions)) return result
      } else if (isDraftOnlyUpdate({ versions, draft: event.args.draft, data: event.args.data })) {
        return result
      }

      invalidateSource(source, dependents)
      return result
    },
  ]
  hooks.afterDelete = [
    ...(hooks.afterDelete ?? []),
    // Deleted documents can still appear in cached detail queries and lists.
    ({ doc }) => {
      invalidateSource(source, dependents)
      return doc
    },
  ]
}

/**
 * Globals have no afterOperation hook, so bridge their hooks using objects owned by each write.
 * Weak sets do not keep failed operations alive and cannot confuse writes sharing a request.
 */
function installGlobalHooks(global: GlobalConfig, source: Source, dependents: Dependents): void {
  const hooks = (global.hooks ??= {})
  // Membership is by object identity. Two writes with identical data still have separate entries.
  const draftInputs = new WeakSet<object>()
  const draftSnapshots = new WeakSet<object>()

  hooks.beforeOperation = [
    ...(hooks.beforeOperation ?? []),
    ({ args, operation, global }) => {
      // Restoration also changes the main global in Payload 3.88, even with draft: true.
      if (
        operation === 'update' &&
        isDraftOnlyUpdate({ versions: global.versions, draft: args.draft, data: args.data })
      ) {
        draftInputs.add(args.data)
      }
      return args
    },
  ]
  hooks.beforeValidate = [
    // Payload gives each update its own originalDoc, then passes it as previousDoc to afterChange.
    // Capture it before application hooks can replace the input data with a new object.
    ({ data, originalDoc }) => {
      if (draftInputs.has(data)) {
        draftInputs.delete(data)
        draftSnapshots.add(originalDoc)
      }
      return data
    },
    ...(hooks.beforeValidate ?? []),
  ]
  hooks.afterChange = [
    ...(hooks.afterChange ?? []),
    ({ doc, previousDoc }) => {
      // A missing snapshot keeps invalidation enabled, including version restoration.
      if (draftSnapshots.has(previousDoc)) {
        draftSnapshots.delete(previousDoc)
        return doc
      }
      invalidateSource(source, dependents)
      return doc
    },
  ]
}

export { installCollectionHooks, installGlobalHooks }
