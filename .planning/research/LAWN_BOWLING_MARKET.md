# Lawn Bowling Tournament App: Market Opportunity & Feature Strategy

**Researched:** 2026-03-11
**Overall Confidence:** MEDIUM-HIGH (market data verified across multiple national association sources)

---

## 1. Market Size: How Big Is Lawn Bowling Globally?

### Global Overview

Lawn bowls is played in over 50 countries, governed by [World Bowls](https://www.worldbowls.com/) with 54 Member National Authorities across 51 countries. The sport has deep roots in Commonwealth nations and is experiencing a complex demographic shift -- declining in some traditional strongholds while growing among younger demographics and in new markets.

### Country-by-Country Breakdown

| Country | Clubs | Registered Players | Social/Casual Players | Source Confidence |
|---------|-------|-------------------|----------------------|-------------------|
| **Australia** | 2,000+ | 180,000-240,000 | 600,000+ (barefoot bowls) | HIGH -- [Bowls Australia](https://bowls.com.au/) annual report |
| **England** | 2,700 | ~90,000 (est.) | Unknown | HIGH -- [Bowls England](https://www.bowlsengland.com/your-national-governing-body/) |
| **Scotland** | 816 | 50,000+ | Unknown | HIGH -- [Bowls Scotland](https://www.bowlsscotland.com/) annual report |
| **Wales** | 286 | ~15,000 (est.) | Unknown | MEDIUM -- [Welsh Bowls](https://www.welshbowls.co.uk/about) |
| **New Zealand** | 465-583 | ~43,000 | ~123,000 total | MEDIUM -- [Bowls NZ](https://bowlsnewzealand.co.nz/) (2017-18 data) |
| **South Africa** | 513 | 23,000+ | Unknown | HIGH -- [Bowls South Africa](https://www.bowlssa.co.za/about-bowls-south-africa/) |
| **Canada** | 200 | 13,000+ | Unknown | HIGH -- [Bowls Canada](https://bowlscanada.com/en/) |
| **USA** | 58 | 2,800+ | Unknown | HIGH -- [Bowls USA](https://www.bowlsusa.us/) |
| **Hong Kong** | 44 | Unknown | Unknown | MEDIUM -- [HKLBA](https://www.bowls.org.hk/) |
| **Ireland** | 30 | ~2,000 | Unknown | MEDIUM -- [Irish Lawn Bowls](https://irishlawnbowls.ie/about-us/) |
| **Indoor (NZ)** | 767 | Unknown | Unknown | MEDIUM -- separate governing body |

### Total Addressable Market (TAM)

| Metric | Estimate | Confidence |
|--------|----------|------------|
| **Total clubs worldwide** | ~7,000-8,000 outdoor clubs | MEDIUM |
| **Total registered players** | ~500,000-600,000 | MEDIUM |
| **Total casual/social players** | ~1,000,000+ | LOW |
| **Primary English-speaking markets** | ~6,500 clubs | MEDIUM |

**Key insight:** The TAM of ~7,000 clubs is small by tech industry standards but represents a deeply underserved niche. Even 5% penetration (350 clubs) at modest subscription pricing creates a viable small SaaS business.

### Typical Club Size

Based on research across multiple national associations:

- **Small clubs:** 15-50 members (common in declining rural areas)
- **Medium clubs:** 80-150 members (typical suburban club)
- **Large clubs:** 150-300 members (strong metropolitan clubs)
- **Very large clubs:** 300-500+ members (major city clubs, especially Australia)

**Design target:** 300 member capacity covers the vast majority of clubs. The app should handle up to 500 for headroom.

### Growth Trends

The picture is nuanced -- not simply growing or dying:

**Positive signals:**
- Bowls England reported **1.4% growth in club affiliation** in 2024, with 660+ clubs participating in "Bowls' Big Weekend" recruitment events
- Bowls Scotland saw **40% rise in Junior membership** in 2023-24
- Australia's barefoot bowls phenomenon drives **600,000+ casual players** annually, feeding into club membership
- Lawn bowling balls market projected at **$150 million in 2025** with sustained growth forecast
- Younger demographics increasingly attracted to social/strategic aspects

**Negative signals:**
- UK player numbers **dropped by a third since 2000** overall
- New Zealand membership **declined 17% between 2007-2011**, with some clubs down to 15 members
- **10% fewer UK club members** than five years ago in some regions
- Aging core demographic (65+ remains the dominant cohort)
- Some small/rural clubs closing or merging

**Net assessment:** The sport is not dying but is undergoing a generational transition. Clubs that modernize (synthetic greens, social events, younger-friendly culture) are growing. Clubs that don't are shrinking. **Technology that helps clubs feel modern and run efficiently is aligned with the survival strategy many clubs are adopting.**

---

## 2. The Gap We're Filling: Why No Good Software Exists

### Market Dynamics That Created the Gap

**The niche is too small for big tech companies.** With ~7,000 clubs globally and most being volunteer-run nonprofits with annual budgets under $50,000, no venture-backed company will touch this. The total market revenue potential (say 2,000 paying clubs at $200/year) is $400K/year -- not enough to interest a funded startup, but perfect for a passion-project-turned-product.

**Clubs are volunteer-run with minimal tech budgets.** The typical bowls club committee consists of retired volunteers. Their "IT system" is often:
- A paper sign-up sheet on a clipboard
- An Excel spreadsheet maintained by one person
- A whiteboard for tournament draws
- A printed results sheet pinned to the noticeboard

**The decision-maker is a 70-year-old honorary secretary.** Tech adoption requires zero friction. App Store installs, account creation flows, and complex UIs are all barriers that have killed previous attempts.

### Existing Software Landscape

The current market is fragmented, dated, and geographically siloed:

#### Club Management Systems (UK-focused)

| Software | Price | Focus | Limitations |
|----------|-------|-------|-------------|
| **[Bowlr](https://www.bowlr.co.uk/)** | From 8 GBP/month | UK club admin, fixtures, membership | 185 clubs. Membership/admin focus, not tournament-day workflow. UK-centric. |
| **[Bowls Hub](https://www.bowls-hub.co.uk/)** | Fixed price (undisclosed) | UK club management, 100+ features | Broad admin tool, not tournament-specific. |
| **[BowlsManager](https://www.bowlsmanager.com/)** | 415 GBP/year + 175 GBP setup | Club website + management | Expensive for what it offers. Website-first, not mobile-first. |
| **[Club Manager](https://www.club-manager.co.uk/)** | Unknown | UK bowls club management | UK-only market focus. |

#### Tournament-Specific Tools

| Software | Price | Focus | Limitations |
|----------|-------|-------|-------------|
| **[PAMI](https://pamibowls.com/)** | Unknown (dongle-based license) | Tournament results calculation | **Requires a physical USB dongle.** Desktop-only. In use since 2011. Powerful but archaic UX. |
| **[Drawmaker Express](https://easyusesystems.com.au/)** | ~$145 AUD | Draw generation for clubs | Desktop Windows app. Sold to 150+ clubs. Australian-focused. |
| **[Free Lawn Bowls Software](https://freelawnbowlssoftware.weebly.com/)** | Free | Excel-based tournament tools | Literally Excel spreadsheets on a Weebly site. |
| **[GitHub LawnBowls](https://github.com/iljohnson/LawnBowls)** | Free | Python round-robin draw generator | Command-line Python script. Exports to Excel. |

#### National Federation Platforms

| Platform | Market | Limitations |
|----------|--------|-------------|
| **[BowlsLink](https://bowlslink.com.au/)** | Australia only | Comprehensive but **Australia-only**. Federation-mandated. Includes live scoring, competition management, member profiles. The closest thing to what we'd build -- but locked to Bowls Australia's ecosystem. |
| **[Bowls Scotland Online Membership](https://www.bowlsscotland.com/club-development/online-membership)** | Scotland only | Membership-focused, not tournament-day. |

#### Training/Personal Apps

| App | Price | Focus | Limitations |
|-----|-------|-------|-------------|
| **[Torny](https://torny.co/)** | Free (first 1000 users) | AI-powered individual training & analysis | Personal training app, not club tournament management. Shot tracking, performance analysis. No club/tournament features. |
| **[PlayPass](https://playpass.com/sports-software/lawn-bowls-management)** | Free tier available | Generic sports scheduling | Not bowls-specific. Generic scheduling tool. |

### The Critical Gap

**No one has built a modern, mobile-first, tournament-DAY tool.**

Every existing solution falls into one of these categories:
1. **Admin tools** -- membership, fees, fixtures for the season (Bowlr, BowlsManager)
2. **Desktop tournament calculators** -- generate draws, calculate results, print sheets (PAMI, Drawmaker)
3. **National platforms** -- federation-specific, country-locked (BowlsLink)
4. **Generic sports tools** -- not bowls-aware (PlayPass, SportEasy)

What nobody has built:
- A tool that runs on the **shared club iPad at the entrance**
- Where players **check in for today's tournament**
- Select their **position preference** (Skip, Lead, Vice/Second)
- An **automatic draw is generated** balancing preferences and player strength
- **Scores are entered live** by players on their phones
- Results display on the **clubhouse TV in real-time**
- All of this works even when the **clubhouse WiFi drops out**

This is the gap. Not another admin system. A **tournament-day experience tool**.

---

## 3. Core Features for MVP (What Must Ship First)

### Priority 1: The Tournament-Day Loop

These features constitute the minimum viable tournament experience. Without all of them, the app doesn't replace the clipboard-and-whiteboard workflow.

| Feature | Why Essential | Complexity | Notes |
|---------|-------------|------------|-------|
| **Player database** (up to 300 members) | Foundation for everything. Must store name, contact, position preferences, skill level. | Low | Import from CSV for existing clubs. Manual add for new members. |
| **Tournament creation** | Committee member creates today's event: format (Fours/Triples/Pairs), number of rounds, rinks available. | Low | Template-based. Most clubs run the same format weekly. |
| **Check-in via iPad kiosk** | Players tap their name on a shared device at the clubhouse entrance. Replaces the paper sign-up sheet. | Medium | Must be dead simple. Large touch targets. No login required for check-in (kiosk mode). |
| **Position preference selection** | During check-in, player selects preferred position: Skip, Lead, Vice-Skip, Second. Can mark "Any". | Low | Critical for draw quality. Skips and Leads are always in short supply. |
| **Automatic draw generation** | Given checked-in players and their preferences, generate balanced teams. Handle odd numbers (byes, triple-up). | High | The algorithmic heart of the app. Must respect: position preferences, avoid repeat pairings (over multiple weeks), balance skill levels. |
| **Draw announcement display** | Show team compositions and rink assignments on a screen everyone can see. | Low | Large-format display. Print-friendly. QR code for mobile view. |
| **Score entry** | After each end/game, players or a scorer enters results. | Medium | Simple numeric input. Must work on phones. Offline-capable. |
| **Results display** | Leaderboard showing rankings after each round. Final results at day's end. | Low | Auto-calculates from scores. Displays on TV/big screen. |
| **Tournament history** | Past tournaments with results, team compositions, individual records. | Low | Valuable for "who played well together" future draws. |

### Priority 2: Club Setup (One-Time)

| Feature | Why Essential | Complexity |
|---------|-------------|------------|
| **Club profile** | Club name, logo, number of greens/rinks, location | Low |
| **Member import** | Bulk add members from CSV/spreadsheet | Medium |
| **Rink configuration** | Define available rinks per green (typically 6-8 per green) | Low |
| **Admin roles** | Club secretary, tournament director, regular member | Low |

### Draw Generation Algorithm: The Technical Differentiator

The automatic draw is where this app lives or dies. Key constraints the algorithm must handle:

1. **Position balance:** Each team of four needs a Skip, Vice-Skip, Second, and Lead. If 20 players check in with 10 preferring Skip, the algorithm must redistribute.
2. **Skill balance:** Don't put all the A-grade players on one team. Use handicap/rating to balance.
3. **Social mixing:** Avoid pairing the same people every week. Track historical pairings.
4. **Odd numbers:** 13 players checking in for Fours means one team plays with 3 (Triple format) or one player sits out (bye per round). Common and must be handled gracefully.
5. **Format flexibility:** Fours (4v4), Triples (3v3), Pairs (2v2), and mixed formats.
6. **Speed:** Draw must generate in under 3 seconds. People are standing around waiting.

---

## 4. Advanced Features for Differentiation

### Tier 1: High Value, Medium Effort

| Feature | Value Proposition | Complexity | When to Build |
|---------|-------------------|------------|---------------|
| **Live scoreboard on clubhouse TV** | Replaces the whiteboard. Creates buzz and atmosphere. Club members love watching scores update in real-time. | Medium | Phase 2. Requires Supabase Realtime subscriptions + a dedicated TV display mode (full-screen, auto-refresh, large fonts). |
| **Player statistics and rankings** | "You've played 42 tournaments this year, won 18, your best position is Lead." Players love stats. Drives engagement and return usage. | Medium | Phase 2-3. Accumulates naturally from tournament history. |
| **Push notifications for draw announcements** | "The draw for Saturday's tournament is up!" or "You're on Rink 4, Team B." Replaces the phone tree the secretary currently uses. | Low | Phase 2. PWA push notifications. |
| **Weather integration** | Show forecast on tournament day. Auto-suggest "Indoor format" if rain predicted. Practical for planning. | Low | Phase 2. Free weather API. |

### Tier 2: Differentiators for Growth

| Feature | Value Proposition | Complexity | When to Build |
|---------|-------------------|------------|---------------|
| **Handicap system** | Assign ratings based on historical performance. Use in draw balancing. Adds competitive depth for serious players. | High | Phase 3. Requires enough historical data to be meaningful. Elo-style or simpler percentage system. |
| **Multi-club tournament support** | Inter-club competitions where players from Club A and Club B are mixed together. "Gala days" are a big deal in bowls culture. | High | Phase 3-4. Requires cross-club player management, visiting player registration, expanded draw logic. |
| **Committee reporting and analytics** | "This year we ran 48 tournaments with 1,247 total player-sessions. Average attendance: 26. Trend: up 12% vs last year." Helps justify grant applications and committee reports at AGMs. | Medium | Phase 3. Aggregation of existing data. |
| **Social features** (photos, comments) | Post photos from the day, comment on results. Builds community. | Medium | Phase 4. Risk of scope creep. Keep minimal. |

### Tier 3: Future Vision

| Feature | Value Proposition | Complexity |
|---------|-------------------|------------|
| **QR code venue check-in** | Already partially built. Players scan a QR code at the venue to check in from their own phone. | Low (exists) |
| **Spectator mode** | Family/friends can watch live scores from home. | Low |
| **Season-long competitions** | Track cumulative points across the whole season, not just one day. Championship ladder. | Medium |
| **Coaching insights** | "Your win rate is highest when playing Lead. Consider developing your Skip game." | Medium |
| **Voice announcements** | "Round 2 draw: Team A to Rink 3..." plays over the PA system. | Low-Medium |

---

## 5. Monetization Strategy

### Pricing Philosophy

Bowling clubs are price-sensitive nonprofits. The pricing must be:
- **Laughably cheap** compared to their total operating budget ($50K-200K/year)
- **Justifiable** to a committee of retirees who will debate any expense
- **Simpler than their current phone plan** -- no per-user, per-tournament, or per-feature pricing

### Recommended Pricing Model

| Tier | Price | Includes | Target |
|------|-------|----------|--------|
| **Free** | $0/forever | 1 club, up to 50 members, 2 tournaments/month, basic draw generation, score entry, results | Small clubs trying it out. Hooks them in. |
| **Club** | $15-20 USD/month ($150-200/year) | Unlimited members (up to 500), unlimited tournaments, TV display mode, player stats, push notifications, weather, full history | The core product. Most clubs land here. |
| **Pro** | $30-40 USD/month ($300-400/year) | Everything in Club + multi-club tournaments, advanced analytics, handicap system, committee reports, API access, priority support | Large clubs and district associations. |

### Why This Pricing Works

- **$150-200/year is trivial** for a club with a $100K operating budget. It's less than the cost of printing one season's worth of draw sheets.
- **Comparable to competitors:** BowlsManager charges 415 GBP/year ($530 USD). Bowlr starts at 8 GBP/month ($120 USD/year). We undercut the UK market and offer a better product.
- **Free tier is the growth engine.** A volunteer at Club A tells their friend at Club B. Friend signs up for free. Uses it for a month. Committee approves $15/month. Network effect.
- **No per-user pricing.** Clubs hate this. "Why should we pay more because we have more members? We're trying to grow!"

### Revenue Projections (Conservative)

| Scenario | Clubs | ARPU | Annual Revenue |
|----------|-------|------|----------------|
| Year 1 (home club + 5 local) | 6 | $100 | $600 |
| Year 2 (word of mouth, 50 clubs) | 50 | $150 | $7,500 |
| Year 3 (association partnerships, 200 clubs) | 200 | $175 | $35,000 |
| Year 5 (established, 500 clubs) | 500 | $200 | $100,000 |

This is a **lifestyle business**, not a venture-scale opportunity. And that's perfectly fine -- it's a product built out of love for the sport, with sustainable economics.

### Alternative Revenue Streams

- **One-time setup fee** ($50-100): For CSV import, club configuration, onboarding call
- **Tournament entry fees:** Process entry fees through the app (take 2-3% + Stripe fees)
- **Merchandise:** Branded scorecards, club stationery generated from the app
- **Sponsorship display:** Local sponsors' logos on the TV scoreboard

---

## 6. Go-to-Market Strategy

### Phase 1: Home Club (Month 1-3)

**Strategy:** Build it for your own club. Use it every tournament day. Iterate based on real usage.

- Install on the club's shared iPad
- Run 10+ tournaments with it
- Collect feedback from players and committee
- Fix everything that's annoying
- Build a case study: "Before vs After" with real numbers

**Success metric:** Club committee votes to officially adopt the app.

### Phase 2: Local Network (Month 3-6)

**Strategy:** Word-of-mouth within the local bowling community.

- Demo at inter-club tournaments (gala days)
- Offer free tier to neighboring clubs
- Ask the district association to mention it in their newsletter
- Create a 2-minute demo video showing a full tournament flow

**Success metric:** 5 clubs actively using the app.

### Phase 3: Association Partnerships (Month 6-12)

**Strategy:** Get endorsement from a state/regional bowling association.

- Approach Bowls [State] with usage data and testimonials
- Offer a district-wide deal (e.g., all clubs in a region get Club tier free for 6 months)
- Present at an association AGM or committee meeting
- Position as "the BowlsLink alternative for social tournaments" (BowlsLink handles pennant/competitive; we handle social/club days)

**Success metric:** Association endorsement or newsletter feature.

### Phase 4: International Expansion (Month 12+)

**Strategy:** Expand to UK/NZ/South Africa markets.

- The app is already web-based and works globally
- Localize terminology (UK says "woods" not "bowls", "rink" sizes vary)
- Partner with one club in each target country as a beachhead
- Attend Bowls England "Big Weekend" or similar events

**Target order:** Australia first (largest market, barefoot bowls culture drives tech adoption), then UK (2,700+ clubs, biggest total club count), then NZ, then South Africa, then North America.

### Marketing Channels

| Channel | Cost | Effectiveness | Notes |
|---------|------|---------------|-------|
| **Word of mouth** | Free | Highest | Bowlers talk to bowlers. One enthusiastic club secretary is worth 10 ads. |
| **Club newsletters** | Free | High | Ask clubs to include a blurb. Bowlers read their club newsletter. |
| **Association newsletters** | Free | High | Bowls England, Bowls Australia all have member communications. |
| **Facebook groups** | Free | Medium | "Bowls Chat", "Lawn Bowls Australia" etc. Active communities of bowlers. |
| **Demo at Open Days** | Time only | High | Many clubs hold annual open days for recruitment. Perfect demo opportunity. |
| **YouTube tutorial** | Low | Medium | "How to run a tournament with Pick a Partner" -- bowlers love instructional content. |
| **BowlsChat.com** | Free | Medium | Active [online forum](https://www.bowlschat.com/) for bowlers. |
| **Google Ads** | Low ($2-5/day) | Low | Very small search volume. Not worth significant spend. |

---

## 7. Technical Architecture Recommendations

### Why PWA Is Perfect for This Market

The Progressive Web App architecture is not just a good choice -- it's the **only viable choice** for this market. Here's why:

| Requirement | Why PWA Wins |
|-------------|-------------|
| **Shared iPad kiosk** | No App Store account needed. No "whose Apple ID do we use?" confusion. Open Safari, add to Home Screen, done. |
| **Zero install friction** | The 70-year-old club secretary can set it up. No downloads, no updates, no storage warnings. |
| **Works on any device** | iPad at the kiosk, iPhone in the pocket, Android phone, laptop in the office. One codebase. |
| **Offline capability** | Clubhouse WiFi is notoriously unreliable. Service workers cache the app shell and recent data. Scores entered offline sync when connection returns. |
| **TV display mode** | Open the scoreboard URL on the smart TV's browser. Full screen. Auto-updates via Supabase Realtime. No Chromecast setup, no Apple TV, no HDMI cables from a laptop. |
| **No app store approval** | Deploy updates instantly. No 2-week Apple review. No $99/year developer account. |
| **Installable** | Still gets a home screen icon, splash screen, and full-screen experience. Feels like a native app. |

### Recommended Stack (Already in Use)

The project already uses an excellent stack. Confirming these choices with rationale:

| Technology | Version | Purpose | Why It's Right |
|------------|---------|---------|----------------|
| **Next.js 15** | App Router | Framework | SSR for initial load speed. App Router for layouts (kiosk vs mobile vs TV). API routes for backend logic. Vercel deployment is zero-config. |
| **Supabase** | Latest | Database + Auth + Realtime | **Realtime subscriptions** are critical for live scoreboards. Row-Level Security handles multi-club data isolation. Auth handles club admin login. **Postgres** means real SQL for complex draw queries and analytics. |
| **Tailwind CSS + Radix UI** | Latest | Styling + Components | Responsive design essential (iPad kiosk to phone to TV). Radix provides accessible components out of the box. |
| **Serwist/next-pwa** | Latest | PWA/Service Worker | Offline caching, install prompt, background sync. |
| **Vercel** | N/A | Hosting | Edge functions for low latency globally (important for AU/UK/NZ markets). Free tier is sufficient for early stage. |

### Architecture Patterns

```
[iPad Kiosk]  [Player Phone]  [TV Display]  [Admin Laptop]
      |              |              |              |
      v              v              v              v
  +--------------------------------------------------+
  |              Next.js App (PWA)                    |
  |  /kiosk/*    /tournament/*    /tv/*    /admin/*   |
  +--------------------------------------------------+
      |              |              |              |
      v              v              v              v
  +--------------------------------------------------+
  |           Supabase (Backend)                      |
  |  Auth | Postgres | Realtime | Storage             |
  +--------------------------------------------------+
```

**Key architectural decisions:**

1. **Route-group-based layouts:** `/kiosk` has large touch-target UI, no auth required. `/tv` has full-screen scoreboard, no interactivity. `/admin` has full management UI, auth required. `/tournament` is the player-facing mobile experience.

2. **Supabase Realtime for live scores:** When a score is entered on any device, all connected clients (TV, phones, kiosk) update instantly via Supabase Realtime subscriptions. No polling.

3. **Offline-first for score entry:** Scores are written to IndexedDB first, then synced to Supabase when online. This handles the "WiFi dropped during the third end" scenario gracefully.

4. **Draw algorithm runs server-side:** The draw generation algorithm should run in a Next.js API route (or Supabase Edge Function), not client-side. It needs access to historical pairing data and is computationally non-trivial for large groups.

5. **Multi-tenancy via Row-Level Security:** Each club's data is isolated at the database level using Supabase RLS policies. A club admin can only see their own club's data. This enables the free tier without data leakage concerns.

### Offline Strategy

For a clubhouse environment, the offline strategy should handle:

| Scenario | Solution |
|----------|----------|
| **App loads with no WiFi** | Service worker caches app shell, static assets, and last tournament data. App loads from cache. |
| **Score entry during WiFi dropout** | Scores saved to IndexedDB. Background sync queue. Visual indicator shows "offline -- will sync." |
| **Draw generation offline** | If the draw algorithm is server-side, this fails offline. **Mitigation:** Pre-generate the draw while online. Cache it. Alternatively, implement a simplified client-side draw for offline fallback. |
| **Check-in offline** | Check-ins saved locally. Sync when online. Kiosk should always show current check-in state from local storage. |

### Data Model (Core Entities)

```
Club
  - id, name, logo, location, greens[], rinks_per_green

Member
  - id, club_id, name, email, phone, position_preference, skill_rating

Tournament
  - id, club_id, date, format (fours/triples/pairs), rounds, status

CheckIn
  - id, tournament_id, member_id, position_preference, checked_in_at

Draw
  - id, tournament_id, round_number, generated_at

Team
  - id, draw_id, rink_number, team_side (A/B)

TeamMember
  - id, team_id, member_id, position (skip/vice/second/lead)

Score
  - id, draw_id, rink_number, round_number, team_a_score, team_b_score

Result
  - id, tournament_id, member_id, total_points, wins, losses, ends_won
```

---

## 8. Competitive Landscape Summary

### Positioning Matrix

```
                    Tournament-Day Focus
                           ^
                           |
                    [Pick a Partner]
                           |
        Admin Focus <------+------> Player Focus
                           |
              [Bowlr]      |        [Torny]
              [BowlsManager]
              [BowlsLink]  |
                           |
                    Season Management
```

**Pick a Partner's unique position:** Tournament-day experience, player-focused, mobile-first. No competitor occupies this quadrant.

### Competitive Advantages

| Advantage | Why It Matters | Who Lacks It |
|-----------|----------------|-------------|
| **Mobile-first PWA** | Works on any device, no install | PAMI (desktop), Drawmaker (Windows), BowlsLink (web but not PWA) |
| **Kiosk mode** | Shared iPad check-in | All competitors |
| **Live TV scoreboard** | Real-time results on clubhouse TV | PAMI, Drawmaker, most competitors |
| **Offline capability** | Works when clubhouse WiFi fails | All cloud-based competitors |
| **Position preference in draw** | Respects Skip/Lead/Vice preferences | Most competitors ignore this |
| **Modern UX** | Clean, touch-friendly, responsive | PAMI (2011 desktop), Drawmaker (Windows XP era) |
| **Global market** | Works in AU, UK, NZ, SA, CA, USA | BowlsLink (AU only), Bowlr (UK only) |
| **Free tier** | No-risk trial for volunteer committees | BowlsManager (415 GBP/year), Drawmaker ($145) |

### What BowlsLink Got Right (Learn From Them)

BowlsLink (Australia) is the most sophisticated existing platform. Key features worth studying:

- **National-level hierarchy:** Player profiles flow from club to district to state to national level
- **Live scoring:** End-by-end scoring submitted via the app
- **Competition management:** Handles everything from club social to Australian Open
- **Find a Club integration:** Clubs get a free website linked to the Bowls Australia directory
- **Role-based permissions:** Granular access control at each level

**What BowlsLink got wrong (our opportunity):**
- **Australia-only:** Locked to Bowls Australia ecosystem
- **Mandated, not chosen:** Clubs use it because they must, not because they love it
- **Complex:** Designed for federation compliance, not club convenience
- **Not offline-capable:** Requires internet connection
- **Not kiosk-friendly:** Not designed for a shared device at the entrance

---

## 9. Risk Assessment

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| **Market too small for sustainability** | High | Medium | Keep costs near-zero (Supabase free tier, Vercel free tier). This is a passion project first. |
| **Clubs won't pay** | Medium | Medium | Free tier ensures usage. Revenue comes from clubs that love it enough to want premium features. |
| **Draw algorithm is harder than expected** | High | High | This is THE hard problem. Start simple (random with position constraints), iterate. Don't try to solve everything in v1. |
| **Offline sync conflicts** | Medium | Medium | Optimistic updates with last-write-wins. Score entry is the only conflict-prone operation, and it's typically one device per rink. |
| **BowlsLink expands internationally** | Medium | Low | BowlsLink is tied to Bowls Australia's governance. International expansion would require partnerships with each national body. Unlikely in near term. |
| **Club secretary can't set it up** | High | Medium | Onboarding must be foolproof. Consider a "setup wizard" and a phone call offer for the first club in each region. |

---

## 10. Sources

### National Bowling Associations (HIGH confidence)
- [World Bowls](https://www.worldbowls.com/) -- International governing body
- [Bowls Australia](https://bowls.com.au/) -- 2,000+ clubs, 240,000 registered players
- [Bowls England](https://www.bowlsengland.com/your-national-governing-body/) -- 2,700 clubs, 35 county associations
- [Bowls Scotland](https://www.bowlsscotland.com/) -- 816 clubs, 50,000+ members
- [Welsh Bowls](https://www.welshbowls.co.uk/about) -- 286 clubs
- [Bowls New Zealand](https://bowlsnewzealand.co.nz/) -- 465 clubs
- [Bowls South Africa](https://www.bowlssa.co.za/about-bowls-south-africa/) -- 513 clubs, 23,000+ members
- [Bowls Canada](https://bowlscanada.com/en/) -- 200 clubs, 13,000 members
- [Bowls USA](https://www.bowlsusa.us/) -- 58 clubs, 2,800 members
- [HKLBA](https://www.bowls.org.hk/) -- 44 clubs in Hong Kong
- [Irish Lawn Bowls](https://irishlawnbowls.ie/about-us/) -- 30 clubs, ~2,000 members

### Competitor Software (MEDIUM-HIGH confidence)
- [Bowlr](https://www.bowlr.co.uk/) -- UK club management, 185+ clubs, from 8 GBP/month
- [PAMI](https://pamibowls.com/) -- Tournament calculator, dongle-based, since 2011
- [Drawmaker Express](https://easyusesystems.com.au/) -- Draw generation, $145 AUD, 150+ clubs
- [BowlsLink](https://bowlslink.com.au/) -- Australia national platform
- [BowlsManager](https://www.bowlsmanager.com/) -- UK, 415 GBP/year
- [Bowls Hub](https://www.bowls-hub.co.uk/) -- UK, 100+ features
- [Torny](https://torny.co/) -- AI training app, individual player focus
- [PlayPass](https://playpass.com/sports-software/lawn-bowls-management) -- Generic sports scheduling
- [Lawn Bowling Club Manager](https://lawnbowlingclubmanager.com/) -- Volunteer-built
- [Free Lawn Bowls Software](https://freelawnbowlssoftware.weebly.com/) -- Excel templates

### Market Trends (MEDIUM confidence)
- [Bowls England participation growth](https://www.bowlsengland.com/lawn-bowls-participation-continues-to-grow/)
- [Jack High Bowls - Is Lawn Bowls a Dying Sport?](https://www.jackhighbowls.com/help/is-lawn-bowls-a-dying-sport/)
- [CSA News - For the Love of Lawn Bowling](https://www.csanews.com/for-the-love-of-lawn-bowling/)
- [BowlsChat Community Forum](https://www.bowlschat.com/)
