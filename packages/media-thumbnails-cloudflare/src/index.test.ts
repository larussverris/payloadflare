import type { Config, GetAdminThumbnail } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { cloudflareMediaThumbnails } from './index'

const configure = (config: Omit<Config, 'db'>) =>
  cloudflareMediaThumbnails({ collection: 'media' })({ ...config, db: {} as Config['db'] })

const getThumbnail = async (doc: Record<string, unknown>) => {
  const config = await configure({
    secret: 'test',
    collections: [{ slug: 'media', fields: [], upload: true }],
  })
  const upload = config.collections![0].upload
  if (!upload || typeof upload !== 'object') throw new Error('Missing upload configuration')
  return (upload.adminThumbnail as GetAdminThumbnail)({ doc })
}

afterEach(() => vi.unstubAllEnvs())

describe('cloudflareMediaThumbnails', () => {
  it('preserves upload settings and leaves unselected and non-upload collections alone', async () => {
    const headers = vi.fn()
    const other = { slug: 'other', fields: [], upload: true }
    const pages = { slug: 'pages', fields: [] }
    const config = await configure({
      secret: 'test',
      collections: [
        {
          slug: 'media',
          fields: [],
          upload: { crop: false, focalPoint: false, modifyResponseHeaders: headers },
        },
        other,
        pages,
      ],
    })
    expect(config.collections![0].upload).toMatchObject({
      crop: false,
      focalPoint: false,
      modifyResponseHeaders: headers,
      adminThumbnail: expect.any(Function),
    })
    expect(config.collections![1]).toBe(other)
    expect(config.collections![2]).toBe(pages)
  })

  it.each([
    {},
    { mimeType: 'image/png' },
    { mimeType: 'image/png', url: '' },
    { mimeType: 'application/pdf', url: '/file.pdf' },
  ])('skips unsupported documents: %j', async (doc) => {
    expect(await getThumbnail(doc)).toBeNull()
  })

  it('leaves the configuration unchanged in development so Payload handles thumbnails', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    const config: Config = {
      secret: 'test',
      db: {} as Config['db'],
      collections: [{ slug: 'media', fields: [], upload: true }],
    }
    expect(await cloudflareMediaThumbnails({ collection: 'media' })(config)).toBe(config)
  })

  it('keeps SVG URLs unchanged in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(await getThumbnail({ mimeType: 'image/svg+xml', url: '/logo.svg' })).toBe('/logo.svg')
  })

  it.each(['/api/media/file/image.png?v=123', 'https://cdn.example.com/image.png?v=123'])(
    'transforms images while preserving version queries: %s',
    async (url) => {
      vi.stubEnv('NODE_ENV', 'production')
      const source = url.replace(/^\//, '')
      expect(await getThumbnail({ mimeType: 'image/png', url })).toBe(
        `/cdn-cgi/image/width=320,height=320,fit=cover,quality=80,format=auto/${source}`,
      )
    },
  )

  it.each(['/api/media/file/video.mp4?v=123', 'https://cdn.example.com/video.mp4?v=123'])(
    'extracts video frames using an absolute source URL: %s',
    async (url) => {
      vi.stubEnv('NODE_ENV', 'production')
      vi.stubEnv('NEXT_PUBLIC_SERVER_URL', 'https://example.com')
      expect(await getThumbnail({ mimeType: 'video/mp4', url })).toBe(
        `/cdn-cgi/media/mode=frame,time=0s,width=320,height=320,fit=cover,format=jpg/${new URL(url, 'https://example.com').href}`,
      )
    },
  )
})
