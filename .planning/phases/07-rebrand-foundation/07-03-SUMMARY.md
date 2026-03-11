# 07-03: Domain Setup and Vercel Configuration -- Summary

## Changes Made

### vercel.json
- Added `Strict-Transport-Security` header (HSTS with 2-year max-age, includeSubDomains, preload)
- Added `X-DNS-Prefetch-Control: on` header
- Added `Permissions-Policy` header (camera/microphone denied, geolocation self-only)
- Existing redirect rules verified: lawnbowling.app, www.lawnbowl.app, www.lawnbowling.app all 301 to lawnbowl.app

### next.config.ts
- Added `images.remotePatterns` for lawnbowl.app and *.supabase.co
- Added HSTS and DNS prefetch headers via Next.js config (complements vercel.json)

### src/app/clubs/[state]/page.tsx
- Fixed typo: `lawnbowls.app` -> `lawnbowl.app` in OpenGraph URL

### src/lib/schema.ts
- Fixed `areaServed` from "Australia" to "United States"
- Fixed `priceCurrency` from "AUD" to "USD"
- Fixed `addressCountry` from "AU" to "US"
- Updated featureList: "90+ Australian clubs" -> "90+ lawn bowling clubs"

### .env.local.example
- Added `NEXT_PUBLIC_APP_URL=https://lawnbowl.app`
- Added `EMAIL_FROM` placeholder
- Added VAPID key placeholders for push notifications

## Verified
- TypeScript compilation: clean (no errors)
- Build: pre-existing Supabase env var error only (unrelated to these changes)
- All BASE_URL constants in robots.ts, sitemap.ts, layout.tsx, schema.ts correctly use `https://lawnbowl.app`
- Email templates correctly reference `NEXT_PUBLIC_APP_URL` with fallback to `https://lawnbowl.app`

## DNS Setup Required (Manual)
- Add A/CNAME records for `lawnbowl.app` pointing to Vercel
- Add A/CNAME records for `www.lawnbowl.app` pointing to Vercel
- Configure `lawnbowling.app` DNS to point to Vercel (for redirect to work)
- Add all domains in Vercel project settings dashboard
