# PRD: Mead Draw & Gavel Draw Formats

## Problem Statement
The tournament engine supports only random and seeded draws, omitting the Mead Draw and Gavel Draw — the two most widely used multi-round rotation formats in lawn bowling clubs worldwide. Without these formats, serious drawmasters will not adopt the app because they cannot replicate the balanced partner-and-opponent rotation their members expect.

## Goal
A drawmaster can select "Mead Draw" or "Gavel Draw" when generating a multi-round tournament, and the system produces the mathematically correct rotation tables ensuring every player partners with and faces every other player the expected number of times across all rounds.

## User Stories
- As a **drawmaster**, I want to select "Mead Draw" as the draw format so that I can run a multi-round social bowls day with fair partner rotation without doing the maths manually.
- As a **drawmaster**, I want to select "Gavel Draw" as the draw format so that I can run a tournament with the traditional Gavel rotation rules used in my club's competitions.
- As a **player**, I want to see who my partners and opponents are in each round so that I can plan which rink to go to without asking the drawmaster.
- As a **drawmaster**, I want the app to tell me how many rounds the Mead/Gavel table supports for the current player count so that I know upfront whether it will work.
- As a **drawmaster**, I want to print or display the full multi-round draw sheet at once so that players can see all rounds, not just the current one.

## Requirements

- **MGD-01** — The draw format selector on the tournament creation/edit screen must include "Mead Draw" and "Gavel Draw" as options alongside the existing random and seeded draws.
- **MGD-02** — The `generateBowlsDraw` function in `src/lib/bowls-draw.ts` must be extended (or a new peer function added) to implement the Mead Draw algorithm: given `n` players (must be a multiple of the rink size), produce rotation tables such that across all rounds each player partners and opposes each other player the same number of times.
- **MGD-03** — The system must implement the Gavel Draw algorithm with its distinct rotation rules (offset-based rotation differing from Mead). Both algorithms must be implemented as pure functions with no side effects, following the existing pattern in `bowls-draw.ts`.
- **MGD-04** — Before generating a Mead or Gavel draw, the API must validate that the player count is compatible with the selected draw table. If not compatible, the API must return a structured error: `{ error: "incompatible_player_count", min: <n>, max: <n>, supported_counts: [n1, n2, ...] }`.
- **MGD-05** — The `/api/bowls/draw` POST route must accept a new optional field `draw_style: "random" | "seeded" | "mead" | "gavel"` in the request body. If omitted, it defaults to `"random"` for backward compatibility.
- **MGD-06** — The tournament detail page (`/bowls/[id]`) must display the draw format label ("Mead Draw", "Gavel Draw") in the header/metadata section when one of these formats is active.
- **MGD-07** — For Mead and Gavel draws, the draw result stored in `tournament_scores` (or a new `tournament_draws` table) must persist all rounds at once, not just round 1, so that the full rotation is available without regenerating.
- **MGD-08** — The draw sheet UI must be enhanced to display a round selector (Round 1, Round 2, … Round N) when a multi-round Mead or Gavel draw has been generated, allowing the drawmaster to show each round without re-running the draw.
- **MGD-09** — The print draw sheet component (`PrintDrawSheet`) must support printing the full multi-round schedule as a single document with each round on a new page section.
- **MGD-10** — The Mead Draw implementation must support the following player counts at minimum: 16, 20, 24, 28, 32 (standard club day sizes) for fours format. Triples and pairs equivalents must also be supported.
- **MGD-11** — The Gavel Draw implementation must support player counts of 12, 16, 20, 24 at minimum for fours format.
- **MGD-12** — Both draw algorithms must have comprehensive unit tests validating: (a) no player appears twice in the same round, (b) every player appears in every round, (c) partner rotation is balanced across rounds (each pair plays together at most once in a standard table).
- **MGD-13** — If a player count is not directly supported by the standard table, the system must attempt to use the nearest supported table and flag "bye" positions for players who sit out a given round.
- **MGD-14** — The tournament `format` column (or a new `draw_style` column) in the `tournaments` table must be updated to store which draw style was used so that results pages and history correctly label past draws.

## Success Criteria
- A drawmaster can generate a 24-player Mead Draw for fours and the output contains exactly 6 rounds with 3 rinks per round, every player appears in all 6 rounds, and no two players are partnered more than once.
- A drawmaster can generate a 20-player Gavel Draw for fours and the output is mathematically valid per the Gavel rotation table.
- Attempting a Mead Draw with 18 players (unsupported count) returns the `incompatible_player_count` error and suggests the nearest valid counts (16 or 20).
- The unit test suite for Mead and Gavel algorithms passes with zero failures.
- The full multi-round draw sheet prints correctly from the print view.

## Technical Approach

**Key files to modify / create:**
- `src/lib/bowls-draw.ts` — Add `generateMeadDraw(checkins, format)` and `generateGavelDraw(checkins, format)` functions. Each returns a `MultiRoundDrawResult` type: `{ rounds: DrawRound[], style: "mead" | "gavel", totalRounds: number }`.
- `src/lib/mead-tables.ts` (new) — Static lookup tables for standard Mead Draw rotations indexed by player count and format. These are the established published tables, not algorithmically generated.
- `src/lib/gavel-tables.ts` (new) — Static lookup tables for Gavel Draw rotations.
- `src/app/api/bowls/draw/route.ts` — Accept `draw_style` field; dispatch to the appropriate generator function.
- `src/app/bowls/[id]/page.tsx` — Add round selector when `drawResult.rounds` has length > 1; persist the selected round in component state.
- `src/components/bowls/PrintDrawSheet.tsx` — Add multi-round print mode.
- `supabase/migrations/` — Add `draw_style` column to `tournaments`; optionally add `tournament_draws` table to persist all rounds.

**Multi-round result type:**
```ts
export interface MultiRoundDrawResult {
  style: "mead" | "gavel" | "random" | "seeded";
  rounds: {
    round: number;
    rinks: BowlsTeamAssignment[][];
    unassigned: BowlsCheckin[];
  }[];
  totalRounds: number;
  playerCount: number;
  format: BowlsGameFormat;
}
```

**Table lookup pattern (Mead):**
```ts
// Tables are published standards — encode as static arrays.
// MEAD_TABLE[playerCount][formatKey] = round[][] where each entry is a rink assignment index.
import { MEAD_TABLE } from "./mead-tables";

export function generateMeadDraw(checkins, format): MultiRoundDrawResult {
  const table = MEAD_TABLE[checkins.length]?.[format];
  if (!table) throw new MeadCompatibilityError(checkins.length, format);
  // Map table indices to player IDs via shuffle for fairness
  ...
}
```

**Dependencies:** No new packages. The draw tables are static data encoded in TypeScript files. The `tournament_draws` table (if introduced) requires a Supabase migration.

## Scope & Constraints

**In scope:**
- Mead Draw algorithm and static rotation tables for fours (16–32 players), triples (12–24), pairs (8–16)
- Gavel Draw algorithm and static rotation tables for fours (12–24 players)
- Multi-round draw persistence and round selector UI
- Print sheet multi-round support
- Player count validation with structured error response
- Unit tests for both algorithms

**Out of scope:**
- American Draw format
- Triples Gavel Draw (too few standard tables exist — defer)
- Seeded Mead Draw (seeds within a Mead table is a separate concern)
- Real-time opponent history analysis across tournaments to further balance draws

**Risks:**
- The Mead and Gavel tables are published by Bowls bodies (World Bowls / national associations) and must be verified against official sources before encoding. Using an incorrect table would silently produce invalid draws.
- Player counts that don't map to standard table sizes are common at small clubs — the bye/partial-table fallback (MGD-13) must be handled gracefully.

## Estimated Effort
M
