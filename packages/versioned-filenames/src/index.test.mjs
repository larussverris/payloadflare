import assert from 'node:assert/strict'
import { test } from 'node:test'
import { versionedFilenames } from './index.ts'

const media = () => ({ slug: 'media', upload: true, fields: [] })
const configure = (collection = media()) =>
  versionedFilenames()({ collections: [collection] }).collections[0]

async function runHooks(collection, args) {
  for (const hook of collection.hooks.beforeOperation) {
    args.args = (await hook(args)) ?? args.args
  }
  return args
}

test('uploads and replacements get different random names while preserving extensions and bytes', async () => {
  const collection = configure()
  for (const extension of ['.jpg', '.PNG', '.mp4', '']) {
    const data = Buffer.from('same file contents')
    const req = { file: { name: `original${extension}`, data } }
    const created = await runHooks(collection, { args: { data: {} }, operation: 'create', req })
    assert.equal(created.args.data.displayFilename, `original${extension}`)
    const first = req.file.name
    const id = extension ? first.slice(0, -extension.length) : first
    assert.match(id, /^[a-f0-9]{32}$/)
    assert.ok(first.endsWith(extension))
    await runHooks(collection, { args: { data: {} }, operation: 'update', req })
    assert.notEqual(req.file.name, first)
    assert.ok(req.file.name.endsWith(extension))
    assert.equal(req.file.data, data)
  }
})

test('metadata-only edits and unrelated operations do not rename files', async () => {
  const collection = configure()
  const args = { args: { data: { filename: 'existing.jpg', alt: 'New alt' } }, operation: 'update', req: {} }
  assert.equal(await runHooks(collection, args), args)
  assert.equal(args.args.data.filename, 'existing.jpg')
  const req = { file: { name: 'existing.jpg' } }
  await runHooks(collection, { args: { data: {} }, operation: 'read', req })
  assert.equal(req.file.name, 'existing.jpg')
})

test('stores the new original filename when replacing a file', async () => {
  const req = { file: { name: 'replacement.jpg' } }
  const result = await runHooks(configure(), {
    args: { data: { displayFilename: 'Homepage hero.jpg' } },
    operation: 'update',
    req,
  })
  assert.equal(result.args.data.displayFilename, 'replacement.jpg')
  assert.match(req.file.name, /^[a-f0-9]{32}\.jpg$/)
})

test('preserves existing hooks and processes a file prepared by an earlier hook', async () => {
  const prepare = ({ req }) => {
    req.file = { name: 'prepared.webp' }
  }
  const afterChange = [() => {}]
  const original = { ...media(), hooks: { beforeOperation: [prepare], afterChange } }
  const collection = configure(original)
  assert.deepEqual(original.hooks.beforeOperation, [prepare])
  assert.equal(collection.hooks.afterChange, afterChange)
  const result = await runHooks(collection, { args: { data: {} }, operation: 'update', req: {} })
  assert.match(result.req.file.name, /^[a-f0-9]{32}\.webp$/)
  assert.equal(result.args.data.displayFilename, 'prepared.webp')
})

test('only selected upload collections change and repeated registration adds no duplicate hook', () => {
  const original = media()
  const otherUpload = { slug: 'documents', upload: {}, fields: [] }
  const nonUpload = { slug: 'users', fields: [] }
  const config = { collections: [original, otherUpload, nonUpload] }
  const plugin = versionedFilenames({ collections: ['media', 'users'] })
  const result = plugin(config)
  assert.equal(original.hooks, undefined)
  assert.equal(result.collections[1], otherUpload)
  assert.equal(result.collections[2], nonUpload)
  assert.equal(plugin(result).collections[0].hooks.beforeOperation.length, 1)
  assert.equal(plugin(result).collections[0].fields.filter((field) => field.name === 'displayFilename').length, 1)
  assert.deepEqual(plugin({}), { collections: undefined })
  assert.ok(configure({ ...media(), upload: {} }).hooks.beforeOperation.length)
})

test('adds the editor-facing filename field and admin defaults', () => {
  const collection = versionedFilenames()({
    collections: [{ ...media(), fields: [{ name: 'alt', type: 'text' }] }],
  }).collections[0]
  assert.equal(collection.admin.useAsTitle, 'displayFilename')
  assert.deepEqual(collection.admin.defaultColumns, ['displayFilename', 'alt', 'updatedAt', 'createdAt'])
  assert.equal(collection.fields.find((field) => field.name === 'filename').admin.disabled, true)
  const display = collection.fields.find((field) => field.name === 'displayFilename')
  assert.equal(display.access.read({ req: { user: null } }), false)
  assert.equal(display.access.read({ req: { user: { id: 'editor' } } }), true)
  assert.equal(display.admin.readOnly, true)
  assert.equal(display.hooks.afterRead[0]({ value: null, siblingData: { filename: 'old.jpg' } }), 'old.jpg')
})
