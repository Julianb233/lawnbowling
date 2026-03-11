# PRD: Visiting Player Flow

## Problem Statement
The club directory at `/clubs` shows 100+ clubs with contact information sourced from `src/lib/clubs-data.ts`, but a traveling bowler has no in-app mechanism to request a visiting session — they must call or email with no guarantee of response, no structured intake of their skill level or preferred position, and no way for the club to accept or decline in a traceable way.

## Goal
A visiting bowler can submit a structured visit request from any club detail page, the club admin receives an in-app notification and can accept or decline, and an accepted visitor receives a temporary check-in token granting access to the club's tournament check-in for the approved date only.

## User Stories
- As a traveling bowler, I want to tap "I'm Visiting" on a club's detail page and submit my preferred date, skill level, and preferred positions so that I can request to join a session without needing to find a phone number or email address.
- As a club admin, I want to receive an in-app notification when a visit request arrives, review the visitor's profile, and accept or decline with a single tap so that I can manage guest access efficiently.
- As an accepted visitor, I want to receive a push notification with my approved visit date and a QR code check-in link so that I can arrive prepared and check in without needing a full club membership.
- As a drawmaster, I want accepted guest players to appear in the check-in list for their approved date, marked as "Guest", so that I can include them in the draw without creating permanent player records.
- As a club admin, I want to see a history of all visit requests (pending, accepted, declined) so that I can track visiting player patterns.

## Requirements

1. **REQ-12-01** — Add a `visit_requests` table in Supabase with columns: `id` (uuid), `club_id` (text, FK to the club identifier in `ClubData`), `player_id` (uuid, FK to `players`), `requested_date` (date), `skill_level` (text: beginner/intermediate/advanced), `preferred_positions` (text[], from `BowlsPosition`), `message` (text, optional), `status` (text: pending/accepted/declined/expired), `responded_by` (uuid, nullable), `responded_at` (timestamptz, nullable), `visit_token` (uuid, generated on acceptance, used for QR check-in), `expires_at` (timestamptz, set to end of `requested_date`), `created_at`, `updated_at`.

2. **REQ-12-02** — Add a `VisitRequest` TypeScript interface and `VisitRequestStatus` type to `src/lib/types.ts`, following the existing pattern of `ClubClaimRequest`.

3. **REQ-12-03** — Add an "I'm Visiting" button to `src/app/clubs/[state]/[slug]/page.tsx`, rendered only when the club has `status: 'active' | 'claimed'` and the viewing user is authenticated. The button opens a modal/sheet containing the visit request form (date picker, skill level selector, position checkboxes using `BOWLS_POSITION_LABELS`, optional message textarea).

4. **REQ-12-04** — Create API route `src/app/api/clubs/visit-request/route.ts` (POST) that validates the request body, writes to `visit_requests`, and triggers a notification to all admin users associated with the club's `venueId` (if claimed) using the existing `push.ts` infrastructure in `src/lib/push.ts`.

5. **REQ-12-05** — Create API route `src/app/api/clubs/visit-request/[id]/respond/route.ts` (POST) that accepts `{ action: 'accept' | 'decline' }`. On acceptance: set `status = 'accepted'`, generate `visit_token`, set `expires_at` to midnight of `requested_date`, and send a push notification to the visitor with the approved date and a deep-link URL to `/checkin?visit_token=<token>`.

6. **REQ-12-06** — Extend the club admin dashboard at `src/app/clubs/dashboard/` (or `src/app/clubs/manage/`) to include a "Visit Requests" tab showing pending requests with player profile info (name, skill level, preferred positions, message) and Accept / Decline buttons.

7. **REQ-12-07** — Modify the check-in flow to recognize a `visit_token` query parameter. When present and valid (token exists, status = accepted, current date matches `requested_date`), auto-populate the player into the check-in list and display a "Guest" badge on their player card. The token must be single-use per tournament session — once the visitor checks in, the token is consumed.

8. **REQ-12-08** — Add a `GuestPlayerBadge` component (`src/components/bowls/GuestPlayerBadge.tsx`) rendered in the check-in player card and on the draw board next to guest player names. The badge should be visually distinct (e.g. dashed border, "Guest" label) so the drawmaster can immediately identify visiting players.

9. **REQ-12-09** — A visiting player's match results must be recorded against their permanent player profile (they are a real registered user, just without club membership). Results count toward their global stats and ratings.

10. **REQ-12-10** — Add a "My Visit Requests" section to `src/app/profile/` or `src/app/settings/` listing all pending, accepted, and recent past visit requests made by the current user, with their current status.

11. **REQ-12-11** — Visit requests older than 30 days with `status = 'pending'` must be auto-expired. Implement a scheduled cleanup via a Supabase cron job or a lightweight API route callable by a Vercel cron (`vercel.json` `crons` config).

12. **REQ-12-12** — The club detail page must show a count of "X visitors this season" for claimed clubs where `venueId` is set, to signal community activity to potential visitors.

13. **REQ-12-13** — Email fallback: if a club has no admin user linked (i.e. `claimedBy` is null), the visit request API must send a notification email to `club.email` (if present in `ClubData`) using the existing email infrastructure in `src/lib/email/`.

14. **REQ-12-14** — RLS policies on `visit_requests`: a player can read and insert their own rows; a club admin (determined by venue membership) can read all rows for their club's `venueId` and update `status`, `responded_by`, `responded_at`; service role can do all.

## Success Criteria
- A logged-in user on `/clubs/ca/santa-monica-lawn-bowls-club` can tap "I'm Visiting", fill out the form, and submit — the request appears in the DB with `status = 'pending'`.
- The club admin sees the pending request in their dashboard and can accept it, causing the visitor's status to update to `accepted` and a push notification to fire.
- The visitor opens the deep-link URL with `?visit_token=<token>`, is auto-added to the check-in list, and the draw board shows their name with a "Guest" badge.
- Attempting to use an expired or already-used visit token returns a clear error message.
- Visit requests for unclaimed clubs trigger an email to the club's listed email address.

## Technical Approach
- **Data layer**: new `visit_requests` table; `VisitRequest` type in `src/lib/types.ts`.
- **Club detail page**: add "I'm Visiting" CTA as a client component island inside the existing static-rendered `src/app/clubs/[state]/[slug]/page.tsx`. Use a `<dialog>` or a Framer Motion sheet consistent with existing UI patterns in `src/components/bowls/`.
- **Notification path**: reuse `src/lib/push.ts` `sendPushToPlayer` and `src/lib/email/` for the fallback email path — do not introduce a new notification library.
- **Check-in token**: generate via `crypto.randomUUID()` server-side; validate in the check-in page's `useEffect` on mount.
- **Key files to modify**: `src/app/clubs/[state]/[slug]/page.tsx`, `src/app/bowls/[id]/page.tsx` (check-in flow), `src/lib/types.ts`, `src/lib/push.ts` (or caller), `src/app/api/clubs/` (new routes).

## Scope & Constraints
- **In scope**: visit request form, admin accept/decline, visit token check-in, guest badge on draw board, email fallback for unclaimed clubs, "My Visit Requests" in profile.
- **Out of scope**: temporary club membership creation, payment for guest green fees, calendar sync (iCal/Google), cross-club visit history visible to other players.
- **Risk**: clubs with no `venueId` (unclaimed) have no admin user to notify — email fallback mitigates this but delivery is not guaranteed.
- **Constraint**: the club detail page is currently a statically generated Next.js page (`generateStaticParams`); the "I'm Visiting" button must be a `"use client"` island that does not block static generation.

## Estimated Effort
L
