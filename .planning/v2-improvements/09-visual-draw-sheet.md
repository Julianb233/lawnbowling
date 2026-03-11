# PRD: Visual Draw Sheet Redesign

## Problem Statement
The draw sheet is currently a plain HTML table of names and rink numbers with no visual hierarchy, no communication of team structure or player positions, and no support for printing — yet drawmasters regularly print it on paper and players need to find their name quickly on a small phone screen. The current design fails both the digital and physical use cases.

## Goal
Replace the plain table with a visual rink-layout draw sheet that color-codes player positions (Skip, Vice, Second, Lead), highlights the viewing player's own name, includes a "Find Me" scroll shortcut, produces a clean printable version with club branding, and reveals teams with subtle screen animations.

## User Stories
- As a player viewing the draw on my phone, I want my name highlighted and a "Find Me" button so that I can locate my rink assignment in seconds without scrolling through the entire sheet.
- As a drawmaster, I want each rink shown as a visual layout with player positions clearly labeled so that players understand their roles at a glance.
- As a player, I want position colors (Skip, Vice, Second, Lead) visually distinct so that I can quickly identify my role within the team.
- As a drawmaster, I want to print a clean, professional-looking draw sheet with the club logo so that physical copies handed to players look polished.
- As a drawmaster revealing the draw live in a club meeting, I want teams to animate in sequentially so that the reveal feels engaging and theatrical.

## Requirements

1. **REQ-DS-01**: Replace the existing draw table in the Draw tab of `src/app/bowls/[id]/page.tsx` with a new `DrawSheet` component located at `src/components/draw/DrawSheet.tsx`.
2. **REQ-DS-02**: Each rink must be rendered as a distinct card showing: rink number, rink name (if applicable), and all four player positions (Skip, Vice, Second, Lead) as labeled slots within the card.
3. **REQ-DS-03**: Each position slot must be color-coded consistently across all rinks using a fixed four-color palette: Skip (brand primary green), Vice (teal/secondary), Second (amber), Lead (slate/neutral). Colors must have sufficient contrast for readability.
4. **REQ-DS-04**: If a team has fewer than four players (triples, pairs, singles), unused position slots must be visually omitted from the card rather than shown as empty.
5. **REQ-DS-05**: The draw sheet must detect the current logged-in user's name and highlight their player slot with a bold outline, distinct background tint, and "You" badge. This detection must work without requiring a separate API call if the user's profile is already available in session context.
6. **REQ-DS-06**: A "Find My Rink" button must be displayed at the top of the draw sheet. Tapping it must smoothly scroll (CSS `scroll-behavior: smooth`) to the rink card containing the current user's name.
7. **REQ-DS-07**: If the current user is not found in the draw (e.g. they are a spectator or not entered), the "Find My Rink" button must be hidden rather than displayed in a non-functional state.
8. **REQ-DS-08**: The draw sheet must support a `revealMode` prop. When `revealMode={true}`, rink cards animate in sequentially with a staggered fade-up effect (50 ms delay between each card, 300 ms per card animation). When `revealMode={false}` (default), all cards render instantly.
9. **REQ-DS-09**: Animations in `revealMode` must respect `prefers-reduced-motion` — all cards must render without animation if the user has opted out.
10. **REQ-DS-10**: A print-optimized stylesheet must be scoped to the `DrawSheet` component using a `@media print` block (or a separate CSS module). Print styles must: remove navigation, remove the "Find My Rink" button, render all rinks in a clean two-column grid, include the club name and draw name as a header, include the draw date, and use black-and-white safe styling (no background colors — use borders and bold instead).
11. **REQ-DS-11**: A "Print Draw Sheet" button must appear above the draw on screen and trigger `window.print()`. This button must be hidden in the print stylesheet.
12. **REQ-DS-12**: The draw sheet must be readable on screens as narrow as 375px (iPhone SE). On narrow screens, rink cards must stack to a single-column layout.
13. **REQ-DS-13**: On screens 768px and wider, rink cards must display in a two-column grid. On screens 1280px and wider, a three-column grid is preferred.
14. **REQ-DS-14**: Player names must truncate with an ellipsis if they overflow their position slot width, and must show the full name in a native `title` tooltip on hover.
15. **REQ-DS-15**: The `DrawSheet` component must accept the draw data via props (not fetch it internally) so it can be reused on the `/tv` route's Next Draw slide without coupling.
16. **REQ-DS-16**: Rink cards must show the rink number prominently (large, bold) so players can visually scan to their rink without reading every name.
17. **REQ-DS-17**: If the tournament has assigned rink locations (e.g. "Rink 3 — East Green"), the location label must appear as a subtitle below the rink number.
18. **REQ-DS-18**: The existing draw data structures and API calls must not be changed — the `DrawSheet` component must consume whatever shape the current draw tab passes, with any necessary transformation done inside the component or a `transformDrawData` utility.

## Success Criteria
- A player can tap "Find My Rink" and their card scrolls into view within one second on a mid-range mobile device.
- All four player positions are visually distinct by color and labeled clearly on every rink card.
- The printed output is clean, legible in black and white, fits on standard A4/Letter paper, and includes the club name and draw date.
- On a 375px screen, all rink cards are fully readable with no horizontal overflow.
- Reveal mode animates cards in sequentially and is skipped entirely with `prefers-reduced-motion`.
- The user's own position slot is unambiguously highlighted and different from all other slots.
- Rink cards on the `/tv` Next Draw slide render correctly using the same `DrawSheet` component.

## Technical Approach
- **`src/components/draw/DrawSheet.tsx`**: Main component. Accepts `draw`, `currentUserId`, `revealMode` props. Renders a CSS grid of `RinkCard` components.
- **`src/components/draw/RinkCard.tsx`**: Individual rink card. Accepts `rink` data and `highlightUserId`. Renders position slots using `PositionSlot` sub-component.
- **`src/components/draw/PositionSlot.tsx`**: Single player position. Accepts `position` (enum), `playerName`, `isCurrentUser`. Applies position color via a `data-position` attribute and CSS variables.
- **`src/components/draw/DrawSheet.module.css`**: CSS module with grid layout, position color variables, `@media print` block, and reveal animation keyframes.
- **`src/app/bowls/[id]/page.tsx`**: Replace the existing draw tab table with `<DrawSheet draw={drawData} currentUserId={session?.user?.id} />`.
- **Print CSS**: `.draw-sheet-actions { display: none; }` and `@media print { .rink-card { break-inside: avoid; } }` to prevent mid-card page breaks.
- **Transform utility**: If the existing draw data shape does not map cleanly to the `DrawSheet` prop interface, add `src/lib/draw/transformDrawData.ts`.

## Scope & Constraints
**In scope**: Visual rink cards, position color coding, current-user highlight, Find My Rink scroll, reveal animation, print stylesheet, responsive layout.
**Out of scope**: Drag-and-drop rink editing from the draw sheet view (that is a drawmaster tool, not a display feature), map-based rink selection, team history/statistics overlays on the card, PDF export (print-to-PDF covers this).
**Risks**: Draw data shape variability — different tournament formats (triples, fours, pairs) produce different team sizes; REQ-DS-04 must handle all cases gracefully. The "Find My Rink" feature requires the logged-in user's display name to exactly match how their name is stored in the draw; a fuzzy match or ID-based lookup may be needed.

## Estimated Effort
M
