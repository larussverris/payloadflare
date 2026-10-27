import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { findDistinct, upsert } from '@payloadcms/drizzle'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig, type Config } from 'payload'
import { fileURLToPath } from 'url'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { cloudflareEmailAdapter } from '@payloadflare/email-cloudflare'
import { revalidateSiteOnSave } from './plugins/revalidateSiteOnSave'
import { mediaURLVersions } from './plugins/mediaURLVersions'
import * as blockSchemas from '@/blocks/config'
import * as collections from '@/collections'
import * as globals from '@/globals'

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
} as unknown as Exclude<Config['logger'], boolean | undefined> // Console adapter for Payload's logger contract.

const cloudflare =
  isCLI || !isProduction
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

const config = buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  admin: {
    components: {
      sidebar: {
        tabs: [
          {
            slug: 'site-pages',
            label: 'Pages',
            components: {
              Icon: '@payloadcms/ui#DocumentIcon',
              Content: '/admin/components/PagesSidebarTab#PagesSidebarTab',
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
    user: collections.Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  // Payload mutates schemas during initialization; keep module exports clean for hot reload.
  collections: Object.values(collections),
  globals: Object.values(globals),
  blocks: Object.values(blockSchemas),
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
    mediaURLVersions({ collections: [collections.Media.slug] }),
    seoPlugin({
      uploadsCollection: collections.Media.slug,
      collections: [], // Pages declares its SEO fields directly.
      generateURL: ({ doc }) => {
        if (doc.isHome) return '/'
        if (doc._h_slugPath) return `/${doc._h_slugPath}`
        return ''
      },
    }),
    formBuilderPlugin({
      formSubmissionOverrides: {
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
    revalidateSiteOnSave({
      collections: Object.values(collections).map(({ slug }) => slug),
      globals: Object.values(globals).map(({ slug }) => slug),
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

export default config
