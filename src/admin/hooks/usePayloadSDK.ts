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
