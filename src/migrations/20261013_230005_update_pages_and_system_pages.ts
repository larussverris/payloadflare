import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages_breadcrumbs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`doc_id\` integer,
  	\`url\` text,
  	\`label\` text,
  	FOREIGN KEY (\`doc_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_breadcrumbs_order_idx\` ON \`pages_breadcrumbs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_breadcrumbs_parent_id_idx\` ON \`pages_breadcrumbs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_breadcrumbs_doc_idx\` ON \`pages_breadcrumbs\` (\`doc_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_version_breadcrumbs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`doc_id\` integer,
  	\`url\` text,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`doc_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_version_breadcrumbs_order_idx\` ON \`_pages_v_version_breadcrumbs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_breadcrumbs_parent_id_idx\` ON \`_pages_v_version_breadcrumbs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_breadcrumbs_doc_idx\` ON \`_pages_v_version_breadcrumbs\` (\`doc_id\`);`)
  await db.run(sql`CREATE TABLE \`not_found_page_blocks_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`caption\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`not_found_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`not_found_page_blocks_image_order_idx\` ON \`not_found_page_blocks_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`not_found_page_blocks_image_parent_id_idx\` ON \`not_found_page_blocks_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`not_found_page_blocks_image_path_idx\` ON \`not_found_page_blocks_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`not_found_page_blocks_image_image_idx\` ON \`not_found_page_blocks_image\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`not_found_page_blocks_video\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`video_id\` integer,
  	\`caption\` text,
  	\`captions_id\` integer,
  	\`captions_language\` text DEFAULT 'en',
  	\`block_name\` text,
  	FOREIGN KEY (\`video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`captions_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`not_found_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`not_found_page_blocks_video_order_idx\` ON \`not_found_page_blocks_video\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`not_found_page_blocks_video_parent_id_idx\` ON \`not_found_page_blocks_video\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`not_found_page_blocks_video_path_idx\` ON \`not_found_page_blocks_video\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`not_found_page_blocks_video_video_idx\` ON \`not_found_page_blocks_video\` (\`video_id\`);`)
  await db.run(sql`CREATE INDEX \`not_found_page_blocks_video_captions_idx\` ON \`not_found_page_blocks_video\` (\`captions_id\`);`)
  await db.run(sql`CREATE TABLE \`not_found_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text DEFAULT 'Page not found',
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`not_found_page__status_idx\` ON \`not_found_page\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_not_found_page_v_blocks_image\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`caption\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_not_found_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_not_found_page_v_blocks_image_order_idx\` ON \`_not_found_page_v_blocks_image\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_not_found_page_v_blocks_image_parent_id_idx\` ON \`_not_found_page_v_blocks_image\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_not_found_page_v_blocks_image_path_idx\` ON \`_not_found_page_v_blocks_image\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_not_found_page_v_blocks_image_image_idx\` ON \`_not_found_page_v_blocks_image\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_not_found_page_v_blocks_video\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`video_id\` integer,
  	\`caption\` text,
  	\`captions_id\` integer,
  	\`captions_language\` text DEFAULT 'en',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`captions_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_not_found_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_not_found_page_v_blocks_video_order_idx\` ON \`_not_found_page_v_blocks_video\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_not_found_page_v_blocks_video_parent_id_idx\` ON \`_not_found_page_v_blocks_video\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_not_found_page_v_blocks_video_path_idx\` ON \`_not_found_page_v_blocks_video\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_not_found_page_v_blocks_video_video_idx\` ON \`_not_found_page_v_blocks_video\` (\`video_id\`);`)
  await db.run(sql`CREATE INDEX \`_not_found_page_v_blocks_video_captions_idx\` ON \`_not_found_page_v_blocks_video\` (\`captions_id\`);`)
  await db.run(sql`CREATE TABLE \`_not_found_page_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_title\` text DEFAULT 'Page not found',
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer
  );
  `)
  await db.run(sql`CREATE INDEX \`_not_found_page_v_version_version__status_idx\` ON \`_not_found_page_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_not_found_page_v_created_at_idx\` ON \`_not_found_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_not_found_page_v_updated_at_idx\` ON \`_not_found_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_not_found_page_v_latest_idx\` ON \`_not_found_page_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_not_found_page_v_autosave_idx\` ON \`_not_found_page_v\` (\`autosave\`);`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`favicon_id\` integer,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`business_name\` text,
  	\`business_legal_name\` text,
  	\`business_description\` text,
  	\`business_logo_id\` integer,
  	\`business_email\` text,
  	\`business_telephone\` text,
  	\`business_address_street_address\` text,
  	\`business_address_address_locality\` text,
  	\`business_address_postal_code\` text,
  	\`business_address_address_country\` text,
  	\`enable_llms_text\` integer DEFAULT false,
  	\`llms_text\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`favicon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`business_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings\`("id", "favicon_id", "meta_title", "meta_description", "meta_image_id", "business_name", "business_legal_name", "business_description", "business_logo_id", "business_email", "business_telephone", "business_address_street_address", "business_address_address_locality", "business_address_postal_code", "business_address_address_country", "enable_llms_text", "llms_text", "updated_at", "created_at") SELECT "id", "favicon_id", "meta_title", "meta_description", "meta_image_id", "business_name", "business_legal_name", "business_description", "business_logo_id", "business_email", "business_telephone", "business_address_street_address", "business_address_address_locality", "business_address_postal_code", "business_address_address_country", "enable_llms_text", "llms_text", "updated_at", "created_at" FROM \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings\` RENAME TO \`site_settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`site_settings_favicon_idx\` ON \`site_settings\` (\`favicon_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_meta_meta_image_idx\` ON \`site_settings\` (\`meta_image_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_business_business_logo_idx\` ON \`site_settings\` (\`business_logo_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__site_settings_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_favicon_id\` integer,
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`version_business_name\` text,
  	\`version_business_legal_name\` text,
  	\`version_business_description\` text,
  	\`version_business_logo_id\` integer,
  	\`version_business_email\` text,
  	\`version_business_telephone\` text,
  	\`version_business_address_street_address\` text,
  	\`version_business_address_address_locality\` text,
  	\`version_business_address_postal_code\` text,
  	\`version_business_address_address_country\` text,
  	\`version_enable_llms_text\` integer DEFAULT false,
  	\`version_llms_text\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`version_favicon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_business_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new__site_settings_v\`("id", "version_favicon_id", "version_meta_title", "version_meta_description", "version_meta_image_id", "version_business_name", "version_business_legal_name", "version_business_description", "version_business_logo_id", "version_business_email", "version_business_telephone", "version_business_address_street_address", "version_business_address_address_locality", "version_business_address_postal_code", "version_business_address_address_country", "version_enable_llms_text", "version_llms_text", "version_updated_at", "version_created_at", "created_at", "updated_at") SELECT "id", "version_favicon_id", "version_meta_title", "version_meta_description", "version_meta_image_id", "version_business_name", "version_business_legal_name", "version_business_description", "version_business_logo_id", "version_business_email", "version_business_telephone", "version_business_address_street_address", "version_business_address_address_locality", "version_business_address_postal_code", "version_business_address_address_country", "version_enable_llms_text", "version_llms_text", "version_updated_at", "version_created_at", "created_at", "updated_at" FROM \`_site_settings_v\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__site_settings_v\` RENAME TO \`_site_settings_v\`;`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version_favicon_idx\` ON \`_site_settings_v\` (\`version_favicon_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_meta_version_meta_image_idx\` ON \`_site_settings_v\` (\`version_meta_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_business_version_business_logo_idx\` ON \`_site_settings_v\` (\`version_business_logo_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_created_at_idx\` ON \`_site_settings_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_updated_at_idx\` ON \`_site_settings_v\` (\`updated_at\`);`)
  await db.run(sql`DROP INDEX \`pages_slug_idx\`;`)
  await db.run(sql`ALTER TABLE \`pages\` ADD \`kind\` text DEFAULT 'page';`)
  await db.run(sql`ALTER TABLE \`pages\` ADD \`pathname\` text;`)
  await db.run(sql`ALTER TABLE \`pages\` ADD \`generate_slug\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`pages\` ADD \`parent_id\` integer REFERENCES pages(id);`)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_pathname_idx\` ON \`pages\` (\`pathname\`);`)
  await db.run(sql`CREATE INDEX \`pages_parent_idx\` ON \`pages\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_slug_idx\` ON \`pages\` (\`slug\`);`)
  await db.run(sql`ALTER TABLE \`pages\` DROP COLUMN \`meta_title\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` ADD \`version_kind\` text DEFAULT 'page';`)
  await db.run(sql`ALTER TABLE \`_pages_v\` ADD \`version_pathname\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` ADD \`version_generate_slug\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`_pages_v\` ADD \`version_parent_id\` integer REFERENCES pages(id);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_pathname_idx\` ON \`_pages_v\` (\`version_pathname\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_parent_idx\` ON \`_pages_v\` (\`version_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`_pages_v\` DROP COLUMN \`version_meta_title\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pages_breadcrumbs\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_version_breadcrumbs\`;`)
  await db.run(sql`DROP TABLE \`not_found_page_blocks_image\`;`)
  await db.run(sql`DROP TABLE \`not_found_page_blocks_video\`;`)
  await db.run(sql`DROP TABLE \`not_found_page\`;`)
  await db.run(sql`DROP TABLE \`_not_found_page_v_blocks_image\`;`)
  await db.run(sql`DROP TABLE \`_not_found_page_v_blocks_video\`;`)
  await db.run(sql`DROP TABLE \`_not_found_page_v\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`site_name\` text DEFAULT 'Your Website Name',
  	\`default_description\` text,
  	\`default_sharing_image_id\` integer,
  	\`business_name\` text,
  	\`business_legal_name\` text,
  	\`business_description\` text,
  	\`business_logo_id\` integer,
  	\`business_email\` text,
  	\`business_telephone\` text,
  	\`business_address_street_address\` text,
  	\`business_address_address_locality\` text,
  	\`business_address_postal_code\` text,
  	\`business_address_address_country\` text,
  	\`llms_text\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`default_sharing_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`business_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_site_settings\`("id", "site_name", "default_description", "default_sharing_image_id", "business_name", "business_legal_name", "business_description", "business_logo_id", "business_email", "business_telephone", "business_address_street_address", "business_address_address_locality", "business_address_postal_code", "business_address_address_country", "llms_text", "updated_at", "created_at") SELECT "id", "site_name", "default_description", "default_sharing_image_id", "business_name", "business_legal_name", "business_description", "business_logo_id", "business_email", "business_telephone", "business_address_street_address", "business_address_address_locality", "business_address_postal_code", "business_address_address_country", "llms_text", "updated_at", "created_at" FROM \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`ALTER TABLE \`__new_site_settings\` RENAME TO \`site_settings\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`site_settings_default_sharing_image_idx\` ON \`site_settings\` (\`default_sharing_image_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_business_business_logo_idx\` ON \`site_settings\` (\`business_logo_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__site_settings_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_site_name\` text DEFAULT 'Your Website Name',
  	\`version_default_description\` text,
  	\`version_default_sharing_image_id\` integer,
  	\`version_business_name\` text,
  	\`version_business_legal_name\` text,
  	\`version_business_description\` text,
  	\`version_business_logo_id\` integer,
  	\`version_business_email\` text,
  	\`version_business_telephone\` text,
  	\`version_business_address_street_address\` text,
  	\`version_business_address_address_locality\` text,
  	\`version_business_address_postal_code\` text,
  	\`version_business_address_address_country\` text,
  	\`version_llms_text\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`version_default_sharing_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_business_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new__site_settings_v\`("id", "version_site_name", "version_default_description", "version_default_sharing_image_id", "version_business_name", "version_business_legal_name", "version_business_description", "version_business_logo_id", "version_business_email", "version_business_telephone", "version_business_address_street_address", "version_business_address_address_locality", "version_business_address_postal_code", "version_business_address_address_country", "version_llms_text", "version_updated_at", "version_created_at", "created_at", "updated_at") SELECT "id", "version_site_name", "version_default_description", "version_default_sharing_image_id", "version_business_name", "version_business_legal_name", "version_business_description", "version_business_logo_id", "version_business_email", "version_business_telephone", "version_business_address_street_address", "version_business_address_address_locality", "version_business_address_postal_code", "version_business_address_address_country", "version_llms_text", "version_updated_at", "version_created_at", "created_at", "updated_at" FROM \`_site_settings_v\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__site_settings_v\` RENAME TO \`_site_settings_v\`;`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version_default_sharing_image_idx\` ON \`_site_settings_v\` (\`version_default_sharing_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_business_version_business_logo_idx\` ON \`_site_settings_v\` (\`version_business_logo_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_created_at_idx\` ON \`_site_settings_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_updated_at_idx\` ON \`_site_settings_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE TABLE \`__new_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pages\`("id", "title", "slug", "meta_title", "meta_description", "meta_image_id", "updated_at", "created_at", "_status") SELECT "id", "title", "slug", "meta_title", "meta_description", "meta_image_id", "updated_at", "created_at", "_status" FROM \`pages\`;`)
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages\` RENAME TO \`pages\`;`)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_slug_idx\` ON \`pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`pages_meta_meta_image_idx\` ON \`pages\` (\`meta_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`pages__status_idx\` ON \`pages\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new__pages_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pages_v\`("id", "parent_id", "version_title", "version_slug", "version_meta_title", "version_meta_description", "version_meta_image_id", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest", "autosave") SELECT "id", "parent_id", "version_title", "version_slug", "version_meta_title", "version_meta_description", "version_meta_image_id", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest", "autosave" FROM \`_pages_v\`;`)
  await db.run(sql`DROP TABLE \`_pages_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__pages_v\` RENAME TO \`_pages_v\`;`)
  await db.run(sql`CREATE INDEX \`_pages_v_parent_idx\` ON \`_pages_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_slug_idx\` ON \`_pages_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_meta_version_meta_image_idx\` ON \`_pages_v\` (\`version_meta_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_updated_at_idx\` ON \`_pages_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_created_at_idx\` ON \`_pages_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version__status_idx\` ON \`_pages_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_created_at_idx\` ON \`_pages_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_updated_at_idx\` ON \`_pages_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_latest_idx\` ON \`_pages_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_autosave_idx\` ON \`_pages_v\` (\`autosave\`);`)
}
