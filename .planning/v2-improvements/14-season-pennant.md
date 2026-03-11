# PRD: Season & Pennant Tracking

## Problem Statement
The app models only individual tournament days — there is no concept of a season, a recurring weekly fixture, or a cumulative standings ladder. Lawn bowls pennant (league) play, where teams compete week-over-week across a 10–20 week season to accumulate division standings, is the competitive backbone of most clubs and is entirely absent from the data model and UI.

## Goal
Clubs can define a multi-week pennant competition, assign teams to divisions, schedule weekly fixtures (home/away), record match results that accumulate into a season standings ladder, and display a live division ladder on the app and TV scoreboard — supporting both internal club leagues and inter-club pennant competitions.

## User Stories
- As a club admin, I want to create a pennant season (name, start/end dates, number of rounds, divisions), assign teams to divisions, and generate a fixture schedule so that the season is managed entirely in the app rather than spreadsheets.
- As a team captain, I want to view my team's upcoming fixtures, past results, and current ladder position so that I always know where my team stands.
- As a player, I want to see which teams I am playing for across the season, so that I can manage my availability and not miss fixtures.
- As a drawmaster running a pennant round, I want to use the existing bowls draw tool to generate rink assignments for the current round's fixtures, so that pennant days use the same workflow as regular tournaments.
- As a spectator on the TV scoreboard, I want to see the current division ladder alongside the live scores so that the display is informative during pennant play.
- As a club admin, I want to track home/away designations for inter-club fixtures so that green allocation and hospitality are clear.

## Requirements

1. **REQ-14-01** — Add a `pennant_seasons` table: `id` (uuid), `venue_id` (uuid), `name` (text), `sport` (text, default `lawn_bowling`), `season_year` (int), `status` (text: `draft` | `registration` | `in_progress` | `completed` | `cancelled`), `starts_at` (date), `ends_at` (date), `rounds_total` (int), `format` (text: `round_robin` | `home_away`), `description` (text, nullable), `created_by` (uuid), `created_at`, `updated_at`.

2. **REQ-14-02** — Add a `pennant_divisions` table: `id`, `season_id` (FK `pennant_seasons`), `name` (text, e.g. "Division 1", "A Grade"), `grade` (int, ordering), `created_at`.

3. **REQ-14-03** — Add a `pennant_teams` table: `id`, `division_id` (FK), `season_id` (FK), `name` (text), `club_id` (text, nullable — for inter-club competitions), `venue_id` (uuid, nullable), `captain_id` (uuid, FK players), `created_at`. This is a season-scoped team distinct from the generic `Team` type — do not reuse `teams` table to avoid scope collision.

4. **REQ-14-04** — Add a `pennant_team_members` table: `id`, `team_id` (FK), `player_id` (FK players), `role` (text: `captain` | `player`), `joined_at`.

5. **REQ-14-05** — Add a `pennant_fixtures` table: `id`, `season_id` (FK), `division_id` (FK), `round` (int), `home_team_id` (FK `pennant_teams`), `away_team_id` (FK `pennant_teams`), `scheduled_at` (timestamptz), `venue` (text, nullable — green name or club name for away fixtures), `tournament_id` (uuid, nullable — FK to `tournaments` if a full draw is generated for this fixture), `status` (text: `scheduled` | `in_progress` | `completed` | `postponed`), `created_at`, `updated_at`.

6. **REQ-14-06** — Add a `pennant_fixture_results` table: `id`, `fixture_id` (FK, unique), `home_rink_wins` (int), `away_rink_wins` (int), `home_shot_total` (int), `away_shot_total` (int), `winner_team_id` (uuid, nullable — null on draw), `points_home` (numeric), `points_away` (numeric), `notes` (text, nullable), `recorded_by` (uuid), `created_at`.

7. **REQ-14-07** — Add TypeScript interfaces `PennantSeason`, `PennantDivision`, `PennantTeam`, `PennantTeamMember`, `PennantFixture`, `PennantFixtureResult` to `src/lib/types.ts`.

8. **REQ-14-08** — Create `src/lib/pennant-engine.ts` as a pure calculation module providing:
   - `generateRoundRobinFixtures(teams: PennantTeam[], rounds: number): PennantFixture[]` — produces a balanced home/away schedule using the standard circle method.
   - `calculateDivisionStandings(fixtures: PennantFixture[], results: PennantFixtureResult[]): Standing[]` — returns the ladder sorted by points (win = 2, draw = 1, loss = 0), then shot difference as tiebreaker. Uses the existing `Standing` interface from `src/lib/tournament-engine.ts`.

9. **REQ-14-09** — Create new pages under `src/app/pennant/`:
   - `src/app/pennant/page.tsx` — season list for the current venue, grouped by status.
   - `src/app/pennant/[seasonId]/page.tsx` — season overview: division tabs, each showing the standings ladder and upcoming/past fixtures.
   - `src/app/pennant/[seasonId]/[divisionId]/page.tsx` — division detail: full ladder, complete fixture list by round.
   - `src/app/pennant/[seasonId]/fixtures/[fixtureId]/page.tsx` — fixture detail: teams, scheduled time, result entry (admin), link to generated tournament draw if one exists.

10. **REQ-14-10** — Create an admin pennant management section at `src/app/admin/pennant/` (or extend existing admin dashboard at `src/app/admin/`) with:
    - Season creation form (name, dates, rounds, format, divisions).
    - Team creation and player assignment per division.
    - Fixture schedule generation (calling `pennant-engine.ts`).
    - Result entry per fixture.

11. **REQ-14-11** — Fixture-to-tournament linkage: on a fixture detail page, an admin button "Generate Draw for This Fixture" creates a new `Tournament` record linked to the fixture (`pennant_fixtures.tournament_id`) and navigates to the existing `src/app/bowls/[id]/page.tsx` draw tool. After the draw day, the drawmaster can navigate back to the fixture and enter the aggregate result.

12. **REQ-14-12** — Create `src/components/pennant/DivisionLadder.tsx` rendering the standings table with columns: position, team name, played, wins, draws, losses, shots for, shots against, shot difference, points. Highlight the current user's team row.

13. **REQ-14-13** — Create `src/components/pennant/FixtureCard.tsx` showing home vs. away team names, round, date/time, venue, and result (if completed) with home/away visual distinction.

14. **REQ-14-14** — TV scoreboard integration: extend `src/app/tv/page.tsx` to detect when an active tournament has a linked `pennant_fixtures.tournament_id` and show a "Season Ladder" panel alongside the live scores, rendering `<DivisionLadder>` for the fixture's division.

15. **REQ-14-15** — Add navigation links to `/pennant` in the main `BottomNav` (or sub-nav under the bowls section) so players can discover season standings.

16. **REQ-14-16** — Inter-club support: `pennant_teams.club_id` references a `ClubData.id` string from `clubs-data.ts`. When `club_id` is set, the team's club name and (if available) logo from `ClubData` are shown on the ladder. This enables tracking fixtures between e.g. Santa Monica LBC vs. Long Beach LBC.

17. **REQ-14-17** — RLS policies: all authenticated players can read all pennant data for their venue; club admins (via `venue_id`) can insert/update seasons, divisions, teams, fixtures, and results; team captains can update `pennant_team_members` for their own team only.

18. **REQ-14-18** — Supabase migrations must be provided for all 6 new tables with appropriate foreign key constraints and indexes on `(season_id)`, `(division_id)`, `(fixture_id)`.

## Success Criteria
- A club admin can create a pennant season with 2 divisions, 8 teams per division, and 14 rounds, and the fixture schedule is generated without manual entry.
- `generateRoundRobinFixtures` unit test confirms that for 8 teams over 7 rounds, every team plays every other team exactly once.
- The division ladder correctly updates when a fixture result is entered: a win adds 2 points to the winning team's total and the ladder re-sorts.
- Clicking "Generate Draw for This Fixture" creates a tournament and navigates to the bowls draw tool with the correct players pre-populated.
- The TV scoreboard shows the division ladder when a pennant-linked tournament is active.
- `/pennant` loads in under 1 second for a season with 14 rounds and 16 teams.

## Technical Approach
- **Pure logic first**: build and test `pennant-engine.ts` (`generateRoundRobinFixtures`, `calculateDivisionStandings`) before touching UI. The circle-method algorithm for round-robin scheduling is well-documented and deterministic.
- **Page structure**: new `src/app/pennant/` route group. Use Next.js server components for the standings pages (data fetched server-side for SEO and performance).
- **TV integration**: `src/app/tv/page.tsx` already conditionally fetches tournament data; add a second conditional fetch for `pennant_fixtures` where `tournament_id = active_tournament.id`.
- **Admin forms**: follow the pattern of existing admin forms in `src/app/admin/` — use uncontrolled forms with `FormData` and server actions, or match the client-form pattern used in `src/app/bowls/`.
- **Key files to modify**: `src/lib/types.ts`, `src/app/tv/page.tsx`, `src/components/board/BottomNav.tsx`, `src/app/admin/` (extend), and all new files listed above.

## Scope & Constraints
- **In scope**: season/division/team/fixture data model, fixture schedule generation, standings ladder, result entry, fixture-to-tournament linkage, TV scoreboard integration, inter-club team support.
- **Out of scope**: player availability polling for fixtures, automatic SMS/email fixture reminders, public-facing season pages for non-members, points system variants beyond win/draw/loss (e.g. bonus points).
- **Risk**: the largest scope item in this roadmap (XL). Consider phasing: Phase A — data model + admin CRUD; Phase B — standings display + TV; Phase C — fixture-to-draw linkage + inter-club.
- **Constraint**: `pennant_teams` is intentionally separate from the generic `teams` table to avoid coupling the existing team-chat and partner-request features to pennant logic.

## Estimated Effort
XL
