import config from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

// Preview changes browser-specific draft state, so caches must not reuse these responses.
const responseHeaders = {
  'Cache-Control': 'private, no-store',
}

// CMS preview URLs navigate with GET; exiting preview uses a Server Action.
export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })

  if (!user) {
    return new Response('Sign in to preview.', { status: 401, headers: responseHeaders })
  }

  const requestURL = new URL(request.url)
  const path = requestURL.searchParams.get('path')
  const destination = path ? URL.parse(path, requestURL.origin) : null

  if (
    !destination ||
    destination.origin !== requestURL.origin ||
    destination.pathname.startsWith('//')
  ) {
    return new Response('Invalid preview path.', { status: 400, headers: responseHeaders })
  }

  const draft = await draftMode()
  draft.enable()

  return new Response(null, {
    status: 307,
    headers: {
      ...responseHeaders,
      Location: `${destination.pathname}${destination.search}${destination.hash}`,
    },
  })
}
