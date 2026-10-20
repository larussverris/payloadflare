'use client'

import { useField } from '@payloadcms/ui'
import { URLPreview } from './URLPreview'
import { useFolderSegments } from './useFolderSegments'

export function FolderURLPreview() {
  const { value: slug } = useField<string>({ path: 'slug' })
  const { value: parent } = useField<null | number | string>({ path: 'parent' })
  const { error, loading, segments } = useFolderSegments(parent)
  const pathname = `/${[...segments, slug || 'your-folder'].join('/')}`
  return <URLPreview error={error} loading={loading} pathname={pathname} />
}
