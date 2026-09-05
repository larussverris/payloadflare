# Payload Next Cache Tags

Payload plugin for source-level Next.js Data Cache invalidation. Tag a cached Payload query with each collection or global it directly reads. On writes, the plugin invalidates the changed source and every collection/global that can depend on it through schema relationships.

For example, a blog post includes its author's name through an `author` relationship field. Editing the author's name invalidates cached authors and cached posts. The post query only needs the `collection:posts` tag.

```ts
import { payloadNextCacheTags } from '@payloadflare/next-cache-tags'

export default buildConfig({
  plugins: [payloadNextCacheTags()],
})
```

```ts
const payload = await getPayload({ config })

return unstable_cache(() => payload.find({ collection: 'posts', depth: 1 }), [], {
  tags: payload.getCacheTags({ collection: 'posts' }),
})()
```

`payload.getCacheTags()` accepts one or more `{ collection }` or `{ global }` source objects and always returns a deduplicated array. The plugin derives relationships from `relationship`, `upload`, and `join` fields, including nested groups, arrays, blocks, and tabs. It follows those reverse dependencies transitively on a public create, update, unpublish, or delete, calling `revalidateTag(tag, 'max')` once for each affected source.

## Options

```ts
payloadNextCacheTags({
  exclude: {
    collections: ['users'],
    globals: ['internal-settings'],
  },
  dependencies: {
    // Needed only if custom code reads authors without a schema relationship.
    'collection:posts': ['collection:authors'],
  },
})
```

Excluding a source disables hooks originating from that source; it does not prevent tags from being generated for it. `dependencies` is additive and validates every identifier against configured collections and globals.

Rich-text editor features and application-defined reads cannot be inferred reliably from a field configuration. Add those dependencies explicitly. The plugin is intended for Payload running inside the same Next.js application; it does not provision OpenNext or Cloudflare cache infrastructure.

## Types

Public types are available from the package root or `@payloadflare/next-cache-tags/types`, including `CacheTagSource`, `CacheTagDependencySource`, and `PayloadNextCacheTagsOptions`.

## Code layout

Start with `src/index.ts`. It reads the options, builds dependencies, attaches hooks, and installs the tag helper during initialization.

- `tags.ts` creates source tags and installs `payload.getCacheTags()`.
- `dependencies.ts` finds schema relationships and collects affected sources.
- `hooks.ts` connects collection and global write lifecycles to invalidation.
- `drafts.ts` holds the draft-only update decision and publication-status checks.
- `invalidation.ts` sends the affected tags to Next.js.
- `types.ts` defines the public options and Payload instance extension.

For example, an author edit reaches `hooks.ts`, which calls `invalidation.ts`. That uses `dependencies.ts` to collect the authors and posts tags, then revalidates each tag.

## Draft handling

Collections use `afterOperation`, which receives the write's arguments and result together. There are no draft flags on the request. Ordinary draft-only updates skip invalidation; publishing and unpublishing invalidate. Initial creation skips invalidation when its result is clearly an unpublished draft. Bulk updates invalidate once when qualifying writes succeed.

Globals have no `afterOperation` hook. Their `beforeOperation` hook identifies draft-only input objects. The first `beforeValidate` hook associates those inputs with the operation's original-document snapshot, which Payload passes to `afterChange` as `previousDoc`. Private weak sets track those objects without modifying request context or documents. Nested reads and writes have separate snapshots, and failed operations need no stack cleanup. Application hooks can replace the input data after that association without losing it.

Version restoration follows the Payload 3.88.0 operations: restoring a collection as a draft skips the main-document write; restoring a global writes the main document even when the operation receives `draft: true`. The plugin therefore invalidates global restores. Localized publication stays conservative and always invalidates.

## Tests

Run `pnpm --filter @payloadflare/next-cache-tags test` and `pnpm --filter @payloadflare/next-cache-tags typecheck`.

Unit tests cover the graph, configuration, and draft decision. `hooks.integration.test.ts` uses `test-fixture.ts` to initialize real Payload 3.88.0 with a disposable SQLite database and transactions enabled. It covers drafts, autosaves, publishing, unpublishing, nested operations, failed writes, bulk updates, and version restoration. Global autosave and draft restoration use Payload's exported operations because the Local APIs do not forward those flags in this version. A separate regression test verifies that the collection Local API's dropped restore-draft flag results in a public write and invalidation. Only the Next.js cache call is mocked.

## Current limits

Dependencies are discovered when this plugin runs. Register it after plugins that add collections, globals, or relationship fields; it does not rescan the final initialized schema.

The hooks invalidate during collection `afterOperation`, collection `afterDelete`, and global `afterChange`. They do not defer delivery until a transaction commits or undo invalidation after a later rollback. Bulk deletion still invalidates per document.

The integration suite verifies Payload's local SQLite behavior, not the Cloudflare D1 adapter, Admin browser workflows, or real Next.js cache refreshes. Transaction-safe invalidation delivery and locale-specific publication workflows need their own integration work.
