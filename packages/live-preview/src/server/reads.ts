import { draftMode } from 'next/headers'
import type { Payload } from 'payload'

type Targets = {
  collections: Set<string>
  globals: Set<string>
}

type ReadOptions = {
  context?: Record<string, unknown>
  draft?: boolean
}

// Keep repeated initialization from wrapping the same Payload instance twice.
const installed = new WeakMap<Payload, Targets>()

async function previewOptions<T extends ReadOptions>(options: T): Promise<T> {
  if (options.context?.livePreview !== true) return options
  if (options.draft !== undefined) return options

  const { isEnabled } = await draftMode()
  return { ...options, draft: isEnabled }
}

/**
 * Wrap Payload's find, findByID, and findGlobal methods so developers can keep
 * using the normal Payload instance and opt queries into live preview with:
 *
 * context: { livePreview: true }
 *
 * For a selected collection or global, previewOptions adds the current request's
 * Draft Mode value as the query's draft option. Unmarked queries, unselected
 * schemas, and queries with an explicit draft value keep their original options.
 * Access-control options, users, filters, and other query settings are preserved.
 *
 * The original methods are bound to this Payload instance so they retain their
 * connection to it when called from a wrapper. Each wrapper then passes the query
 * to the original method; it does not fetch or process documents itself.
 *
 * Repeated initialization updates the selected schemas instead of wrapping the
 * methods again. The installation map stores schema selections only; Draft Mode
 * is read separately for each participating query, never shared between requests.
 */
function installPreviewReads(payload: Payload, targets: Targets) {
  const existing = installed.get(payload)
  if (existing) {
    existing.collections = targets.collections
    existing.globals = targets.globals
    return
  }

  const selected = { ...targets }
  installed.set(payload, selected)

  const find = payload.find.bind(payload)
  const findByID = payload.findByID.bind(payload)
  const findGlobal = payload.findGlobal.bind(payload)

  payload.find = async (options) => {
    if (!selected.collections.has(options.collection)) return find(options)

    return find(await previewOptions(options))
  }

  payload.findByID = async (options) => {
    if (!selected.collections.has(options.collection)) return findByID(options)

    return findByID(await previewOptions(options))
  }

  payload.findGlobal = async (options) => {
    if (!selected.globals.has(options.slug)) return findGlobal(options)

    return findGlobal(await previewOptions(options))
  }
}

export { installPreviewReads }
