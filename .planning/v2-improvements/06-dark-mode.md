# PRD: Dark Mode Clubhouse Theme

## Problem Statement
Only the `/tv` route has dark mode styling, leaving the rest of the app with a bright white interface that is jarring for players and drawmasters using devices in evening conditions or low-light club environments. The existing brand palette includes a deep green that would translate beautifully to a dark mode theme but is currently unused at the app level.

## Goal
Implement a full app-wide dark mode toggle using the brand's deep green palette, respecting the user's system preference by default and persisting the manual toggle choice across sessions via localStorage.

## User Stories
- As a player checking scores on my phone at an evening match, I want dark mode so that the screen is comfortable to read without disturbing others or straining my eyes.
- As a drawmaster running a tournament indoors with the lights dimmed on the projector screen, I want dark mode so the UI doesn't wash out the display.
- As a club administrator, I want dark mode to respect my device's system preference automatically so that I don't have to configure it.
- As a user who prefers light mode during the day and dark mode at night, I want my manual toggle choice to persist across sessions so that I don't have to re-set it every visit.

## Requirements

1. **REQ-DM-01**: Add a `dark` class toggle to the `<html>` element in `src/app/layout.tsx` that controls the entire app color scheme.
2. **REQ-DM-02**: Define a complete dark mode color palette in `src/app/globals.css` using CSS custom properties (e.g. `--background`, `--foreground`, `--surface`, `--border`, `--primary`) scoped under `.dark`.
3. **REQ-DM-03**: The dark palette must use the brand's deep green as the primary surface color (approx. `#0f2518` base, `#1a3d28` surface) rather than a generic gray/black dark mode.
4. **REQ-DM-04**: Update `tailwind.config.ts` to set `darkMode: 'class'` so Tailwind dark variants (`dark:`) are driven by the class strategy.
5. **REQ-DM-05**: On initial page load, read `window.matchMedia('(prefers-color-scheme: dark)')` and apply dark mode automatically if the system preference is dark and no manual override is stored.
6. **REQ-DM-06**: Persist the user's manual toggle choice in `localStorage` under the key `lb-color-scheme` with values `'light'` or `'dark'`.
7. **REQ-DM-07**: Place the theme-initialization script inline in `<head>` (before first paint) to prevent flash of incorrect theme (FOIT).
8. **REQ-DM-08**: Add a dark mode toggle button (sun/moon icon) accessible from the top-level navigation, visible on all routes.
9. **REQ-DM-09**: The `/tv` route must continue to function correctly in dark mode; its existing dark styling should be reconciled with the new system (not duplicated).
10. **REQ-DM-10**: All existing Tailwind utility classes on interactive elements (buttons, cards, inputs, tables, modals) must have corresponding `dark:` variants ensuring sufficient contrast (WCAG AA minimum).
11. **REQ-DM-11**: Form inputs, dropdowns, and date pickers must use dark-mode-aware border and background colors so they do not appear as bright white islands in dark mode.
12. **REQ-DM-12**: Charts and score visualizations must use palette-compatible colors in dark mode (no white backgrounds on chart containers).
13. **REQ-DM-13**: The toggle must be keyboard-accessible and have an appropriate `aria-label` describing the current mode and action.
14. **REQ-DM-14**: A `useTheme` hook (or equivalent context) must be provided so any component can read the current theme and switch it without prop drilling.
15. **REQ-DM-15**: Dark mode must work correctly after hydration in the Next.js App Router (no hydration mismatch warnings in the console).

## Success Criteria
- Toggling dark mode from any page applies the new theme instantly across the entire app with no flash.
- System preference is correctly detected and applied on first visit with no JavaScript errors.
- The manual toggle choice survives a full browser close and reopen.
- All pages pass a visual review: no white backgrounds, no invisible text, no broken contrast in dark mode.
- WCAG AA contrast ratio is met for all body text and interactive elements in both modes.
- The `/tv` route renders correctly in dark mode without duplicated style logic.
- Zero hydration mismatch warnings appear in the Next.js dev console.

## Technical Approach
- **`tailwind.config.ts`**: Set `darkMode: 'class'`.
- **`src/app/globals.css`**: Define `:root` (light) and `.dark` (dark) custom property blocks. Map existing Tailwind color references to use these variables.
- **`src/app/layout.tsx`**: Inject an inline `<script>` in `<head>` that reads localStorage / system preference and sets `document.documentElement.classList` synchronously before render.
- **New file `src/components/ThemeProvider.tsx`**: React context provider wrapping the app, exposing `theme` and `setTheme`. Syncs with localStorage and applies class to `<html>`.
- **New file `src/components/ThemeToggle.tsx`**: Icon button rendering a sun or moon depending on current theme; placed in the shared nav component.
- **Audit pass**: Search all `bg-white`, `text-gray-900`, `border-gray-200` etc. and add `dark:` variants or replace with CSS variable references.
- **`/tv` route**: Remove any hardcoded `bg-black`/`text-white` and replace with dark-mode classes so it is consistent.

## Scope & Constraints
**In scope**: App-wide CSS variables, Tailwind dark mode config, theme toggle UI, persistence, system preference detection, FOIT prevention, WCAG contrast audit.
**Out of scope**: Per-page custom themes, user profile color customization, high-contrast accessibility mode, admin branding overrides.
**Risks**: Large number of components needing `dark:` class audit — use a grep pass to find all hardcoded white/light colors and address systematically. Hydration mismatches in Next.js App Router are a known pitfall — the inline script approach is the standard mitigation.

## Estimated Effort
M
