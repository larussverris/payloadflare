# Agents

This repository is a starter for Payload CMS on Cloudflare Workers, using Next.js,
OpenNext, Cloudflare D1, and R2.

## Project conventions

- Use `pnpm` exclusively. Do not introduce Yarn or npm lockfiles.
- Keep application source in `src/`; root-level files are project configuration.
- Use the existing project-local skills in `.agents/skills/<skill-name>/SKILL.md`
  when their technology applies.
- For version-sensitive framework or platform behavior, consult the relevant
  official documentation through those skills.

## Payload and Cloudflare

- Treat `src/payload.config.ts`, `wrangler.jsonc`, `open-next.config.ts`, and
  `next.config.ts` as interconnected deployment configuration.
- When changing Payload collections, fields, or database schema, create or update
  migrations and regenerate Payload types when appropriate.
- Do not manually edit generated files such as `src/payload-types.ts`,
  `cloudflare-env.d.ts`, or the Payload admin import map.
- Do not deploy, run remote D1 commands, alter Cloudflare resources, or modify
  secrets unless the user explicitly asks.

## Verification

- Run the narrowest relevant existing check after changes, typically `pnpm lint`.
- Run `pnpm build` only when explicitly requested, when preparing a release/deployment, or when a change directly affects build or deployment configuration.
- Report checks not run and their reason.

## Repository hygiene

- Do not read `node_modules` unless explicitly asked.
- Do not read generated artifacts or caches—including `.next`, `.open-next`,
  `.wrangler`, `dist`, `build`, `out`, `coverage`, `.turbo`, or `.cache`—unless
  explicitly asked.
- Preserve unrelated working-tree changes.