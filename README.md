![Payloadflare poster](public/poster.webp)

Payloadflare is a starter for building content-managed websites with [Payload CMS](https://payloadcms.com/) and [Next.js](https://nextjs.org/), designed to be hosted on [Cloudflare Workers](https://developers.cloudflare.com/workers/).

It is derived from [Payload's official Cloudflare D1 template](https://github.com/payloadcms/payload/tree/main/templates/with-cloudflare-d1).

> **Important:** This starter currently exceeds the Cloudflare Workers Free plan's script-size limit, so deployment requires a paid Workers plan.

It includes authenticated admin users, public media uploads, a form builder, and a blank frontend. Data is stored in [D1](https://developers.cloudflare.com/d1/) and media in [R2](https://developers.cloudflare.com/r2/).

## Run locally

Requirements: Node.js 24.15.0 or later, pnpm, and a Cloudflare account.

```bash
pnpm install
pnpm wrangler login
```

Create a `.env` file with:

```dotenv
# Generate a secret with `openssl rand -hex 32`.
PAYLOAD_SECRET=replace-with-a-random-secret
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

Start the app:

```bash
pnpm dev
```

- Website: `http://localhost:3000`
- Payload admin: `http://localhost:3000/admin`

## Keep your project up to date

To bring template improvements into a project created from this repository, add this repository as an `upstream` remote once:

```bash
git remote add upstream https://github.com/larussverris/payloadflare.git
```

Then fetch and merge template updates when needed:

```bash
git fetch upstream
git merge upstream/main
```

Resolve any merge conflicts, then run the relevant checks before deploying.

## Deploy to Cloudflare

Replace the placeholder names and IDs in `wrangler.jsonc` with your Worker, D1, and R2 resources.

The app uses:

- `D1` for Payload data
- `R2` for Payload media uploads
- `NEXT_INC_CACHE_R2_BUCKET` for the Next.js incremental cache
- `NEXT_TAG_CACHE_D1` for cache-tag invalidation
- `NEXT_CACHE_DO_QUEUE` to coordinate ISR revalidation
- `WORKER_SELF_REFERENCE` as the Worker's self-service binding
- `EMAIL` to send transactional email through Cloudflare Email

### Configure transactional email

Set `defaultFromAddress` and `defaultFromName` in the email adapter configuration in
`src/payload.config.ts`. These values are configured in code, not through environment variables.
Keep `defaultFromAddress` in sync with `allowed_sender_addresses` on the `EMAIL` binding in
`wrangler.jsonc`. The sender address must use a domain onboarded to Cloudflare Email. Onboard the
domain before sending mail:

```bash
pnpm wrangler email sending enable example.com
```

The `@payloadflare/email-cloudflare` workspace package is configured in `src/payload.config.ts`, so auth emails and `payload.sendEmail(...)` use the `EMAIL` binding.

### Enable D1 read replication

The `first-primary` strategy is enabled in `src/payload.config.ts`, but replicas must also be enabled on the database itself:

1. Open the D1 database in the Cloudflare dashboard.
2. Go to **Settings**.
3. Enable **Read Replication**.

### Media storage

Payload stores uploads in the `R2` bucket and serves files through `/api/media/file/<filename>` in both development and production. No separate media domain or media URL environment variable is required.

Public image responses use a 30-day browser TTL and a 30-day edge TTL in production. Development image responses use `no-store`. [Workers Cache](https://developers.cloudflare.com/workers/cache/) is enabled in `wrangler.jsonc`, using the standard OpenNext entrypoint. Payload's `Media` collection sets the file response cache headers; `next.config.ts` excludes application routes outside `/api/media/file/` from Workers Cache. Non-image file responses handled by the media header hook also opt out. OpenNext's existing internal caches and browser cache headers are preserved. No custom Worker wrapper or dashboard Cache Rule is needed.

On a cache miss, Payload retrieves the image from R2. On a hit, Cloudflare serves the cached image at the same `/api/media/file/` URL without executing Payload. This shared caching assumes the collection's current public read access (`read: () => true`); private media needs a different cache policy. File-route errors that do not reach the media header hook follow their response headers and Cloudflare's default cache behavior.

After deploying, request the same uploaded image twice using `curl -sS -D - -o /dev/null https://yourdomain.com/api/media/file/example.jpg` and check for `CF-Cache-Status: HIT` on a repeated request. Also verify `/admin` and `/api/media` do not produce cache hits. Edge behavior must be verified on Cloudflare, not just with `pnpm dev`.

The [`@payloadflare/versioned-filenames`](packages/versioned-filenames/README.md) plugin is enabled for `media` in `src/payload.config.ts`. New uploads and file replacements automatically receive a 32-character hexadecimal filename (a UUID without hyphens), preserving the extension, so browsers fetch a new URL. Metadata-only edits keep the existing filename; existing uploads are not renamed until replaced. Purge its Workers Cache entry if the old URL should stop being served from the edge. Purging cannot remove a copy already cached in a browser, and a TTL does not guarantee an object remains in edge cache until it expires.

### Deploy schema and application changes

Before deploying schema changes, create a Payload migration:

```bash
pnpm payload migrate:create
```

Deploy the database migration and application together:

```bash
pnpm deploy
```

## Optimizations

- **Metadata caching** keeps `robots.txt` and `llms.txt` on the `max` cache profile and `sitemap.xml` on the `hours` profile.
- **Persistent Next.js cache** stores SSG, ISR, and data-cache entries in R2.
- **Regional cache** keeps frequently read cache entries close to the Worker for up to one minute.
- **D1 read replicas** use Payload's `first-primary` strategy for consistent reads with lower latency after the initial primary query.
- **On-demand invalidation** is supported through D1-backed Next.js cache tags when application code revalidates tagged content.
- **Deduplicated revalidation** uses a Durable Object queue to avoid repeated ISR work.
- **Cloudflare image transformations** resize images at `/cdn-cgi/image`, negotiate the output format automatically, and default to quality 85.
- **Static asset caching** keeps Next.js's hashed `/_next/static/*` files immutable for one year and manually managed `/static/*` files cached for 30 days.
- **React Compiler** is enabled for automatic React rendering optimizations.
- **Worker-aware bundling** keeps `jose` and `pg-cloudflare` external for the workerd runtime.
- **Production logging** writes structured JSON through `console`, which integrates with Cloudflare Workers logs.

## Static files

Put manually managed assets in `public/static/` (create the directory when needed):

```text
public/static/logo.svg  ->  /static/logo.svg
```

Everything under `/static/*` is served with:

```http
Cache-Control: public,max-age=2592000
```

These files are cached by browsers for 30 days. Versioned filenames such as `logo-v2.svg` or `logo.abcd1234.svg` are still useful when an update must appear immediately.

Other files placed directly in `public/` use Cloudflare's normal static-asset caching unless another rule is added to `public/_headers`.

Uploads are limited to 6 MiB. Payload's Sharp-based crop and focal-point tools are disabled because Sharp is not supported in the Workers runtime.
