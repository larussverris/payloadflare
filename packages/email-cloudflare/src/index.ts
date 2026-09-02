import type { EmailAdapter } from 'payload'
import Mail from 'nodemailer/lib/mailer'

import type {
  CloudflareEmailAddressValue,
  CloudflareEmailDestinations,
  CloudflareEmailMessage,
  CloudflareEmailRecipients,
  EmailAdapterArgs,
} from './types'

/**
 * Payload email adapter for Cloudflare Email Service.
 *
 * Payload calls this adapter for authentication emails (including password
 * resets) and for `payload.sendEmail()` calls. The adapter converts the
 * Payload message into Cloudflare's `EmailMessageBuilder` format and sends it
 * through the `EMAIL` Worker binding.
 * Payload's message argument follows Nodemailer's SendMailOptions interface:
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/d0ba4d27bbba786ca23dca88cf8878867a83ccb8/types/nodemailer/lib/mailer/index.d.ts#L101
 *
 *
 * The EMAIL binding must be configured in wrangler.jsonc. This adapter throws
 * during Payload initialization when that binding is missing.
 */

type CloudflareEmailAdapter = EmailAdapter<unknown>

export const cloudflareEmailAdapter = async (
  args?: EmailAdapterArgs,
): Promise<CloudflareEmailAdapter> => {
  if (!args?.binding) {
    throw new Error('Missing Cloudflare EMAIL binding.')
  }

  const adapter: CloudflareEmailAdapter = () => ({
    name: 'cloudflare-email',
    defaultFromAddress: args?.defaultFromAddress,
    defaultFromName: args?.defaultFromName,
    sendEmail: async (msg) => {
      // Nodemailer makes "subject" optional, but Cloudflare requires it.
      if (!msg.subject) {
        throw new Error('Cloudflare email requires a subject.')
      }

      const to = toCloudflareRecipients(msg.to)
      const cc = toCloudflareRecipients(msg.cc)
      const bcc = toCloudflareRecipients(msg.bcc)
      let destinations: CloudflareEmailDestinations

      if (to) {
        destinations = { to, cc, bcc }
      } else if (cc) {
        destinations = { cc, bcc }
      } else if (bcc) {
        destinations = { bcc }
      } else {
        throw new Error('Cloudflare email requires at least one recipient.')
      }

      const email: CloudflareEmailMessage = {
        ...destinations,
        from: toCloudflareAddress(msg.from || args?.defaultFromAddress),
        subject: msg.subject,
        text: toCloudflareContent(msg.text),
        html: toCloudflareContent(msg.html),
        replyTo: toCloudflareReplyTo(msg.replyTo),
        headers: toCloudflareHeaders(msg),
      }

      return args?.binding.send(email)
    },
  })

  return adapter
}

/**
 * Converts a Nodemailer address value to Cloudflare's format.
 */
const toCloudflareAddress = (address: string | Mail.Address): CloudflareEmailAddressValue => {
  if (typeof address === 'string') return address
  // Cloudflare requires `name` on address objects, so unnamed addresses remain strings.
  if (!address.name) return address.address

  return {
    email: address.address,
    name: address.name,
  }
}

/**
 * Maps Nodemailer recipient values to Cloudflare's recipient format.
 */
const toCloudflareRecipients = (
  value: Mail.Options['to'],
): CloudflareEmailRecipients | undefined => {
  if (!value) return undefined

  if (Array.isArray(value)) {
    return value.length > 0 ? value.map(toCloudflareAddress) : undefined
  }

  return toCloudflareAddress(value)
}

/**
 * Maps Nodemailer's reply-to value, which Cloudflare limits to one address.
 */
const toCloudflareReplyTo = (value: Mail.Options['replyTo']): CloudflareEmailMessage['replyTo'] => {
  if (!value) return undefined

  if (Array.isArray(value)) {
    if (value.length === 0) return undefined
    if (value.length > 1) {
      throw new Error('Cloudflare email supports only one reply-to address.')
    }

    return toCloudflareAddress(value[0])
  }

  return toCloudflareAddress(value)
}

/**
 * Converts Nodemailer text or HTML content to the string format Cloudflare requires.
 */
const toCloudflareContent = (value: Mail.Options['text']): string | undefined => {
  if (value === undefined) return undefined
  if (typeof value === 'string') return value
  if (Buffer.isBuffer(value)) return value.toString('utf8')

  throw new Error('Cloudflare email content must be a string or UTF-8 Buffer.')
}

/**
 * Converts Nodemailer headers and message metadata to Cloudflare's string-only headers.
 */
const toCloudflareHeaders = (message: Mail.Options): CloudflareEmailMessage['headers'] => {
  const mappedHeaders: NonNullable<CloudflareEmailMessage['headers']> = {}

  if (Array.isArray(message.headers)) {
    for (const { key, value } of message.headers) {
      mappedHeaders[key] = value
    }
  } else if (message.headers) {
    for (const [name, value] of Object.entries(message.headers)) {
      if (typeof value === 'string') {
        mappedHeaders[name] = value
        continue
      }

      if (Array.isArray(value)) {
        mappedHeaders[name] = value.join(', ')
        continue
      }

      throw new Error(`Cloudflare does not support Nodemailer's prepared header "${name}".`)
    }
  }

  if (message.inReplyTo) {
    mappedHeaders['In-Reply-To'] =
      typeof message.inReplyTo === 'string' ? message.inReplyTo : message.inReplyTo.address
  }

  if (message.references) {
    mappedHeaders.References = Array.isArray(message.references)
      ? message.references.join(' ')
      : message.references
  }

  if (message.priority) {
    mappedHeaders.Importance = message.priority
  }

  return Object.keys(mappedHeaders).length > 0 ? mappedHeaders : undefined
}
