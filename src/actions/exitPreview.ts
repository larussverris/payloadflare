'use server'

import { draftMode } from 'next/headers'

async function exitPreviewAction() {
  const draft = await draftMode()
  draft.disable()
}

export { exitPreviewAction }
