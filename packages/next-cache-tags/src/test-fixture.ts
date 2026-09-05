import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import {
  BasePayload,
  buildConfig,
  type CollectionBeforeChangeHook,
  type GlobalBeforeChangeHook,
} from 'payload'
import { payloadNextCacheTags } from './index'

type TestHooks = {
  postBeforeChange?: CollectionBeforeChangeHook
  settingsBeforeChange?: GlobalBeforeChangeHook
}

/** Starts real Payload with a disposable SQLite database and controllable application hooks. */
async function createTestFixture() {
  const directory = await mkdtemp(join(tmpdir(), 'next-cache-tags-'))
  const hooks: TestHooks = {}
  const payload = new BasePayload()

  try {
    await payload.init({
      config: buildConfig({
        secret: 'next-cache-tags-local-test-secret',
        telemetry: false,
        typescript: { autoGenerate: false },
        admin: { disable: true },
        db: sqliteAdapter({
          client: { url: `file:${join(directory, 'test.db')}` },
          transactionOptions: {},
        }),
        collections: [
          { slug: 'authors', fields: [{ name: 'name', type: 'text' }] },
          {
            slug: 'posts',
            versions: { drafts: { autosave: true } },
            fields: [
              { name: 'title', type: 'text', required: true },
              { name: 'author', type: 'relationship', relationTo: 'authors' },
            ],
            hooks: {
              // Tests can introduce nested writes without calling the plugin hooks themselves.
              beforeChange: [(event) => hooks.postBeforeChange?.(event) ?? event.data],
            },
          },
        ],
        globals: [
          {
            slug: 'announcement',
            versions: { drafts: true },
            fields: [{ name: 'title', type: 'text' }],
          },
          {
            slug: 'settings',
            versions: { drafts: { autosave: true } },
            fields: [{ name: 'title', type: 'text', required: true }],
            hooks: {
              // Replacing data is common in application hooks and must not lose draft tracking.
              beforeValidate: [({ data }) => ({ ...data })],
              beforeChange: [(event) => hooks.settingsBeforeChange?.(event) ?? event.data],
            },
          },
        ],
        plugins: [payloadNextCacheTags()],
      }),
    })
  } catch (error) {
    await payload.destroy()
    await rm(directory, { recursive: true, force: true })
    throw error
  }

  /** Closes database connections before removing this fixture's files. */
  async function close() {
    await payload.destroy()
    await rm(directory, { recursive: true, force: true })
  }

  return { payload, hooks, close }
}

export { createTestFixture }
