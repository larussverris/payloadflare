import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { cloudflareEmailAdapter } from '@payloadflare/email-cloudflare'
import { versionedFilenames } from '@payloadflare/versioned-filenames'
import { livePreviewPlugin } from '@payloadflare/live-preview'
import { openLivePreviewByDefault } from './plugins/openLivePreviewByDefault'
import { revalidateSiteOnChange } from './plugins/revalidateSiteOnChange'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Preferences } from './globals/Preferences'
import { getPagePath } from './lib/pages/getPagePath'
import { resolvePagePath } from './lib/pages/resolvePagePath'

if (!process.env.NEXT_PUBLIC_SERVER_URL) {
  throw new Error('NEXT_PUBLIC_SERVER_URL must be set.')
}

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined)

const isCLI = process.argv.some((value) => {
  const resolved = realpath(value)

  if (!resolved) {
    return false
  }

  return resolved.endsWith(path.join('payload', 'bin.js'))
})
const isProduction = process.env.NODE_ENV === 'production'

const createLog =
  (level: string, fn: typeof console.log) => (objOrMsg: object | string, msg?: string) => {
    if (typeof objOrMsg === 'string') {
      fn(JSON.stringify({ level, msg: objOrMsg }))
    } else {
      fn(JSON.stringify({ level, ...objOrMsg, msg: msg ?? (objOrMsg as { msg?: string }).msg }))
    }
  }

const cloudflareLogger = {
  level: process.env.PAYLOAD_LOG_LEVEL || 'info',
  trace: createLog('trace', console.debug),
  debug: createLog('debug', console.debug),
  info: createLog('info', console.log),
  warn: createLog('warn', console.warn),
  error: createLog('error', console.error),
  fatal: createLog('fatal', console.error),
  silent: () => {},
} as any // Use PayloadLogger type when it's exported

const cloudflare =
  isCLI || !isProduction
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

export default buildConfig({
  admin: {
    // https://payloadcms.com/docs/authentication/overview
    autoLogin:
      process.env.NODE_ENV === 'development' && process.env.DEV_AUTO_LOGIN_EMAIL
        ? { email: process.env.DEV_AUTO_LOGIN_EMAIL }
        : false,
    autoRefresh: true,
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Pages],
  globals: [Preferences],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteD1Adapter({
    binding: cloudflare.env.D1,
    blocksAsJSON: true,
    readReplicas: 'first-primary',
  }),
  logger: isProduction ? cloudflareLogger : undefined,
  plugins: [
    nestedDocsPlugin({
      collections: ['pages'],
      parentFieldSlug: 'parent',
      generateURL: (docs) => getPagePath(docs.map((doc) => String(doc.slug || '')).join('/')),
    }),
    seoPlugin({
      uploadsCollection: Media.slug,
      tabbedUI: true,
      generateURL: async ({ doc, req, globalSlug }) => {
        if (globalSlug === Preferences.slug) return process.env.NEXT_PUBLIC_SERVER_URL!
        const pathname = await resolvePagePath(doc, req)
        return pathname ? new URL(pathname, process.env.NEXT_PUBLIC_SERVER_URL!).href : ''
      },
    }),
    livePreviewPlugin({
      collections: [Pages.slug],
    }),
    formBuilderPlugin({
      formOverrides: {
        admin: { group: 'Administration' },
      },
      formSubmissionOverrides: {
        admin: { group: 'Administration' },
      },
      fields: {
        payment: false,
      },
    }),
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: { media: true },
    }),
    versionedFilenames({}),
    openLivePreviewByDefault,
    revalidateSiteOnChange,
  ],
  upload: {
    abortOnLimit: true,
    limits: {
      // Cap uploads to 6 MB.
      fileSize: 6 * 1024 * 1024,
    },
  },
  // https://payloadcms.com/docs/rich-text/overview
  editor: lexicalEditor({}),
  email: cloudflareEmailAdapter({
    defaultFromAddress: 'noreply@yourdomain.com',
    defaultFromName: 'Payload CMS',
    // `SendEmail` is supplied by Wrangler's generated runtime types. The
    // binding is cast while the generated environment file is being updated.
    binding: cloudflare.env.EMAIL,
  }),
})

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/d00b3a13e42e65aad76fba41774815726422cc39/packages/cloudflare/src/api/cloudflare-context.ts#L328C36-L328C46
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: isProduction,
      } satisfies GetPlatformProxyOptions),
  )
}
