# Roadmap: Lawnbowling

## Overview

Lawnbowling is the world's best lawn bowling app — a PWA platform for tournament management, club directory, insurance, education, and merchandise. Rebranded from Pick a Partner (Phases 1-6 complete). Phases 7+ build the Lawnbowling national platform.

**Execution mode:** Parallel — independent phases run simultaneously with multiple agents.

## Phases

- [x] **Phase 1: Foundation & Auth** — Project setup, Supabase, auth flow, database schema
- [x] **Phase 2: Player Profiles & Waivers** — Registration, profiles, liability waiver, DEI integration
- [x] **Phase 3: Live Availability Board** — Real-time check-in/out board with filtering
- [x] **Phase 4: Partner Selection** — Pick/request/accept flow, match queue
- [x] **Phase 5: Court Management & Admin** — Court assignment, timers, admin panel
- [x] **Phase 6: PWA, Polish & Deploy** — Service worker, responsive polish, Vercel deploy
- [ ] **Phase 7: Rebrand & Foundation** — Rename to Lawnbowling, new logo, colors, domain, multi-club DB
- [ ] **Phase 8: Tournament Lifecycle** — Score entry, results, multi-round, history, print draw
- [ ] **Phase 9: Kiosk UX Overhaul** — Elderly-friendly redesign, 4-screen check-in, WCAG AAA
- [ ] **Phase 10: Club Directory** — Supabase clubs table, directory pages, state pages, club detail, seed data, claim flow
- [ ] **Phase 11: Live Display & Engagement** — TV scoreboard, live draw display, push notifications, weather
- [ ] **Phase 12: Educational Content & Blog** — Learning hub, blog engine, 10 AI posts, equipment guide, bocce comparison
- [ ] **Phase 13: DEI Insurance Platform** — In-app lawn bowls insurance page, lawnbowl.camp microsite, check-in offer
- [ ] **Phase 14: Print-on-Demand Shop** — Printify API integration, product catalog, cart, checkout, order fulfillment
- [ ] **Phase 15: SEO & Growth Engine** — Sitemap, Schema.org, meta tags, OG cards, Google Business Profile

## Parallel Execution Map

```
Week 1 (LAUNCH WEEK):
  ├── Phase 7:  Rebrand & Foundation ──────────┐
  ├── Phase 8:  Tournament Lifecycle ──────────┤ CORE APP
  ├── Phase 9:  Kiosk UX Overhaul ────────────┘
  ├── Phase 10: Club Directory ────────────────── DIRECTORY
  ├── Phase 12: Educational Content ───────────── CONTENT
  └── Phase 15: SEO & Growth ──────────────────── SEO

Week 2:
  ├── Phase 11: Live Display ──────────────────── ENGAGEMENT
  ├── Phase 13: DEI Insurance ─────────────────── INSURANCE
  └── Phase 14: Print-on-Demand Shop ──────────── SHOP
```

## Phase Details

### Phase 7: Rebrand & Foundation
**Goal**: Transform Pick a Partner into Lawnbowling with new brand identity and multi-club database architecture
**Depends on**: Phase 6 (complete)
**Requirements**: BRAND-01, BRAND-02, BRAND-03, BRAND-04, BRAND-05, MULTI-01, MULTI-02, MULTI-03, MULTI-04
**Success Criteria** (what must be TRUE):
  1. All references to "Pick a Partner" replaced with "Lawnbowling"
  2. New logo (app icon + wordmark) integrated in header, manifest, favicons
  3. Color scheme updated to lawn bowling green (#1B5E20 primary)
  4. App deployed to lawnbowl.app domain on Vercel
  5. Club entity exists in database with onboarding flow
  6. npm run build passes
**Plans**: 3 plans

Plans:
- [ ] 07-01: Find-and-replace rebrand, logo integration, color scheme, manifest update
- [ ] 07-02: Multi-club database schema, club onboarding flow, club admin dashboard
- [ ] 07-03: Domain setup (lawnbowl.app, lawnbowling.app redirect), Vercel config

### Phase 8: Tournament Lifecycle
**Goal**: Complete tournament-day workflow — scoring, results, multi-round, history, print
**Depends on**: Phase 7 (tournament entity needs club scope)
**Requirements**: TOUR-01, TOUR-02, TOUR-03, TOUR-04, TOUR-05, TOUR-06, TOUR-07
**Research flag**: Standard patterns, straightforward
**Success Criteria** (what must be TRUE):
  1. Drawmaster can enter scores per end per rink in real-time
  2. Results automatically calculated (shots, ends, winner)
  3. Multi-round tournaments supported (generate new draw after results)
  4. Tournament history viewable with past results and player stats
  5. Print-friendly draw sheet available
  6. Dynamic tournament entity replaces hardcoded demo ID
**Plans**: 3 plans

Plans:
- [ ] 08-01: Score entry UI and API (per end, per rink, real-time via Supabase Realtime)
- [ ] 08-02: Results calculation, multi-round draw, tournament progression
- [ ] 08-03: Tournament history, player stats, print-friendly draw sheet

### Phase 9: Kiosk UX Overhaul
**Goal**: Redesign kiosk mode for 60-80+ year old users with WCAG AAA accessibility
**Depends on**: Phase 7 (rebrand first, then redesign)
**Requirements**: KIOSK-01, KIOSK-02, KIOSK-03, KIOSK-04, KIOSK-05, KIOSK-06
**Research flag**: UX research complete (LAWN_BOWLING_UX.md — 12 issues identified)
**Success Criteria** (what must be TRUE):
  1. All kiosk touch targets are 56-72pt minimum
  2. No text below 16px in kiosk views, headings 32px+
  3. WCAG AAA contrast (7:1 ratio) throughout kiosk
  4. 4-screen check-in flow works: Welcome → Name Search → Position → Confirm
  5. A-Z letter filter handles 300 member names smoothly
  6. 15-second auto-reset after confirmation, 10-second undo window
**Plans**: 2 plans

Plans:
- [ ] 09-01: Kiosk component redesign (touch targets, typography, contrast, layout)
- [ ] 09-02: 4-screen check-in flow with A-Z filter, auto-reset, undo

### Phase 10: Club Directory
**Goal**: National club directory with search, filters, state pages, and claim flow — SEO machine
**Depends on**: Phase 7 (clubs table)
**Requirements**: DIR-01, DIR-02, DIR-03, DIR-04, DIR-05, DIR-06, DIR-07
**Success Criteria** (what must be TRUE):
  1. /clubs page shows all clubs with search, region/state/activity filters
  2. /clubs/[state] pages exist for each state with clubs
  3. /clubs/[state]/[slug] detail pages with full club info
  4. 90+ USA clubs seeded from research data
  5. "Claim your club" flow allows managers to take ownership
  6. Claimed clubs can link to their venue in the app
**Plans**: 3 plans

Plans:
- [ ] 10-01: Clubs DB migration, API routes, seed 90+ clubs
- [ ] 10-02: Directory page, state pages, club detail page (already started)
- [ ] 10-03: Claim flow, club-venue linking, club manager dashboard

### Phase 11: Live Display & Engagement
**Goal**: TV scoreboard, live draw display, notifications, and weather for clubhouse engagement
**Depends on**: Phase 8 (needs scoring data)
**Requirements**: LIVE-01, LIVE-02, LIVE-03, LIVE-04
**Success Criteria** (what must be TRUE):
  1. /tv route displays live scoreboard optimized for clubhouse TV
  2. Draw announcements auto-display when generated
  3. Push notifications sent for draw announcements
  4. Weather widget shows current conditions via Open-Meteo
**Plans**: 2 plans

Plans:
- [ ] 11-01: TV scoreboard mode (/tv), live draw display with auto-refresh
- [ ] 11-02: Push notifications (web push), weather widget integration

### Phase 12: Educational Content & Blog
**Goal**: Learning hub and blog with AI-generated content targeting top lawn bowling keywords
**Depends on**: Phase 7 (rebrand — content needs new brand)
**Requirements**: EDU-01, EDU-02, EDU-03, EDU-04, EDU-05
**Research flag**: Content strategy complete (DROPSHIPPING_AND_CONTENT.md, SEO_STRATEGY.md)
**Success Criteria** (what must be TRUE):
  1. /learn hub with beginner guide, rules, positions, formats, glossary
  2. /learn/lawn-bowling-vs-bocce comparison page published
  3. /blog engine with MDX or DB-backed posts
  4. 10 blog posts published targeting top keywords
  5. Equipment buying guide at /learn/equipment
**Plans**: 3 plans

Plans:
- [ ] 12-01: Learning hub pages (/learn, /learn/rules, /learn/positions, /learn/formats, /learn/glossary)
- [ ] 12-02: Blog engine, first 5 blog posts (bocce comparison, how to play, rules, beginner guide, equipment)
- [ ] 12-03: Next 5 blog posts, equipment guide, internal linking strategy

### Phase 13: DEI Insurance Platform
**Goal**: Lawn bowling-specific insurance product with in-app page and standalone microsite
**Depends on**: Phase 7 (rebrand), Phase 8 (check-in integration)
**Requirements**: DEI-01, DEI-02, DEI-03, DEI-04, DEI-05, DEI-06
**Research flag**: DEI research complete (DEI_LAWN_BOWLS.md — pricing, coverage, UX designed)
**Success Criteria** (what must be TRUE):
  1. /insurance/lawn-bowls page with lawn bowling-specific coverage info
  2. lawnbowl.camp standalone microsite deployed
  3. Per-session coverage tiers ($3-15/player) with quote flow
  4. Insurance offer appears at tournament check-in
  5. Admin can view member coverage status
**Plans**: 2 plans

Plans:
- [ ] 13-01: In-app lawn bowls insurance page, check-in integration, admin coverage view
- [ ] 13-02: lawnbowl.camp standalone microsite (Next.js, Vercel, co-branded)

### Phase 14: Print-on-Demand Shop
**Goal**: Merch shop with Printify integration, real SKUs, 40% markup, and Stripe checkout
**Depends on**: Phase 7 (rebrand — shop needs new brand)
**Requirements**: SHOP-01, SHOP-02, SHOP-03, SHOP-04, SHOP-05, SHOP-06, SHOP-07, SHOP-08
**Research flag**: Printify research in progress
**Success Criteria** (what must be TRUE):
  1. /shop page with product catalog synced from Printify API
  2. Products display real SKUs, images, variants with 40% markup pricing
  3. Cart and checkout work with Stripe
  4. Orders submitted to Printify API for fulfillment
  5. Order tracking and status updates via webhooks
  6. Club-branded merchandise customization available
  7. Affiliate links for bowls, shoes, bags from authorized dealers
**Plans**: 3 plans

Plans:
- [ ] 14-01: Printify API integration (product sync, SKU mapping, 40% markup pricing)
- [ ] 14-02: Shop UI (catalog, product detail, cart, Stripe checkout)
- [ ] 14-03: Order fulfillment (Printify order API, webhooks, tracking), club custom merch, affiliate links

### Phase 15: SEO & Growth Engine
**Goal**: Technical SEO foundation to rank #1 for lawn bowling keywords nationally
**Depends on**: Phase 10 (directory URLs), Phase 12 (blog URLs)
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04, SEO-05
**Research flag**: SEO strategy complete (SEO_STRATEGY.md — full keyword + content plan)
**Success Criteria** (what must be TRUE):
  1. Dynamic sitemap.ts includes all club, state, blog, and learn URLs
  2. Schema.org markup on all page types
  3. Meta tags and OG cards configured for every route
  4. lawnbowling.app 301 redirects to lawnbowl.app
  5. Google Business Profile created and verified
**Plans**: 2 plans

Plans:
- [ ] 15-01: Dynamic sitemap, Schema.org markup, meta tags, OG cards
- [ ] 15-02: Domain redirects, Google Business Profile, robots.txt, Search Console

## Progress

**Execution Order:**
Phases 7-10, 12, 15 run in parallel (Week 1). Phases 11, 13, 14 follow (Week 2).

| Phase | Plans | Status | Completed |
|-------|-------|--------|-----------|
| 1. Foundation & Auth | 2/2 | Complete | 2026-03-09 |
| 2. Player Profiles & Waivers | 2/2 | Complete | 2026-03-09 |
| 3. Live Availability Board | 2/2 | Complete | 2026-03-09 |
| 4. Partner Selection | 2/2 | Complete | 2026-03-09 |
| 5. Court Management & Admin | 2/2 | Complete | 2026-03-09 |
| 6. PWA, Polish & Deploy | 2/2 | Complete | 2026-03-10 |
| 7. Rebrand & Foundation | 0/3 | Not Started | - |
| 8. Tournament Lifecycle | 0/3 | Not Started | - |
| 9. Kiosk UX Overhaul | 0/2 | Not Started | - |
| 10. Club Directory | 0/3 | Not Started | - |
| 11. Live Display & Engagement | 0/2 | Not Started | - |
| 12. Educational Content & Blog | 0/3 | Not Started | - |
| 13. DEI Insurance Platform | 0/2 | Not Started | - |
| 14. Print-on-Demand Shop | 0/3 | Not Started | - |
| 15. SEO & Growth Engine | 0/2 | Not Started | - |

**Total:** 15 phases, 35 plans (12 complete, 23 remaining)
