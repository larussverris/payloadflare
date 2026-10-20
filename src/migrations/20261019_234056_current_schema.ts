import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_rels_order_idx\` ON \`users_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`users_rels_parent_idx\` ON \`users_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`users_rels_path_idx\` ON \`users_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`users_rels_users_id_idx\` ON \`users_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`_users_v_version_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_users_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_users_v_version_sessions_order_idx\` ON \`_users_v_version_sessions\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_users_v_version_sessions_parent_id_idx\` ON \`_users_v_version_sessions\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_users_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version_email\` text NOT NULL,
  	\`version_reset_password_token\` text,
  	\`version_reset_password_expiration\` text,
  	\`version_salt\` text,
  	\`version_hash\` text,
  	\`version_reset_password_requested_at\` text,
  	\`version_login_attempts\` numeric DEFAULT 0,
  	\`version_lock_until\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_users_v_parent_idx\` ON \`_users_v\` (\`parent_id\`);`)
  await db.run(
    sql`CREATE INDEX \`_users_v_version_version_updated_at_idx\` ON \`_users_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_users_v_version_version_created_at_idx\` ON \`_users_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_users_v_version_version_email_idx\` ON \`_users_v\` (\`version_email\`);`,
  )
  await db.run(sql`CREATE INDEX \`_users_v_created_at_idx\` ON \`_users_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_users_v_updated_at_idx\` ON \`_users_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE TABLE \`_users_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_users_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_users_v_rels_order_idx\` ON \`_users_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_users_v_rels_parent_idx\` ON \`_users_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_users_v_rels_path_idx\` ON \`_users_v_rels\` (\`path\`);`)
  await db.run(
    sql`CREATE INDEX \`_users_v_rels_users_id_idx\` ON \`_users_v_rels\` (\`users_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`media_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`media_rels_order_idx\` ON \`media_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`media_rels_parent_idx\` ON \`media_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`media_rels_path_idx\` ON \`media_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`media_rels_users_id_idx\` ON \`media_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`_media_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_display_filename\` text,
  	\`version_alt\` text NOT NULL,
  	\`version_prefix\` text DEFAULT '',
  	\`version__objectkey\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version_url\` text,
  	\`version_thumbnail_u_r_l\` text,
  	\`version_filename\` text,
  	\`version_mime_type\` text,
  	\`version_filesize\` numeric,
  	\`version_width\` numeric,
  	\`version_height\` numeric,
  	\`version_original_filename\` text,
  	\`version_original_url\` text,
  	\`version_original_mime_type\` text,
  	\`version_original_filesize\` numeric,
  	\`version_original_width\` numeric,
  	\`version_original_height\` numeric,
  	\`version_original_prefix\` text,
  	\`version_original__objectkey\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_media_v_parent_idx\` ON \`_media_v\` (\`parent_id\`);`)
  await db.run(
    sql`CREATE INDEX \`_media_v_version_version_updated_at_idx\` ON \`_media_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_media_v_version_version_created_at_idx\` ON \`_media_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_media_v_version_version_filename_idx\` ON \`_media_v\` (\`version_filename\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_media_v_version_original_version_original_filename_idx\` ON \`_media_v\` (\`version_original_filename\`);`,
  )
  await db.run(sql`CREATE INDEX \`_media_v_created_at_idx\` ON \`_media_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_media_v_updated_at_idx\` ON \`_media_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE TABLE \`_media_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_media_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_media_v_rels_order_idx\` ON \`_media_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_media_v_rels_parent_idx\` ON \`_media_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_media_v_rels_path_idx\` ON \`_media_v_rels\` (\`path\`);`)
  await db.run(
    sql`CREATE INDEX \`_media_v_rels_users_id_idx\` ON \`_media_v_rels\` (\`users_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`folders\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`parent_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`folders\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`folders_slug_idx\` ON \`folders\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`folders_parent_idx\` ON \`folders\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`folders_updated_at_idx\` ON \`folders\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`folders_created_at_idx\` ON \`folders\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`folders_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`folders\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`folders_rels_order_idx\` ON \`folders_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`folders_rels_parent_idx\` ON \`folders_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`folders_rels_path_idx\` ON \`folders_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`folders_rels_users_id_idx\` ON \`folders_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`_forms_v_version_emails\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`email_to\` text,
  	\`cc\` text,
  	\`bcc\` text,
  	\`reply_to\` text,
  	\`email_from\` text,
  	\`subject\` text DEFAULT 'You''ve received a new message.' NOT NULL,
  	\`message\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_forms_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_forms_v_version_emails_order_idx\` ON \`_forms_v_version_emails\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_forms_v_version_emails_parent_id_idx\` ON \`_forms_v_version_emails\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_forms_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text NOT NULL,
  	\`version_fields\` text,
  	\`version_submit_button_label\` text,
  	\`version_confirmation_type\` text DEFAULT 'message',
  	\`version_confirmation_message\` text,
  	\`version_redirect_url\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_forms_v_parent_idx\` ON \`_forms_v\` (\`parent_id\`);`)
  await db.run(
    sql`CREATE INDEX \`_forms_v_version_version_updated_at_idx\` ON \`_forms_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_forms_v_version_version_created_at_idx\` ON \`_forms_v\` (\`version_created_at\`);`,
  )
  await db.run(sql`CREATE INDEX \`_forms_v_created_at_idx\` ON \`_forms_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_forms_v_updated_at_idx\` ON \`_forms_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE TABLE \`_form_submissions_v_version_submission_data\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`field\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_form_submissions_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_form_submissions_v_version_submission_data_order_idx\` ON \`_form_submissions_v_version_submission_data\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_form_submissions_v_version_submission_data_parent_id_idx\` ON \`_form_submissions_v_version_submission_data\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_form_submissions_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_form_id\` integer NOT NULL,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`form_submissions\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_form_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_form_submissions_v_parent_idx\` ON \`_form_submissions_v\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_form_submissions_v_version_version_form_idx\` ON \`_form_submissions_v\` (\`version_form_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_form_submissions_v_version_version_updated_at_idx\` ON \`_form_submissions_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_form_submissions_v_version_version_created_at_idx\` ON \`_form_submissions_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_form_submissions_v_created_at_idx\` ON \`_form_submissions_v\` (\`created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_form_submissions_v_updated_at_idx\` ON \`_form_submissions_v\` (\`updated_at\`);`,
  )
  await db.run(sql`CREATE TABLE \`payload_llm_instructions\` (
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`entity_slug\` text NOT NULL,
  	\`entity_type\` text NOT NULL,
  	\`additional_instructions\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(
    sql`CREATE INDEX \`payload_llm_instructions_entity_slug_idx\` ON \`payload_llm_instructions\` (\`entity_slug\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_llm_instructions_updated_at_idx\` ON \`payload_llm_instructions\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_llm_instructions_created_at_idx\` ON \`payload_llm_instructions\` (\`created_at\`);`,
  )
  await db.run(sql`CREATE TABLE \`payload_llm_instructions_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` text NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_llm_instructions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`payload_llm_instructions_rels_order_idx\` ON \`payload_llm_instructions_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_llm_instructions_rels_parent_idx\` ON \`payload_llm_instructions_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_llm_instructions_rels_path_idx\` ON \`payload_llm_instructions_rels\` (\`path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_llm_instructions_rels_users_id_idx\` ON \`payload_llm_instructions_rels\` (\`users_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_preferences_v_version_business_profiles\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`url\` text NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_preferences_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_preferences_v_version_business_profiles_order_idx\` ON \`_preferences_v_version_business_profiles\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_preferences_v_version_business_profiles_parent_id_idx\` ON \`_preferences_v_version_business_profiles\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_preferences_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_page_language\` text DEFAULT 'en' NOT NULL,
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
  await db.run(
    sql`CREATE INDEX \`_preferences_v_version_version_favicon_idx\` ON \`_preferences_v\` (\`version_favicon_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_preferences_v_version_meta_version_meta_image_idx\` ON \`_preferences_v\` (\`version_meta_image_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_preferences_v_version_business_version_business_logo_idx\` ON \`_preferences_v\` (\`version_business_logo_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_preferences_v_created_at_idx\` ON \`_preferences_v\` (\`created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_preferences_v_updated_at_idx\` ON \`_preferences_v\` (\`updated_at\`);`,
  )
  await db.run(sql`CREATE TABLE \`not_found_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text DEFAULT '404 Page',
  	\`layout\` text DEFAULT '[{"blockType":"hero","heading":"Page not found","subheading":"The page you are looking for does not exist."}]',
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(
    sql`CREATE INDEX \`not_found_page__status_idx\` ON \`not_found_page\` (\`_status\`);`,
  )
  await db.run(sql`CREATE TABLE \`_not_found_page_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_title\` text DEFAULT '404 Page',
  	\`version_layout\` text DEFAULT '[{"blockType":"hero","heading":"Page not found","subheading":"The page you are looking for does not exist."}]',
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_not_found_page_v_version_version__status_idx\` ON \`_not_found_page_v\` (\`version__status\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_not_found_page_v_created_at_idx\` ON \`_not_found_page_v\` (\`created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_not_found_page_v_updated_at_idx\` ON \`_not_found_page_v\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_not_found_page_v_latest_idx\` ON \`_not_found_page_v\` (\`latest\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_not_found_page_v_autosave_idx\` ON \`_not_found_page_v\` (\`autosave\`);`,
  )
  // Preserve rows affected by SQLite foreign-key actions during table rebuilds.
  await db.run(sql`CREATE TABLE __migration_pages_v AS SELECT * FROM _pages_v;`)
  await db.run(sql`CREATE TABLE __migration_locks AS SELECT * FROM payload_locked_documents_rels;`)
  await db.run(sql`DELETE FROM payload_locked_documents_rels;`)
  await db.run(sql`INSERT INTO folders (id, name, slug, updated_at, created_at)
    SELECT id, COALESCE(NULLIF(title, ''), slug), slug, updated_at, created_at
    FROM pages WHERE slug NOT IN ('home', '404') AND id IN (
      SELECT parent_id FROM pages WHERE parent_id IS NOT NULL
      UNION SELECT version_parent_id FROM _pages_v WHERE version_parent_id IS NOT NULL
    );`)
  await db.run(sql`UPDATE folders SET parent_id = (
    SELECT pages.parent_id FROM pages WHERE pages.id = folders.id
      AND pages.parent_id IN (SELECT id FROM folders)
  );`)
  await db.run(sql`INSERT INTO not_found_page (id, title, layout, _status, updated_at, created_at)
    SELECT 1, title, json_array(json_object('blockType', 'hero',
      'heading', COALESCE(json_extract(layout, '$[0].heading'), 'Page not found'),
      'subheading', COALESCE(json_extract(layout, '$[0].message'), 'The page you are looking for does not exist.'))),
      _status, updated_at, created_at
    FROM pages WHERE slug = '404' AND json_extract(layout, '$[0].blockType') = 'notFound' LIMIT 1;`)
  await db.run(sql`INSERT OR IGNORE INTO not_found_page (id, title, layout, _status, updated_at, created_at)
    VALUES (1, '404 Page', json_array(json_object('blockType', 'hero',
      'heading', 'Page not found', 'subheading', 'The page you are looking for does not exist.')),
      'published', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));`)
  await db.run(sql`INSERT INTO _not_found_page_v (version_title, version_layout, version__status,
    version_updated_at, version_created_at, latest, autosave)
    SELECT title, layout, _status, updated_at, created_at, 1, 0 FROM not_found_page;`)
  await db.run(sql`DROP TABLE \`pages_breadcrumbs\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_version_breadcrumbs\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_order\` text,
  	\`folder_id\` integer,
  	\`layout\` text,
  	\`title\` text,
  	\`is_home\` integer DEFAULT false,
  	\`slug\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`folder_id\`) REFERENCES \`folders\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_pages\`("id", "_order", "folder_id", "layout", "title", "is_home", "slug", "meta_title", "meta_description", "meta_image_id", "updated_at", "created_at", "_status") SELECT "id", NULL, CASE WHEN id IN (SELECT id FROM folders) THEN id WHEN parent_id IN (SELECT id FROM folders) THEN parent_id ELSE NULL END, "layout", "title", CASE WHEN slug = 'home' THEN 1 ELSE 0 END, "slug", "meta_title", "meta_description", "meta_image_id", "updated_at", "created_at", "_status" FROM pages;`,
  )
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages\` RENAME TO \`pages\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`pages__order_idx\` ON \`pages\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_folder_idx\` ON \`pages\` (\`folder_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_is_home_idx\` ON \`pages\` (\`is_home\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_slug_idx\` ON \`pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`pages_meta_meta_image_idx\` ON \`pages\` (\`meta_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`pages__status_idx\` ON \`pages\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new__pages_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version__order\` text,
  	\`version_folder_id\` integer,
  	\`version_layout\` text,
  	\`version_title\` text,
  	\`version_is_home\` integer DEFAULT false,
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
  	FOREIGN KEY (\`version_folder_id\`) REFERENCES \`folders\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new__pages_v\`("id", "parent_id", "version__order", "version_folder_id", "version_layout", "version_title", "version_is_home", "version_slug", "version_meta_title", "version_meta_description", "version_meta_image_id", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest", "autosave") SELECT "id", "parent_id", NULL, CASE WHEN parent_id IN (SELECT id FROM folders) THEN parent_id WHEN version_parent_id IN (SELECT id FROM folders) THEN version_parent_id ELSE NULL END, "version_layout", "version_title", CASE WHEN version_slug = 'home' THEN 1 ELSE 0 END, "version_slug", "version_meta_title", "version_meta_description", "version_meta_image_id", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest", "autosave" FROM __migration_pages_v;`,
  )
  await db.run(sql`DROP TABLE \`_pages_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__pages_v\` RENAME TO \`_pages_v\`;`)
  await db.run(sql`CREATE INDEX \`_pages_v_parent_idx\` ON \`_pages_v\` (\`parent_id\`);`)
  await db.run(
    sql`CREATE INDEX \`_pages_v_version_version__order_idx\` ON \`_pages_v\` (\`version__order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_version_version_folder_idx\` ON \`_pages_v\` (\`version_folder_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_version_version_is_home_idx\` ON \`_pages_v\` (\`version_is_home\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_version_version_slug_idx\` ON \`_pages_v\` (\`version_slug\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_version_meta_version_meta_image_idx\` ON \`_pages_v\` (\`version_meta_image_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_version_version_updated_at_idx\` ON \`_pages_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_version_version_created_at_idx\` ON \`_pages_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_version_version__status_idx\` ON \`_pages_v\` (\`version__status\`);`,
  )
  await db.run(sql`CREATE INDEX \`_pages_v_created_at_idx\` ON \`_pages_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_updated_at_idx\` ON \`_pages_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_latest_idx\` ON \`_pages_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_autosave_idx\` ON \`_pages_v\` (\`autosave\`);`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`reset_password_requested_at\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`display_filename\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`prefix\` text DEFAULT '';`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`_objectkey\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`original_filename\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`original_url\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`original_mime_type\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`original_filesize\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`original_width\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`original_height\` numeric;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`original_prefix\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`original__objectkey\` text;`)
  await db.run(
    sql`CREATE INDEX \`media_original_original_filename_idx\` ON \`media\` (\`original_filename\`);`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`folders_id\` integer REFERENCES folders(id);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_folders_id_idx\` ON \`payload_locked_documents_rels\` (\`folders_id\`);`,
  )
  await db.run(
    sql`INSERT OR IGNORE INTO payload_locked_documents_rels (id, "order", parent_id, path, users_id, media_id, pages_id, forms_id, form_submissions_id) SELECT id, "order", parent_id, path, users_id, media_id, pages_id, forms_id, form_submissions_id FROM __migration_locks;`,
  )
  await db.run(
    sql`DELETE FROM _pages_v WHERE parent_id IN (SELECT id FROM pages WHERE slug = '404' AND json_extract(layout, '$[0].blockType') = 'notFound');`,
  )
  await db.run(
    sql`DELETE FROM pages WHERE slug = '404' AND json_extract(layout, '$[0].blockType') = 'notFound';`,
  )
  // A former parent page stays beside its folder at its original URL.
  await db.run(sql`UPDATE pages SET folder_id = (
    SELECT parent_id FROM folders WHERE id = pages.folder_id
  ) WHERE is_home != 1 AND slug = (SELECT slug FROM folders WHERE id = pages.folder_id);`)
  await db.run(sql`UPDATE _pages_v SET version_folder_id = (
    SELECT parent_id FROM folders WHERE id = _pages_v.version_folder_id
  ) WHERE version_is_home != 1
    AND version_slug = (SELECT slug FROM folders WHERE id = _pages_v.version_folder_id);`)
  await db.run(sql`ALTER TABLE preferences ADD page_language text DEFAULT 'en' NOT NULL;`)
  await db.run(sql`DROP TABLE __migration_pages_v;`)
  await db.run(sql`DROP TABLE __migration_locks;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`CREATE TABLE __migration_404 AS SELECT * FROM not_found_page;`)
  await db.run(sql`CREATE TABLE __migration_pages AS SELECT * FROM pages;`)
  await db.run(sql`CREATE TABLE __migration_pages_v AS SELECT * FROM _pages_v;`)
  await db.run(sql`CREATE TABLE __migration_folders AS SELECT * FROM folders;`)
  await db.run(sql`CREATE TABLE __migration_locks AS SELECT * FROM payload_locked_documents_rels;`)
  await db.run(sql`DELETE FROM payload_locked_documents_rels;`)

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
  await db.run(
    sql`CREATE INDEX \`pages_breadcrumbs_order_idx\` ON \`pages_breadcrumbs\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`pages_breadcrumbs_parent_id_idx\` ON \`pages_breadcrumbs\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`pages_breadcrumbs_doc_idx\` ON \`pages_breadcrumbs\` (\`doc_id\`);`,
  )
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
  await db.run(
    sql`CREATE INDEX \`_pages_v_version_breadcrumbs_order_idx\` ON \`_pages_v_version_breadcrumbs\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_version_breadcrumbs_parent_id_idx\` ON \`_pages_v_version_breadcrumbs\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_version_breadcrumbs_doc_idx\` ON \`_pages_v_version_breadcrumbs\` (\`doc_id\`);`,
  )
  await db.run(sql`DROP TABLE \`users_rels\`;`)
  await db.run(sql`DROP TABLE \`_users_v_version_sessions\`;`)
  await db.run(sql`DROP TABLE \`_users_v_rels\`;`)
  await db.run(sql`DROP TABLE \`_users_v\`;`)
  await db.run(sql`DROP TABLE \`media_rels\`;`)
  await db.run(sql`DROP TABLE \`_media_v_rels\`;`)
  await db.run(sql`DROP TABLE \`_media_v\`;`)
  await db.run(sql`DROP TABLE \`_forms_v_version_emails\`;`)
  await db.run(sql`DROP TABLE \`_forms_v\`;`)
  await db.run(sql`DROP TABLE \`_form_submissions_v_version_submission_data\`;`)
  await db.run(sql`DROP TABLE \`_form_submissions_v\`;`)
  await db.run(sql`DROP TABLE \`payload_llm_instructions\`;`)
  await db.run(sql`DROP TABLE \`payload_llm_instructions_rels\`;`)
  await db.run(sql`DROP TABLE \`_preferences_v_version_business_profiles\`;`)
  await db.run(sql`DROP TABLE \`_preferences_v\`;`)
  await db.run(sql`DROP TABLE \`not_found_page\`;`)
  await db.run(sql`DROP TABLE \`_not_found_page_v\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`layout\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text,
  	\`parent_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)

  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages\` RENAME TO \`pages\`;`)
  await db.run(sql`INSERT INTO pages("id", "title", "layout", "meta_title", "meta_description", "meta_image_id", "generate_slug", "slug", "parent_id", "updated_at", "created_at", "_status") SELECT "id", "title", "layout", "meta_title", "meta_description", "meta_image_id", 0, "slug", CASE WHEN folder_id = id THEN (SELECT parent_id FROM __migration_folders WHERE id = folder_id AND parent_id IN (SELECT id FROM __migration_pages))
    WHEN folder_id IN (SELECT id FROM __migration_pages) THEN folder_id ELSE NULL END, "updated_at", "created_at", "_status" FROM __migration_pages;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`pages_meta_meta_image_idx\` ON \`pages\` (\`meta_image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_slug_idx\` ON \`pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`pages_parent_idx\` ON \`pages\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`pages__status_idx\` ON \`pages\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__new__pages_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_layout\` text,
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`version_generate_slug\` integer DEFAULT true,
  	\`version_slug\` text,
  	\`version_parent_id\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pages_v\`("id", "parent_id", "version_title", "version_layout", "version_meta_title", "version_meta_description", "version_meta_image_id", "version_generate_slug", "version_slug", "version_parent_id", "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest", "autosave") SELECT "id", "parent_id", "version_title", "version_layout", "version_meta_title", "version_meta_description", "version_meta_image_id", 0, "version_slug", CASE WHEN version_folder_id = parent_id THEN (SELECT parent_id FROM __migration_folders WHERE id = version_folder_id AND parent_id IN (SELECT id FROM __migration_pages))
    WHEN version_folder_id IN (SELECT id FROM __migration_pages) THEN version_folder_id ELSE NULL END, "version_updated_at", "version_created_at", "version__status", "created_at", "updated_at", "latest", "autosave" FROM __migration_pages_v;`)
  await db.run(sql`DROP TABLE \`_pages_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__pages_v\` RENAME TO \`_pages_v\`;`)
  await db.run(sql`CREATE INDEX \`_pages_v_parent_idx\` ON \`_pages_v\` (\`parent_id\`);`)
  await db.run(
    sql`CREATE INDEX \`_pages_v_version_meta_version_meta_image_idx\` ON \`_pages_v\` (\`version_meta_image_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_version_version_slug_idx\` ON \`_pages_v\` (\`version_slug\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_version_version_parent_idx\` ON \`_pages_v\` (\`version_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_version_version_updated_at_idx\` ON \`_pages_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_version_version_created_at_idx\` ON \`_pages_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_version_version__status_idx\` ON \`_pages_v\` (\`version__status\`);`,
  )
  await db.run(sql`CREATE INDEX \`_pages_v_created_at_idx\` ON \`_pages_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_updated_at_idx\` ON \`_pages_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_latest_idx\` ON \`_pages_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_autosave_idx\` ON \`_pages_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`pages_id\` integer,
  	\`forms_id\` integer,
  	\`form_submissions_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`forms_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`form_submissions_id\`) REFERENCES \`form_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "pages_id", "forms_id", "form_submissions_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "pages_id", "forms_id", "form_submissions_id" FROM __migration_locks;`,
  )
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(
    sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_forms_id_idx\` ON \`payload_locked_documents_rels\` (\`forms_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_form_submissions_id_idx\` ON \`payload_locked_documents_rels\` (\`form_submissions_id\`);`,
  )
  await db.run(sql`DROP INDEX \`media_original_original_filename_idx\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`display_filename\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`prefix\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`_objectkey\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`original_filename\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`original_url\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`original_mime_type\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`original_filesize\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`original_width\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`original_height\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`original_prefix\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`original__objectkey\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`reset_password_requested_at\`;`)
  await db.run(sql`DROP TABLE __migration_pages;`)
  await db.run(sql`DROP TABLE __migration_pages_v;`)
  await db.run(sql`DROP TABLE __migration_folders;`)
  await db.run(sql`DROP TABLE __migration_locks;`)
  await db.run(sql`INSERT INTO pages (title, slug, generate_slug, layout, _status, updated_at, created_at)
    SELECT title, '404', 0, json_array(json_object('blockType', 'notFound',
      'heading', json_extract(layout, '$[0].heading'),
      'message', json_extract(layout, '$[0].subheading'))), _status, updated_at, created_at
    FROM __migration_404 WHERE NOT EXISTS (SELECT 1 FROM pages WHERE slug = '404');`)
  await db.run(sql`INSERT INTO _pages_v (parent_id, version_title, version_slug, version_generate_slug,
    version_layout, version__status, version_updated_at, version_created_at, latest, autosave)
    SELECT id, title, slug, 0, layout, _status, updated_at, created_at, 1, 0 FROM pages
    WHERE slug = '404' AND NOT EXISTS (SELECT 1 FROM _pages_v WHERE parent_id = pages.id);`)
  await db.run(sql`DROP TABLE __migration_404;`)
  // Remove folders only after pages, versions, and locks no longer reference them.
  await db.run(sql`DROP TABLE \`folders_rels\`;`)
  await db.run(sql`DROP TABLE \`folders\`;`)
  await db.run(sql`ALTER TABLE preferences DROP COLUMN page_language;`)
}
