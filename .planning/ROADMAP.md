# Roadmap: Pick a Partner

## Overview

Pick a Partner is a PWA for recreational sports venues where players check in, find partners, and get matched to courts for Pickleball, Lawn Bowling, Tennis, and other partner sports. The build starts with project foundation and auth, layers on player profiles with liability waivers, builds the real-time availability board and partner selection flow, adds court management and admin, and finishes with PWA optimization and deploy.

## Phases

- [x] **Phase 1: Foundation & Auth** - Project setup, Supabase, auth flow, database schema
- [x] **Phase 2: Player Profiles & Waivers** - Registration with profiles, liability waiver, DEI integration
- [x] **Phase 3: Live Availability Board** - Real-time check-in/out board with filtering
- [x] **Phase 4: Partner Selection** - Pick/request/accept flow, match queue
- [x] **Phase 5: Court Management & Admin** - Court/lane assignment, timers, admin panel
- [x] **Phase 6: PWA, Polish & Deploy** - Service worker, responsive polish, Vercel deploy
- [ ] **Phase 7: Bowls Tournament Production Launch** - Dynamic tournaments, real data, competitor features

## Phase Details

### Phase 1: Foundation & Auth
**Goal**: Working Next.js app with Supabase backend, auth, and complete database schema
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):
  1. User can sign up and log in via Supabase Auth (magic link or email+password)
  2. User session persists across browser refresh
  3. Admin role exists and is distinguishable from regular user
  4. Database schema is deployed with all tables (players, partner_requests, matches, courts, venues, waivers)
  5. App runs locally and builds without errors
**Plans**: 2 plans

Plans:
- [x] 01-01: Next.js project scaffold, Supabase setup, Tailwind + Radix UI config
- [x] 01-02: Auth flow (signup/login/logout), database schema migration, admin role seeding

### Phase 2: Player Profiles & Waivers
**Goal**: Users can register with full profiles and sign a liability waiver before playing; optional DEI insurance offered
**Depends on**: Phase 1
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04, PROF-05, WAIV-01, WAIV-02, WAIV-03, WAIV-04, WAIV-05, INSR-01, INSR-02, INSR-03
**Success Criteria** (what must be TRUE):
  1. New user completes profile (name, photo, skill level, sports) during registration
  2. User must accept liability waiver before accessing the availability board
  3. Waiver acceptance is logged with timestamp and IP address
  4. After waiver, user is offered optional Daily Event Insurance link
  5. Admin can view all signed waivers
**Plans**: 2 plans

Plans:
- [x] 02-01: Player profile CRUD (create, read, update), avatar upload via Supabase Storage
- [x] 02-02: Liability waiver flow, waiver admin view, DEI integration link

### Phase 3: Live Availability Board
**Goal**: Real-time board showing available players, with check-in/out and filtering by sport/skill
**Depends on**: Phase 2
**Requirements**: AVAIL-01, AVAIL-02, AVAIL-03, AVAIL-04, AVAIL-05
**Success Criteria** (what must be TRUE):
  1. Player can check in and immediately appear on the live board
  2. Board updates in real-time when players check in/out (no page refresh needed)
  3. Board can be filtered by sport and skill level
  4. Each player card shows name, avatar, skill level, sports, and check-in time
  5. Works on both iPad landscape and iPhone portrait layouts
**Plans**: 2 plans

Plans:
- [x] 03-01: Check-in/out toggle, Supabase Realtime subscription, available players query
- [x] 03-02: Board UI (player cards grid), sport/skill filters, responsive iPad + iPhone layouts

### Phase 4: Partner Selection
**Goal**: Full partner pick/request/accept flow — users can pick a partner, get matched, and enter the play queue
**Depends on**: Phase 3
**Requirements**: PICK-01, PICK-02, PICK-03, PICK-04, PICK-05, MATCH-01
**Success Criteria** (what must be TRUE):
  1. User can tap a player card to send a partner request
  2. Target player sees the request and can accept or decline
  3. Accepted pair moves to the "Ready to Play" queue
  4. Declined requests return both players to the available board
  5. Expired requests are auto-cleaned after timeout
**Plans**: 2 plans

Plans:
- [x] 04-01: Partner request API (create, accept, decline, expire), real-time request notifications
- [x] 04-02: Request modal UI, match queue display, request status handling

### Phase 5: Court Management & Admin
**Goal**: Courts/lanes can be managed, assigned to matched pairs with timers; admin panel for full venue control
**Depends on**: Phase 4
**Requirements**: MATCH-02, MATCH-03, MATCH-04, MATCH-05, ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05
**Success Criteria** (what must be TRUE):
  1. Admin can create/edit/delete courts and lanes
  2. Matched pairs can be assigned to open courts (manual or auto)
  3. Court status board shows which courts are playing, queued, or open
  4. Match timer shows elapsed/remaining time per court
  5. Completing a match frees the court for the next queued pair
**Plans**: 2 plans

Plans:
- [x] 05-01: Court CRUD, court assignment logic, match timer, court status board
- [x] 05-02: Admin panel (venue settings, player management, waiver viewer, match history)

### Phase 6: PWA, Polish & Deploy
**Goal**: Installable PWA on iPad/iPhone, responsive polish, production deploy to Vercel
**Depends on**: Phase 5
**Requirements**: PWA-01, PWA-02, PWA-03, PWA-04
**Success Criteria** (what must be TRUE):
  1. App can be installed on iPad and iPhone via "Add to Home Screen"
  2. Service worker caches assets for offline browsing
  3. iPad landscape kiosk mode and iPhone portrait mode both work smoothly
  4. All touch targets are 44px minimum
  5. App is deployed to Vercel and accessible via pick-a-partner.vercel.app
**Plans**: 2 plans

Plans:
- [x] 06-01: PWA manifest, service worker (Serwist), install prompt, offline support
- [x] 06-02: Responsive polish (iPad landscape + iPhone portrait), accessibility pass, Vercel deploy

### Phase 7: Bowls Tournament Production Launch
**Goal**: Connect bowls to real tournament data, add competitor-inspired features, make production-ready
**Depends on**: Phase 6
**Requirements**: BOWLS-01 (migration), BOWLS-02 (dynamic routing), BOWLS-03 (tournament CRUD), BOWLS-04 (nav integration), BOWLS-05 (seed data), BOWLS-06 (kiosk update)
**Success Criteria** (what must be TRUE):
  1. bowls_checkins table exists in Supabase
  2. /bowls shows tournament list with active/past tournaments
  3. /bowls/[id] shows check-in/board/draw for specific tournament
  4. New tournament can be created via modal
  5. Demo seed data includes a bowls tournament with check-ins
  6. BottomNav includes Bowls link
  7. Kiosk mode works with dynamic routing
  8. npm run build passes
**Plans**: 2 plans

Plans:
- [ ] 07-01: Migration, dynamic routing, tournament CRUD API
- [ ] 07-02: Tournament modal, seed data, kiosk update, nav, build verification

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Auth | 2/2 | Complete | 2026-03-09 |
| 2. Player Profiles & Waivers | 2/2 | Complete | 2026-03-09 |
| 3. Live Availability Board | 2/2 | Complete | 2026-03-09 |
| 4. Partner Selection | 2/2 | Complete | 2026-03-09 |
| 5. Court Management & Admin | 2/2 | Complete | 2026-03-09 |
| 6. PWA, Polish & Deploy | 2/2 | Complete | 2026-03-10 |
| 7. Bowls Tournament Production Launch | 0/2 | In Progress | - |
