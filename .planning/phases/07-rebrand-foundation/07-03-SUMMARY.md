# Plan 07-03 Summary: Domain Setup and Vercel Config

## Status: Complete

## What Was Done

### 1. Created shared site config (`src/lib/site-config.ts`)
- Single source of truth for `SITE_URL`, `SITE_NAME`, `SITE_DOMAIN`, `SITE_DESCRIPTION`
- Uses `NEXT_PUBLIC_APP_URL` env var with fallback to `https://lawnbowl.app`

### 2. Updated hardcoded URLs to use site-config
- `src/app/robots.ts` — uses `SITE_URL` instead of hardcoded string
- `src/app/sitemap.ts` — uses `SITE_URL` instead of hardcoded string
- `src/app/layout.tsx` — uses `SITE_URL` for `metadataBase` and OG config
- `src/lib/schema.ts` — uses `SITE_URL` for all Schema.org JSON-LD
- Email templates already used `process.env.NEXT_PUBLIC_APP_URL || 'https://lawnbowl.app'` (left as-is, correct pattern for runtime templates)

### 3. Updated `next.config.ts`
- Added `images.remotePatterns` for `lawnbowl.app` and `*.supabase.co`
- Added HSTS header (`max-age=63072000; includeSubDomains; preload`)
- Added Permissions-Policy header

### 4. Updated `vercel.json`
- Added HSTS and Permissions-Policy headers to catch-all route
- Existing redirects already correct: `lawnbowling.app`, `www.lawnbowl.app`, `www.lawnbowling.app` all 301 to `lawnbowl.app`

### 5. Updated `.env.local.example`
- Added `NEXT_PUBLIC_APP_URL=https://lawnbowl.app`

### 6. Fixed pre-existing type error
- `src/components/board/BottomNav.tsx` — optional chaining for `pathname?.startsWith()`

## Verification
- TypeScript compilation: PASS (`npx tsc --noEmit`)
- Full build: PASS (`npm run build`)

## Out of Scope (Manual Tasks)
- DNS: Add `lawnbowl.app`, `lawnbowling.app`, and `www` variants in Vercel dashboard
- SSL: Automatic via Vercel once domains are added
- Google Search Console: Manual verification after DNS propagation
