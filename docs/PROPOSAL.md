# Pick a Partner — Project Proposal

## Overview

**Pick a Partner** is a Progressive Web App (PWA) for recreational sports clubs and venues where players can browse, select, and team up with partners for activities like **Pickleball**, **Lawn Bowling**, **Tennis Doubles**, and other partner-based sports.

The app runs on **iPad** (mounted at a venue/clubhouse) and **iPhone** (personal use), giving players a fast, visual way to find and claim partners before games.

---

## Problem

At recreational clubs and community sports venues, partner selection is currently handled via:
- Paper sign-up sheets
- Group texts / WhatsApp chaos
- Showing up and hoping someone's available

This leads to uneven skill matching, social friction, and wasted time.

## Solution

A clean, touch-friendly PWA where:
1. **Players register** with name, photo, skill level, and preferred sports
2. **Available players** show up on a live board (like a sports draft board)
3. **Anyone can "pick" a partner** — tap a player card to request a pairing
4. **Matched pairs** move to the "Ready to Play" queue
5. **Court/lane assignment** happens automatically or manually
6. **History tracks** who played with whom, win/loss records (optional)

---

## Core Features (MVP)

| Feature | Description |
|---------|-------------|
| **User Auth** | Sign up / login (email + password or magic link via Supabase Auth) |
| **Player Profiles** | Name, photo, skill rating (beginner/intermediate/advanced), preferred sports |
| **Liability Waiver** | Digital waiver signing during registration (checkbox + signature pad, timestamped, IP-logged). Modeled after Daily Event Insurance's waiver flow — users must accept before they can play |
| **Daily Event Insurance Integration** | Partner microsite embed for optional event insurance coverage. Users can purchase liability coverage through the DEI check-in flow |
| **Live Availability Board** | Grid of available players, filterable by sport and skill level |
| **Partner Request** | Tap to send a partner request; other player accepts/declines |
| **Match Queue** | Paired teams appear in a "Ready to Play" list |
| **Court Assignment** | Manual or auto-assign courts/lanes with timer |
| **Check-in / Check-out** | Players toggle availability when they arrive/leave |
| **PWA Install** | Add to Home Screen on iPad/iPhone, works offline for basic browsing |
| **Admin Panel** | Manage players, courts, sports, view waivers, and manage activity |

## Post-MVP Features

| Feature | Description |
|---------|-------------|
| **Skill-based matching** | Algorithm suggests balanced pairings |
| **Round Robin generator** | Auto-create tournament brackets |
| **Wait list** | Queue when all courts are full |
| **Stats & Leaderboard** | Track games played, win rates, favorite partners |
| **Push notifications** | Alert when a partner request comes in |
| **Multi-venue support** | One app, multiple locations |
| **QR code check-in** | Scan at the venue to mark yourself available |

---

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | Next.js 15 (App Router) | SSR + PWA support, React ecosystem |
| **UI** | Tailwind CSS + Radix UI | Fast, touch-friendly, accessible |
| **Database** | Supabase (Postgres + Realtime) | Real-time availability updates, auth built-in |
| **Auth** | Supabase Auth (magic link or Google) | No passwords for casual sports players |
| **Hosting** | Vercel | Instant deploys, edge functions |
| **PWA** | next-pwa / Serwist | Service worker, offline support, installable |
| **Real-time** | Supabase Realtime (WebSockets) | Live board updates when players check in/out |
| **Media** | Supabase Storage | Player profile photos |

---

## Timeline

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| **Phase 1: Foundation** | 3 days | Project setup, DB schema, auth, player profiles |
| **Phase 2: Live Board** | 3 days | Availability board, check-in/out, filtering |
| **Phase 3: Partner Matching** | 3 days | Request/accept flow, match queue, notifications |
| **Phase 4: Court Management** | 2 days | Court/lane assignment, timers, admin panel |
| **Phase 5: PWA & Polish** | 2 days | Service worker, install prompt, offline, responsive |
| **Phase 6: Deploy & Test** | 1 day | Vercel deploy, real-device testing, QA |

**Total MVP: ~14 days** (solo agent execution)

---

## Milestone Payment Structure

| Milestone | Deliverable | Payment |
|-----------|-------------|---------|
| **M1: Setup + Profiles** | Working auth, player registration, profile CRUD | 20% |
| **M2: Live Board** | Real-time availability board on iPad + iPhone | 25% |
| **M3: Partner Matching** | Full pick/request/accept flow working | 25% |
| **M4: Court Management + Admin** | Court assignment, admin panel, timers | 15% |
| **M5: PWA + Launch** | Installable PWA, deployed, tested on real devices | 15% |

---

## Device Targets

- **Primary**: iPad (landscape, mounted at venue) — 1024x768 / 1366x1024
- **Secondary**: iPhone (portrait, personal use) — 390x844 / 430x932
- **Tertiary**: Desktop browser (admin panel)

---

## Database Schema (Draft)

```sql
-- Players
players (
  id uuid PK,
  name text,
  avatar_url text,
  skill_level enum('beginner', 'intermediate', 'advanced'),
  sports text[],           -- ['pickleball', 'lawn_bowling']
  is_available boolean,
  checked_in_at timestamp,
  created_at timestamp
)

-- Partner Requests
partner_requests (
  id uuid PK,
  requester_id uuid FK → players,
  target_id uuid FK → players,
  sport text,
  status enum('pending', 'accepted', 'declined', 'expired'),
  created_at timestamp,
  responded_at timestamp
)

-- Matches
matches (
  id uuid PK,
  sport text,
  court_id uuid FK → courts,
  started_at timestamp,
  ended_at timestamp,
  status enum('queued', 'playing', 'completed')
)

-- Match Players (junction)
match_players (
  match_id uuid FK → matches,
  player_id uuid FK → players,
  team smallint           -- 1 or 2
)

-- Courts / Lanes
courts (
  id uuid PK,
  name text,              -- 'Court 1', 'Lane 3'
  sport text,
  is_available boolean,
  venue_id uuid FK → venues
)

-- Venues
venues (
  id uuid PK,
  name text,
  address text,
  timezone text
)
```

---

## What It Takes

### To Build
- 1 full-stack agent (or developer) for ~2 weeks
- Supabase project (free tier covers MVP)
- Vercel deployment (free tier)
- No external API costs for MVP

### To Run (Monthly)
- Supabase: Free tier (up to 500MB DB, 50K auth users)
- Vercel: Free tier (hobby)
- Domain (optional): ~$12/year
- **Total ongoing cost: $0–12/month for MVP**

### To Scale
- Supabase Pro ($25/mo) when exceeding free tier
- Vercel Pro ($20/mo) for team features
- Push notifications via web-push (free) or OneSignal (free tier)
