// Encode each path segment while preserving the homepage slug `/`.
export function getPagePath(slug: string): string {
  return `/${slug.split('/').filter(Boolean).map(encodeURIComponent).join('/')}`
}
