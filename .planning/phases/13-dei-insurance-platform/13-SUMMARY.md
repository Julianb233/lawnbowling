# Phase 13: DEI Insurance Platform — Summary

## Status: COMPLETE

## What Already Existed
- `/insurance` and `/insurance/lawn-bowls` pages with full content
- `InsuranceOffer` component integrated into check-in flow
- `/api/insurance/status` API endpoint
- Integration with Daily Event Insurance (DEI) partner URLs

## What Was Built

### Admin Insurance Dashboard (`/admin/insurance`)
- Coverage stats cards: Active, Expired, No Coverage, Coverage Rate %
- Filterable player list with status badges (covered/expired/none)
- Search by player name
- Filter by coverage status
- Uses `useAdminVenue` context for venue-scoped data

### Admin Navigation
- Added "Insurance" link to admin sidebar navigation

### LawnBowl.camp Microsite (`sites/lawnbowl-camp/`)
- Standalone Next.js app deployable to Vercel
- Landing page sections:
  - Hero with CTA → dailyeventinsurance.com quote flow
  - Injury stats (sourced from Monash University, Bowls Australia)
  - 3 pricing tiers: Essential ($3), Standard ($7), Premium ($15)
  - 5 FAQs covering common questions
  - Final CTA and footer with links to lawnbowl.app
- Tailwind CSS v4, security headers in vercel.json
- OpenGraph metadata for social sharing

## Files Changed
- `src/app/admin/insurance/page.tsx` — NEW
- `src/app/admin/layout.tsx` — Modified (added nav item)
- `sites/lawnbowl-camp/*` — NEW (8 files)
