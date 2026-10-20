import { sql } from '@payloadcms/db-d1-sqlite'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-d1-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const existing = await db.all<{ id: number }>(
    sql`SELECT id FROM pages WHERE slug = 'home' LIMIT 1`,
  )
  if (existing.length) return

  // This seed runs before the v4 migration, so use the schema available here.
  const now = new Date().toISOString()
  await db.run(sql`INSERT INTO pages (title, slug, generate_slug, layout, _status, updated_at, created_at)
    VALUES ('Home', 'home', 0, '[]', 'published', ${now}, ${now})`)
  const [page] = await db.all<{ id: number }>(sql`SELECT id FROM pages WHERE slug = 'home' LIMIT 1`)
  if (!page) throw new Error('Failed to seed Home page.')

  const breadcrumbID = crypto.randomUUID()
  await db.run(sql`INSERT INTO pages_breadcrumbs (_order, _parent_id, id, doc_id, url, label)
    VALUES (0, ${page.id}, ${breadcrumbID}, ${page.id}, '/', 'Home')`)
  await db.run(sql`INSERT INTO _pages_v
    (parent_id, version_title, version_layout, version_generate_slug, version_slug,
     version__status, version_updated_at, version_created_at, created_at, updated_at, latest, autosave)
    VALUES (${page.id}, 'Home', '[]', 0, 'home', 'published', ${now}, ${now}, ${now}, ${now}, 1, 0)`)
  const [version] = await db.all<{ id: number }>(
    sql`SELECT id FROM _pages_v WHERE parent_id = ${page.id} AND latest = 1 LIMIT 1`,
  )
  if (!version) throw new Error('Failed to seed Home page version.')
  await db.run(sql`INSERT INTO _pages_v_version_breadcrumbs
    (_order, _parent_id, doc_id, url, label, _uuid)
    VALUES (0, ${version.id}, ${page.id}, '/', 'Home', ${breadcrumbID})`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Keep editor content if a rollback is requested.
}
