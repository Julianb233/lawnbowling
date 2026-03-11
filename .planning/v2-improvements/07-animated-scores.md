# PRD: Animated Score Entry

## Problem Statement
Score entry is the highest-frequency interaction during any bowls day, yet it is entirely static — numbers update instantly with no visual feedback, no acknowledgment of significant moments (end completion, match point, win), and no micro-interactions that communicate the app has registered the input. The experience feels like a spreadsheet rather than a live sports tool.

## Goal
Score entry feels alive and satisfying through tasteful micro-interactions: number flip animations on score changes, a subtle pulse when an end is completed, and a celebratory animation when a match is won — all non-blocking and fast enough that they never impede workflow.

## User Stories
- As a scorer, I want to see a number flip animation when I enter a score so that I get clear visual confirmation the score was registered.
- As a player watching scores update on a shared device, I want visual feedback when an end is completed so that the transition between ends is clearly communicated.
- As a player, I want a satisfying celebration animation when a match is won so that the moment feels rewarding and memorable.
- As a drawmaster entering many scores rapidly, I want animations to complete quickly and not block further input so that my workflow is never slowed down.
- As a player at match point, I want the UI to communicate the tension of the moment so that the experience matches the excitement of the game.

## Requirements

1. **REQ-AS-01**: Implement a `NumberFlip` component that animates a score digit change using a vertical CSS keyframe transition (outgoing number slides up/out, incoming number slides down/in), completing in ≤ 250 ms.
2. **REQ-AS-02**: The `NumberFlip` animation must trigger on any change to a team's score value — both increments and decrements.
3. **REQ-AS-03**: If a score changes by more than 1 in a single update (e.g. a 4-point end), each digit position animates independently rather than one combined flip.
4. **REQ-AS-04**: Implement an `EndComplete` pulse — a brief ring/glow effect on the end row that played — triggering when the score for an end is saved. Duration ≤ 400 ms. Must not shift layout.
5. **REQ-AS-05**: Implement a `MatchWon` celebration — a short (≤ 2 s) full-screen confetti or particle burst in team/brand colors — triggering when a match winner is determined. Must auto-dismiss without user interaction.
6. **REQ-AS-06**: Implement a `MatchPoint` indicator — a subtle pulsing badge or highlight on the leading team's score when they are one point or one end away from winning — so the tension of the moment is visible.
7. **REQ-AS-07**: All animations must be implemented using CSS keyframes or the Web Animations API (no heavy animation library dependency); Framer Motion is acceptable if already in the dependency tree.
8. **REQ-AS-08**: Animations must respect `prefers-reduced-motion`: if the user has opted out of motion, all animations must be skipped or reduced to instant transitions.
9. **REQ-AS-09**: Score input controls (buttons, tap targets) must remain fully interactive during any animation — no pointer-events blocking.
10. **REQ-AS-10**: The `MatchWon` celebration must not obscure the final score display; it should layer above content using a fixed overlay that the user can also tap/click to dismiss early.
11. **REQ-AS-11**: Animation state must be driven by score data props/state — components must remain pure and not carry animation state that could desync from server state after a Supabase real-time update.
12. **REQ-AS-12**: All animation components must be exported from a single `src/components/animations/` directory for easy discoverability.
13. **REQ-AS-13**: A Storybook story or isolated test page is not required, but each animation component must accept a `debug` prop that forces the animation to play on mount, allowing manual QA without needing to trigger the real game event.
14. **REQ-AS-14**: The existing score entry page (`src/app/bowls/[id]/scores/page.tsx`) must continue to pass all existing type checks and render tests after animation integration.
15. **REQ-AS-15**: Total JS bundle size increase from animation additions must not exceed 15 kB gzipped.

## Success Criteria
- A scorer entering a score sees the number flip animation within one frame of the state update, with no perceptible delay.
- Completing an end produces a visible but non-distracting pulse on the relevant row.
- A match winner triggers the celebration overlay; it auto-dismisses within 2 s.
- Match-point state is visually indicated and updates correctly as scores change.
- On a device with `prefers-reduced-motion: reduce`, no motion occurs — scores update instantly.
- Score buttons remain tappable during all active animations (no input blockage).
- Bundle size increase is verified to be under 15 kB gzipped.

## Technical Approach
- **`src/components/animations/NumberFlip.tsx`**: Wraps a score integer. On value change, uses `useEffect` + CSS class toggle to trigger keyframe animation. Uses `requestAnimationFrame` to synchronize DOM class add with next paint.
- **`src/components/animations/EndPulse.tsx`**: Renders a positioned `::after` pseudo-element ring. Triggered by a `active` prop; auto-resets after `animationend` event.
- **`src/components/animations/MatchWon.tsx`**: Fixed overlay with a canvas-based confetti or pure-CSS particle burst. Accepts `teamName` and `teamColor` props. Uses `setTimeout` for auto-dismiss.
- **`src/components/animations/MatchPoint.tsx`**: Badge/ring rendered next to the score. Uses a CSS `pulse` keyframe on a loop while `isMatchPoint` prop is true.
- **`src/app/bowls/[id]/scores/page.tsx`**: Import and compose the above components. Derive `isMatchPoint` and `isMatchWon` from existing score state logic.
- **`prefers-reduced-motion`**: Use a `useReducedMotion` hook that reads `window.matchMedia('(prefers-reduced-motion: reduce)')` and pass a `noMotion` prop or CSS variable to all animation components.

## Scope & Constraints
**In scope**: Score digit flip, end completion pulse, match-won celebration, match-point indicator, reduced-motion support.
**Out of scope**: Sound effects, haptic feedback, animated scorecards on the `/tv` route (separate PRD), score history animations, leaderboard animations.
**Risks**: Animation timing desync with Supabase real-time updates — ensure animation is driven by state changes, not network events directly. CSS keyframe approach avoids heavy library dependencies but requires careful cross-browser testing on older Safari versions used on club iPads.

## Estimated Effort
S
