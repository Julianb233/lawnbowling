# PRD: Tournament Day Wizard

## Problem Statement
The tournament detail page exposes five navigation destinations (Check In, Board, Draw, Scores, Results) as a flat tab list with no visual hierarchy or workflow guidance, leaving first-time drawmasters confused about what to do next. Critical destructive actions — such as the "Re-Draw" button — have no confirmation dialog, and the draw round counter does not stay in sync with actual scored rounds.

## Goal
Replace the flat tab navigation on `/bowls/[id]` with a guided step-by-step wizard that surfaces the tournament lifecycle — Check In → Generate Draw → Play & Score → Finalize Results → Next Round (repeat) — shows a clear "you are here" indicator and a primary "next action" CTA button, and prevents dangerous actions (re-draw, reset) during live scoring.

## User Stories
- As a **first-time drawmaster**, I want the app to tell me what to do next so that I can run a tournament day without reading documentation.
- As a **drawmaster**, I want a single prominent "Next Step" button that performs the right action for the current tournament state so that I'm not hunting through tabs.
- As a **drawmaster**, I want the "Re-Draw" action to require an explicit confirmation (with a warning about destroying existing assignments) so that I don't accidentally reset a live round.
- As a **drawmaster**, I want the round counter to always reflect the number of rounds that have been fully scored and finalized so that I'm never confused about which round I'm on.
- As a **player or spectator** viewing the tournament page, I want to see a clear visual indicator of where the tournament is in its lifecycle (e.g., "Round 2 of 3 — Scoring in Progress") so that I know the current status at a glance.

## Requirements

- **TWZ-01** — The `/bowls/[id]` page must be refactored to render a `TournamentWizard` component as the primary UI. The existing tab-based navigation (`PageView = "checkin" | "board" | "draw"`) must be replaced with a step-based state machine.
- **TWZ-02** — The wizard must map directly to the states already defined in `/api/bowls/progression`: `registration → checkin → draw → scoring → results → (next_round | complete)`. The UI step shown must always reflect the server-side state, not a locally-managed tab.
- **TWZ-03** — Each wizard step must display: (a) a step title, (b) a short description of what to do, (c) a primary CTA button for the next action, and (d) a secondary option to view adjacent steps (e.g., "View Board" from the checkin step).
- **TWZ-04** — A progress indicator (e.g., horizontal step rail or numbered breadcrumb) must be visible at the top of the wizard showing all steps and highlighting the current one.
- **TWZ-05** — The "Generate Draw" step must show: current checked-in player count, minimum required count, and format selector. The CTA button must be disabled with a tooltip explanation if the player count is below the minimum for the selected format.
- **TWZ-06** — The "Re-Draw" action (regenerating a draw after one has already been created) must display a modal confirmation dialog with the text: "This will delete the current draw for Round N and all existing assignments. This cannot be undone. Are you sure?" requiring explicit confirmation before proceeding.
- **TWZ-07** — While tournament state is `scoring` (at least one score has been entered and not all are finalized), the "Re-Draw" button must be disabled entirely with a tooltip: "Cannot re-draw while scores are in progress. Finalize or clear all scores first."
- **TWZ-08** — The round counter displayed in the wizard header must be derived exclusively from the server-side `progression.current_round` value returned by `/api/bowls/progression`, never from local component state.
- **TWZ-09** — The "Finalize Round" CTA must be disabled until all rinks in the current round have `is_finalized = true` in `tournament_scores`. It must show a count of outstanding rinks: "Waiting for 2 rinks to be finalized."
- **TWZ-10** — The "Next Round" step must display a preview of the upcoming round number and the action to be taken (generate a new draw for round N+1) before the drawmaster commits.
- **TWZ-11** — The "Tournament Complete" terminal step must show a summary card: total rounds played, total players, winner(s) by standings, and a link to the full results page.
- **TWZ-12** — The wizard must be fully responsive: on mobile, the step rail collapses to "Step N of M" text; on tablet/desktop, the full step rail is shown horizontally.
- **TWZ-13** — All wizard state transitions that call the progression API must show a loading state on the CTA button and disable further clicks until the response is received.
- **TWZ-14** — If the progression API returns an error for a state transition, the wizard must display an inline error message adjacent to the CTA button (not a full-page error) and allow retry.
- **TWZ-15** — The wizard must retain an "escape hatch": a collapsible "Advanced" panel that exposes the raw tab navigation (Check In list, Board, Draw sheet, Score entry, Results) for experienced drawmasters who prefer direct access.
- **TWZ-16** — The `TournamentWizard` component must be implemented as a standalone component in `src/components/bowls/TournamentWizard.tsx` with clearly defined props, making it independently testable.

## Success Criteria
- A user who has never used the app can run a complete tournament (check in players, generate draw, enter scores, finalize, advance to next round) by following only the wizard CTA buttons, without needing to navigate tabs.
- The "Re-Draw" button is inaccessible (not merely hidden) while `tournament_scores` contains any non-finalized entries for the current round.
- The round counter on the wizard header always matches `progression.current_round` from the API — verified by manually advancing rounds and confirming the UI reflects the change immediately.
- The wizard renders correctly on a 375px-wide mobile viewport (no horizontal scroll, no truncated labels).
- All 16 requirements have been QA-verified in staging.

## Technical Approach

**Key files to modify / create:**
- `src/app/bowls/[id]/page.tsx` — Replace the `PageView` state and tab buttons with `<TournamentWizard tournamentId={tournamentId} />`. Keep existing data-loading hooks (`loadCheckins`, `loadTournament`) at the page level and pass data down as props.
- `src/components/bowls/TournamentWizard.tsx` (new) — The primary wizard component. Owns `progression` state fetched from `/api/bowls/progression`. Maps `current_state` to a rendered step.
- `src/components/bowls/WizardStepRail.tsx` (new) — Horizontal progress indicator. Accepts `steps: string[]` and `currentIndex: number`.
- `src/components/bowls/ConfirmRedrawModal.tsx` (new) — Modal for re-draw confirmation. Accepts `round: number`, `onConfirm`, `onCancel`.
- `src/app/api/bowls/progression/route.ts` — No changes required; wizard consumes the existing API.

**State machine mapping:**
```
progression.current_state  →  Wizard Step Label
─────────────────────────────────────────────────
registration               →  "Tournament Setup"
checkin                    →  "Check In Players"
draw                       →  "Generate Draw"
scoring                    →  "Play & Score"
results                    →  "Round Results"
complete                   →  "Tournament Complete"
```

**Re-draw guard logic:**
```ts
const hasLiveScores = rinkScores.some(r => !r.isFinalized && (r.teamAScores.length > 0 || r.teamBScores.length > 0));
const canRedraw = progression?.current_state === "draw" && !hasLiveScores;
```

**Dependencies:** `framer-motion` (already installed) for step transition animations. No new packages required.

## Scope & Constraints

**In scope:**
- `TournamentWizard` component and step rail
- Re-draw confirmation modal
- Guard logic blocking re-draw during live scoring
- Round counter derived from server-side progression state
- Mobile-responsive step rail
- "Advanced" escape hatch panel preserving original tab access

**Out of scope:**
- Redesigning the score entry UI (`/bowls/[id]/scores`) — wizard links to existing page
- Redesigning the results page (`/bowls/[id]/results`) — wizard links to existing page
- Multi-device wizard sync (two drawmasters on different devices both seeing the wizard advance in realtime — that is a separate realtime PRD)
- Undo / rollback of finalized rounds

**Risks:**
- The progression API is the source of truth for wizard state; if it has latency (e.g., cold Supabase edge function), the wizard CTA buttons may feel sluggish. Optimistic state updates should be used where safe (e.g., after a successful `next_round` transition).
- The "Advanced" escape hatch adds ongoing maintenance burden — any new tabs added to the original UI must also be added to the escape hatch panel.

## Estimated Effort
M
