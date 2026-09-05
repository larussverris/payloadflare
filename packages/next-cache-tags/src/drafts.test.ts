import { describe, expect, it } from 'vitest'
import type { CollectionConfig } from 'payload'
import { isDraftOnlyUpdate } from './drafts'

describe('draft update policy', () => {
  it.each([
    { status: undefined, draftOnly: true },
    { status: 'draft', draftOnly: true },
    { status: 'published', draftOnly: false },
    { status: 'unexpected', draftOnly: false },
    { status: null, draftOnly: false },
    { status: { en: 'draft' }, draftOnly: false },
  ])('classifies a draft request with status $status', ({ status, draftOnly }) => {
    expect(
      isDraftOnlyUpdate({ versions: { drafts: true }, draft: true, data: { _status: status } }),
    ).toBe(draftOnly)
  })

  it.each([undefined, false, true, { drafts: false }] satisfies CollectionConfig['versions'][])(
    'keeps invalidation enabled without drafts (%s)',
    (versions) => {
      expect(isDraftOnlyUpdate({ versions, draft: true, data: { _status: 'draft' } })).toBe(false)
    },
  )

  it('keeps ordinary unpublishing eligible for invalidation', () => {
    expect(isDraftOnlyUpdate({ versions: { drafts: true }, data: { _status: 'draft' } })).toBe(
      false,
    )
  })

  it('keeps localized publishing conservative', () => {
    expect(
      isDraftOnlyUpdate({
        versions: { drafts: { localizeStatus: true } },
        draft: true,
        data: { _status: 'draft' },
      }),
    ).toBe(false)
  })
})
