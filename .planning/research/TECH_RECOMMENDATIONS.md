# Technical Recommendations

**Project:** Pick-a-Partner lawn bowls tournament app
**Researched:** 2026-03-10
**Stack:** Next.js 15 + Supabase + Vercel (already established)

## Current Architecture Assessment

The existing codebase is solid. The bowls draw engine (`src/lib/bowls-draw.ts`) is well-structured with position pooling, format awareness, and flexible player handling. The kiosk mode, check-in flow, and real-time board are functional. The app is deployed as a PWA on Vercel.

**What needs to be added** is the second half of the tournament lifecycle: scoring, results, multi-round management, and history.

---

## Feature Recommendations (Priority Order)

### 1. Score Entry & Results Tracking
**Priority:** CRITICAL -- completes the core product loop
**Effort:** 3-4 days

**Database schema additions:**
```sql
-- Tournament rounds
CREATE TABLE bowls_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id TEXT NOT NULL,
  round_number INT NOT NULL,
  format TEXT NOT NULL, -- singles/pairs/triples/fours
  draw_data JSONB, -- full draw result snapshot
  status TEXT DEFAULT 'in_progress', -- in_progress, completed
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(tournament_id, round_number)
);

-- End-by-end scores
CREATE TABLE bowls_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES bowls_rounds(id),
  rink_number INT NOT NULL,
  end_number INT NOT NULL,
  team1_shots INT NOT NULL DEFAULT 0,
  team2_shots INT NOT NULL DEFAULT 0,
  entered_by UUID REFERENCES auth.users(id),
  entered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(round_id, rink_number, end_number)
);

-- Tournament metadata (upgrade from demo-bowls-tournament string)
CREATE TABLE bowls_tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  format TEXT NOT NULL,
  entry_fee DECIMAL(8,2),
  max_ends INT DEFAULT 12,
  max_rounds INT DEFAULT 3,
  status TEXT DEFAULT 'checkin', -- checkin, in_progress, completed
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**UI components needed:**
- Score entry form (select rink, tap to enter shots per end)
- Running scoreboard per rink
- Results summary after round completion
- Overall standings view

**Implementation notes:**
- Use Supabase Realtime on `bowls_scores` for live scoreboard updates
- Score entry should work on mobile (players entering their own scores) AND kiosk
- Validate: only one team scores per end (other team gets 0)
- Cap maximum shots per end at reasonable limit

### 2. Multi-Round Tournament Support
**Priority:** CRITICAL -- most tournaments are 2-4 rounds
**Effort:** 2-3 days

**What to build:**
- Round progression: after Round N scores are entered, enable Round N+1 draw
- "Winners play winners" seeding: rank teams by wins then shot differential, pair top vs top
- New draw options: "Full re-draw" vs "Seeded re-draw" vs "Swiss system"
- Track which round is active
- Display round tabs in the draw view

**Draw engine extension:**
```typescript
interface DrawOptions {
  format: BowlsGameFormat;
  seeding?: 'random' | 'winners_play_winners' | 'swiss';
  previousResults?: RoundResult[];
  avoidRepeats?: boolean; // don't pair same teams twice
}
```

**Key constraint from drawmaster best practice:** "No team plays on the same rink twice and the same two teams cannot play against each other more than once." Build this into the algorithm.

### 3. Live Scoreboard Display
**Priority:** HIGH -- wow factor for club adoption
**Effort:** 2-3 days

**What to build:**
- New route: `/bowls/scoreboard` (or `/kiosk/bowls/scoreboard`)
- Large-format display optimized for TV screens (1920x1080)
- Shows all rinks with current scores, updated via Supabase Realtime
- Auto-rotating between rinks if more than fit on screen
- Color-coded: green for completed ends, current end highlighted

**Design principles:**
- Minimum 48px font for scores (readable from across the room)
- High contrast (dark background, bright scores)
- Club branding area (logo, tournament name)
- No interaction needed -- pure display mode

**Reference:** Bowlr offers TV screen integration for rink diaries. We should exceed this with live scoring.

### 4. Tournament History & Player Stats
**Priority:** HIGH -- retention driver
**Effort:** 2-3 days

**What to build:**
- Tournament archive: list of past tournaments with date, format, participants, results
- Player profile enhancement: games played, win rate, average shots
- "Last tournament" quick view on home screen
- Basic attendance tracking (how many times has each player participated)

**Implementation:**
- Aggregate queries on `bowls_scores` joined to `bowls_rounds` and `bowls_tournaments`
- Player stats page showing performance over time
- Exportable to CSV for committee reports

### 5. Player Handicap System
**Priority:** MEDIUM -- adds competitive depth
**Effort:** 2 days

**What to build:**
- Handicap field on player profile (integer, 0-10 range)
- Display handicap on player cards during check-in
- Draw engine option: "Balance by handicap" -- distribute high/low handicap players evenly
- Handicap application in scoring: difference credited to lower-handicapped team
- Auto-adjustment: handicap recalculated based on recent results

**Handicap formula (based on UK club practice):**
- New players start at 0 (most shots given)
- Experienced players up to 8-10 (give shots away)
- Difference between two players' handicaps is applied as starting shots

### 6. Weather Integration
**Priority:** MEDIUM -- practical utility for outdoor sport
**Effort:** 1 day

**What to build:**
- Weather widget on tournament home page
- Current conditions: temperature, wind speed, rain probability
- 3-hour forecast (covers typical tournament duration)
- Alert banner if rain probability > 60% or wind > 30 km/h
- Optional: "abandon play" workflow with partial results saved

**API recommendation:** Open-Meteo (free, no API key required, good global coverage)
```typescript
// Free, no auth needed
const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,rain&hourly=precipitation_probability&forecast_hours=4`;
```

**Implementation:** Store venue coordinates in venue settings. Fetch on tournament page load, cache for 15 minutes.

### 7. Push Notifications
**Priority:** MEDIUM -- engagement between rounds
**Effort:** 1-2 days (web-push infrastructure already exists)

**What to build:**
- "Round starting" notification (5 min warning)
- "Your rink assignment" notification with rink number and teammates
- "Results are in" notification after scores are tallied
- "New tournament posted" for upcoming events

**Implementation notes:**
- Web Push API already partially built (`web-push` lazy-loaded in codebase)
- VAPID keys likely already configured
- Add notification triggers at key tournament state changes
- Respect user notification preferences (already have NotificationSettings component)

### 8. QR Code Check-In Enhancement
**Priority:** LOW-MEDIUM -- speeds up check-in for regulars
**Effort:** 1 day

**What to build:**
- Each player has a unique QR code (already have PlayerQRCode component)
- Kiosk QR scanner reads code, auto-checks player in
- Player still selects position preference after scan
- Skip the "find your name in the list" step

**Already exists in codebase:**
- `src/components/qr/QRScanner.tsx`
- `src/components/qr/PlayerQRCode.tsx`

Wire these into the bowls check-in flow.

### 9. Mix-and-Mingle Format Support
**Priority:** MEDIUM -- popular social format, differentiator
**Effort:** 2-3 days

**What to build:**
- New format: "Mix and Mingle" -- 4 rounds, partners rotate each round
- Algorithm ensures each player plays with different partners each round
- Pre-calculate all 4 round pairings at once
- Display all rounds upfront so players know their full schedule

**This is a genuine differentiator.** Mix and Mingle is one of the most popular social formats and no digital tool handles the rotation logic. Clubs currently use pre-printed scorecards from templates.

### 10. Print-Friendly Output
**Priority:** LOW -- but extremely practical
**Effort:** 0.5 days

**What to build:**
- CSS print stylesheet for draw results
- Print button on draw view
- Format: Rink number, Team 1 names/positions, vs Team 2 names/positions
- Include tournament name, date, format, round number

**Why:** Many clubs have a notice board. The drawmaster will print the draw and pin it up. Some older members will not look at screens.

---

## Architecture Decisions

### Keep It Simple: No Microservices
The entire tournament workflow runs fine as a single Next.js app with Supabase backend. There is no need for:
- Separate scoring service
- Message queue for notifications
- Separate API server

Supabase Realtime handles all real-time needs. Next.js API routes handle all server logic. Vercel handles scaling.

### Real-Time Strategy
Use Supabase Realtime subscriptions for:
- Check-in board (already working)
- Live scoreboard during play
- Results updates

Do NOT use polling for scores. The current 5-second poll for check-ins should be migrated to Supabase Realtime channel subscription for consistency.

### Data Model: Tournament as First-Class Entity
The current `demo-bowls-tournament` hardcoded ID needs to become a real `bowls_tournaments` table. This is the foundation for multi-round support, history, and stats.

### Offline Consideration
Score entry should work offline (queue scores in IndexedDB, sync when back online). Club greens may have poor WiFi. The PWA service worker is already set up -- extend it with a sync queue for score submissions.

---

## Technology Additions Needed

| Technology | Purpose | Already In Stack? |
|-----------|---------|------------------|
| Supabase Realtime channels | Live scoreboard | Yes, used for check-in board |
| Open-Meteo API | Weather widget | No -- free, no key needed |
| Web Push API | Notifications | Partially (web-push package exists) |
| CSS Print Media Queries | Print draw sheets | No -- trivial to add |
| IndexedDB (via idb) | Offline score queue | No -- small library |

No new major dependencies required. The existing stack handles everything.

---

## Performance Considerations

| Concern | At 1 Club | At 50 Clubs | At 500 Clubs |
|---------|-----------|-------------|-------------|
| Database load | Negligible | Negligible | Moderate -- index tournament_id columns |
| Realtime connections | 20-50 concurrent | 500-1000 | 5000-10000 -- may need Supabase Pro plan |
| Storage | Minimal | ~1 GB | ~10 GB -- mostly tournament history |
| API routes | Cold start fine | Warm | May need edge functions |

**Bottom line:** Supabase free tier handles dozens of clubs. Pro plan ($25/mo) handles hundreds. Scale is not a concern for the foreseeable future.

## Sources

- Existing codebase analysis: `/opt/agency-workspace/pick-a-partner/src/`
- Open-Meteo API: https://open-meteo.com/ (LOW confidence -- not verified in this session)
- Drawmaster constraints: https://greenbowler.blogspot.com/2014/10/how-to-run-lawn-bowls-tournament-as.html
- Mix and Mingle format: https://www.getagameofbowls.com/ggtour.php
- Handicap system: https://www.leatherheadbowling.co.uk/handicap-system
