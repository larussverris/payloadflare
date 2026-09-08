'use server'

import { draftMode } from 'next/headers'

export async function exitPreviewAction() {
  const draft = await draftMode()
  draft.disable()
}
