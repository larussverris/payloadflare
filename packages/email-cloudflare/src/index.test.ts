import { Readable } from 'node:stream'
import { describe, expect, it, vi } from 'vitest'

import { cloudflareEmailAdapter } from './index'
import type { SendEmail } from './types'

const defaultFromAddress = 'noreply@example.com'
const defaultFromName = 'Example'

const createAdapter = (send = vi.fn().mockResolvedValue({ messageId: 'message-id' })) => {
  const binding = { send } as SendEmail
  const adapter = cloudflareEmailAdapter({ defaultFromAddress, defaultFromName, binding })
  const initializedAdapter = adapter({
    payload: {} as never,
  })

  return { adapter: initializedAdapter, send }
}

describe('cloudflareEmailAdapter', () => {
  it('requires adapter arguments during initialization', () => {
    expect(() => {
      // @ts-expect-error Verify runtime validation for JavaScript callers.
      cloudflareEmailAdapter()
    }).toThrow('Missing Cloudflare email adapter arguments.')
  })

  it('requires the Cloudflare binding during initialization', () => {
    expect(() => {
      cloudflareEmailAdapter({
        defaultFromAddress,
        defaultFromName,
        binding: undefined as unknown as SendEmail,
      })
    }).toThrow('Missing Cloudflare EMAIL binding.')
  })

  it('exposes its Payload adapter metadata', async () => {
    const { adapter } = createAdapter()

    expect(adapter).toMatchObject({
      defaultFromAddress,
      defaultFromName,
      name: 'cloudflare-email',
    })
  })

  it('maps addresses and message bodies', async () => {
    const { adapter, send } = createAdapter()

    await adapter.sendEmail({
      bcc: { address: 'audit@example.com' },
      cc: 'copy@example.com',
      from: { address: 'sender@example.com', name: 'Sender' },
      html: '<p>Hello</p>',
      replyTo: [{ address: 'reply@example.com', name: 'Replies' }],
      subject: 'Hello',
      text: Buffer.from('Plain text'),
      to: [
        'first@example.com',
        { address: 'second@example.com' },
        { address: 'third@example.com', name: 'Third' },
      ],
    })

    expect(send).toHaveBeenCalledWith({
      bcc: 'audit@example.com',
      cc: 'copy@example.com',
      from: { email: 'sender@example.com', name: 'Sender' },
      html: '<p>Hello</p>',
      replyTo: { email: 'reply@example.com', name: 'Replies' },
      subject: 'Hello',
      text: 'Plain text',
      to: [
        'first@example.com',
        'second@example.com',
        { email: 'third@example.com', name: 'Third' },
      ],
    })
  })

  it('uses the default sender and supports a string reply-to', async () => {
    const { adapter, send } = createAdapter()

    await adapter.sendEmail({
      html: '<p>Hello</p>',
      replyTo: 'reply@example.com',
      subject: 'Hello',
      to: 'recipient@example.com',
    })

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: { email: defaultFromAddress, name: defaultFromName },
        replyTo: 'reply@example.com',
        to: 'recipient@example.com',
      }),
    )
    expect(send.mock.calls[0][0]).not.toHaveProperty('text')
  })

  it('maps unnamed sender and reply-to addresses to strings', async () => {
    const { adapter, send } = createAdapter()

    await adapter.sendEmail({
      from: { address: 'sender@example.com' },
      replyTo: { address: 'reply@example.com' },
      subject: 'Hello',
      to: 'recipient@example.com',
    })

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'sender@example.com',
        replyTo: 'reply@example.com',
      }),
    )
  })

  it('passes through a string sender address', async () => {
    const { adapter, send } = createAdapter()

    await adapter.sendEmail({
      from: 'sender@example.com',
      subject: 'Hello',
      to: 'recipient@example.com',
    })

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'sender@example.com',
      }),
    )
  })

  it('converts HTML Buffers to UTF-8 strings', async () => {
    const { adapter, send } = createAdapter()

    await adapter.sendEmail({
      html: Buffer.from('<p>Hello</p>'),
      subject: 'Hello',
      to: 'recipient@example.com',
    })

    expect(send).toHaveBeenCalledWith(expect.objectContaining({ html: '<p>Hello</p>' }))
  })

  it('accepts CC as the only recipient and ignores empty recipient arrays', async () => {
    const { adapter, send } = createAdapter()

    await adapter.sendEmail({ cc: 'copy@example.com', subject: 'Hello', text: 'Body', to: [] })

    expect(send).toHaveBeenCalledWith(expect.objectContaining({ cc: 'copy@example.com' }))
    expect(send.mock.calls[0][0]).not.toHaveProperty('to')
  })

  it('accepts BCC as the only recipient', async () => {
    const { adapter, send } = createAdapter()

    await adapter.sendEmail({ bcc: 'hidden@example.com', subject: 'Hello', text: 'Body' })

    expect(send).toHaveBeenCalledWith(expect.objectContaining({ bcc: 'hidden@example.com' }))
  })

  it('falls back to BCC when TO and CC recipient arrays are empty', async () => {
    const { adapter, send } = createAdapter()

    await adapter.sendEmail({
      bcc: 'hidden@example.com',
      cc: [],
      subject: 'Hello',
      text: 'Body',
      to: [],
    })

    expect(send).toHaveBeenCalledWith(expect.objectContaining({ bcc: 'hidden@example.com' }))
    expect(send.mock.calls[0][0]).not.toHaveProperty('to')
    expect(send.mock.calls[0][0]).not.toHaveProperty('cc')
  })

  it('requires at least one recipient', async () => {
    const { adapter } = createAdapter()

    await expect(adapter.sendEmail({ subject: 'Hello', text: 'Body' })).rejects.toThrow(
      'Cloudflare email requires at least one recipient.',
    )
  })

  it('requires a subject', async () => {
    const { adapter } = createAdapter()

    await expect(adapter.sendEmail({ text: 'Body', to: 'recipient@example.com' })).rejects.toThrow(
      'Cloudflare email requires a subject.',
    )
  })

  it('handles an empty reply-to array', async () => {
    const { adapter, send } = createAdapter()

    await adapter.sendEmail({ replyTo: [], subject: 'Hello', text: 'Body', to: 'user@example.com' })

    expect(send.mock.calls[0][0]).not.toHaveProperty('replyTo')
  })

  it('rejects multiple reply-to addresses', async () => {
    const { adapter } = createAdapter()

    await expect(
      adapter.sendEmail({
        replyTo: ['one@example.com', 'two@example.com'],
        subject: 'Hello',
        text: 'Body',
        to: 'user@example.com',
      }),
    ).rejects.toThrow('Cloudflare email supports only one reply-to address.')
  })

  it('rejects unsupported body content', async () => {
    const { adapter } = createAdapter()

    await expect(
      adapter.sendEmail({
        subject: 'Hello',
        text: Readable.from('Body'),
        to: 'user@example.com',
      }),
    ).rejects.toThrow('Cloudflare email content must be a string or UTF-8 Buffer.')
  })

  it('rejects attachments', async () => {
    const { adapter } = createAdapter()

    await expect(
      adapter.sendEmail({
        attachments: [{ content: 'Body', filename: 'message.txt' }],
        subject: 'Hello',
        to: 'user@example.com',
      }),
    ).rejects.toThrow('Cloudflare email attachments are not supported.')
  })

  it('returns the EMAIL binding response', async () => {
    const response = { messageId: 'returned-message-id' }
    const send = vi.fn().mockResolvedValue(response)
    const { adapter } = createAdapter(send)

    await expect(adapter.sendEmail({ subject: 'Hello', to: 'user@example.com' })).resolves.toBe(
      response,
    )
  })

  it('propagates EMAIL binding errors', async () => {
    const error = new Error('Email Service unavailable')
    const send = vi.fn().mockRejectedValue(error)
    const { adapter } = createAdapter(send)

    await expect(adapter.sendEmail({ subject: 'Hello', to: 'user@example.com' })).rejects.toBe(
      error,
    )
  })
})
