import type { BeforeListServerProps } from 'payload'
import { redirect } from 'next/navigation'

export function PagesListPreferences({
  listPreferences,
  payload,
  searchParams,
}: BeforeListServerProps) {
  const sort = searchParams?.sort ?? listPreferences?.sort
  if (sort !== 'path' && sort !== '-path') return null

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (typeof value === 'string') params.append(key, value)
    else if (Array.isArray(value)) value.forEach((item) => params.append(key, item))
  }
  params.set('sort', '_order')
  redirect(`${payload.config.routes.admin}/collections/pages?${params}`)
}
