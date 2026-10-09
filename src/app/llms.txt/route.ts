import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  const payload = await getPayload({ config })
  const { llmsText } = await payload.findGlobal({
    slug: 'site-settings',
    depth: 0,
  })

  // Return 404 if text is empty
  if (!llmsText?.trim()) {
    return new Response(null, {
      status: 404,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  return new Response(llmsText, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
