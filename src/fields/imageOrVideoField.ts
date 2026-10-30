/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates. Reuse this field
 * in blocks, collections, and globals to select an image or video.
 */

import type { UploadField } from 'payload'

import { mediaField, type MediaFieldOptions } from './mediaField'

export function imageOrVideoField(options: MediaFieldOptions = {}): UploadField {
  return mediaField({
    label: 'Image or video',
    filterOptions: {
      or: [{ mimeType: { contains: 'image/' } }, { mimeType: { contains: 'video/' } }],
    },
    ...options,
  })
}
