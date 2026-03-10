# Requirements: Pick a Partner

**Defined:** 2026-03-09
**Core Value:** Players at recreational sports venues can quickly find and team up with partners for activities like Pickleball and Lawn Bowling

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can sign up with email (magic link or email+password via Supabase Auth)
- [ ] **AUTH-02**: User can log in and maintain a persistent session across browser refresh
- [ ] **AUTH-03**: User can log out from any device
- [ ] **AUTH-04**: Admin users have elevated permissions (manage venue, courts, players)

### Player Profiles

- [ ] **PROF-01**: User can create a player profile with name and avatar photo
- [ ] **PROF-02**: User can set skill level (beginner/intermediate/advanced)
- [ ] **PROF-03**: User can select preferred sports (pickleball, lawn bowling, tennis, etc.)
- [ ] **PROF-04**: User can view other players' profiles
- [ ] **PROF-05**: User can edit their own profile

### Liability Waiver

- [ ] **WAIV-01**: New users must sign a digital liability waiver during registration before they can play
- [ ] **WAIV-02**: Waiver includes checkbox acceptance + timestamp + IP logging
- [ ] **WAIV-03**: Waiver acceptance is stored in the database with audit trail
- [ ] **WAIV-04**: Admin can view all signed waivers with date/time/player info
- [ ] **WAIV-05**: Waiver text is configurable per venue by admin

### Daily Event Insurance Integration

- [ ] **INSR-01**: After waiver signing, users are offered optional event insurance via Daily Event Insurance
- [ ] **INSR-02**: DEI microsite check-in flow is embedded/linked for insurance purchase
- [ ] **INSR-03**: Insurance status is visible on the player's profile (insured/not insured)

### Availability & Check-in

- [ ] **AVAIL-01**: Player can check in to mark themselves as available at a venue
- [ ] **AVAIL-02**: Player can check out to remove themselves from the available board
- [ ] **AVAIL-03**: Available players appear on a live board in real-time (Supabase Realtime)
- [ ] **AVAIL-04**: Board is filterable by sport and skill level
- [ ] **AVAIL-05**: Check-in time is displayed on each player card

### Partner Selection

- [ ] **PICK-01**: User can tap another player's card to send a partner request
- [ ] **PICK-02**: Target player receives the request and can accept or decline
- [ ] **PICK-03**: Accepted pair moves to the "Ready to Play" match queue
- [ ] **PICK-04**: Declined requests return both players to the available board
- [ ] **PICK-05**: Pending requests expire after a configurable timeout

### Match Queue & Courts

- [ ] **MATCH-01**: Matched pairs appear in a "Ready to Play" queue
- [ ] **MATCH-02**: Admin or system can assign a court/lane to a matched pair
- [ ] **MATCH-03**: Courts/lanes show status (open, playing, queued) on the board
- [ ] **MATCH-04**: Match timer shows how long a game has been running
- [ ] **MATCH-05**: Completed matches free up the court for the next queued pair

### Admin Panel

- [ ] **ADMIN-01**: Admin can manage venue details (name, address, timezone)
- [ ] **ADMIN-02**: Admin can add/remove/edit courts and lanes
- [ ] **ADMIN-03**: Admin can add/remove sports available at the venue
- [ ] **ADMIN-04**: Admin can view all players, waivers, and match history
- [ ] **ADMIN-05**: Admin can manually assign/unassign courts

### PWA & Responsive

- [ ] **PWA-01**: App is installable on iPad and iPhone via "Add to Home Screen"
- [ ] **PWA-02**: App works in iPad landscape (venue kiosk) and iPhone portrait (personal)
- [ ] **PWA-03**: Touch-friendly UI with large tap targets (44px minimum)
- [ ] **PWA-04**: Service worker enables basic offline browsing of cached data

## v2 Requirements

### Advanced Matching

- **ADVMATCH-01**: Algorithm suggests balanced skill pairings
- **ADVMATCH-02**: Round robin tournament bracket generator
- **ADVMATCH-03**: Wait list queue when all courts are full

### Stats & Social

- **STATS-01**: Track games played, win rates, favorite partners
- **STATS-02**: Leaderboard by sport and skill level
- **STATS-03**: Player match history

### Notifications

- **NOTIF-01**: Push notifications for partner requests
- **NOTIF-02**: Push notifications when a court opens up

### Multi-Venue

- **VENUE-01**: Support multiple venues under one account
- **VENUE-02**: QR code check-in at each venue

## Out of Scope

| Feature | Reason |
|---------|--------|
| Payment processing for memberships | Not core to partner selection; venues handle billing separately |
| Video/live streaming of matches | High bandwidth cost, not needed for MVP |
| Chat/messaging between players | Partner request flow is sufficient for coordination |
| Native iOS/Android app | PWA covers mobile needs for MVP |
| Automated skill rating (ELO) | Manual skill levels sufficient for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| PROF-01 | Phase 2 | Pending |
| PROF-02 | Phase 2 | Pending |
| PROF-03 | Phase 2 | Pending |
| PROF-04 | Phase 2 | Pending |
| PROF-05 | Phase 2 | Pending |
| WAIV-01 | Phase 2 | Pending |
| WAIV-02 | Phase 2 | Pending |
| WAIV-03 | Phase 2 | Pending |
| WAIV-04 | Phase 2 | Pending |
| WAIV-05 | Phase 2 | Pending |
| INSR-01 | Phase 2 | Pending |
| INSR-02 | Phase 2 | Pending |
| INSR-03 | Phase 2 | Pending |
| AVAIL-01 | Phase 3 | Pending |
| AVAIL-02 | Phase 3 | Pending |
| AVAIL-03 | Phase 3 | Pending |
| AVAIL-04 | Phase 3 | Pending |
| AVAIL-05 | Phase 3 | Pending |
| PICK-01 | Phase 4 | Pending |
| PICK-02 | Phase 4 | Pending |
| PICK-03 | Phase 4 | Pending |
| PICK-04 | Phase 4 | Pending |
| PICK-05 | Phase 4 | Pending |
| MATCH-01 | Phase 4 | Pending |
| MATCH-02 | Phase 5 | Pending |
| MATCH-03 | Phase 5 | Pending |
| MATCH-04 | Phase 5 | Pending |
| MATCH-05 | Phase 5 | Pending |
| ADMIN-01 | Phase 5 | Pending |
| ADMIN-02 | Phase 5 | Pending |
| ADMIN-03 | Phase 5 | Pending |
| ADMIN-04 | Phase 5 | Pending |
| ADMIN-05 | Phase 5 | Pending |
| PWA-01 | Phase 6 | Pending |
| PWA-02 | Phase 6 | Pending |
| PWA-03 | Phase 6 | Pending |
| PWA-04 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 41 total
- Mapped to phases: 41
- Unmapped: 0

---
*Requirements defined: 2026-03-09*
*Last updated: 2026-03-09 after roadmap creation*
