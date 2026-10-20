import { ValidationError } from 'payload'

// Keep these root namespaces in sync with application routes and public assets.
const reservedRoots = new Set(['admin', 'api', '_next', 'cdn-cgi', 'static'])

export function assertPagePathAvailable(path: string | null) {
  const root = path?.split('/')[1]?.toLowerCase()
  if (root && reservedRoots.has(root)) {
    throw new ValidationError({
      errors: [
        {
          path: 'slug',
          message: `The URL namespace /${root} is reserved by the application. Choose another slug or parent folder.`,
        },
      ],
    })
  }
}
