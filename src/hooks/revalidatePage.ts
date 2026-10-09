import { revalidatePath } from 'next/cache'
import type { PayloadRequest } from 'payload'

/**
 * Called by Payload after Pages saves/deletes and Site Settings saves.
 * Invalidates the site's Next.js cache so visits reflect CMS changes.
 * Set context.disableRevalidate to skip, e.g. when seeding outside Next.js.
 */
export const revalidatePage = <T>({
  doc,
  req: { context },
}: {
  doc: T
  req: PayloadRequest
}): T => {
  if (!context.disableRevalidate) {
    revalidatePath('/', 'layout')
  }

  return doc
}
