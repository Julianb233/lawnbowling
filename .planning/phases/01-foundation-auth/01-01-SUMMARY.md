# 01-01: Project Scaffold & Core Dependencies — COMPLETE

## What was built
- **Framework**: Next.js 16.1.6 with App Router, React 19.2.3, TypeScript 5
- **Styling**: Tailwind CSS 4 via `@tailwindcss/postcss`, dark theme by default
- **UI Primitives**: Radix UI (avatar, checkbox, dialog, dropdown-menu, select, tabs, toast, toggle-group)
- **Database/Auth**: `@supabase/ssr` 0.9.0 + `@supabase/supabase-js` 2.99.0
- **Animation**: Framer Motion 12.35.2
- **PWA**: Serwist 9.5.6 with manifest.json, offline page, service worker
- **Fonts**: Geist Sans + Geist Mono via `next/font/google`
- **Utility**: `clsx`, `tailwind-merge`, `lucide-react` icons

## Key Files
- `package.json` — all 18 dependencies
- `src/app/layout.tsx` — root layout with dark theme, PWA meta, InstallPrompt
- `src/app/globals.css` — Tailwind imports and custom styles
- `src/components/ui/button.tsx` — shared Button component
- `src/components/pwa/InstallPrompt.tsx` — PWA install prompt
- `public/manifest.json` — PWA manifest

## Fixes Applied (Phase 1 Re-audit)
- **QueuePageClient type mismatch**: Supabase returns `courts` as array; fixed type and rendering
- **Serwist incompatibility**: `@serwist/next` v9 crashes Next.js 16 Turbopack builds; disabled by default, gated behind `ENABLE_SERWIST=1`
- **Build script**: Added `--turbopack` flag to `npm run build` for reliable builds
- **Env example**: Added `SUPABASE_SERVICE_ROLE_KEY` to `.env.local.example`

## Verification
- `npx next build --turbopack` passes with 0 errors
- `npx tsc --noEmit` reports 0 errors
- 152 source files across components, lib, and app directories
