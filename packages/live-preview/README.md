# Live preview

Edit content in Payload and see the page update after each save or autosave.
The website and Payload admin must use the same origin.
Pass that origin to the component, such as `http://localhost:3000` in development
or `https://example.com` in production, without a path or trailing slash. The
component passes it to the admin bar and refresh listener.

## Source structure

- `src/index.ts`: Payload plugin configuration and registration.
- `src/components/`: the server preview component and a client component combining
  the admin bar with the refresh listener.
- `src/server/`: draft defaults, preview entry endpoint, URL helpers, and Payload reads.

Public imports remain `@payloadflare/live-preview` for the plugin and
`@payloadflare/live-preview/next` for `LivePreview`.

## 1. Select your collections and globals

In `src/payload.config.ts`:

```ts
import { livePreviewPlugin } from '@payloadflare/live-preview'

// Add to your plugins list:
livePreviewPlugin({
  collections: ['posts', 'employees'],
  globals: ['about'],
  autosaveInterval: 100, // Optional; defaults to 100 ms.
}),
```

Use slugs from schemas you have registered. Unknown slugs cause an error.
Include related content you want to read as drafts, even if it has no preview URL.

The plugin enables drafts and autosave for these schemas. Existing settings win,
including explicit `versions: false`, `drafts: false`, or `autosave: false`.
After enabling drafts, generate types and create a migration:

```bash
pnpm generate:types:payload
pnpm payload migrate:create
```

## 2. Set the page URL

In each selected collection that needs a preview button:

```ts
admin: {
  livePreview: {
    url: ({ data }) => data.slug
      ? `/posts/${encodeURIComponent(data.slug)}`
      : null,
  },
},
```

In a global, or a collection displayed on a fixed page:

```ts
admin: {
  livePreview: {
    url: '/about',
  },
},
```

Use Payload's normal URL string or callback. Return `null` when the document is not
ready.
It creates the preview endpoints for you; no extra API route files are needed.

## 3. Mark your page queries

Keep using `getPayload`. Add `context: { livePreview: true }` to participating
`find`, `findByID`, and `findGlobal` calls. Render `<LivePreview />` in your shared
frontend layout to show a draft-mode banner and refresh after saves:

```tsx
import type { ReactNode } from 'react'
import { LivePreview } from '@payloadflare/live-preview/next'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LivePreview origin={process.env.NEXT_PUBLIC_SERVER_URL!} />
        {children}
      </body>
    </html>
  )
}
```

Set `NEXT_PUBLIC_SERVER_URL` to the origin used to open the app in each environment.

The component uses `@payloadcms/admin-bar` with a draft-mode label, dashboard/account
links, and an exit-preview button that disables Draft Mode through a server action
imported by the component. Next.js re-renders the current page with the updated
cookie, so no exit endpoint or redirect is needed. The bar is
shown to authenticated users in Draft Mode in a normal browser tab. It is hidden
inside iframes, including Payload's split preview; save-triggered refreshes still
run there. The component requires an `origin` prop. The admin bar uses Payload's
defaults: `/admin`, `/api`, and the `users` auth collection.

The component mounts the admin bar and refresh listener automatically in Draft Mode.
Render it once in your shared frontend layout; no preview components are needed in pages.

```tsx
import config from '@payload-config'
import { getPayload } from 'payload'

export default async function AboutPage() {
  const payload = await getPayload({ config })
  const [about, employees] = await Promise.all([
    payload.findGlobal({
      slug: 'about',
      context: { livePreview: true },
    }),
    payload.find({
      collection: 'employees',
      context: { livePreview: true },
    }),
  ])

  return (
    <>
      <h1>{about.title}</h1>
      {employees.docs.map((employee) => (
        <p key={employee.id}>{employee.name}</p>
      ))}
    </>
  )
}
```

This example assumes an `about` global with `title` and an `employees` collection
with `name`. Use your own schemas and fields.

For selected schemas, marked reads use `draft: true` in Draft Mode and `draft: false`
outside it. An explicit `draft` value wins. Unmarked reads and unselected schemas
keep their original behavior. Add the marker to separate related-content queries too.

The marker only controls `draft`. It does not change `user`, `overrideAccess`, or your
access rules. Local API access bypass remains the default. Entry authenticates the
admin user; subsequent marked reads trust the Draft Mode cookie, even after that
admin session expires. Set your own access options when your application needs them.

Keep marked reads outside `use cache` and `unstable_cache`. Browser-only fetching
needs a separate integration; these helpers are for server-rendered pages.

## 4. Try it

1. Run `pnpm dev` and sign in to `/admin`.
2. Save a document as a draft and click **Live Preview**.
3. Edit it and wait for autosave. The page should refresh.

To preview employee edits on the About page, set Employees' URL to `/about` too.
Another editor's save does not automatically refresh your open preview.

Use **Exit preview mode** in the admin bar in a normal browser tab to leave Draft
Mode and remain on the current page. The plugin only registers the authenticated
`/api/preview` entry endpoint. Use a normal link for that endpoint; do not prefetch it.

## If it does not work

- **Unknown slug:** register the schema before listing it in the plugin.
- **No preview button:** set `admin.livePreview.url` on the selected schema.
- **Page not found:** create the page at that URL.
- **Changes do not appear:** check the selected slugs, query markers, `<LivePreview>`, and autosave settings.
- **Request-context error:** call marked reads from a Next.js server page or route, outside shared caches. In scripts, omit the marker or pass an explicit `draft` value.
- **Sign-in error:** open admin and website on the same domain and port, then sign in.
- **Visitors can see unpublished content:** review your query filters and access policy; the marker does not enforce published-only public reads.
