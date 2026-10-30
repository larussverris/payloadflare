/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates. Reuse this field
 * in blocks, collections, and globals to select any file allowed by Media.
 */

import type { UploadField } from 'payload'

export type MediaFieldOptions = {
  name?: string
  label?: string
  required?: boolean
  filterOptions?: UploadField['filterOptions']
}

export function mediaField({
  name = 'media',
  label = 'Media',
  required = false,
  filterOptions,
}: MediaFieldOptions = {}): UploadField {
  return {
    name,
    label,
    type: 'upload',
    relationTo: 'media',
    required,
    filterOptions,
  }
}
