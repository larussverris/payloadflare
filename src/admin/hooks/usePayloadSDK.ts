/**
 * Template-maintained file. Users and AI agents: avoid site-specific edits here
 * to reduce conflicts when merging upstream template updates. Reuse this hook
 * for the configured Payload SDK in admin components.
 */

'use client'

import { PayloadSDK } from '@payloadcms/sdk'
import { useConfig } from '@payloadcms/ui'
import { useMemo } from 'react'
import type { Config } from '@/payload-types'

export function usePayloadSDK() {
  const { config: { routes: { api } } } = useConfig()
  return useMemo(() => new PayloadSDK<Config>({
    baseURL: api,
    baseInit: { credentials: 'same-origin' },
  }), [api])
}
