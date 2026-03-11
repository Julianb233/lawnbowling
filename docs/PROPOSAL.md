# Lawnbowling — MVP Delivery Report & Proposal

**Prepared by:** AI Acrobatics
**Date:** March 10, 2026
**Status:** MVP Complete - Ready for Demo

---

## Executive Summary

**Lawnbowling** is a Progressive Web App (PWA) built for recreational sports venues where players check in, find partners, and get matched to courts for Pickleball, Lawn Bowling, Tennis, and other partner sports.

The app runs on **iPad (venue kiosk mode)** and **iPhone (personal device)** — no app store download required. Players simply visit the URL or "Add to Home Screen."

**The MVP is fully built, tested, and deployed.**

---

## What's Been Built (Complete Feature List)

### 1. Authentication & User Management
- Email + password signup and login
- Magic link (passwordless) login option
- Persistent sessions across browser refresh
- Admin role with elevated permissions
- Secure middleware protecting all routes

### 2. Player Profiles & Liability Waivers
- 3-step onboarding wizard: Profile -> Waiver -> Insurance
- Player profile with name, avatar photo, skill level, and preferred sports
- Avatar upload via cloud storage (Supabase Storage)
- Digital liability waiver with checkbox acceptance, timestamp, and IP logging
- Optional Daily Event Insurance integration link post-waiver
- Full profile editing

### 3. Live Availability Board (Real-Time)
- Players check in with one tap to appear on the live board
- Board updates **instantly** via WebSocket — no page refresh
- Filter by sport (Pickleball, Tennis, Lawn Bowling, etc.)
- Filter by skill level (Beginner, Intermediate, Advanced)
- Player cards show name, avatar, skill level, sports, and check-in time
- Live indicator showing count of online players

### 4. Partner Selection Flow
- Tap a player card to send a partner request with sport selection
- Target player sees a real-time toast notification with countdown timer
- Accept -> both players move to "Ready to Play" queue
- Decline -> both players return to the available board
- Requests auto-expire after 5 minutes to prevent stale matches

### 5. Court Management & Admin Panel
- **Court Status Board** — real-time view of which courts are playing, queued, or open (visible to players AND admins)
- **Match Timer** — counts up from match start, pulses red when overtime
- **Auto-assignment** — next queued pair auto-assigned when a court frees up
- **Admin Dashboard** — live stats: players online, matches today, courts in use, total players
- **Admin Controls:**
  - Create/edit/delete courts and lanes
  - Manage venue settings (name, address, timezone)
  - View all players and signed waivers with audit trail
  - View complete match history
  - Manual court assignment/override

### 6. PWA & Mobile Experience
- Installable on iPad and iPhone via "Add to Home Screen"
- Service worker caches assets for offline browsing
- iPad landscape kiosk mode — perfect for front desk display
- iPhone portrait mode — optimized for personal use
- All touch targets meet 44px minimum for accessibility
- Branded offline fallback page when network is unavailable
- Install prompt banner for first-time visitors

### 7. Security (Production-Grade)
- Row-Level Security (RLS) on every database table
- Server-side authentication on all 16+ API routes
- Admin routes protected with role verification (401/403 distinction)
- CSRF protection via Supabase Auth tokens
- Input validation and error handling on all endpoints
- Waiver acceptance audit trail (timestamp + IP + user-agent)
- Partner request ownership verification
- Court assignment restricted to admin users

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS |
| UI Components | Radix UI (accessible, headless) |
| Animations | Framer Motion |
| Backend/DB | Supabase (Postgres + Auth + Realtime + Storage) |
| PWA | Serwist (service worker + offline) |
| Hosting | Vercel (CDN + serverless) |

---

## User Flows

### Player Journey
```
Sign Up -> Create Profile -> Sign Waiver -> (Optional Insurance) -> Board

On the Board:
  Check In -> Browse Players -> Send Partner Request ->
  Wait for Accept -> Matched! -> Assigned to Court -> Play -> Done
```

### Admin Journey
```
Login (admin) -> Dashboard

From Dashboard:
  - Manage Courts (add/edit/delete)
  - View Players & Waivers
  - Assign Courts to Matched Pairs
  - View Match History
  - Configure Venue Settings
```

---

## What's Included

| Feature | Status |
|---------|--------|
| User auth (email + magic link) | Complete |
| Player profiles with avatar upload | Complete |
| Digital liability waiver with audit trail | Complete |
| Daily Event Insurance link | Complete |
| Real-time availability board | Complete |
| Sport & skill level filtering | Complete |
| Partner request/accept/decline with timer | Complete |
| Request expiration & auto-cleanup | Complete |
| Court management CRUD | Complete |
| Auto court assignment | Complete |
| Match timer with overtime indicator | Complete |
| Admin dashboard with live stats | Complete |
| Admin panel (players, waivers, matches, venue) | Complete |
| PWA install + offline support | Complete |
| iPad kiosk + iPhone portrait layouts | Complete |
| Production security audit | Complete |

**41 requirements — all implemented and verified.**

---

## v2 Roadmap (Future Enhancements)

| Feature | Description |
|---------|-------------|
| Smart Matching | Algorithm suggests balanced skill pairings |
| Tournament Brackets | Round robin bracket generator |
| Wait List Queue | Queue system when all courts are full |
| Player Stats | Games played, win rates, favorite partners |
| Leaderboard | Rankings by sport and skill level |
| Push Notifications | Partner requests, court openings |
| Multi-Venue | Support multiple venues under one account |
| QR Code Check-in | Scan to check in at each venue |

---

## Costs

### Monthly Operating Costs
| Service | Cost |
|---------|------|
| Supabase (free tier) | $0 |
| Vercel (hobby tier) | $0 |
| Custom domain (optional) | ~$1/mo |
| **Total** | **$0-1/month** |

### When You Scale
| Threshold | Upgrade | Cost |
|-----------|---------|------|
| 500MB+ database | Supabase Pro | $25/mo |
| Team features needed | Vercel Pro | $20/mo |
| Push notifications | OneSignal free tier | $0 |

---

## Next Steps

1. **Demo walkthrough** — Test the app, walk through each feature together
2. **Custom branding** — Update colors, logo, venue name to match your brand
3. **Go live** — Connect your custom domain
4. **Onboard staff** — Create admin accounts for venue managers
5. **Launch** — Roll out to your first venue

---

*Built by AI Acrobatics | March 2026*
