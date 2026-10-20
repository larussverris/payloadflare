import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { findDistinct, upsert } from '@payloadcms/drizzle'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { cloudflareEmailAdapter } from '@payloadflare/email-cloudflare'
import { versionedFilenames } from '@payloadflare/versioned-filenames'
import { previewEndpoint } from './endpoints/preview'
import { revalidateSiteOnChange } from './plugins/revalidateSiteOnChange'
import { pagePaths } from './plugins/pagePaths'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Folders } from './collections/Folders'
import { Preferences } from './globals/Preferences'
import { NotFoundPage } from './globals/NotFoundPage'
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
    components: {
      sidebar: {
        tabs: [
          {
            slug: 'site-pages',
            label: 'Pages',
            components: {
              Icon: '@payloadcms/ui#DocumentIcon',
              Content: '/components/admin/PagesSidebarTab#PagesSidebarTab',
            },
          },
        ],
      },
    },
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
  endpoints: [previewEndpoint],
  collections: [Users, Media, Folders, Pages],
  globals: [Preferences, NotFoundPage],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteD1AdapterWithFixes({
    binding: cloudflare.env.D1,
    blocksAsJSON: true,
    readReplicas: 'first-primary',
  }),
  logger: isProduction ? cloudflareLogger : undefined,
  plugins: [
    pagePaths({ collection: Pages.slug }),
    seoPlugin({
      uploadsCollection: Media.slug,
      collections: [],
      generateURL: async ({ doc, req, globalSlug }) => {
        const pathname = globalSlug ? '/' : await resolvePagePath(doc, req)
        return pathname ? new URL(pathname, process.env.NEXT_PUBLIC_SERVER_URL!).href : ''
      },
    }),
    formBuilderPlugin({
      formOverrides: {
        labels: { singular: 'Form', plural: 'Forms' },
        authorship: false,
      },
      formSubmissionOverrides: {
        authorship: false,
        access: {
          create: ({ req }) => !req.user,
          read: ({ req }) => Boolean(req.user),
          update: () => false,
          delete: () => false,
        },
      },
      fields: {
        payment: false,
      },
    }),
    versionedFilenames(),
    revalidateSiteOnChange({
      collections: [Pages.slug, Folders.slug, Media.slug],
      globals: [Preferences.slug, NotFoundPage.slug],
    }),
  ],
  storage: [
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: { media: true },
    }),
  ],
  upload: {
    abortOnLimit: true,
    limits: {
      fileSize: Number(process.env.MAX_UPLOAD_SIZE),
    },
  },
  // https://payloadcms.com/docs/rich-text/overview
  editor: lexicalEditor({}),
  email: cloudflareEmailAdapter({
    defaultFromAddress: process.env.EMAIL_FROM_ADDRESS!,
    defaultFromName: process.env.EMAIL_FROM_NAME!,
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

function sqliteD1AdapterWithFixes(args: Parameters<typeof sqliteD1Adapter>[0]) {
  const adapterConfig = sqliteD1Adapter(args)
  const originalInit = adapterConfig.init

  return {
    ...adapterConfig,
    init: (initArgs: Parameters<typeof originalInit>[0]) => {
      const adapter = originalInit(initArgs)
      // Payload 4 beta omits this method from the D1 adapter, though its list view uses it.
      adapter.findDistinct = findDistinct
      // The beta wires upsert to updateOne without enabling insertion of missing preferences.
      adapter.upsert = upsert
      return adapter
    },
  }
}
