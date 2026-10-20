'use client'

import { useField } from '@payloadcms/ui'
import { getPagePathFromFolder } from '@/lib/pages/getPagePath'
import { URLPreview } from './URLPreview'
import { useFolderSegments } from './useFolderSegments'

export function PageURLPreview() {
  const { value } = useField<string>({ path: 'slug' })
  const { value: folderValue } = useField<number | string | null>({ path: 'folder' })
  const { value: isHome } = useField<boolean>({ path: 'isHome' })
  const { error, loading, segments } = useFolderSegments(isHome ? null : folderValue)
  const slug = value || 'your-page'
  const pathname = isHome ? '/' : getPagePathFromFolder(slug, segments)

  return <URLPreview error={error} loading={loading} pathname={pathname} />
}
