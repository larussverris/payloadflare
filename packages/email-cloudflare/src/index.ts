import type { EmailAdapter } from 'payload'
import Mail from 'nodemailer/lib/mailer'

import type {
  EmailAddress,
  EmailAdapterArgs,
  EmailDestinations,
  EmailMessageBuilder,
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
type CloudflareSendEmail = ReturnType<CloudflareEmailAdapter>['sendEmail']

const cloudflareEmailAdapter = (args: EmailAdapterArgs): CloudflareEmailAdapter => {
  if (!args) {
    throw new Error('Missing Cloudflare email adapter arguments.')
  }

  if (!args.binding) {
    throw new Error('Missing Cloudflare EMAIL binding.')
  }

  if (!args.defaultFromAddress) {
    throw new Error('Missing default from address.')
  }

  if (!args.defaultFromName) {
    throw new Error('Missing default from name.')
  }

  const sendEmail: CloudflareSendEmail = async (msg) => {
    // Nodemailer makes "subject" optional, but Cloudflare requires it.
    if (!msg.subject) {
      throw new Error('Cloudflare email requires a subject.')
    }

    const to = toCloudflareRecipients(msg.to)
    const cc = toCloudflareRecipients(msg.cc)
    const bcc = toCloudflareRecipients(msg.bcc)

    if (!to && !cc && !bcc) {
      throw new Error('Cloudflare email requires at least one recipient.')
    }

    // The guard guarantees that at least one field will be assigned below.
    const destinations = {} as EmailDestinations

    if (to) {
      destinations.to = to
    }

    if (cc) {
      destinations.cc = cc
    }

    if (bcc) {
      destinations.bcc = bcc
    }

    let from: EmailMessageBuilder['from']

    if (msg.from) {
      from = toCloudflareAddress(msg.from)
    } else {
      from = {
        email: args.defaultFromAddress,
        name: args.defaultFromName,
      }
    }

    const text = toCloudflareContent(msg.text)
    const html = toCloudflareContent(msg.html)
    const replyTo = toCloudflareReplyTo(msg.replyTo)

    const email: EmailMessageBuilder = {
      ...destinations,
      from,
      subject: msg.subject,
    }

    if (text !== undefined) {
      email.text = text
    }

    if (html !== undefined) {
      email.html = html
    }

    if (replyTo !== undefined) {
      email.replyTo = replyTo
    }

    return args.binding.send(email)
  }

  return () => ({
    name: 'cloudflare-email',
    defaultFromAddress: args.defaultFromAddress,
    defaultFromName: args.defaultFromName,
    sendEmail,
  })
}

/**
 * Converts a Nodemailer address value to Cloudflare's format.
 */
const toCloudflareAddress = (address: string | Mail.Address): string | EmailAddress => {
  // Nodemailer and Cloudflare both accept plain string addresses, so preserve them unchanged.
  if (typeof address === 'string') {
    return address
  }
  // Cloudflare requires `name` on address objects, so unnamed addresses remain strings.
  if (!address.name) {
    return address.address
  }

  return {
    email: address.address,
    name: address.name,
  }
}

/**
 * Maps Nodemailer recipient values to Cloudflare's recipient format.
 */
const toCloudflareRecipients = (value: Mail.Options['to']): EmailDestinations['to'] => {
  // Nodemailer recipient fields are optional; omit missing or empty values from the Cloudflare message.
  if (!value) {
    return undefined
  }

  if (!Array.isArray(value)) {
    return toCloudflareAddress(value)
  }

  if (value.length === 0) {
    return undefined
  }

  return value.map(toCloudflareAddress)
}

/**
 * Maps Nodemailer's reply-to value, which Cloudflare limits to one address.
 */
const toCloudflareReplyTo = (value: Mail.Options['replyTo']): EmailMessageBuilder['replyTo'] => {
  // Map an absent Nodemailer reply-to value to Cloudflare's optional replyTo field.
  if (!value) {
    return undefined
  }

  if (!Array.isArray(value)) {
    return toCloudflareAddress(value)
  }

  if (value.length > 1) {
    throw new Error('Cloudflare email supports only one reply-to address.')
  }

  const [address] = value
  if (!address) {
    return undefined
  }

  return toCloudflareAddress(address)
}

/**
 * Converts Nodemailer text or HTML content to the string format Cloudflare requires.
 */
const toCloudflareContent = (value: Mail.Options['text']): string | undefined => {
  if (value === undefined) {
    return undefined
  }

  if (typeof value === 'string') {
    return value
  }

  if (Buffer.isBuffer(value)) {
    return value.toString('utf8')
  }

  throw new Error('Cloudflare email content must be a string or UTF-8 Buffer.')
}

export { cloudflareEmailAdapter }
