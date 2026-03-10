# Feature Gap Analysis: Pick-a-Partner vs Competitors

**Project:** Pick-a-Partner lawn bowls tournament app
**Researched:** 2026-03-10
**Confidence:** MEDIUM-HIGH

## What We Have That Nobody Else Does

These are genuine differentiators. No competitor offers these.

| Feature | Our Implementation | Nearest Competitor |
|---------|-------------------|-------------------|
| **Position-based draw engine** | Players select preferred position (skip/vice/second/lead), algorithm pools and balances teams | Competitors do random-only or manual draws |
| **Kiosk check-in mode** | iPad kiosk with inactivity timeout, designed for club lobby | No competitor has kiosk mode |
| **Real-time check-in board** | Live view of who is checked in, with position counts | Paper tags on a board |
| **Multiple game formats** | Singles, pairs, triples, fours with position-aware draws | Most handle one format at a time |
| **Flexible player pooling** | Overflow/flexible pool for players whose position preference cannot be met | Manual adjustment only |
| **Modern mobile-first PWA** | Installable on iPad/iPhone, works offline | Bowls Hub has native apps, but no tournament-day features |
| **Partner selection flow** | Pick-a-partner matching for social bowls | Nobody has this |

## Features Competitors Have That We Are Missing

### Critical Gaps (competitors have, users expect)

| Feature | Who Has It | Complexity to Add | Priority |
|---------|-----------|-------------------|----------|
| **Score entry / results tracking** | PAMI, Bowlr, Bowls Hub, rollUp | Medium | HIGH -- without this, tournaments end and data vanishes |
| **Tournament standings/rankings** | PAMI, Bowlr, Bowls Hub | Medium | HIGH -- players want to see who won |
| **Match history** | Bowlr, Bowls Hub, BowlsManager | Low-Medium | HIGH -- "how did I do last month?" |
| **Multiple rounds per tournament** | PAMI, Bowlr, GitHub LawnBowls | Medium | HIGH -- most tournaments are 3-4 rounds |
| **Re-draw between rounds** | PAMI, drawmaster workflow | Medium | HIGH -- winners-play-winners format |

### Important Gaps (competitors have, nice-to-have)

| Feature | Who Has It | Complexity to Add | Priority |
|---------|-----------|-------------------|----------|
| **Player statistics** | Bowls Hub (win/loss, attendance) | Low | MEDIUM |
| **League/season management** | Bowlr, BowlsManager, Bowls Hub | High | MEDIUM -- different product scope |
| **Email notifications** | Bowlr, BowlsManager | Low | MEDIUM |
| **Membership management** | All Tier 1 competitors | High | LOW -- not our focus |
| **Financial reporting** | Bowlr, BowlsManager | Medium | LOW -- not our focus |
| **Club website builder** | LB Club Manager, LB Manager, BowlsManager | High | LOW -- not our focus |

### Not Gaps (competitors have but we deliberately skip)

| Feature | Why We Skip It |
|---------|---------------|
| Club website hosting | Not our product. We are tournament-day ops. |
| Membership fee collection | Clubs already have this via their management suite |
| Tea duty scheduling | Hilarious but real. Not our problem. |
| Sponsor management | Post-product-market-fit feature |

## Low-Hanging Fruit: Build This Week

These can be added to the existing codebase with minimal effort and maximum impact.

### 1. End-by-End Score Entry (2-3 days)
**What:** After draw is generated and teams are on rinks, allow score entry per end.
**Why now:** Completes the tournament workflow. Without scoring, the app is useful for 15 minutes (check-in + draw) then abandoned.
**Implementation:** New `bowls_scores` table. Simple form: select rink, enter Team 1 and Team 2 scores per end. Running total display.

### 2. Tournament Results & Winner Declaration (1-2 days)
**What:** Calculate winners based on total shots, display final standings.
**Why now:** Direct follow-on from score entry. The payoff moment.
**Implementation:** Aggregate scores per team across ends, rank by wins then shot differential. Display results page with podium/ranking.

### 3. Re-Draw for Subsequent Rounds (1-2 days)
**What:** After Round 1 results, generate Round 2 draw with "winners play winners, losers play losers" logic.
**Why now:** Most tournaments are multi-round. Single-round only is a hard limitation.
**Implementation:** Extend draw engine to accept previous round results as seeding input. Track round number.

### 4. Tournament History (1 day)
**What:** Save completed tournament results. View past tournaments.
**Why now:** Players ask "who won last week?" every single week.
**Implementation:** `tournaments` table with status (active/completed), link results to tournament. Simple list view.

### 5. Print / Share Draw (0.5 days)
**What:** Print-friendly view of the draw for posting on the clubhouse notice board.
**Why now:** Clubs will want a paper backup. Older members may not use phones.
**Implementation:** CSS print stylesheet for draw view. Share button using Web Share API.

## High-Value Differentiators: Build This Month

These would make Pick-a-Partner the clear best-in-class for tournament day operations.

### 1. Live Scoreboard Display
**What:** TV/projector view showing all rinks, current scores, updated in real-time.
**Why:** Bowlr has TV integration for rink diaries. We should have it for live scoring.
**Effort:** Medium (new route with large-format display, Supabase Realtime subscription)

### 2. Player Handicap System
**What:** Track player handicaps (0-8 range), apply to draws for balanced competition.
**Why:** Handicaps are fundamental to competitive bowls. Draws become meaningfully fairer.
**Effort:** Medium (handicap field on player, adjustment in draw algorithm)

### 3. Weather Integration
**What:** Show current weather and forecast. Alert if conditions may cause abandonment.
**Why:** Outdoor sport. Weather determines if play continues. Currently players check their phones.
**Effort:** Low (weather API call, display widget)

### 4. Push Notifications
**What:** "Your rink is ready" / "Round 2 starting in 5 minutes" / "Results are in"
**Why:** Players wander to the bar between rounds. Notifications bring them back.
**Effort:** Low-Medium (web push already partially built in the codebase)

### 5. QR Code Check-In
**What:** Players scan a QR code to check in instead of finding their name in a list.
**Why:** Faster check-in, especially for large tournaments (40+ players).
**Effort:** Low (QR scanner component already exists in codebase)

## Feature Priority Matrix

```
                    HIGH VALUE
                       |
    Score Entry -------|------- Live Scoreboard
    Results            |       Handicap System
    Multi-Round Draw   |
    Tournament History |       Weather Widget
                       |
    LOW EFFORT --------|-------- HIGH EFFORT
                       |
    Print/Share Draw   |       League Management
    QR Check-In        |       Membership Mgmt
    Player Stats       |       Club Website
                       |
                    LOW VALUE
```

**Recommended build order:**
1. Score Entry + Results (completes the core loop)
2. Multi-Round Draw (makes tournaments real)
3. Tournament History (retention / return visits)
4. Print/Share Draw (quick win, practical value)
5. Live Scoreboard (wow factor for clubs)
6. Handicap System (competitive play depth)
7. Push Notifications (engagement)
8. Weather Widget (polish)

## Sources

- Feature analysis based on competitor research in COMPETITOR_APPS.md
- Drawmaster workflow: https://greenbowler.blogspot.com/2014/10/how-to-run-lawn-bowls-tournament-as.html
- Tournament formats: https://www.getagameofbowls.com/ggtour.php
- Bowls Hub features: https://www.bowls-hub.co.uk/
- Bowlr features: https://www.bowlr.co.uk/
