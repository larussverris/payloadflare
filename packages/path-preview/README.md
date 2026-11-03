# Path preview

Adds a saved URL preview after the slug field in selected Payload hierarchy
collections. Links open in a new tab. No extra fetch is needed.

```ts
import { pathPreview } from '@payloadflare/path-preview'

plugins: [pathPreview({ collections: ['pages'], replace: [/^\/home$/, '/'] })]
```

`replace` is optional and applies to the slash-prefixed `_h_slugPath`.
The plugin requests hierarchy paths for authenticated document responses.
