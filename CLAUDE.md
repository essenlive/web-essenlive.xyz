# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Next.js dev server (Turbopack)
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — ESLint
- `npm run analyze` — build with bundle analyzer
- No test suite exists.

## What this is

Personal portfolio (essenlive.xyz) using Notion as a headless CMS, Next.js 16 + React 19 + Tailwind 4/ShadCN. Product intent is in [PRODUCT.md](PRODUCT.md), visual system ("Printed Page", light-only, lowtech) in [DESIGN.md](DESIGN.md) — read both before UI changes. The README is a generic template description and partly outdated (mentions dark mode, which was removed).

## Architecture

- **Routing is data-driven.** `SITE_DATA` (JSON env var) maps URL paths to Notion pages or databases (with filter/sorts and per-section card/page properties). Content and routes are never hard-coded. [app/page.tsx](app/page.tsx) renders `/`; everything else goes through the catch-all [app/[...slug]/page.tsx](app/[...slug]/page.tsx), which uses `generateStaticParams` (from `getAllData`) so the site is statically generated.
- **[lib/notion.ts](lib/notion.ts)** is the single Notion layer: parses `SITE_DATA` (`getSiteStructure`), fetches pages/databases/blocks recursively, and normalizes responses into the `PageData`/`CleanData` shapes in [lib/types.ts](lib/types.ts). Fetchers are wrapped in React `cache()` for per-request dedup. Requires `NOTION_SECRET` and `SITE_DATA` in `.env.local`.
- **Rendering:** [components/notion/](components/notion/) maps Notion blocks to React (`notion-renderer.tsx` dispatches to text/list/media/layout block files); `page.tsx` renders a page, `database.tsx` renders a database listing via cards (`page-card`) or compact list items (`page-list-item`). `components/notion-renderer.tsx` at the top level is an empty file.
- **Images:** [lib/imageProcessor.ts](lib/imageProcessor.ts) downloads Notion images (whose URLs expire) to `public/images/<md5(url-without-query)>.webp` (gitignored cache), optionally dithers them with a custom Atkinson diffusion against an extracted 32-color palette (`DITHER_IMAGES=true`), and returns dimensions + blur placeholder ([lib/plaiceholder.ts](lib/plaiceholder.ts)). [next.config.mjs](next.config.mjs) sets `images.unoptimized: true` on purpose — next/image must not re-encode dithered files.
- **[app/dev-env/](app/dev-env/)** is a development-only editor to switch between `.env.local.<name>` variants (copies into `.env.local`); it 404s outside `NODE_ENV=development`.

## Environment variables

Set in `.env.local` (edit via `/dev-env`; restart dev server after changes). `.env.local.<name>` files are switchable variants.

- `NOTION_SECRET` (required) — Notion integration token.
- `SITE_DATA` (required) — JSON, see below.
- `DITHER_IMAGES` — `"true"` enables Atkinson dithering in `lib/imageProcessor.ts`.
- `NEXT_PUBLIC_ANALYTICS_SERVER_URL`, `NEXT_PUBLIC_ANALYTICS_ID` — analytics `<script>` (`{url}/script.js`, `data-website-id`) injected in `app/layout.tsx`, non-development only.
- `ANALYZE` — `"true"` enables the bundle analyzer (set by `npm run analyze`).

### `SITE_DATA` shape (types in [lib/types.ts](lib/types.ts))

- Top level: `sitename`, `siteUrl` (typed but currently unused), `socials` (`mail`, `github`, `linkedin`, `instagram`; shown in navigation), `structure`.
- `structure`: map of URL path → definition; `"/"` is required, and the key becomes the entry's `path`. Definition fields:
  - `type` (`page`|`database`), `id` (Notion id, dashes optional), `label` (nav label, default path without slash), `showTitle` (title block on top-level pages; sub-pages always show it).
  - Database only: `filter`, `sorts` (Notion query JSON), `displayType` (`grid` default | `list` | `list-compact`), `columns` (grid columns from `lg`, default 3), `cardProperties` / `pageProperties` (property names to show on cards / item pages; `Description` in `cardProperties` renders as summary), `disableItemLinks`, `showEntryCount`.
  - Page only: `featured` — items of another database shown under the page: `from` (structure path of that database), `title`, `filter` (ANDed with the database's own), `sorts`, `limit`, `columns`, `displayType` (defaults to the source database's).
- When adding a `SITE_DATA` option, also add it to the `/dev-env` editor ([app/dev-env/editor.tsx](app/dev-env/editor.tsx)) and this section.

## Gotchas

- `next.config.mjs` forces `cpus: 1` / no worker threads to avoid SIGBUS in WSL2 — don't remove.
- `removeConsole` is on in production builds.
- `.env*` and `public/images/*` are gitignored.
- Both `bun.lock` and `package-lock.json` exist; scripts are npm-based.
