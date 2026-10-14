import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages_blocks_button\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`type\` text DEFAULT 'page',
  	\`page_id\` integer,
  	\`url\` text,
  	\`file_id\` integer,
  	\`phone\` text,
  	\`email\` text,
  	\`new_tab\` integer DEFAULT false,
  	\`block_name\` text,
  	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_button_order_idx\` ON \`pages_blocks_button\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_button_parent_id_idx\` ON \`pages_blocks_button\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_button_path_idx\` ON \`pages_blocks_button\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_button_page_idx\` ON \`pages_blocks_button\` (\`page_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_button_file_idx\` ON \`pages_blocks_button\` (\`file_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_button\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`type\` text DEFAULT 'page',
  	\`page_id\` integer,
  	\`url\` text,
  	\`file_id\` integer,
  	\`phone\` text,
  	\`email\` text,
  	\`new_tab\` integer DEFAULT false,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_button_order_idx\` ON \`_pages_v_blocks_button\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_button_parent_id_idx\` ON \`_pages_v_blocks_button\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_button_path_idx\` ON \`_pages_v_blocks_button\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_button_page_idx\` ON \`_pages_v_blocks_button\` (\`page_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_button_file_idx\` ON \`_pages_v_blocks_button\` (\`file_id\`);`)
  await db.run(sql`CREATE TABLE \`not_found_page_blocks_button\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`type\` text DEFAULT 'page',
  	\`page_id\` integer,
  	\`url\` text,
  	\`file_id\` integer,
  	\`phone\` text,
  	\`email\` text,
  	\`new_tab\` integer DEFAULT false,
  	\`block_name\` text,
  	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`not_found_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`not_found_page_blocks_button_order_idx\` ON \`not_found_page_blocks_button\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`not_found_page_blocks_button_parent_id_idx\` ON \`not_found_page_blocks_button\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`not_found_page_blocks_button_path_idx\` ON \`not_found_page_blocks_button\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`not_found_page_blocks_button_page_idx\` ON \`not_found_page_blocks_button\` (\`page_id\`);`)
  await db.run(sql`CREATE INDEX \`not_found_page_blocks_button_file_idx\` ON \`not_found_page_blocks_button\` (\`file_id\`);`)
  await db.run(sql`CREATE TABLE \`_not_found_page_v_blocks_button\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`type\` text DEFAULT 'page',
  	\`page_id\` integer,
  	\`url\` text,
  	\`file_id\` integer,
  	\`phone\` text,
  	\`email\` text,
  	\`new_tab\` integer DEFAULT false,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`file_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_not_found_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_not_found_page_v_blocks_button_order_idx\` ON \`_not_found_page_v_blocks_button\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_not_found_page_v_blocks_button_parent_id_idx\` ON \`_not_found_page_v_blocks_button\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_not_found_page_v_blocks_button_path_idx\` ON \`_not_found_page_v_blocks_button\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_not_found_page_v_blocks_button_page_idx\` ON \`_not_found_page_v_blocks_button\` (\`page_id\`);`)
  await db.run(sql`CREATE INDEX \`_not_found_page_v_blocks_button_file_idx\` ON \`_not_found_page_v_blocks_button\` (\`file_id\`);`)

  // Ensure the homepage exists after creating the final Button schema.
  const { docs } = await payload.find({
    collection: 'pages',
    where: {
      or: [
        { kind: { equals: 'home' } },
        { pathname: { equals: '/' } },
        { slug: { equals: '/' } },
      ],
    },
    limit: 1,
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  })

  const data = {
    kind: 'home' as const,
    slug: '/',
    pathname: '/',
    generateSlug: false,
    parent: null,
  }
  const options = {
    collection: 'pages' as const,
    overrideAccess: true,
    context: { disableRevalidate: true },
    req,
  }

  if (docs[0]) {
    await payload.update({ ...options, id: docs[0].id, data })
  } else {
    await payload.create({
      ...options,
      data: { ...data, title: 'Home', layout: [], _status: 'published' },
    })
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pages_blocks_button\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_button\`;`)
  await db.run(sql`DROP TABLE \`not_found_page_blocks_button\`;`)
  await db.run(sql`DROP TABLE \`_not_found_page_v_blocks_button\`;`)
  // Keep the homepage: it may already contain editor-created content.
}
