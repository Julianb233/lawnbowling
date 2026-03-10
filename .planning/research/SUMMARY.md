# Research Summary: Pick-a-Partner Lawn Bowls Tournament App

**Domain:** Lawn bowls tournament-day operations (check-in, draw, scoring, results)
**Researched:** 2026-03-10
**Overall confidence:** MEDIUM-HIGH

## Executive Summary

The lawn bowls tournament software market is fragmented and underserved. Existing products fall into two categories: full club management suites (Bowlr, BowlsManager, Bowls Hub) that handle memberships, leagues, and admin but treat tournament-day operations as an afterthought; and desktop scoring tools (PAMI, Drawmaker) that calculate results but lack check-in, draw generation, or modern interfaces. No product in the market offers a real-time, mobile-first tournament-day operations tool with position-based draw generation.

Pick-a-Partner occupies a genuine whitespace. The kiosk check-in, position-preference draw engine, and modern PWA interface are features no competitor offers. However, the app currently covers only the first half of a tournament day -- check-in and draw generation. The critical gap is everything that happens after the draw: scoring, results, multi-round progression, and history. Without these, the app is useful for 15 minutes then abandoned.

The competitive moat is not in club management (Bowlr owns that space in the UK, and club management suites are commoditized). The moat is in tournament-day UX: making the drawmaster's job trivially easy, giving players instant visibility into their assignments and scores, and creating a tournament record that persists beyond the day. The fastest path to product-market fit is completing the tournament lifecycle loop: check-in, draw, score, results, history.

The demographic reality matters: lawn bowls players skew older (60+). The app must be extremely simple to use, with large touch targets (already implemented at 44px minimum), high-contrast displays, and minimal steps. The kiosk mode is the right approach -- a shared iPad in the clubhouse where a volunteer operates the draw, rather than requiring every 75-year-old to download an app.

## Key Findings

**Stack:** Existing Next.js 15 + Supabase + Vercel stack is perfect. No new major dependencies needed. Open-Meteo (free weather API) is the only external addition worth considering.

**Architecture:** Keep it monolithic. Supabase Realtime handles all real-time needs. The tournament should become a first-class database entity (currently hardcoded as `demo-bowls-tournament`).

**Critical pitfall:** Building the app as a club management suite. That market is crowded and solved. Stay focused on tournament-day operations.

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Phase 7: Tournament Lifecycle** - Score entry, results calculation, multi-round draws
   - Addresses: The #1 gap vs competitors (no post-draw workflow)
   - Avoids: Scope creep into club management
   - This is the most important phase. Without it, the product is a demo.

2. **Phase 8: Tournament Management** - Tournament creation, history, archival, player stats
   - Addresses: "Who won last week?" question, committee reporting needs
   - Builds on: Phase 7 data (scores and results feed into history)

3. **Phase 9: Live Display & Engagement** - TV scoreboard, push notifications, weather widget
   - Addresses: Club presentation needs, player engagement between rounds
   - This is the "wow factor" phase that sells clubs on adoption

4. **Phase 10: Competitive Depth** - Handicap system, Mix-and-Mingle format, advanced draw algorithms
   - Addresses: Differentiation from simple random-draw tools
   - Avoids: Over-engineering before product-market fit

**Phase ordering rationale:**
- Phase 7 first because the app is incomplete without scoring and results
- Phase 8 second because history/stats drive return visits and prove value to committees
- Phase 9 third because live displays and notifications are the "sell" to club decision-makers
- Phase 10 last because competitive features require a user base to validate

**Research flags for phases:**
- Phase 7: Standard patterns, straightforward implementation
- Phase 8: Likely needs deeper research on what stats clubs actually want for committee reports
- Phase 9: TV display optimization may need field testing at actual clubs
- Phase 10: Mix-and-Mingle rotation algorithm needs careful design (combinatorial problem)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Competitor landscape | MEDIUM-HIGH | Surveyed 10+ products. Some (BowlsLink, Bowls Connect, MyLawnBowls, ClubsOnline) could not be found -- may be regional/deprecated or incorrectly named |
| Feature gaps | HIGH | Clear from both competitor analysis and drawmaster workflow research |
| Tournament best practices | HIGH | Verified against multiple drawmaster guides and tournament organizer resources |
| Technical recommendations | HIGH | Based on existing codebase analysis and well-understood patterns |
| Pricing data | LOW | Most competitors do not publicly disclose pricing |

## Gaps to Address

- **BowlsLink, Bowls Connect, MyLawnBowls, ClubsOnline:** Could not find these as distinct products. They may be regional names, defunct products, or incorrectly named. This does not materially affect the analysis since the market is well-covered by the products we did find.
- **User sentiment/reviews:** Very few public reviews for any lawn bowls software. The market is too niche for App Store review volumes. Would need direct user interviews.
- **Pricing intelligence:** Only BowlsManager (GBP 415/yr) and Bowls Hub (GBP 150-400/yr) disclose pricing. Bowlr and others are quote-based.
- **Club adoption friction:** Unknown how clubs actually decide to adopt new software. Need field research (talk to club secretaries/committees).

## Files Created

| File | Purpose |
|------|---------|
| `.planning/research/SUMMARY.md` | This file -- executive summary with roadmap implications |
| `.planning/research/COMPETITOR_APPS.md` | Detailed competitor analysis (10+ products) |
| `.planning/research/FEATURE_GAP_ANALYSIS.md` | What we have, what we lack, build priorities |
| `.planning/research/BEST_PRACTICES.md` | Tournament workflows, formats, player/organizer needs |
| `.planning/research/TECH_RECOMMENDATIONS.md` | Technical features to build with implementation details |
