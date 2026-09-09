import { draftMode } from 'next/headers'
import type { Endpoint } from 'payload'

// Preview changes browser-specific draft state, so caches must not reuse these responses.
const responseHeaders = {
  'Cache-Control': 'private, no-store',
}

const previewEndpoint: Endpoint = {
  path: '/preview',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      return new Response('Sign in to preview.', { status: 401, headers: responseHeaders })
    }

    const requestURL = new URL(req.url!)
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
  },
}

export { previewEndpoint }
