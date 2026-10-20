# Versioned filenames for Payload

A Payload plugin that gives uploads and file replacements a fresh 32-character
hexadecimal filename (a UUID without hyphens), preserving the final extension.
For example, `photo.jpg` becomes `5b31b5b8788c435c98560ccba12fb086.jpg`.

```ts
import { versionedFilenames } from '@payloadflare/versioned-filenames'

// In your Payload config:
plugins: [versionedFilenames()]
```

The plugin targets the `media` collection by default. Pass
`{ collections: ['assets', 'documents'] }` to select different upload collections.
Only the selected upload-enabled collections are modified. Metadata-only edits
keep the existing filename, and existing files are not renamed retroactively.
Existing collection hooks are preserved; the filename hook runs after existing
`beforeOperation` hooks. Register this plugin after other plugins that prepare
uploaded files. Reapplying this plugin does not duplicate its hook.

For each selected collection, the plugin adds a read-only `displayFilename` field
for signed-in editors and hides Payload's stored `filename` field in the admin UI.
On upload or file replacement, it saves the uploaded original filename for editors
before replacing the stored filename with a random one. Anonymous API responses
omit `displayFilename`. Existing records fall back to their stored filename for
editors. It also sets the collection's
title and default list columns unless the collection already defines them.

The identifier is random, not a content hash: uploading identical bytes again
still creates a new filename. The plugin does not change cache headers, storage
adapters, collection access control, or media document IDs. Pages displaying
an image must use its updated URL; any cached page data may need revalidation.
If adding the plugin to an existing collection, migrate its database to include
the `displayFilename` field before uploading new files.

This is a private workspace package exporting TypeScript source, following the
repository's existing package convention. Next.js consumers should add
`@payloadflare/versioned-filenames` to `transpilePackages`.

Run checks with:

```sh
pnpm --filter @payloadflare/versioned-filenames test
pnpm --filter @payloadflare/versioned-filenames typecheck
```
