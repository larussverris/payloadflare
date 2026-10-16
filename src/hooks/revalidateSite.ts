import { revalidatePath } from 'next/cache'
import type { PayloadRequest } from 'payload'

/**
 * Called by Payload after collection saves/deletes and global saves.
 * Invalidates the site's Next.js cache so visits reflect CMS changes.
 * Set context.disableRevalidate to skip, e.g. when seeding outside Next.js.
 */
export const revalidateSite = <T>({
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
