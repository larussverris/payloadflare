import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

export const getPreferences = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    return payload.findGlobal({ slug: 'preferences', depth: 1, overrideAccess: false })
  },
  ['preferences'],
  { revalidate: 3600 },
)
