# ImageToolz

A browser-based image tools suite — 9 client-side utilities for resizing, compressing, converting, cropping, watermarking, and more. All processing happens in the browser; no images are uploaded to a server.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/imagetoolz run dev` — run the frontend dev server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + wouter (routing)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Image processing: Canvas API, `browser-image-compression`, `jspdf`

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/tools.ts` — tools table schema
- `lib/db/src/schema/toolUsageEvents.ts` — usage events table
- `artifacts/api-server/src/routes/tools.ts` — tools CRUD + usage tracking routes
- `artifacts/api-server/src/routes/stats.ts` — stats/popular/recent routes
- `artifacts/imagetoolz/src/pages/` — one file per tool page

## Architecture decisions

- All image processing is 100% client-side using Canvas API and npm packages — no file uploads to the server, maximizing privacy and speed.
- Tools are seeded in the DB and usage events are tracked per-tool-use to power the stats dashboard.
- OpenAPI-first contract: spec → codegen → typed hooks → frontend. No hand-written fetch calls.
- Tool routes use the tool `id` (slug-style text PK) for human-readable URLs.

## Product

9 image tools accessible from the home page:
1. Image Resizer — resize by px or %
2. Image Compressor — quality slider with size comparison
3. Image Converter — PNG/JPG/WEBP/GIF conversion
4. Image Cropper — drag-to-crop with preset ratios
5. Watermark Adder — text overlays with opacity control
6. Image Rotator & Flipper — rotate + flip
7. Image to PDF — multi-image PDF export
8. Color Picker — pixel-level HEX/RGB/HSL extraction
9. Metadata Remover — EXIF data stripping

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `jspdf` and `browser-image-compression` must be installed in `@workspace/imagetoolz` (not workspace root).
- After OpenAPI spec changes, re-run codegen before touching any generated types.
- The DB uses text PKs (slug-style IDs) for tools, not serial integers.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
