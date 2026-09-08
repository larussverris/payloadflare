import type { CollectionConfig } from 'payload'

type Admin = NonNullable<CollectionConfig['admin']>
type LivePreview = NonNullable<Admin['livePreview']>
type URLSetting = NonNullable<LivePreview['url']>
type URLCallback = Exclude<URLSetting, string>
/** Route Live Preview through the authenticated Draft Mode entry endpoint. */
function createLivePreviewURL(source: URLSetting): URLCallback {
  const url: URLCallback = async (args) => {
    let destination
    if (typeof source === 'function') {
      destination = await source(args)
    } else {
      destination = source
    }

    if (!destination) return destination

    return `/api/preview?${new URLSearchParams({ path: destination })}`
  }

  return url
}

export { createLivePreviewURL }
