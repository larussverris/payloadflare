# Cloudflare Email Service Adapter

This adapter allows Payload CMS to send emails using the
[Cloudflare Email Service](https://developers.cloudflare.com/email-service/).

## Usage

- Enable Cloudflare Email Service
- Onboard a sender domain
- Configure an `EMAIL` binding under `send_email` in `wrangler.jsonc`
- Configure your Payload config

```ts
// payload.config.ts
import { cloudflareEmailAdapter } from '@payloadflare/email-cloudflare'

export default buildConfig({
  email: cloudflareEmailAdapter({
    defaultFromAddress: 'noreply@example.com',
    defaultFromName: 'Payload CMS',
    binding: cloudflare.env.EMAIL,
  }),
})
```

## Implemented Nodemailer features

| Nodemailer option | Cloudflare mapping |
| --- | --- |
| `from` | Uses the supplied sender or the configured default sender. |
| `to`, `cc`, `bcc` | Maps Nodemailer addresses to Cloudflare recipients. At least one recipient is required. |
| `subject` | Required by Cloudflare. |
| `text`, `html` | Accepts strings and UTF-8 `Buffer` values. |
| `replyTo` | Maps one reply-to address. |
| `headers` | Maps string headers and string arrays. |
| `inReplyTo`, `references`, `priority` | Maps to Cloudflare-compatible email headers. |

## Not implemented Nodemailer features

The following Nodemailer options are not implemented by this adapter.

| Nodemailer option | Reason |
| --- | --- |
| `sender`, `envelope` | SMTP envelope controls are not exposed by the Workers binding. |
| `watchHtml`, `amp`, `icalEvent`, `alternatives` | Cloudflare's structured API does not support these additional MIME parts. |
| `attachments` | Mappable to Cloudflare's attachment shape, but support is intentionally deferred. |
| `raw` | Raw MIME cannot be passed to the structured email builder. |
| `messageId`, `date`, `encoding`, `textEncoding` | Cloudflare does not expose MIME serialization controls. |
| `dkim` | Cloudflare manages DKIM for onboarded sender domains. |
| `attachDataUrls` | Cloudflare does not automatically turn HTML data URLs into attachments. |
| `list` | Intentionally skipped. |
| `xMailer` | Intentionally skipped. |
| `normalizeHeaderKey`, prepared headers | Cloudflare accepts only string header values, not Nodemailer serialization hooks or prepared values. |
| `disableFileAccess`, `disableUrlAccess` | The adapter does not load content from files or URLs. |
