# Phase 6, Plan 01: PWA Manifest, Service Worker, iOS Install Guide - SUMMARY

**Completed:** 2026-03-10

## What Was Done

### Manifest Polish
- Added `scope: "/"` and `prefer_related_applications: false` to `public/manifest.json`
- Manifest already had correct `display: standalone`, `orientation: any`, icons at 192/512/maskable-512

### Apple-specific Meta Tags
- Added `apple-touch-icon` links for 180x180 and 152x152 sizes in `src/app/layout.tsx`
- Apple Web App metadata was already configured (capable, black-translucent, title)

### iOS Install Guide (NEW)
- Created `src/components/pwa/IOSInstallGuide.tsx`
- Detects iOS Safari (not standalone) and shows install instructions
- Shows share icon SVG with step-by-step "Add to Home Screen" guide
- Dismisses for 7 days via localStorage
- Uses glass styling consistent with app design
- All touch targets are 44px minimum

### Service Worker Enhancement
- Added NetworkFirst strategy for `/api/*` routes (5-second timeout)
- Added CacheFirst strategy for images (100 max entries, 30-day expiry)
- Kept existing Serwist precache + offline fallback

### Offline Page Enhancement
- Added online event listener for auto-detection of reconnection
- Shows "You're Back Online!" with auto-redirect to /board after 2 seconds

### Global CSS Polish
- Added `-webkit-tap-highlight-color: transparent` to remove iOS blue flash
- Added `touch-action: manipulation` on buttons/links to prevent 300ms delay
- Added `.safe-bottom` utility for bottom nav spacing

### Vercel Config
- Updated `vercel.json` with security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- Added `Service-Worker-Allowed: /` header for sw.js
- Added no-cache header for manifest.json

## Files Modified
- `src/components/pwa/IOSInstallGuide.tsx` (NEW)
- `src/app/layout.tsx` (apple-touch-icon links, IOSInstallGuide import)
- `public/manifest.json` (scope, prefer_related_applications)
- `src/app/sw.ts` (custom runtime caching)
- `src/app/offline/page.tsx` (online detection)
- `src/app/globals.css` (touch optimizations, safe-bottom)
- `vercel.json` (security headers)

## Verification
- TypeScript: `npx tsc --noEmit` passes with zero errors
