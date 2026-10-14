/** Build contact links from plain editor input, without allowing URL parameters. */
export function getContactURL(type: 'phone' | 'email', value: unknown): string | null {
  if (typeof value !== 'string') return null
  const contact = value.trim()

  if (type === 'phone') {
    if (!/^\+?[\d ().-]+$/.test(contact)) return null
    const number = contact.replace(/[ ().-]/g, '')
    return /\d/.test(number) ? `tel:${number}` : null
  }

  if (!/^[^\s@<>:"\\/?#&]+@[^\s@<>:"\\/?#&]+\.[^\s@<>:"\\/?#&]+$/.test(contact)) return null
  return `mailto:${encodeURIComponent(contact).replace('%40', '@')}`
}
