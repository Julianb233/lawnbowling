# UI/UX Overhaul Plan — Bowls App

## Executive Summary

The app is **90% functionally complete but 40% visually complete.** The gap analysis reveals a working product held back by missing imagery, basic component styling, and no data visualization. This plan addresses every gap to create a market-dominating experience.

## Generated Assets (Ready)

| Asset | Path | Status |
|-------|------|--------|
| App Icon (3D bowl) | `public/images/logo/bowls-icon.png` | Ready |
| Wordmark ("BOWLS") | `public/images/logo/bowls-wordmark.png` | Ready |
| Hero Close-up (16:9) | `public/images/hero-closeup.png` | Ready |
| Hero Wide Angle (16:9) | `public/images/hero-wide.png` | Ready |

---

## Phase A: Visual Foundation (Priority: CRITICAL)

### A1: Hero Images on Every Major Page
**Current:** Text-only headers on 15+ pages, zero photography
**Target:** Full-bleed hero images with text overlay on all key pages

Pages needing hero treatment:
- Homepage → `hero-wide.png` with gradient overlay + headline
- About → Generated club atmosphere image
- Learn Hub → Generated green close-up
- Blog → Generated editorial bowling image
- Clubs Directory → Generated map/aerial view
- Insurance → Generated safety/protection image
- Shop → Generated product lifestyle image
- Contact → Generated clubhouse image

**Technical:** Next.js `<Image>` with `priority`, gradient overlays via CSS, responsive srcsets

### A2: New Logo Integration
**Current:** Basic text logo or old "Pick a Partner" remnants
**Target:** New "BOWLS" wordmark in header, app icon as favicon/manifest

- Replace header logo with `bowls-wordmark.png`
- Replace favicon with `bowls-icon.png` (resize to 32x32, 180x180, 512x512)
- Update `manifest.json` icons
- Update OG image to use new brand assets

### A3: Design Token Refresh
**Current:** Generic green (#1B5E20) + grays
**Target:** Premium palette extracted from generated imagery

```css
:root {
  --green-deep: #1B5E20;      /* brand primary */
  --green-grass: #4CAF50;      /* secondary green */
  --gold-accent: #C9A227;      /* bias mark gold */
  --gold-light: #E8D48B;       /* gold highlight */
  --cream: #F5F0E8;            /* warm off-white bg */
  --charcoal: #2D2D2D;         /* text primary */
  --green-dark: #0D3311;       /* dark mode bg */
}
```

---

## Phase B: Player Experience (Priority: HIGH)

### B1: Enhanced Player Cards
**Current:** Initials-only avatars, basic card layout
**Target:** Rich player cards with photos, stats, badges

Improvements:
- User avatar upload (Supabase storage bucket)
- Avatar display with fallback to styled initials
- Win/loss record badge
- Skill rating visualization (radar chart or bar)
- Recent form indicator (last 5 games: W/L dots)
- Achievement badges (Tournament Winner, Most Games, etc.)
- Position preference badge (Skip, Lead, etc.)
- "Verified Bowler" checkmark for active members

### B2: Player Profile Overhaul
**Current:** Basic text profile
**Target:** Rich profile page like a sports app

- Cover photo (uploaded or default bowling green)
- Large avatar with edit capability
- Stats dashboard with charts (wins, games, seasons)
- Match history timeline
- Achievement gallery
- Favorite partners grid with avatars
- Position breakdown pie chart

### B3: Leaderboard Redesign
**Current:** Plain text list
**Target:** Gamified leaderboard

- Gold/Silver/Bronze medals for top 3
- Rank number with movement indicator (up/down arrow)
- Player avatar + name + stats in each row
- Sparkline showing trend over time
- Season/all-time toggle
- Position-specific leaderboards (best Skip, best Lead)

---

## Phase C: Court Visualization (Priority: HIGH — MARKET DIFFERENTIATOR)

### C1: Interactive Bowling Green Map
**Revolutionary feature — nothing like this exists in bowls.**

- Bird's-eye view SVG of the bowling green
- Each rink shown as a lane with number
- Color-coded status: Active (green), Completed (gray), Upcoming (blue)
- Tap a rink to zoom into "head" visualization
- Real-time updates via Supabase Realtime

### C2: "Head" Visualization (The Killer Feature)
- SVG/Canvas view showing bowls around the jack from above
- Each bowl color-coded by team
- Distance rings showing proximity to jack
- Jack highlighted as gold/white circle
- Tap a bowl to see who delivered it
- Optional: shot trajectory replay (curved path showing bowl delivery)

### C3: TV Scoreboard Upgrade
**Current:** Basic text grid
**Target:** Broadcast-quality scoreboard

- Club logo + tournament name banner
- Rink cards with team colors
- Live score animation when points update
- "Head" mini-visualization per rink
- Sponsor bar capability
- Full-screen optimized for 1080p TV

### C4: Shot Tracker (Future - Phase 2)
- Bowl trajectory visualization using curved bezier paths
- Heat map showing where player typically delivers
- Head-building replay animation
- AR potential for iPad camera overlay

**Technical approach:** SVG for the green/rink layout (scalable, interactive), Canvas for real-time bowl positions and trajectories. No Three.js needed — 2D top-down is more useful and performant.

---

## Phase D: Data Visualization & Dashboard (Priority: MEDIUM-HIGH)

### D1: Admin Dashboard Overhaul
**Current:** 4 plain stat cards
**Target:** Analytics dashboard

- Recharts/Chart.js integration
- Player activity over time (line chart)
- Tournament participation trends (bar chart)
- Revenue tracking (if shop/insurance active)
- Popular game formats (donut chart)
- Member growth (area chart)

### D2: Tournament Stats Visualization
**Current:** Text-only stats
**Target:** Rich visual stats

- Score distribution histograms
- Head-to-head comparison cards
- Round progression charts
- Best performances callout cards
- Tournament bracket visualization (for knockout formats)

---

## Phase E: Content & Commerce Polish (Priority: MEDIUM)

### E1: Blog Visual Upgrade
- Generate featured image for each blog post
- Author photo/bio section
- Category-specific header colors
- Related posts with thumbnail grid
- Social share cards with OG images

### E2: Shop Product Images
- Generate product mockups for each item (t-shirts, hats, mugs)
- Size/variant selector with visual preview
- Product gallery with zoom
- "On model" lifestyle images via Nano Banana

### E3: Club Directory Enhancement
- Club placeholder images (bowling green generic photos)
- Map view with pins (Mapbox or Google Maps)
- Club logo upload for claimed clubs
- Review/rating stars
- Member count badge

---

## Phase F: Micro-interactions & Polish (Priority: MEDIUM)

### F1: Animation System
- Draw generation animation (cards shuffling/dealing effect)
- Score update pulse/flash
- Check-in success celebration (confetti or green check)
- Page transitions (fade/slide)
- Skeleton loaders on all data-dependent views
- Button press haptic feedback (PWA)

### F2: Dark Mode
- Full dark mode color palette
- System preference detection
- Manual toggle in settings
- Dark-optimized bowling green imagery

### F3: Notification UI
- Toast notifications for real-time events
- In-app notification center
- Badge counts on nav items
- Push notification permission prompt (friendly, non-intrusive)

---

## GSD Phase Breakdown

| GSD Phase | Name | Plans | Priority | Depends On |
|-----------|------|-------|----------|------------|
| 16 | Visual Foundation | 3 (hero images, logo, design tokens) | CRITICAL | None |
| 17 | Player Experience | 3 (cards, profiles, leaderboard) | HIGH | Phase 16 |
| 18 | Court Visualization | 4 (green map, head viz, TV upgrade, shot tracker) | HIGH | Phase 16 |
| 19 | Data Visualization | 2 (admin dashboard, tournament stats) | MEDIUM-HIGH | Phase 17 |
| 20 | Content & Commerce Polish | 3 (blog images, shop images, club directory) | MEDIUM | Phase 16 |
| 21 | Micro-interactions & Polish | 3 (animations, dark mode, notifications) | MEDIUM | Phases 17-20 |

**Total: 6 phases, 18 plans**

---

## Market Domination Strategy

### What Makes This Unbeatable:

1. **Court Visualization** — No bowls app has this. Seeing the "head" in real-time on a screen is revolutionary.
2. **Player Cards with Real Stats** — Gamification drives engagement. Badges, leaderboards, achievements.
3. **TV Scoreboard** — Clubs install this on their TV = permanent visibility.
4. **Photography Quality** — AI-generated hero images make the app look like it has a $50K design budget.
5. **Data Visualization** — Club admins see beautiful charts = they feel the app is "professional."

### The "Wow Moment":
A club secretary opens the app on their clubhouse TV. They see the bowling green visualized with live rink status, bowls appearing in real-time as scores are entered, weather in the corner, and the next draw auto-generating. No bowls app in the world does this.
