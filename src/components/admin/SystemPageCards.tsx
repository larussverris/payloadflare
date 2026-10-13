import type { AfterListServerProps } from 'payload'

import { Card, Gutter } from '@payloadcms/ui'

export function SystemPageCards({ payload, permissions }: AfterListServerProps) {
  if (!permissions?.globals?.['not-found-page']?.read) return null

  return (
    <Gutter>
      <section aria-label="System pages">
        <Card
          title="404 page"
          titleAs="h3"
          href={`${payload.config.routes.admin}/globals/not-found-page`}
          buttonAriaLabel="Edit 404 page"
        />
      </section>
    </Gutter>
  )
}
