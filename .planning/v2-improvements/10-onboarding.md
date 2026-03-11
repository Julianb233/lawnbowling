# PRD: Onboarding Experience

## Problem Statement
New users — whether players scanning a QR code at the club, drawmasters setting up their first tournament, or club administrators configuring a new venue — receive no introduction to the app. Every workflow must be discovered by trial and error, leading to confusion, abandoned sessions, and support burden for club administrators.

## Goal
Deliver three distinct onboarding flows — Player (3-screen animated walkthrough), Drawmaster (guided first-tournament setup with tooltips), and Club Admin (step-by-step venue and member setup wizard) — that get each user type to their first meaningful action with confidence.

## User Stories
- As a player scanning a QR code at the club for the first time, I want a brief animated walkthrough explaining check-in, finding my rink, and viewing scores so that I understand the app immediately without asking anyone.
- As a drawmaster setting up my first tournament, I want contextual tooltips and a guided flow so that I don't accidentally skip required steps or misconfigure the draw format.
- As a club administrator setting up a new venue, I want a step-by-step wizard so that I can configure greens, members, and settings without reading documentation.
- As a returning user, I want onboarding to not appear again after I have completed it so that repeat visits are not interrupted.
- As a drawmaster who dismissed onboarding accidentally, I want to be able to re-launch it from the help menu so that I can revisit the guidance at any time.

## Requirements

### General

1. **REQ-OB-01**: Each onboarding flow must be independently triggered — completing or dismissing one must not affect the others.
2. **REQ-OB-02**: Completion state for each flow must be persisted per-user in Supabase (not just localStorage) so that it survives device changes and app reinstalls.
3. **REQ-OB-03**: A "Skip for now" / "Dismiss" option must be present on every onboarding screen. Dismissal must be counted as a soft-skip, not a completion — the flow may re-appear once more on a subsequent visit before being permanently suppressed after the second dismissal.
4. **REQ-OB-04**: All onboarding flows must be re-launchable from a "Restart onboarding" or "Take the tour" option in the app's help/settings menu.
5. **REQ-OB-05**: All onboarding screens must be fully accessible: keyboard navigable (Tab / Enter / Escape), with appropriate `role="dialog"`, `aria-labelledby`, and focus trapping.
6. **REQ-OB-06**: All onboarding animations must respect `prefers-reduced-motion` — screens must crossfade rather than slide if motion is reduced.

### Player Onboarding

7. **REQ-OB-07**: The player onboarding must trigger automatically on a user's first visit to any `/bowls/` route when the user is not yet associated with any tournament.
8. **REQ-OB-08**: The flow must consist of exactly three screens presented as a modal overlay: (1) Welcome — app name, tagline, brief purpose statement; (2) Check In — illustration showing the check-in flow with a brief caption; (3) Find Your Rink & Track Scores — illustration of the draw sheet and score view with caption.
9. **REQ-OB-09**: Each screen must feature a simple SVG or Lottie illustration relevant to the step (bowls ball for welcome, rink diagram for draw, scoreboard for scores).
10. **REQ-OB-10**: Navigation between screens must use a Next / Back button pair and a dot-indicator showing current position (e.g. ● ○ ○).
11. **REQ-OB-11**: Screen transitions must animate using a horizontal slide (left-to-right for Next, right-to-left for Back) at ≤ 300 ms.
12. **REQ-OB-12**: The final screen must have a "Let's go!" CTA button that closes the modal and marks the flow as complete in Supabase.

### Drawmaster Onboarding

13. **REQ-OB-13**: The drawmaster onboarding must trigger automatically when a user with drawmaster or admin role navigates to the tournament management area for the first time (detected by a `drawmaster_onboarding_completed` flag in the user profile).
14. **REQ-OB-14**: The flow must use a tooltip-based approach (spotlight/coach mark style) rather than a modal overlay, so the drawmaster can see the actual UI while receiving guidance.
15. **REQ-OB-15**: The tooltip tour must cover the following steps in order: (1) Create Tournament button, (2) Configure format (rounds, ends, scoring), (3) Add players / import roster, (4) Generate draw, (5) Publish draw and open scoring.
16. **REQ-OB-16**: Each tooltip must include: a step counter (e.g. "Step 2 of 5"), a one-sentence explanation of the current UI element, and a "Next" button. The last step must have a "Done" button.
17. **REQ-OB-17**: The spotlight effect must dim the rest of the screen (semi-transparent overlay) and highlight the target element with a visible border/glow, using `position: fixed` overlay with a CSS `clip-path` or `box-shadow` cutout.
18. **REQ-OB-18**: If the drawmaster navigates away from the page mid-tour, the tour must resume from the correct step on the next visit to the relevant page within the same session.
19. **REQ-OB-19**: Tooltip positioning must auto-flip (above/below/left/right) based on available viewport space so tooltips are never clipped off-screen.

### Club Admin Onboarding

20. **REQ-OB-20**: The club admin onboarding wizard must trigger when a new club is created or when an admin first visits the admin dashboard with an incomplete venue setup (detected by missing green/court data).
21. **REQ-OB-21**: The wizard must be a multi-step full-page flow (not a modal), replacing the admin dashboard content, with a persistent progress bar showing completion percentage across all steps.
22. **REQ-OB-22**: The wizard must consist of the following steps: (1) Club Profile — name, address, logo upload, contact email; (2) Greens Setup — add greens/courts with names and rink counts; (3) Member Import — upload CSV or add members manually (minimum 1 member to advance); (4) First Tournament — create a tournament with name and date (skippable); (5) Done — summary of what was configured and links to next actions.
23. **REQ-OB-23**: Each wizard step must validate its required fields before allowing advancement. Validation errors must be shown inline, not as a toast or alert.
24. **REQ-OB-24**: Step state must be auto-saved to Supabase after completing each step so that an admin who closes the browser mid-wizard can resume from their last completed step.
25. **REQ-OB-25**: The wizard must be accessible from the admin dashboard as "Complete Setup" for partially completed setups, and hidden once all steps are marked complete.
26. **REQ-OB-26**: The Done screen must display a checklist of completed items and provide direct action links: "View your club page", "Create a tournament", "Invite members".

## Success Criteria
- A new player completing the 3-screen walkthrough can check in, find their rink, and view scores without any additional guidance.
- A new drawmaster following the tooltip tour successfully creates and publishes their first tournament without error.
- A club administrator completing the wizard has a fully configured venue (club profile, at least one green, at least one member) at the end.
- All three flows correctly mark themselves as complete in Supabase and do not re-trigger on subsequent visits.
- Each flow can be re-launched from the help/settings menu at any time.
- All onboarding UI passes keyboard navigation and screen reader accessibility checks (focus trapping, ARIA roles, Escape to dismiss).
- Onboarding screens display correctly on 375px mobile and 1440px desktop viewports.
- `prefers-reduced-motion` is respected across all animated transitions.

## Technical Approach
- **`src/components/onboarding/PlayerOnboarding.tsx`**: Modal component with slide carousel. Triggered by a `useOnboarding('player')` hook that checks Supabase completion flag.
- **`src/components/onboarding/DrawmasterTour.tsx`**: Tooltip spotlight component. Uses a `tourSteps` config array mapping step to a CSS selector and tooltip content. Manages step state and page-change persistence via sessionStorage for mid-tour navigation.
- **`src/components/onboarding/AdminWizard.tsx`**: Multi-step full-page wizard. Each step is its own sub-component under `src/components/onboarding/wizard/`. Uses React Hook Form for validation. Auto-saves to Supabase on step completion.
- **`src/hooks/useOnboarding.ts`**: Shared hook. Accepts a flow name, reads completion state from Supabase user metadata, returns `{ isComplete, markComplete, resetFlow }`.
- **`src/app/layout.tsx`**: Mount `<PlayerOnboarding />` and `<DrawmasterTour />` at the layout level (they self-suppress based on hook state).
- **`src/app/bowls/[id]/page.tsx`**: No changes needed — player onboarding triggers via the layout-level component.
- **Supabase**: Add `onboarding_state` JSONB column to the user profiles table storing `{ player: boolean, drawmaster: boolean, admin_wizard_step: number | null }`.
- **Illustrations**: Use inline SVG components (no external asset fetches) for the player onboarding screens to avoid layout shift and keep bundle self-contained.

## Scope & Constraints
**In scope**: Three distinct flows, Supabase persistence, re-launch from settings, reduced-motion support, accessibility compliance, auto-save for wizard.
**Out of scope**: Video tutorials, in-app chat support, AI-guided onboarding, onboarding analytics/funnel tracking (can be added later), multi-language support.
**Risks**: The drawmaster tooltip tour depends on stable CSS selectors for target elements — use `data-onboarding-target` attributes on key UI elements rather than class or ID selectors to avoid brittleness. The admin wizard CSV import step requires the existing member import logic to be in a reusable state; if it is tightly coupled to a specific admin page, refactoring may be needed before the wizard step can use it.

## Estimated Effort
M
