# Lawn Bowling App -- Complete Research Synthesis

**Synthesized:** 2026-03-11
**Sources:** 9 research files (LAWN_BOWLING_RULES.md, LAWN_BOWLING_TECH.md, LAWN_BOWLING_UX.md, LAWN_BOWLING_MARKET.md, SUMMARY.md, COMPETITOR_APPS.md, FEATURE_GAP_ANALYSIS.md, BEST_PRACTICES.md, TECH_RECOMMENDATIONS.md)
**Confidence:** HIGH

---

## Executive Summary

Pick-a-Partner is building the only tournament-day operations tool in the lawn bowls market. The sport has ~7,000 clubs and ~600,000 registered players across 50+ countries, overwhelmingly served by paper clipboards, marble draws, and whiteboards. Existing software falls into two dead-end categories: club admin suites (Bowlr, BowlsManager) that handle membership and season fixtures but ignore tournament-day operations, and desktop scoring calculators (PAMI, Drawmaker) that are Windows-only relics from the 2010s. No product offers kiosk check-in, position-preference-aware draw generation, or a modern mobile-first interface for a 65+ demographic. The app currently handles check-in and draw generation well, but is incomplete -- it stops at the draw. The critical path to product-market fit is completing the tournament lifecycle: scoring, results, multi-round progression, and history. The total addressable market is small by tech standards (~$100K-400K annual revenue at maturity) but the gap is wide open, the competition is weak, and the product can be built and sustained on near-zero infrastructure costs.

---

## The Sport at a Glance

**How it works:** Players roll asymmetrically weighted balls ("bowls") on a flat green, aiming to land closest to a small white target ball called the "jack." The bowl's built-in bias causes it to curve, making line and weight selection the core skill. A game consists of multiple "ends" (rounds), and the team with bowls closest to the jack scores points each end.

**Key positions (in order of play):**

| Position | Role | Primary Skill |
|----------|------|---------------|
| **Lead** | Bowls first, delivers the jack, sets up the head | Draw accuracy, consistency |
| **Second** | Reinforces the head, applies pressure (Fours only) | Versatility |
| **Vice/Third** | Directs play at the head, measures shots, advises skip | Tactical reading, all shots |
| **Skip** | Team captain, bowls last, directs all play, makes strategic calls | Leadership, all shots |

**Game formats:**

| Format | Players/Team | Bowls Each | Typical Ends |
|--------|-------------|-----------|-------------|
| Singles | 1 | 4 | First to 21 shots |
| Pairs | 2 | 4 | 21 ends |
| Triples | 3 | 2-3 | 18 ends |
| Fours | 4 | 2 | 21 ends |

**Social bowls formats (the app's primary target):** Players arrive at the club, check in ("tabs in"), and a drawmaster randomly assigns teams from position pools (skip/lead/vice bins). Teams play 2-4 short games of 7-12 ends. Between rounds, teams are re-drawn so everyone plays with different people. Individual scores accumulate across games. The entire pre-play process (check-in, sorting, drawing) takes 20-40 minutes manually -- this is exactly what Pick-a-Partner automates to under 3 minutes.

---

## The Market Opportunity

### Global Size

| Country | Clubs | Registered Players | Notes |
|---------|-------|-------------------|-------|
| Australia | 2,000+ | 180,000-240,000 | Largest market. 600K+ barefoot bowls casuals. |
| England | 2,700 | ~90,000 | Most clubs, strong culture |
| Scotland | 816 | 50,000+ | High per-capita participation |
| New Zealand | 465-583 | ~43,000 | Similar to Australia |
| South Africa | 513 | 23,000+ | Growing, minimal digital tools |
| Canada | 200 | 13,000+ | Small but organized |
| USA | 58 | 2,800+ | Tiny but growing |
| **Total** | **~7,000-8,000** | **~500,000-600,000** | **50+ countries** |

### Growth Trends

The sport is not dying -- it is transitioning. Bowls England reported 1.4% club growth in 2024. Bowls Scotland saw 40% rise in junior membership. Australia's barefoot bowls drives 600K+ casual players annually. However, UK player numbers dropped a third since 2000, and some rural clubs are closing. **Clubs that modernize are growing. Technology that helps clubs feel modern is aligned with their survival strategy.**

### Why No Good Software Exists

The market is too small for venture-backed companies (~$400K total revenue at full penetration) but perfect for a passion-project-turned-product. Club decision-makers are 70-year-old volunteer committee members who debate every expense. The result: a fragmented landscape of desktop tools, Excel templates, and paper processes. **90%+ of matches globally still use paper scorecards. 70%+ of social bowls use physical marble/chip draws.**

### The Gap Pick-a-Partner Fills

No product covers the complete social bowls tournament-day workflow: Check-in (with position preference) --> Draw generation (position-balanced) --> Rink assignment --> Score entry --> Results --> History. Every existing tool covers only one fragment. Pick-a-Partner is the first end-to-end tournament-day experience tool.

---

## Competitive Landscape

| Product | Region | Focus | Price | What They Do | What They Lack |
|---------|--------|-------|-------|-------------|----------------|
| **BowlsLink** | Australia | National federation platform | Mandated | Membership, competition management, live scoring app | Australia-only, not designed for social bowls, no kiosk, no position draws |
| **Bowlr** | UK | Club admin suite | Quote-based | Membership, rink booking, fixtures, iPad scoring, TV integration | No tournament check-in, no position draws, no kiosk mode, UK-only |
| **BowlsManager** | UK | Club website + admin | 415 GBP/yr | Membership database, fixtures, reporting (even tea duties) | No tournament ops, no real-time, no mobile app |
| **Bowls Hub** | UK | Club management | 150-400 GBP/yr | iOS/Android apps, availability tracking, league tables | No tournament draw engine, no check-in kiosk |
| **PAMI** | AU/NZ | Tournament results calculator | Unknown | Fast score entry, section rankings, rotating formats | Desktop-only (since 2011), no check-in, no draw, no real-time |
| **Drawmaker Express** | Australia | Draw generation | $145 AUD | Tournament draw generation (150+ clubs) | Windows desktop, references floppy disks, no scoring |
| **Global Lawn Bowls** | Multi-region | All-in-one platform | Tiered | Live scoring, analytics, LED scoreboards | New/unproven, adoption unclear, may be over-engineered |
| **rollUp Scorecard** | Australia | Personal scoring app | Free/$3/mo | Mobile scorecard, live sharing, stats | Individual tool, no club/tournament ops |
| **PlayPass** | Global | Generic sports platform | Free tier | Scheduling for 60+ sports | Not bowls-specific, no position features |
| **Free Lawn Bowls Software** | Community | Excel templates | Free | Tournament draw sheets, result templates | Literally spreadsheets on a Weebly site |

### Pick-a-Partner's Unique Position

The only software that combines: (1) iPad kiosk check-in, (2) position-preference-aware draw generation, (3) modern mobile-first PWA, (4) elderly-accessible design, and (5) end-to-end tournament-day workflow. No competitor occupies the "tournament-day experience, player-focused, mobile-first" quadrant.

---

## Product Strategy

### MVP Features (Prioritized)

**P0 -- Already Built:**
- Player database with position preferences
- iPad kiosk check-in with inactivity timeout
- Position preference selection (Skip/Lead/Vice/Any)
- Position-aware draw generation algorithm
- Real-time check-in board via Supabase
- Draw display with team/rink assignments
- QR code check-in (partially built)

**P0 -- Must Build Next (completes the core loop):**
1. End-by-end score entry (per rink, validates one-team-scores-per-end)
2. Tournament results calculation (wins, shot differential, standings)
3. Multi-round draw support (re-draw with "winners play winners" seeding)
4. Tournament creation as a first-class entity (replace hardcoded `demo-bowls-tournament`)

**P1 -- High Value:**
5. Live scoreboard TV display route (`/bowls/scoreboard`, 1920x1080, large fonts)
6. Tournament history and archive
7. Player statistics (games played, win rate, positions played)
8. Print-friendly draw output (CSS print stylesheet)

**P2 -- Differentiators:**
9. Mix-and-Mingle format (4 rounds, partners rotate -- no digital tool handles this)
10. Player handicap system (0-10 range, draw balancing)
11. Push notifications ("Your rink is ready", "Results are in")
12. Weather integration (Open-Meteo API, free, no key required)

**P3 -- Growth Features:**
13. Multi-club tournament support (gala days, inter-club events)
14. Committee reporting and analytics
15. Season-long competition tracking
16. BowlsLink data export (Australian market integration)

### The Tournament-Day Workflow

```
Arrive at club
    |
    v
CHECK IN on iPad kiosk (tap name, select position)    ~2 min
    |
    v
Drawmaster taps "Generate Draw"                        ~3 sec
    |
    v
DRAW DISPLAYED on screen/TV/print                      ~5 min
    |
    v
PLAY ROUND (7-12 ends, ~60 min)
    |
    v
SCORE ENTRY (per rink, per end or final)               ~2 min
    |
    v
RESULTS DISPLAYED / RE-DRAW for next round
    |
    v
Repeat 2-4 rounds
    |
    v
FINAL RESULTS & PRIZES
```

**Time saved vs manual process:** 15-30 minutes per tournament day. Over a season of 48 tournaments, that is 12-24 hours of volunteer time.

---

## UX Requirements

### Elderly-Friendly Design Principles

The core user is 60-80+ years old. This is not an edge case -- it IS the primary design target.

| Principle | Standard |
|-----------|----------|
| Touch targets | 56-72pt minimum (Apple HIG says 44pt; we go bigger) |
| Typography | No text below 16px. Player names at 20px+. Headings at 32px. |
| Contrast | WCAG AAA (7:1) for all text. Never light gray on white. |
| Navigation | 2-tap maximum to any action. No hamburger menus. No swipe gestures. |
| Error handling | 10-second undo window (not 2). No permanent mistakes. Plain language errors. |
| Cognitive load | One action per screen. Icon + text label (never icon alone). |

### iPad Kiosk Flow (4 Screens)

**Screen 1 -- Welcome/Check-In List:** Tournament name, time, progress bar ("24 of 36 checked in"). Alphabetical player list with A-Z letter filter tabs. Large CHECK IN button per row. No typing required.

**Screen 2 -- Position Selection:** Full-width buttons for Skip, Lead, Vice, Any Position. Each with subtitle description ("Team captain", "Bowls first"). Single tap selects.

**Screen 3 -- Confirmation:** Large checkmark, "You're checked in, Bob! Position: SKIP." Change Position and Withdraw buttons. Auto-resets after 15 seconds.

**Screen 4 -- Draw Display:** Card-based layout with each rink as a distinct card. Player names in large text (SURNAME bold). "Find your name" search for 6+ rinks. Read-only.

### Critical Fixes Needed in Current Code

| Issue | Fix |
|-------|-----|
| Player name text too small (`text-sm` = 14px) | Change to `text-xl` (20px) |
| Grid layout too dense (3-5 column tiles) | Switch to full-width list rows, 64pt height |
| No position selection in check-in | Add position selection screen |
| Undo window 2 seconds | Extend to 10 seconds |
| Low contrast `text-zinc-500` | Replace with `text-zinc-700` for AAA |
| No tournament context header | Add name, time, progress bar |
| No semantic HTML/ARIA | Add `aria-label`, semantic elements |

### Recommended Color Palette: "The Bowling Green"

| Role | Color | Hex | Contrast vs White |
|------|-------|-----|-------------------|
| Primary (buttons, headers) | Dark Bowling Green | `#1B5E20` | 7.9:1 (AAA) |
| Background | Warm White | `#FAFAF5` | -- |
| Text Primary | Near Black | `#1A1A1A` | 17.1:1 (AAA) |
| Text Secondary | Dark Gray | `#4A4A4A` | 9.7:1 (AAA) |
| Accent | Championship Gold | `#B8860B` | 4.0:1 (large text only) |
| Success | Confirmation Green | `#2E7D32` | 6.2:1 (AA) |
| Error | Alert Red | `#C62828` | 6.5:1 (AA) |

---

## Technical Architecture

### Why PWA

| Requirement | Why PWA Wins |
|-------------|-------------|
| Shared iPad kiosk | No App Store account, no "whose Apple ID?" confusion |
| Zero install friction | Open Safari, add to Home Screen, done |
| Any device | iPad kiosk, iPhone, Android, laptop, TV browser |
| Offline capability | Service workers cache app shell and recent data |
| TV display | Open scoreboard URL on smart TV browser. No Chromecast needed. |
| Instant updates | No App Store review. Deploy to Vercel, live in seconds. |

### Data Model Entities

```
Club           -- id, name, logo, location, greens, rinks_per_green
Member         -- id, club_id, name, position_preference, skill_rating, handicap
Tournament     -- id, club_id, name, date, format, entry_fee, max_ends, max_rounds, status
CheckIn        -- id, tournament_id, member_id, position_preference, checked_in_at
Round          -- id, tournament_id, round_number, format, draw_data (JSONB), status
Team           -- id, round_id, rink_number, team_side (A/B)
TeamMember     -- id, team_id, member_id, position
Score          -- id, round_id, rink_number, end_number, team1_shots, team2_shots
Result         -- id, tournament_id, member_id, total_points, wins, losses
```

### Real-Time Requirements

- **Check-in board:** Supabase Realtime on `check_ins` table (already working)
- **Live scoreboard:** Supabase Realtime on `scores` table (to build)
- **Draw updates:** Supabase Realtime on `rounds` table (to build)
- **No polling.** Migrate any existing polling to Realtime subscriptions.

### Offline Strategy

| Scenario | Solution |
|----------|----------|
| App loads with no WiFi | Service worker serves cached app shell + last tournament data |
| Score entry during WiFi dropout | Scores saved to IndexedDB, background sync when online |
| Draw generation offline | Pre-generate while online and cache. Client-side fallback for simplified draw. |
| Check-in offline | Local storage queue, sync when reconnected |

### Stack (Already Correct)

| Technology | Purpose | Status |
|------------|---------|--------|
| Next.js 15 (App Router) | Framework, SSR, API routes | In use |
| Supabase | Database, Auth, Realtime | In use |
| Tailwind CSS + Radix UI | Styling, accessible components | In use |
| Serwist/next-pwa | PWA, service worker, offline | In use |
| Vercel | Hosting, edge functions | In use |
| Open-Meteo API | Weather widget | To add (free, no key) |

No new major dependencies needed.

---

## Business Model

### DEI (Daily Event Insurance) Integration

The app owner also owns DEI (Daily Event Insurance). This creates a natural cross-sell: clubs using Pick-a-Partner for tournament management can purchase event insurance through integrated DEI workflows. Tournament creation is the perfect trigger point for insurance prompts. This is a significant revenue multiplier beyond software subscriptions.

### Pricing Strategy

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | $0/forever | 1 club, 50 members, 2 tournaments/month, basic draw |
| **Club** | $15-20/month ($150-200/year) | Unlimited members (500), unlimited tournaments, TV display, stats, notifications |
| **Pro** | $30-40/month ($300-400/year) | Multi-club tournaments, advanced analytics, handicap system, committee reports, priority support |

Pricing philosophy: Must be "laughably cheap" compared to club operating budgets ($50K-200K/year). Comparable to BowlsManager (415 GBP/year) but offering more. No per-user pricing -- clubs hate it.

### Go-to-Market Approach

1. **Month 1-3 -- Home Club:** Install on club iPad. Run 10+ tournaments. Iterate. Build case study.
2. **Month 3-6 -- Local Network:** Demo at inter-club gala days. Free tier for neighboring clubs. District association newsletter.
3. **Month 6-12 -- Association Partnerships:** Approach state bowls body with usage data. Position as "BowlsLink alternative for social bowls."
4. **Month 12+ -- International:** UK (2,700 clubs), NZ, South Africa. Localize terminology.

**Key marketing insight:** Word of mouth is the dominant channel. One enthusiastic club secretary is worth 10 ads. Demo at a real tournament -- seeing is believing.

### Revenue Projections (Conservative)

| Year | Clubs | ARPU | Annual Revenue |
|------|-------|------|----------------|
| 1 | 6 | $100 | $600 |
| 2 | 50 | $150 | $7,500 |
| 3 | 200 | $175 | $35,000 |
| 5 | 500 | $200 | $100,000 |

This is a lifestyle business, not a venture play. And that is perfectly fine -- sustainable economics on near-zero infrastructure costs (Supabase free tier, Vercel free tier).

---

## Immediate Next Steps (Prioritized)

1. **Complete the tournament lifecycle** -- Score entry, results calculation, multi-round draws. Without this, the app is a 15-minute demo then abandoned. (3-4 days)

2. **Fix kiosk UX for elderly users** -- Increase text sizes, switch to full-width list rows, add position selection, fix contrast, extend undo window. (2 days)

3. **Replace hardcoded tournament ID** -- Create `bowls_tournaments` table, tournament creation flow, tournament status lifecycle (checkin --> in_progress --> completed). (1-2 days)

4. **Build live scoreboard TV display** -- New `/bowls/scoreboard` route, large-format display, Supabase Realtime updates. This is the "wow factor" that sells clubs. (2-3 days)

5. **Add tournament history** -- Save completed tournaments, view past results, basic player stats. Drives return visits and proves value to committees. (1-2 days)

6. **Print-friendly draw output** -- CSS print stylesheet. Clubs will want paper backup for the notice board. (0.5 days)

7. **Mix-and-Mingle format** -- Genuine differentiator. Most popular social format. No digital tool handles the rotation logic. (2-3 days)

8. **Weather widget** -- Open-Meteo API, free, practical for an outdoor sport. (1 day)

**Total estimated effort for items 1-6:** ~10-12 days to reach a complete, shippable product.

---

## Sources

Aggregated from 9 research files. Key references:

- World Bowls Laws of the Sport (Crystal Mark 4th Edition)
- Bowls Australia, Bowls England, Bowls Scotland, Bowls NZ official sites
- Bowlr (bowlr.co.uk), BowlsManager, PAMI, Drawmaker official product pages
- WCAG 2.1/2.2 contrast and target size guidelines
- Apple Human Interface Guidelines (accessibility)
- Nielsen Norman Group elderly UX research (3rd Edition)
- JMIR Aging 2025 -- barriers to digital health technology adoption
- GrandPad, Oscar Senior, SilverSneakers UX patterns
- Drawmaster workflow guides and tournament organizer resources
- GitHub open-source lawn bowls tools
