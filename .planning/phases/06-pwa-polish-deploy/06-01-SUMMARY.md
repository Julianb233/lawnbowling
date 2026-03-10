---
phase: 06-pwa-polish-deploy
plan: 01
status: complete
duration: verified-existing
---

# 06-01 Summary: PWA Manifest, Service Worker, Install Prompt, Offline

## What Was Done

All PWA-01 through PWA-04 requirements were verified as already implemented and functional.

### Manifest & Icons (PWA-01)
- `public/manifest.json` has all required fields: `display: standalone`, `orientation: any`, `scope: /`, `start_url: /board`, `theme_color: #22c55e`, `background_color: #0f172a`
- Icons present at all sizes: 152, 180, 192, 512, and maskable-512
- Splash screens present for iPhone and iPad landscape
- `prefer_related_applications: false` set correctly

### Service Worker (PWA-04)
- `src/app/sw.ts` configured with @serwist/next: precaching, NetworkFirst for /api/*, CacheFirst for images with 30-day expiry, defaultCache spread for all other assets
- `public/sw.js` is the built output (comprehensive, includes all caching strategies)
- `next.config.ts` has serwist integration (gated behind ENABLE_SERWIST env var for build compatibility)
- Offline fallback correctly routes document requests to `/offline`

### Install Prompts (PWA-01)
- `InstallPrompt.tsx`: Chrome/Android beforeinstallprompt handler with iOS guard (returns null on iOS)
- `IOSInstallGuide.tsx`: iOS-specific install guide with share icon SVG, step-by-step instructions, 7-day dismiss with localStorage, standalone mode detection
- Both rendered in `layout.tsx`

### Layout Meta Tags (PWA-01, PWA-02)
- `layout.tsx` exports proper Metadata (appleWebApp.capable, manifest link) and Viewport (device-width, viewport-fit: cover, themeColor)
- apple-touch-icon links for 152 and 180 sizes
- apple-touch-startup-image links for iPhone and iPad landscape

### Offline Page (PWA-04)
- `src/app/offline/page.tsx` detects reconnection via `online` event and auto-redirects to /board after 2 seconds

## Files Verified
- `public/manifest.json` -- complete
- `src/app/sw.ts` -- complete
- `src/app/layout.tsx` -- complete
- `src/components/pwa/InstallPrompt.tsx` -- complete
- `src/components/pwa/IOSInstallGuide.tsx` -- complete
- `src/app/offline/page.tsx` -- complete
- `public/icons/` -- all 5 icons present
- `public/splash/` -- both splash screens present

## Outcome
All PWA requirements satisfied. No code changes needed.
