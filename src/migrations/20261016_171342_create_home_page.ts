import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-d1-sqlite'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  })
  if (docs.length) return

  await payload.create({
    collection: 'pages',
    data: { title: 'Home', slug: 'home', generateSlug: false, layout: [], _status: 'published' },
    overrideAccess: true,
    context: { pageSeed: true, disableRevalidate: true },
    req,
  })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Keep editor content if a rollback is requested.
}
