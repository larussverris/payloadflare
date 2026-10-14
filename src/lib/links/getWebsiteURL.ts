import { getLinkURL } from './getLinkURL'

/** Accept familiar website addresses while keeping the link safety checks. */
export function getWebsiteURL(value: unknown): string | null {
  const explicit = getLinkURL(value)
  if (explicit) return explicit
  if (typeof value !== 'string') return null
  const address = value.trim()
  if (!/^[^\s/?#@:\\]+\.[^\s/?#@:\\]+(?::\d+)?(?:[/?#].*)?$/.test(address)) return null
  return getLinkURL(`https://${address}`)
}
