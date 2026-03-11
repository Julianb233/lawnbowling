# PRD: Club-Scoped Experience

## Problem Statement
The app has no concept of a player's "home club" — player profiles do not show club affiliation, the tournament list shows all tournaments across all clubs globally, the leaderboard is unscoped, and the check-in grid loads every player in the database. There is also no support for club-vs-club match formats used at social bowls events.

## Goal
Players belong to a home club, and all primary views (tournaments, leaderboard, stats, check-in grid) are scoped to the player's club by default, with an explicit opt-in to view global data. Club affiliation is visible on profiles. Inter-club matches are supported as a first-class tournament type.

## User Stories
- As a **player**, I want to set my home club in my profile so that the app shows me my club's tournaments, leaderboard, and members by default.
- As a **player**, I want to see my club badge and name on my profile card so that other members can confirm I'm from the same club.
- As a **drawmaster**, I want the check-in grid to show only my club's members by default so that I'm not scrolling through hundreds of players from other clubs.
- As a **player**, I want to see a club leaderboard scoped to my home club so that I can see my standing among my clubmates rather than all players globally.
- As a **club admin**, I want to create a "club-vs-club" match event so that I can run a challenge day against a visiting club with both clubs' players in the same tournament.
- As a **player**, I want to opt into a global/all-clubs view with one tap so that I can still see regional or national standings when I want to.

## Requirements

- **CSE-01** — The `Player` type in `src/lib/types.ts` must be extended with a `home_club_id: string | null` field. A corresponding `players.home_club_id` foreign key column must be added to the database via migration, referencing a `clubs` table.
- **CSE-02** — The `clubs` table (or equivalent structure from `src/lib/clubs-data.ts`) must be normalised into the Supabase database if it is not already a DB table. Each club must have: `id`, `name`, `slug`, `city`, `state_code`, `country`, `logo_url`, `primary_color`.
- **CSE-03** — The profile setup flow (`src/app/profile/setup/`) must include a "Home Club" step where the player can search for and select their club. This step is optional but recommended — display it with a "Skip for now" option.
- **CSE-04** — The profile page (`src/app/profile/[id]/`) must display the player's home club name and logo/badge. If no home club is set, display "No club set" with a link to the profile settings.
- **CSE-05** — The tournament list page (`src/app/bowls/`) must default to showing only tournaments where `tournament.club_id` matches the current player's `home_club_id`. A toggle or tab ("My Club" / "All Clubs") must allow switching to the global view.
- **CSE-06** — The leaderboard page (`src/app/leaderboard/`) must default to a club-scoped view showing only players with the same `home_club_id`. A toggle ("My Club" / "All Players") must switch to the global leaderboard.
- **CSE-07** — The check-in grid on `/bowls/[id]/page.tsx` must default to showing only players with the same `home_club_id` as the tournament's `club_id`. A "Show All Players" expansion option must be available for visiting players who are not yet associated with the club.
- **CSE-08** — The stats page (`src/app/stats/`) must include a "Club Stats" section showing: total club members, total club games played, club win rate, and club's most active players this month.
- **CSE-09** — When creating a new tournament, the "Club" field must be pre-populated with the drawmaster's `home_club_id`. The drawmaster may change this to any club they have admin rights for.
- **CSE-10** — A new tournament type `inter_club` must be added to the `Tournament` type and the tournament creation UI. An inter-club tournament must support two `club_id` values: `home_club_id` and `visiting_club_id`. Players from either club can check in.
- **CSE-11** — The inter-club match draw must respect club membership: it must attempt to avoid placing two players from the same club on the same team (within a rink) to ensure genuine club-vs-club competition. This is a best-effort constraint, not a hard requirement.
- **CSE-12** — Club affiliation badges (club logo or initials) must appear next to player names in the check-in list, draw sheet, score entry, and results pages.
- **CSE-13** — The player search/autocomplete used across the app must show club affiliation as a secondary label under the player's name to aid disambiguation when two players have similar names.
- **CSE-14** — A player must be able to belong to only one home club at a time. Changing home club must require confirmation: "You are changing your home club from X to Y. Your stats and match history will remain unchanged."
- **CSE-15** — All queries that were previously unscoped (fetch all players, fetch all tournaments) must add club-scoped variants. The unscoped versions must remain available for admin views and the "All Clubs" toggle.
- **CSE-16** — The clubs directory page (`src/app/clubs/`) must link from each club's listing to a club-scoped tournament and leaderboard view accessible without being logged in (public-facing).
- **CSE-17** — Row-level security policies in Supabase must not be changed in a way that prevents players from viewing cross-club data when the "All Clubs" toggle is active. Club scoping is a UI/query-level filter, not an RLS restriction.

## Success Criteria
- A player with a home club set sees only their club's tournaments on the bowls list page on first load, with zero tournaments from other clubs visible.
- A drawmaster's check-in grid for a club tournament shows only club members by default; a visiting player can still be found by clicking "Show All Players."
- The club leaderboard shows only clubmates and is clearly labelled with the club name.
- Player profiles display the club badge correctly across all profile views (own profile, other player's profile card in draw sheet, search results).
- An inter-club tournament can be created, players from both clubs can check in, and the draw is generated with cross-club team assignments.
- All new DB queries use club-scoped filters where applicable, verified by checking that the global "All Clubs" toggle requires an explicit user action.

## Technical Approach

**Key files to modify:**
- `src/lib/types.ts` — Add `home_club_id` to `Player`; add `inter_club` to `TournamentFormat`; add `visiting_club_id` to `Tournament`; add new `Club` interface if not already present.
- `src/app/profile/setup/page.tsx` — Add home club search step.
- `src/app/profile/[id]/ProfilePageClient.tsx` — Render club badge.
- `src/app/bowls/page.tsx` (or equivalent tournament list) — Add club filter; default to `home_club_id` filter.
- `src/app/leaderboard/page.tsx` — Add club scope toggle; pass `clubId` to `Leaderboard` component.
- `src/components/stats/Leaderboard.tsx` — Accept optional `clubId` prop; add to query filter.
- `src/app/bowls/[id]/page.tsx` — Default player search to club members; "Show All" expansion.
- `src/app/stats/page.tsx` — Add club stats section.
- `src/lib/clubs-data.ts` — Review whether clubs are static data or need to become a DB table. If static, create a `getClubById(id)` utility; if DB, create a `clubs` Supabase table.
- `supabase/migrations/` — `players.home_club_id`, `tournaments.visiting_club_id`, `tournaments.type` column updates.

**Club scoping pattern:**
```ts
// Tournament list — scoped
const { data } = await supabase
  .from("tournaments")
  .select("*")
  .eq("club_id", player.home_club_id)
  .order("starts_at", { ascending: false });

// With "All Clubs" toggle
const query = showAll
  ? supabase.from("tournaments").select("*")
  : supabase.from("tournaments").select("*").eq("club_id", player.home_club_id);
```

**Club badge component:**
```tsx
// src/components/clubs/ClubBadge.tsx (new)
interface ClubBadgeProps { clubId: string | null; size?: "sm" | "md" }
// Renders club logo or initials pill with club primary_color background
```

**Dependencies:** No new packages. If clubs are moved to DB, a Supabase migration and seed script for existing static club data is required.

## Scope & Constraints

**In scope:**
- `home_club_id` on player profiles
- Club-scoped tournament list, leaderboard, check-in grid, stats
- Club badge on profiles and draw sheets
- Inter-club tournament type with two-club check-in
- Club-scoped disambiguation in player search
- Public club profile pages linked from clubs directory

**Out of scope:**
- Club membership management (invites, approval workflows, club admin roles beyond what already exists via `ClubClaimRequest`)
- Club chat or messaging
- Club financial management (dues, fees)
- Multi-club membership (a player belonging to more than one club)
- Federation/national body hierarchy above club level

**Risks:**
- This is an XL effort because it touches virtually every page and query in the app. Phasing is strongly recommended: (1) data model + profile club selection, (2) scoped tournament list + leaderboard, (3) scoped check-in + draw sheet badges, (4) inter-club match type.
- Scoping queries by club at the application layer (not RLS) means that a player who manipulates API calls could access other clubs' data. This is acceptable for v1 since there is no sensitive PII involved, but should be documented.
- Static club data in `src/lib/clubs-data.ts`, `clubs-data-canada.ts`, and `clubs-data-uk.ts` must be migrated or kept in sync with the DB. A decision on the authoritative source must be made before implementation begins.

## Estimated Effort
XL
