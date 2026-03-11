# PRD: Green Conditions Widget

## Problem Statement
Green speed, surface moisture, and wind strength materially affect lawn bowls play and strategy, yet there is no way to record or share this information in the app. The `WeatherWidget` on `src/app/tv/page.tsx` shows ambient temperature but not the bowls-specific green conditions that experienced players discuss before every session. Drawmasters and visitors have no in-app source for this context.

## Goal
The drawmaster can log green conditions (speed, surface state, wind) before each session, these conditions appear on the tournament page and the TV scoreboard display, and historical conditions are stored per tournament to reveal seasonal green trends over time.

## User Stories
- As a drawmaster, I want to log green speed (fast/medium/slow), surface condition (dry/damp/wet), wind direction, and wind strength before a session starts, so that all players can see the conditions before their first bowl.
- As a player checking in, I want to see today's green conditions on the tournament page so that I can mentally prepare my line and weight selection before stepping on the rink.
- As a player on the TV scoreboard waiting for the draw, I want to see green conditions displayed prominently on the screen so that I don't have to ask the drawmaster.
- As a club admin, I want to view a history of green conditions per tournament so that I can correlate green speed with surface maintenance schedules.
- As a visiting player, I want to see typical green conditions for a club from historical records so that I can prepare before arriving.

## Requirements

1. **REQ-15-01** — Add a `green_conditions` table in Supabase with columns: `id` (uuid), `tournament_id` (uuid, FK `tournaments`, unique — one record per tournament session), `venue_id` (uuid, FK), `recorded_by` (uuid, FK players), `green_speed` (text: `fast` | `medium` | `slow`), `surface_condition` (text: `dry` | `damp` | `wet`), `wind_direction` (text: `N` | `NE` | `E` | `SE` | `S` | `SW` | `W` | `NW` | `calm`), `wind_strength` (text: `calm` | `light` | `moderate` | `strong`), `notes` (text, nullable, max 280 chars), `temperature_c` (numeric, nullable — may be populated from existing weather data), `recorded_at` (timestamptz), `created_at`, `updated_at`.

2. **REQ-15-02** — Add a `GreenConditions` TypeScript interface and `GreenSpeed`, `SurfaceCondition`, `WindDirection`, `WindStrength` type aliases to `src/lib/types.ts`. Add human-readable label maps (e.g. `GREEN_SPEED_LABELS: Record<GreenSpeed, string>`) in the same file.

3. **REQ-15-03** — Create `src/components/bowls/GreenConditionsWidget.tsx` — a display-only component that accepts a `GreenConditions | null` prop and renders: a speed indicator (icon + label), surface condition badge, wind direction compass rose (simple SVG arrow), wind strength label, optional notes, and "Recorded by [name] at [time]". When `null`, renders "Conditions not yet logged".

4. **REQ-15-04** — Create `src/components/bowls/GreenConditionsForm.tsx` — an admin-only form component with: segmented control for green speed, segmented control for surface condition, compass direction picker for wind direction (8-point rose rendered as a 3×3 button grid with center = calm), segmented control for wind strength, and a notes textarea. On submit, calls `POST /api/bowls/green-conditions`.

5. **REQ-15-05** — Create API route `src/app/api/bowls/green-conditions/route.ts`:
   - `POST` — create or update (upsert on `tournament_id`) green conditions. Requires admin or drawmaster role. Returns the saved record.
   - `GET ?tournament_id=<id>` — fetch conditions for a given tournament. Public read (no auth required) to allow display on public-facing pages.

6. **REQ-15-06** — Integrate `<GreenConditionsWidget>` into `src/app/bowls/[id]/page.tsx`. It must appear above the check-in list when the view is in `checkin` or `board` mode. Admin users see an "Edit Conditions" button that opens `<GreenConditionsForm>` in a sheet/modal.

7. **REQ-15-07** — Integrate `<GreenConditionsWidget>` into `src/app/tv/page.tsx` in the TV scoreboard. Display it in the header area alongside the existing `<WeatherWidget>`. On the TV display it should be visually large enough to read from across the room — use a larger font size and high-contrast badge styles. The TV display must fetch conditions via the existing `loadTournament` / `loadScores` pattern (add a parallel `loadConditions` fetch).

8. **REQ-15-08** — Add a "Log Conditions" shortcut button to the admin draw tool view in `src/app/bowls/[id]/page.tsx` (the admin `draw` view tab). It opens `<GreenConditionsForm>` directly without switching tabs.

9. **REQ-15-09** — Historical conditions on club detail pages: add a "Green History" section to `src/app/clubs/[state]/[slug]/page.tsx` (rendered only for claimed clubs with `venueId`). It shows the last 10 recorded sessions as a compact list: date, speed badge, surface badge. This gives visiting players insight into typical conditions. Data is fetched server-side using `src/lib/supabase/server.ts`.

10. **REQ-15-10** — Seasonal trend summary: add a `getGreenConditionsSummary(venueId, seasonYear)` function to a new `src/lib/db/green-conditions.ts` helper module. It returns counts grouped by `green_speed` and `surface_condition` for the given venue and year. This powers a simple "This season: 40% fast / 45% medium / 15% slow" summary line on the club detail page and the admin dashboard.

11. **REQ-15-11** — Noticeboard auto-post (if PRD-13 is implemented): when green conditions are logged for a tournament, auto-post a `member_post` to the noticeboard: "Green conditions logged for today: Medium / Damp / Light SW wind." Guard this call with a feature flag or a simple existence check so it does not hard-fail if the noticeboard tables do not yet exist.

12. **REQ-15-12** — The conditions record must update in real time on the TV scoreboard page. Subscribe to `green_conditions:tournament_id=eq.<id>` via Supabase Realtime so that when the drawmaster logs conditions from their device, the TV display updates within 2 seconds without a page refresh.

13. **REQ-15-13** — RLS policies: any authenticated user can read `green_conditions`; only players with `role = 'admin'` for the associated `venue_id` can insert or update.

14. **REQ-15-14** — The `GreenConditionsWidget` must degrade gracefully when no conditions are recorded: show a neutral "Conditions not logged" placeholder that does not cause layout shift on the tournament page or TV display.

## Success Criteria
- A drawmaster can open the conditions form, select Fast / Dry / Moderate NE wind, and save — the record appears in the DB.
- The TV scoreboard displays the logged conditions within 2 seconds of save (Realtime subscription).
- The tournament page at `/bowls/[id]` shows the green conditions widget above the check-in list for all users.
- The club detail page for a claimed club with past tournaments shows at least the last 3 recorded conditions sessions in the Green History section.
- `getGreenConditionsSummary` returns a correct percentage breakdown for a venue with 10 logged sessions of known distribution.
- When no conditions are logged, the widget renders "Conditions not yet logged" without a JS error.

## Technical Approach
- **Minimal new surface area**: one new table, one new API route, two new components, three small integrations into existing pages. This is intentionally small.
- **Compass rose**: 3×3 button grid in `GreenConditionsForm` where the center button = "Calm", surrounding 8 = cardinal/intercardinal directions. Pure CSS/Tailwind, no SVG library required.
- **TV display**: add `loadConditions` as a parallel `useCallback` alongside the existing `loadTournament` and `loadScores` in `src/app/tv/page.tsx`. Follow the identical pattern — `useEffect` depends on `tournament?.id`, subscribe to Realtime channel on mount.
- **Club history fetch**: in `src/app/clubs/[state]/[slug]/page.tsx`, the page already generates static params. The Green History section should be a small async server component that fetches from Supabase at request time (use `export const dynamic = 'force-dynamic'` on the section or move to a separate `<Suspense>` boundary).
- **Key files to modify**: `src/lib/types.ts`, `src/app/bowls/[id]/page.tsx`, `src/app/tv/page.tsx`, `src/app/clubs/[state]/[slug]/page.tsx`.
- **New files**: `src/components/bowls/GreenConditionsWidget.tsx`, `src/components/bowls/GreenConditionsForm.tsx`, `src/app/api/bowls/green-conditions/route.ts`, `src/lib/db/green-conditions.ts`.

## Scope & Constraints
- **In scope**: conditions logging form, display widget, TV integration, club history section, seasonal summary, Realtime sync.
- **Out of scope**: automated green speed calculation from sensor data, integration with weather APIs beyond what `WeatherWidget` already provides, push notifications for condition changes, public API endpoint for third-party access.
- **Risk**: low. This is the smallest item in the v2 backlog. The main risk is over-engineering the compass rose UI — keep it simple (button grid, not draggable SVG).
- **Constraint**: the club detail page uses `generateStaticParams` for static generation. The Green History section must either be a separate dynamically-rendered route segment or use `fetch` with `no-store` cache inside a `<Suspense>` boundary to avoid invalidating the entire page's static generation.

## Estimated Effort
S
