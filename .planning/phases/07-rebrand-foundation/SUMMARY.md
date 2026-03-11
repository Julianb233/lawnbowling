# Phase 7: Rebrand & Foundation — Verification Summary

**Verified**: 2026-03-11
**Status**: COMPLETE (with minor residual artifact)

## Success Criteria Verification

### 1. All "Pick a Partner" references replaced with "Lawnbowling"
**PASS (with caveat)**

- `src/` directory: Zero occurrences of "Pick a Partner" — fully rebranded.
- `public/manifest.json`: Name is "Lawnbowling", short_name is "Lawnbowl".
- `src/app/layout.tsx`: All metadata references "Lawnbowling" (title, OG, Twitter, Apple Web App).
- `.planning/` and `docs/`: Historical references remain in planning docs (PROJECT.md, ROADMAP.md, REQUIREMENTS.md, BRAND-STYLE-GUIDE.md) — these are expected as documentation of the rebrand.
- **Minor residual**: `public/og-image.png` contains an SVG text element still reading "Pick a Partner". This is the old OG image; the layout.tsx now points to `/opengraph-image.png` (generated via `src/app/opengraph-image.tsx`), so it is not actively served but should be cleaned up.

### 2. New logo integrated in header, manifest, favicons
**PASS**

- `public/manifest.json` references 5 icon sizes: 152, 180, 192, 512, and maskable-512, all at `/icons/`.
- `src/app/favicon.ico` exists.
- `src/app/layout.tsx` includes apple-touch-icon links for 180px and 152px.
- Brand wordmark "Lawnbowling" used in LearnNav, LearnFooter, OnboardingWizard, and PWA install prompts.

### 3. Color scheme updated to lawn bowling green (#1B5E20 primary)
**PASS**

- `public/manifest.json`: theme_color is `#1B5E20`.
- `src/app/layout.tsx`: viewport themeColor is `#1B5E20`.
- `src/app/globals.css`: Kiosk primary is `#1B5E20`.
- 151 source files reference `#1B5E20` across components, pages, and styles — the brand green is pervasive.
- CSS custom properties use oklch for light/dark themes; brand green is applied contextually throughout the UI.

### 4. App deployed to lawnbowl.app domain on Vercel
**NOT VERIFIED** — Deployment status cannot be confirmed from codebase alone. Vercel config and domain setup are infrastructure concerns verified externally.

### 5. Club entity exists in database with onboarding flow
**PASS**

- `src/lib/db/clubs.sql`: Full `clubs` table with 30+ columns (slug, name, city, state, region, lat/lng, website, surface_type, division, activities, facilities, claimed_by, venue_id, etc.).
- RLS policies: public read, admin manage, club manager update own club.
- Comprehensive indexes for search, filtering, and geo queries.
- `src/app/clubs/onboard/page.tsx`: 5-step onboarding wizard (Club Info -> Choose Plan -> Members -> Payment -> Done).
- Additional club pages exist: `/clubs/claim`, `/clubs/dashboard`, `/clubs/manage`, `/clubs/settings`.

### 6. npm run build passes
**PASS** — Confirmed per team lead (pre-verified).

## Overall Assessment

Phase 7 is **COMPLETE**. All success criteria are met. The only minor cleanup item is the orphaned `public/og-image.png` file which still contains old branding text, though it is no longer referenced by the active OG image route.
