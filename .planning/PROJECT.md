# Lawnbowling

## Description

The world's best lawn bowling app. A Progressive Web App platform for lawn bowling clubs offering tournament-day operations (iPad kiosk check-in, position preference selection, automatic draw generation, scoring, results), a national club directory, integrated Daily Event Insurance (DEI — owner's company), educational content hub, blog, and equipment dropshipping shop. Rebranded from Pick a Partner to Lawnbowling. Going for national domination of the lawn bowling market.

## Type

brownfield (rebranding + massive scope expansion from Pick a Partner codebase)

## Stack

- Next.js 15+ (App Router, Turbopack)
- Tailwind CSS v4 + shadcn/ui + Radix UI + Framer Motion
- Supabase (Postgres + Realtime + Auth + Storage + RLS)
- Vercel hosting
- PWA (service worker, offline support, installable)
- Nano Banana / Gemini (AI image generation for content)
- 21st.dev component marketplace

## Domains

- **lawnbowl.app** — Primary app (tournament management, directory, shop, blog)
- **lawnbowl.camp** — DEI insurance microsite for lawn bowling
- **lawnbowling.app** — 301 redirect to lawnbowl.app

## Repository

/opt/agency-workspace/pick-a-partner

## Current Milestone

v2.0 — Lawnbowling National Launch

## Requirements

### Validated (from existing Pick a Partner codebase)

- ✓ User auth (email/password + magic link via Supabase Auth)
- ✓ Player profiles with avatar, skill level, sports
- ✓ Digital liability waiver (checkbox + timestamp + IP)
- ✓ DEI insurance integration (post-waiver offer, status tracking)
- ✓ Real-time availability board with check-in/out
- ✓ Partner request/accept/decline flow
- ✓ Court/rink management with assignment and timers
- ✓ Admin panel (venue settings, players, waivers, match history)
- ✓ PWA installable on iPad + iPhone
- ✓ Service worker with offline fallback
- ✓ 44px minimum touch targets globally
- ✓ Responsive: iPad landscape (kiosk) + iPhone portrait
- ✓ Bowls tournament check-in with position preference (Skip/Lead/Vice)
- ✓ Tournament draw generation (Fours, Triples, Pairs)
- ✓ Bowls-specific types (BowlsPosition, BowlsGameFormat, BowlsCheckin)
- ✓ QR code venue check-in system
- ✓ Deployed to Vercel

### Active (v2.0 — Lawn Bowl Launch)

#### Core App — Tournament Lifecycle
- [ ] TOUR-01: Score entry per end (per rink, real-time)
- [ ] TOUR-02: Results calculation and display
- [ ] TOUR-03: Multi-round tournament support (play multiple rounds in a day)
- [ ] TOUR-04: Tournament history and archival
- [ ] TOUR-05: Player statistics from tournament results
- [ ] TOUR-06: Dynamic tournament entity (replace hardcoded demo ID)

#### Kiosk UX Overhaul
- [ ] KIOSK-01: Elderly-friendly redesign (56-72pt touch targets, 16px+ min text)
- [ ] KIOSK-02: WCAG AAA contrast (7:1 ratio) throughout kiosk views
- [ ] KIOSK-03: 4-screen check-in flow (Welcome → Name Search → Position Select → Confirm)
- [ ] KIOSK-04: 15-second auto-reset after check-in
- [ ] KIOSK-05: A-Z letter filter for name browsing (300 members)
- [ ] KIOSK-06: Undo window extended to 10 seconds

#### Club Directory
- [ ] DIR-01: Clubs table in Supabase with full schema
- [ ] DIR-02: Public directory page (/clubs) with search, region/state/activity filters
- [ ] DIR-03: State-level pages (/clubs/[state]) for local SEO
- [ ] DIR-04: Individual club detail pages (/clubs/[state]/[slug])
- [ ] DIR-05: "Claim your club" flow for club managers
- [ ] DIR-06: Seed 90+ researched USA clubs
- [ ] DIR-07: Club-to-venue linking (clubs that use Lawn Bowl app)

#### Live Display & Engagement
- [ ] LIVE-01: TV scoreboard mode (/tv) for clubhouse display
- [ ] LIVE-02: Live draw announcement display
- [ ] LIVE-03: Push notifications for draw announcements
- [ ] LIVE-04: Weather widget (Open-Meteo integration)

#### Rebrand
- [ ] BRAND-01: Rename "Pick a Partner" → "Lawnbowling" throughout
- [ ] BRAND-02: New logo (app icon + wordmark — already generated via Nano Banana)
- [ ] BRAND-03: Update manifest.json, favicons, OG images
- [ ] BRAND-04: Update color scheme to lawn bowling green (#1B5E20 primary)
- [ ] BRAND-05: Domain setup (lawnbowl.app on Vercel)

#### DEI Insurance Microsite (lawnbowl.camp)
- [ ] DEI-01: Lawn bowls-specific insurance landing page (in-app /insurance/lawn-bowls)
- [ ] DEI-02: Standalone microsite at lawnbowl.camp
- [ ] DEI-03: Per-session coverage ($3-15/player)
- [ ] DEI-04: Club-wide bulk coverage option
- [ ] DEI-05: Insurance offer at tournament check-in (highest conversion point)
- [ ] DEI-06: Admin dashboard showing member coverage status

#### Educational Content & Blog
- [ ] EDU-01: Learning hub (/learn) with beginner guide, rules, positions, formats, glossary
- [ ] EDU-02: "Lawn bowling vs bocce" comparison page (highest traffic keyword)
- [ ] EDU-03: Blog engine with AI-generated content (/blog)
- [ ] EDU-04: First 10 blog posts generated and published
- [ ] EDU-05: Equipment buying guide (/learn/equipment)

#### Shop (Dropshipping)
- [ ] SHOP-01: Product catalog page (/shop) with categories
- [ ] SHOP-02: Product detail pages with images, descriptions
- [ ] SHOP-03: Cart and checkout flow (Stripe integration)
- [ ] SHOP-04: Supplier/fulfillment integration for dropshipping
- [ ] SHOP-05: Categories: bowls, shoes, bags, accessories, clothing

#### SEO & Growth
- [ ] SEO-01: Dynamic sitemap.ts with all club/state/blog URLs
- [ ] SEO-02: Schema.org markup (SportsOrganization, SportsEvent, SoftwareApplication)
- [ ] SEO-03: Meta tags and OG cards for all page types
- [ ] SEO-04: Canonical URLs (lawnbowling.app → lawnbowl.app)
- [ ] SEO-05: Google Business Profile setup

#### Multi-Club Architecture
- [ ] MULTI-01: Club-scoped data (tournaments, members per club)
- [ ] MULTI-02: Club onboarding flow (sign up → create club → invite members)
- [ ] MULTI-03: Club admin dashboard
- [ ] MULTI-04: Club branding (custom colors, logo per club)

### Out of Scope (v2.0)

- Native iOS/Android app — PWA covers this, no App Store needed
- International clubs — USA first, international in v3
- Handicap system — competitive depth feature for v3
- Mix-and-Mingle rotation algorithm — complex combinatorial, v3
- Multi-club tournament federation — v3
- Video/streaming integration — v3
- Payment processing for club memberships — v3 (clubs handle this themselves)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Rebrand to Lawnbowling | Lawn bowling is the primary vertical; generic "Pick a Partner" doesn't resonate with bowlers | lawnbowl.app as primary domain |
| PWA not native | 60-80 year old users won't download apps; shared iPad kiosk is primary use case; no App Store friction | Confirmed |
| Same Supabase DB | Avoid migration complexity; all existing tables remain, add new ones | clubs table added |
| lawnbowl.camp for DEI | Separate brand identity for insurance; clubs can share independently | DEI microsite on separate domain |
| Shop built in-app | /shop section in lawnbowl.app; no Shopify overhead; keep users in-ecosystem | Stripe for payments |
| AI-generated content | Blog and educational content generated by AI, owner reviews before publish | Scale content fast |
| 21st.dev for components | shadcn/ui marketplace for polished components; faster than building from scratch | Already installed |
| Everything in parallel | National domination requires speed; multiple agents build simultaneously | YOLO mode, parallel execution |

## Research

Comprehensive research completed (11 reports in .planning/research/):
- LAWN_BOWLING_RULES.md (738 lines) — Rules, positions, formats, glossary
- LAWN_BOWLING_TECH.md (723 lines) — 20+ products, technology gaps
- LAWN_BOWLING_UX.md (788 lines) — Elderly UX, kiosk design, accessibility
- LAWN_BOWLING_MARKET.md (738 lines) — Market size, pricing, go-to-market
- LAWN_BOWLING_SYNTHESIS.md — Master synthesis of all research
- DEI_LAWN_BOWLS.md (542 lines) — Insurance product design
- SEO_STRATEGY.md — Keywords, content strategy, technical SEO
- USA_CLUBS_WEST.md — 57 clubs in Western US
- USA_CLUBS_EAST.md — 13 clubs in Eastern US
- USA_CLUBS_SOUTH.md — 19 clubs in Southern US
- USA_CLUBS_MIDWEST.md — 9 clubs in Midwest US
- DROPSHIPPING_AND_CONTENT.md — (in progress) Shop and blog strategy

## Target Users

1. **Lawn bowling club drawmasters/organizers** — Run tournament days easily
2. **Club committee members** — Manage member data, view reports
3. **Lawn bowling players (60-80+ years old)** — Check in, see draws, view results
4. **Club visitors/newcomers** — Find clubs, learn the sport
5. **Equipment buyers** — Browse and buy lawn bowling gear

## Revenue Streams

1. **SaaS subscription** — Club pays $15-50/month for app features
2. **DEI insurance** — Per-session ($3-15/player) and annual premiums
3. **Dropshipping margin** — Equipment sales markup
4. **Advertising** — Featured clubs, sponsored content (future)

---
*Last updated: 2026-03-11 after Lawnbowling rebrand and scope expansion*
