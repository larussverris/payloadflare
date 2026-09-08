import assert from 'node:assert/strict'
import { test } from 'node:test'
import { versionedFilenames } from './index.ts'

const media = () => ({ slug: 'media', upload: true, fields: [] })
const configure = (collection = media()) =>
  versionedFilenames({ collections: ['media'] })({ collections: [collection] }).collections[0]

async function runHooks(collection, args) {
  for (const hook of collection.hooks.beforeOperation) {
    args = (await hook(args)) ?? args
  }
  return args
}

test('uploads and replacements get different random names while preserving extensions and bytes', async () => {
  const collection = configure()
  for (const extension of ['.jpg', '.PNG', '.mp4', '']) {
    const data = Buffer.from('same file contents')
    const req = { file: { name: `original${extension}`, data } }
    await runHooks(collection, { operation: 'create', req })
    const first = req.file.name
    const id = extension ? first.slice(0, -extension.length) : first
    assert.match(id, /^[a-f0-9]{32}$/)
    assert.ok(first.endsWith(extension))
    await runHooks(collection, { operation: 'update', req })
    assert.notEqual(req.file.name, first)
    assert.ok(req.file.name.endsWith(extension))
    assert.equal(req.file.data, data)
  }
})

test('metadata-only edits and unrelated operations do not rename files', async () => {
  const collection = configure()
  const args = { operation: 'update', req: {}, data: { filename: 'existing.jpg', alt: 'New alt' } }
  assert.equal(await runHooks(collection, args), args)
  assert.equal(args.data.filename, 'existing.jpg')
  const req = { file: { name: 'existing.jpg' } }
  await runHooks(collection, { operation: 'read', req })
  assert.equal(req.file.name, 'existing.jpg')
})

test('preserves existing hooks and processes a file prepared by an earlier hook', async () => {
  const prepare = async (args) => ({
    ...args,
    req: { ...args.req, file: { name: 'prepared.webp' } },
  })
  const afterChange = [() => {}]
  const original = { ...media(), hooks: { beforeOperation: [prepare], afterChange } }
  const collection = configure(original)
  assert.deepEqual(original.hooks.beforeOperation, [prepare])
  assert.equal(collection.hooks.afterChange, afterChange)
  const result = await runHooks(collection, { operation: 'update', req: {} })
  assert.match(result.req.file.name, /^[a-f0-9]{32}\.webp$/)
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
  assert.deepEqual(plugin({}), { collections: undefined })
  assert.ok(configure({ ...media(), upload: {} }).hooks.beforeOperation.length)
})
