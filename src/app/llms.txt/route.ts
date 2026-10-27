import { getPreferences } from '@/utilities/getPreferences'

export async function GET() {
  const { enableLlmsText, llmsText } = await getPreferences()

  if (!enableLlmsText) {
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
