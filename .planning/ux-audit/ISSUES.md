# Lawn Bowl UX Audit — Club Director 500-Member Simulation

**Auditor**: Agent4 (simulating Lon Bolin, 70yo club director)
**Date**: 2026-03-17
**Scenario**: Saturday social bowls, 500 members, 3 greens (72 rinks max)

## P1 — Critical (Fix This Week)

### LBUX-1: Mixed Format Tournament Support
**Phase**: Pre-Day Setup
**File**: `src/components/bowls/CreateBowlsTournamentModal.tsx`
**Problem**: Can't run mixed formats (200 Fours + 150 Triples + 100 Pairs + 50 Singles) in one tournament. Must create 4 separate tournaments.
**Fix**: Add "Mixed" format option that allows sub-groups within one tournament. Each sub-group has its own format, rink allocation, and draw — but one unified check-in and results view.
**Impact**: Without this, managing 4 tournaments simultaneously is unworkable for an elderly director.

### LBUX-4: Multi-Kiosk + QR Self-Check-In
**Phase**: Check-In
**Files**: `src/components/kiosk/KioskBowlsCheckIn.tsx`, new: QR poster component
**Problem**: 500 members × 30sec = 250min on 1 iPad. Need: (a) multi-station guidance in UI, (b) QR code poster generator linking to `/bowls/[id]` for phone self-check-in.
**Fix**: Add "Generate QR Poster" button on tournament admin page. Create printable A4 poster with QR code, tournament name, and check-in instructions. Phone check-in page already exists.

### LBUX-9: Draw Preview Before Committing
**Phase**: Draw Generation
**Files**: `src/components/bowls/TournamentWizard.tsx`, `src/lib/bowls/bowls-draw.ts`
**Problem**: "Generate Draw" immediately commits all players. No preview, no swap, no confirm.
**Fix**: Two-step draw: (1) Generate preview showing rink assignments in editable grid, (2) "Confirm Draw" button to finalize. Allow drag-drop or swap between rinks in preview.

### LBUX-13: Rink Search/Filter in Score Entry
**Phase**: Scoring
**File**: `src/app/bowls/[id]/scores/page.tsx`
**Problem**: 60 rinks in 2-column grid = 30 rows of scrolling. Can't find Rink 47 quickly.
**Fix**: Add search bar + green filter tabs at top of scoring page. "Green A | Green B | Green C | All" tabs. Search by rink number or player name.

### LBUX-14: Larger Score Entry Buttons
**Phase**: Scoring
**File**: `src/app/bowls/[id]/scores/page.tsx:483-495`
**Problem**: Score +/- buttons are 44px (min-h-[44px]). Kiosk uses 56-88px. Outdoor iPad use needs bigger targets.
**Fix**: Increase score entry buttons to min-h-[56px] min-w-[56px]. Add `text-lg` for the +/- symbols. Match kiosk-level accessibility.

## P2 — Important (Fix This Month)

### LBUX-2: Tournament Templates/Presets
**File**: `src/components/bowls/CreateBowlsTournamentModal.tsx`
**Fix**: "Repeat Last Tournament" button pre-fills all fields from most recent tournament. Save/load named templates.

### LBUX-5: QR Code Poster Generator
**File**: New component
**Fix**: Generate printable A4 poster with QR code → `/bowls/[id]` for wall display. Include tournament name, time, format.

### LBUX-6: Quick Add Guest on Kiosk
**File**: `src/components/kiosk/KioskBowlsCheckIn.tsx`
**Fix**: "Add Guest" button on kiosk check-in. Name + skill level + position = done. No admin panel required.

### LBUX-7: Bulk Pre-Check-In from RSVP
**Files**: `src/components/bowls/TournamentWizard.tsx`
**Fix**: "Check In All RSVPed" button that bulk-checks all confirmed RSVP players. Walk-ins handled individually.

### LBUX-8: Remember Last Position Preference
**File**: `src/components/kiosk/KioskBowlsCheckIn.tsx:520`
**Fix**: Pre-select position from player's profile `preferred_position` or last tournament check-in. Allow override.

### LBUX-10: Physical Green Mapping
**Files**: New venue config, `src/lib/bowls/bowls-draw.ts`
**Fix**: Venue settings: define greens (A, B, C) with rink ranges. Draw assigns rinks within green context. Labels show "Green A — Rink 5" not just "Rink 5".

### LBUX-11: Mead Draw Limit Warning
**File**: `src/lib/bowls/bowls-draw.ts`
**Fix**: When player count doesn't match Mead rotation tables, show warning: "Mead Draw supports X players. You have Y. Falling back to Random Draw." Let user choose.

### LBUX-15: Delegated Rink Scoring
**Files**: `src/app/bowls/[id]/scores/page.tsx`, new per-rink scoring route
**Fix**: Generate per-rink scoring link/QR. Each rink's Skip can enter their own scores on their phone. Admin sees all rinks updating live.

### LBUX-16: Unlock Finalized Scores (Admin)
**File**: `src/app/bowls/[id]/scores/page.tsx:866-876`
**Fix**: Admin "Unlock for Correction" button on finalized rounds. Requires PIN confirmation. Logs correction history.

### LBUX-17: Announce Results One-Tap
**File**: `src/app/bowls/[id]/results/page.tsx`
**Fix**: "Announce Results" button on results page. Sends push notification to all checked-in players with summary.

### LBUX-19: Clear Round Transition CTA
**File**: `src/components/bowls/TournamentWizard.tsx`
**Fix**: After results finalized, show prominent "Start Round 2" button with round summary. Clear visual transition.

### LBUX-20: Email Results to Participants
**File**: New feature
**Fix**: "Email Results" button generates and sends personalized email to each participant with their rink, scores, and standings.

## P3 — Backlog

### LBUX-3: Max Player Validation Warning
### LBUX-12: Couple/Group Lock in Draw
### LBUX-18: Awards & Highlights (Best Rink, Top Scorer)
### Voice Score Entry (Web Speech API)
### Tournament Report PDF Export
### Large-Font Print Poster for Noticeboard
### Accessibility Presets (Font Size Toggle, Dark Mode)
### Inter-Round Analytics Dashboard
