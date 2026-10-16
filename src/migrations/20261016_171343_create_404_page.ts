import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-d1-sqlite'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: '404' } },
    limit: 1,
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  })
  if (docs.length) {
    if (docs[0].layout?.length === 1 && docs[0].layout[0].blockType === 'notFound') return
    throw new Error('An unrelated page owns /404. Resolve it before seeding the 404 page.')
  }

  await payload.create({
    collection: 'pages',
    data: {
      title: '404 Page',
      slug: '404',
      generateSlug: false,
      layout: [
        {
          blockType: 'notFound',
          heading: 'Page not found',
          message: 'The page you are looking for does not exist.',
        },
      ],
      _status: 'published',
    },
    overrideAccess: true,
    context: { pageSeed: true, disableRevalidate: true },
    req,
  })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Keep editor content if a rollback is requested.
}
