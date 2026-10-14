/** Allow web, email, phone, and root-relative links without fragments. */
export function getLinkURL(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const url = value.trim()
  if (!url || url.includes('#') || /[\u0000-\u001f\u007f\\]/.test(url)) return null
  if (url.startsWith('/') && !url.startsWith('//')) return url

  try {
    const parsed = new URL(url)
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) return url
  } catch {
    return null
  }

  return null
}
