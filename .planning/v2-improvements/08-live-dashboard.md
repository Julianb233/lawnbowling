# PRD: Live Tournament Dashboard

## Problem Statement
The `/tv` route displays a basic static scoreboard but does not auto-rotate between views, update in real time, or present the variety of information a clubhouse audience needs throughout a tournament day. Clubs are left with a single frozen view that requires manual refresh and fails to showcase standings, upcoming draws, weather, or announcements — wasting the potential of a dedicated clubhouse display.

## Goal
Deliver a full-screen auto-rotating dashboard for clubhouse TVs that cycles beautifully through live scores, standings, upcoming draw, weather, and announcements, with real-time Supabase updates, animated transitions, and support for any display size or aspect ratio.

## User Stories
- As a club spectator watching the TV screen, I want to see all the important tournament information cycle automatically so that I can stay informed without touching anything.
- As a drawmaster, I want the TV to show live scores updating in real time so that everyone in the club can follow the action without asking me.
- As a club administrator, I want to push a text announcement to the TV screen so that I can communicate schedule changes or notices to everyone in the room.
- As a player waiting for their rink, I want to see the upcoming draw on the TV so that I know when and where to go without checking my phone.
- As a club with an older TV, I want the dashboard to work on any display resolution and aspect ratio so that the investment in the feature is not gated by hardware.

## Requirements

1. **REQ-LD-01**: The dashboard must implement a carousel of at minimum four slide types: (a) Live Scores, (b) Current Standings, (c) Next Draw / Upcoming Rinks, (d) Weather + Announcements.
2. **REQ-LD-02**: The carousel must auto-advance on a configurable interval (default 12 seconds per slide). The interval must be adjustable via a query parameter (`?interval=<seconds>`) to allow per-venue customization without a code change.
3. **REQ-LD-03**: Slide transitions must use a smooth animated crossfade or horizontal slide animation (≤ 600 ms, easing: ease-in-out). Transitions must not cause layout shift or scrollbars.
4. **REQ-LD-04**: Live Scores slide must display all active rinks with current end-by-end scores, team names, and rink number. It must update in real time via Supabase Realtime subscription without requiring a page refresh.
5. **REQ-LD-05**: If there are more active rinks than fit on one screen, the Live Scores slide must sub-rotate through groups of rinks (e.g. 4 per screen) before advancing to the next slide type.
6. **REQ-LD-06**: Current Standings slide must display the tournament leaderboard ordered by wins, points differential, or the tournament's configured ranking method.
7. **REQ-LD-07**: Next Draw slide must show the next scheduled draw: rink assignments, team names, and start time. If no next draw exists, this slide must be skipped.
8. **REQ-LD-08**: Weather + Announcements slide must display current conditions (temperature, wind, conditions icon) fetched from the existing weather data source, alongside any active admin announcements.
9. **REQ-LD-09**: Admin announcements must be creatable and deletable from the existing admin interface (or a minimal new admin UI component). Announcements must be stored in Supabase and update on the TV in real time.
10. **REQ-LD-10**: The dashboard must be fully responsive and render correctly at 1920×1080 (Full HD), 3840×2160 (4K), and 1280×720 (HD Ready) without horizontal scrolling or text overflow.
11. **REQ-LD-11**: Text must use viewport-relative units (`vw`, `vh`, `clamp()`) so that content scales proportionally with screen size rather than requiring breakpoint overrides.
12. **REQ-LD-12**: The dashboard must display a persistent header strip showing the tournament name, current date/time (live updating every second), and club logo.
13. **REQ-LD-13**: A subtle progress bar below the header must indicate time remaining on the current slide before it advances.
14. **REQ-LD-14**: The dashboard URL (`/tv`) must continue to function as a standalone full-screen page; no site navigation, header, or footer should be visible.
15. **REQ-LD-15**: Supabase subscriptions must include reconnection logic — if the connection drops, the dashboard must display a subtle "Reconnecting…" indicator and resume updates automatically once reconnected.
16. **REQ-LD-16**: The carousel must pause rotation when the browser tab is hidden (using the Page Visibility API) to conserve resources on background tabs, resuming when the tab becomes visible again.
17. **REQ-LD-17**: A `?slide=<type>` query parameter must allow locking the dashboard to a single slide type (e.g. `?slide=scores`) for venues that only want one view.
18. **REQ-LD-18**: Each slide component must be independently loadable and testable in isolation via a `?preview=<slide-type>` query parameter for drawmaster setup and configuration.

## Success Criteria
- The TV dashboard auto-rotates through all four slide types without manual interaction.
- A score change entered on a mobile device appears on the TV Live Scores slide within 3 seconds.
- An admin announcement created in the admin UI appears on the TV within 5 seconds.
- The dashboard displays without horizontal scrollbars or overflow at all three target resolutions.
- When the Supabase connection is interrupted, the dashboard shows a reconnection indicator and recovers automatically.
- The carousel pauses when the tab is backgrounded and resumes correctly when brought to the foreground.
- The `?interval=`, `?slide=`, and `?preview=` query parameters all work as specified.

## Technical Approach
- **`src/app/tv/page.tsx`**: Refactor into a carousel shell. Extract existing scoreboard into a `LiveScoresSlide` component. Add `useCarousel` hook managing slide index, interval timer, and Page Visibility listener.
- **New `src/components/tv/` directory**: One file per slide type — `LiveScoresSlide.tsx`, `StandingsSlide.tsx`, `NextDrawSlide.tsx`, `WeatherAnnouncementsSlide.tsx`, `DashboardHeader.tsx`, `ProgressBar.tsx`.
- **`useSupabaseRealtime` hook**: Centralize the subscription logic with reconnect handling. Subscribe to score changes, standings updates, and announcements table.
- **Announcements**: Add a `tv_announcements` table in Supabase (id, message, active, created_at). Admin UI gets a minimal announcement form. Real-time subscription pushes updates to the TV.
- **Responsive text**: Use `clamp()` for font sizes in the TV-specific CSS module. Test with browser DevTools at 720p, 1080p, and 4K viewport sizes.
- **Slide transitions**: CSS `@keyframes fadeSlide` applied via class addition; outgoing slide gets `exit` class, incoming gets `enter` class, managed by the carousel hook.

## Scope & Constraints
**In scope**: Four slide types, auto-rotation, real-time updates, admin announcements, responsive scaling, Supabase reconnect handling, query parameter controls.
**Out of scope**: Custom slide ordering per venue (use `?slide=` lock), video backgrounds, sound alerts on score changes, multi-tournament simultaneous display, mobile-specific TV remote control UI.
**Risks**: Supabase Realtime connection reliability in club environments with spotty Wi-Fi — the reconnection requirement is critical. Large numbers of active rinks may make the Live Scores slide too dense; the sub-rotation requirement (REQ-LD-05) mitigates this but requires careful implementation.

## Estimated Effort
M
