// Document paths omit Home's internal slug; URL paths retain every segment.
export function getPagePath(source: string | { slug?: unknown }[]): string {
  const segments =
    typeof source === 'string'
      ? source.split('/').filter(Boolean)
      : source.map((doc) => String(doc.slug || '')).filter((slug) => slug && slug !== 'home')

  return `/${segments.map(encodeURIComponent).join('/')}`
}
