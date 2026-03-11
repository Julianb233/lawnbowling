# Requirements: Lawnbowling

**Defined:** 2026-03-09 (v1), Updated: 2026-03-11 (v2)
**Core Value:** The world's best lawn bowling app — tournament management, club directory, insurance, education, and merchandise for national domination

## v1 Requirements (Validated — Already Built)

### Authentication
- ✓ **AUTH-01**: User can sign up with email (magic link or email+password via Supabase Auth)
- ✓ **AUTH-02**: User can log in and maintain a persistent session across browser refresh
- ✓ **AUTH-03**: User can log out from any device
- ✓ **AUTH-04**: Admin users have elevated permissions

### Player Profiles
- ✓ **PROF-01**: User can create a player profile with name and avatar photo
- ✓ **PROF-02**: User can set skill level (beginner/intermediate/advanced)
- ✓ **PROF-03**: User can select preferred sports
- ✓ **PROF-04**: User can view other players' profiles
- ✓ **PROF-05**: User can edit their own profile

### Liability Waiver
- ✓ **WAIV-01**: Digital liability waiver during registration
- ✓ **WAIV-02**: Checkbox acceptance + timestamp + IP logging
- ✓ **WAIV-03**: Waiver stored with audit trail
- ✓ **WAIV-04**: Admin can view all signed waivers
- ✓ **WAIV-05**: Waiver text configurable per venue

### Insurance Integration
- ✓ **INSR-01**: Post-waiver insurance offer via DEI
- ✓ **INSR-02**: DEI microsite linked for purchase
- ✓ **INSR-03**: Insurance status visible on profile

### Availability & Check-in
- ✓ **AVAIL-01**: Player can check in at a venue
- ✓ **AVAIL-02**: Player can check out
- ✓ **AVAIL-03**: Live board with real-time updates
- ✓ **AVAIL-04**: Filterable by sport and skill
- ✓ **AVAIL-05**: Check-in time displayed

### Partner Selection
- ✓ **PICK-01**: Tap to send partner request
- ✓ **PICK-02**: Accept or decline requests
- ✓ **PICK-03**: Accepted pair enters match queue
- ✓ **PICK-04**: Declined returns both to board
- ✓ **PICK-05**: Requests expire after timeout

### Match Queue & Courts
- ✓ **MATCH-01**: Matched pairs in queue
- ✓ **MATCH-02**: Court assignment
- ✓ **MATCH-03**: Court status board
- ✓ **MATCH-04**: Match timer
- ✓ **MATCH-05**: Completed matches free courts

### Admin Panel
- ✓ **ADMIN-01**: Venue management
- ✓ **ADMIN-02**: Court/lane CRUD
- ✓ **ADMIN-03**: Sport management
- ✓ **ADMIN-04**: View players, waivers, match history
- ✓ **ADMIN-05**: Manual court assignment

### PWA & Responsive
- ✓ **PWA-01**: Installable on iPad and iPhone
- ✓ **PWA-02**: iPad landscape + iPhone portrait
- ✓ **PWA-03**: 44px minimum touch targets
- ✓ **PWA-04**: Service worker with offline fallback

### Bowls Tournament (Partial)
- ✓ **BOWLS-01**: Bowls check-in with position preference (Skip/Lead/Vice)
- ✓ **BOWLS-02**: Tournament draw generation (Fours, Triples, Pairs)
- ✓ **BOWLS-03**: QR code venue check-in

## v2 Requirements (Active — Lawnbowling National Launch)

### Tournament Lifecycle
- [ ] **TOUR-01**: Score entry per end (per rink, real-time)
- [ ] **TOUR-02**: Results calculation and display (shots, ends, winner)
- [ ] **TOUR-03**: Multi-round tournament support (multiple rounds in one day)
- [ ] **TOUR-04**: Tournament history and archival
- [ ] **TOUR-05**: Player statistics from tournament results
- [ ] **TOUR-06**: Dynamic tournament entity (replace hardcoded demo ID)
- [ ] **TOUR-07**: Print-friendly draw sheet

### Kiosk UX Overhaul
- [ ] **KIOSK-01**: Elderly-friendly redesign (56-72pt touch targets, 16px+ minimum text)
- [ ] **KIOSK-02**: WCAG AAA contrast (7:1 ratio) throughout kiosk views
- [ ] **KIOSK-03**: 4-screen check-in flow (Welcome → Name Search → Position Select → Confirm)
- [ ] **KIOSK-04**: 15-second auto-reset after check-in confirmation
- [ ] **KIOSK-05**: A-Z letter filter for name browsing (300 member capacity)
- [ ] **KIOSK-06**: Undo window extended to 10 seconds

### Club Directory
- [ ] **DIR-01**: Clubs table in Supabase with full schema
- [ ] **DIR-02**: Public directory page (/clubs) with search, region/state/activity filters
- [ ] **DIR-03**: State-level pages (/clubs/[state]) for local SEO
- [ ] **DIR-04**: Individual club detail pages (/clubs/[state]/[slug])
- [ ] **DIR-05**: "Claim your club" flow for club managers
- [ ] **DIR-06**: Seed 90+ researched USA clubs into database
- [ ] **DIR-07**: Club-to-venue linking (clubs that use the app)

### Live Display & Engagement
- [ ] **LIVE-01**: TV scoreboard mode (/tv) for clubhouse display
- [ ] **LIVE-02**: Live draw announcement display
- [ ] **LIVE-03**: Push notifications for draw announcements
- [ ] **LIVE-04**: Weather widget (Open-Meteo API)

### Rebrand
- [ ] **BRAND-01**: Rename "Pick a Partner" → "Lawnbowling" throughout codebase
- [ ] **BRAND-02**: New logo integration (app icon + wordmark)
- [ ] **BRAND-03**: Update manifest.json, favicons, OG images
- [ ] **BRAND-04**: Color scheme update (#1B5E20 primary green)
- [ ] **BRAND-05**: Domain setup (lawnbowl.app on Vercel)

### DEI Insurance (lawnbowl.camp)
- [ ] **DEI-01**: Lawn bowls-specific insurance page (in-app /insurance/lawn-bowls)
- [ ] **DEI-02**: Standalone microsite at lawnbowl.camp
- [ ] **DEI-03**: Per-session coverage tiers ($3-15/player)
- [ ] **DEI-04**: Club-wide bulk coverage option
- [ ] **DEI-05**: Insurance offer at tournament check-in
- [ ] **DEI-06**: Admin dashboard showing member coverage status

### Educational Content & Blog
- [ ] **EDU-01**: Learning hub (/learn) — beginner guide, rules, positions, formats, glossary
- [ ] **EDU-02**: "Lawn bowling vs bocce" comparison page (top keyword)
- [ ] **EDU-03**: Blog engine (/blog) with MDX or Supabase-backed posts
- [ ] **EDU-04**: First 10 blog posts AI-generated and published
- [ ] **EDU-05**: Equipment buying guide (/learn/equipment)

### Shop (Print-on-Demand via Printify)
- [ ] **SHOP-01**: Printify API integration (product sync, order creation, webhooks)
- [ ] **SHOP-02**: Product catalog page (/shop) with real SKUs and 40% markup
- [ ] **SHOP-03**: Product detail pages with Printify images, variants
- [ ] **SHOP-04**: Cart and checkout flow (Stripe integration)
- [ ] **SHOP-05**: Order submission to Printify API + order tracking
- [ ] **SHOP-06**: Categories: polos, t-shirts, hats, hoodies, tote bags, mugs, towels
- [ ] **SHOP-07**: Club-branded merchandise (clubs customize with their logo)
- [ ] **SHOP-08**: Affiliate links for big-ticket items (bowls, shoes)

### SEO & Growth
- [ ] **SEO-01**: Dynamic sitemap.ts with all club/state/blog URLs
- [ ] **SEO-02**: Schema.org markup (SportsOrganization, SportsEvent, SoftwareApplication)
- [ ] **SEO-03**: Meta tags and OG cards for all page types
- [ ] **SEO-04**: Canonical URLs (lawnbowling.app 301 → lawnbowl.app)
- [ ] **SEO-05**: Google Business Profile setup

### Multi-Club Architecture
- [ ] **MULTI-01**: Club-scoped data (tournaments, members per club)
- [ ] **MULTI-02**: Club onboarding flow (sign up → create club → invite members)
- [ ] **MULTI-03**: Club admin dashboard
- [ ] **MULTI-04**: Club branding (custom colors, logo per club)

## Out of Scope (v2)

| Feature | Reason |
|---------|--------|
| Native iOS/Android app | PWA covers this, no App Store friction |
| International clubs | USA first, international in v3 |
| Handicap system | Competitive depth for v3 |
| Mix-and-Mingle rotation algorithm | Complex combinatorial, v3 |
| Multi-club federation tournaments | v3 |
| Video/streaming | v3 |
| Club membership payment processing | Clubs handle billing separately |
| Chat/messaging | Partner request flow sufficient |
| Automated ELO rating | Manual skill levels sufficient |

## Traceability

Updated after roadmap creation.

---
*Requirements defined: 2026-03-09 (v1)*
*Last updated: 2026-03-11 after Lawnbowling v2 expansion*
