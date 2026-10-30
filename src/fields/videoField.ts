/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates. Reuse this field
 * in blocks, collections, and globals to select a video.
 */

import type { UploadField } from 'payload'

import { mediaField, type MediaFieldOptions } from './mediaField'

export function videoField(options: MediaFieldOptions = {}): UploadField {
  return mediaField({
    label: 'Video',
    filterOptions: { mimeType: { contains: 'video/' } },
    ...options,
  })
}
