import { sql } from '@payloadcms/db-d1-sqlite'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: '/' } },
    limit: 1,
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  })
  if (docs.length) return

  const home = await payload.create({
    collection: 'pages',
    data: { title: 'Home', slug: 'home', generateSlug: false, layout: [], _status: 'published' },
    overrideAccess: true,
    context: { pageSeed: true, disableRevalidate: true },
    req,
  })

  // Payload's default slug field rejects "/"; set the reserved Home slug after validation.
  await db.run(sql`UPDATE pages SET slug = '/' WHERE id = ${home.id}`)
  await db.run(sql`UPDATE _pages_v SET version_slug = '/' WHERE parent_id = ${home.id}`)
  await db.run(sql`UPDATE pages_breadcrumbs SET url = '/' WHERE _parent_id = ${home.id}`)
  await db.run(sql`UPDATE _pages_v_version_breadcrumbs SET url = '/' WHERE doc_id = ${home.id}`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Keep editor content if a rollback is requested.
}
