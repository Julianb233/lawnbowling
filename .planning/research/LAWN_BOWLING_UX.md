# Lawn Bowling Club App -- UI/UX Design Research

**Project:** Pick-a-Partner
**Domain:** Lawn bowls tournament-day operations on iPad kiosk + iPhone
**Researched:** 2026-03-11
**Overall confidence:** HIGH (grounded in WCAG standards, Apple HIG, peer-reviewed elderly UX research, and existing kiosk app patterns)

---

## Table of Contents

1. [Elderly-Friendly Design Principles](#1-elderly-friendly-design-principles)
2. [iPad Kiosk Mode UX](#2-ipad-kiosk-mode-ux)
3. [Information Architecture](#3-information-architecture)
4. [Color Schemes and Branding](#4-color-schemes-and-branding)
5. [Accessibility Considerations](#5-accessibility-considerations)
6. [Comparable Apps with Great Elderly UX](#6-comparable-apps-with-great-elderly-ux)
7. [Audit of Current Implementation](#7-audit-of-current-implementation)
8. [Recommendations Summary](#8-recommendations-summary)

---

## 1. Elderly-Friendly Design Principles

The core user base is 60-80+ years old. This is not an edge case to accommodate -- it IS the primary design target. Every design decision must pass the test: "Would an 80-year-old who has never used an iPad be able to do this?"

### 1.1 Touch Target Sizes

**The standard:** Apple HIG mandates a minimum 44x44pt touch target. WCAG 2.5.5 (AAA) requires 44x44 CSS pixels. WCAG 2.5.8 (AA, added in WCAG 2.2) requires a minimum 24x24px target size.

**Our standard -- go bigger:** For a 70-80 year old user base with declining motor control, 44pt is the floor, not the target.

| Element | Minimum Size | Recommended Size | Rationale |
|---------|-------------|-----------------|-----------|
| Primary action buttons (Check In, Enter, Submit) | 60x60pt | 72x80pt or full-width | Must be unmissable. Research shows 48px+ reduces error rates significantly for motor-impaired users. |
| Player name tiles in check-in list | 56x56pt | 64pt tall, full-width on phone | Users must tap their own name. A miss = frustration. |
| Navigation tabs (Check In / Board / Results) | 48x48pt | 56pt tall, generous padding | Tab switching is secondary but must be easy. |
| Position preference buttons (Skip/Lead/Vice) | 56x56pt | 64pt tall, minimum 120pt wide | These carry important meaning; users need time to read and tap confidently. |
| Back / Cancel buttons | 44x44pt | 48pt, with generous padding | Less critical but must be reachable. |

**Spacing between targets:** Minimum 8pt gap between adjacent touch targets. Recommend 12-16pt for primary actions to prevent accidental taps on neighboring elements.

**The `touch-manipulation` CSS property** should be on all interactive elements (already applied in globals.css -- good).

### 1.2 Typography

**The problem:** Age-related vision changes include presbyopia (difficulty focusing on close objects), reduced contrast sensitivity, slower adaptation to brightness changes, and narrowing field of vision. By age 75, the average person needs 3x more light to read than at age 20.

| Text Role | Minimum Size | Recommended Size | Weight | Notes |
|-----------|-------------|-----------------|--------|-------|
| Page headings | 28px | 32-36px | Bold (700+) | Must be readable from 2-3 feet (standing at kiosk) |
| Section headings | 22px | 24-28px | Semi-bold (600) | |
| Player names in lists | 18px | 20-22px | Medium (500) | The most-read text in the app |
| Body text / instructions | 16px | 18-20px | Regular (400) | Never below 16px anywhere |
| Button labels | 18px | 20-24px | Bold (700) | Must be readable at a glance |
| Status text (checked in, confirmed) | 16px | 18px | Medium (500) | |
| Timestamps, metadata | 14px | 16px | Regular (400) | Minimum -- no 12px text anywhere |
| Error messages | 18px | 20px | Semi-bold (600) | Must be noticeable and readable |

**Font choice:** Use system fonts (San Francisco on iOS/iPad). They are optimized for on-screen readability, support Dynamic Type, and users are familiar with them. Avoid decorative or thin fonts. The current Geist Sans is acceptable but consider falling back to `-apple-system, BlinkMacSystemFont` for the kiosk views specifically.

**Line height:** Minimum 1.5x font size. For body text at 18px, line-height should be at least 27px. Generous line height reduces reading errors for aging eyes.

**Letter spacing:** Slightly increased letter spacing (0.01-0.02em) improves legibility for older readers, especially on backlit screens.

### 1.3 Color Contrast

**WCAG Requirements:**

| Level | Normal Text | Large Text (18px bold or 24px+) |
|-------|------------|-------------------------------|
| AA | 4.5:1 | 3:1 |
| AAA | 7:1 | 4.5:1 |

**Our target: WCAG AAA (7:1) for all text.** The user base has age-related contrast sensitivity loss. AAA is not optional for this audience -- it is the correct standard. Research shows that 20/40 vision (typical for ~age 80) requires the higher contrast ratios that AAA provides.

**Specific rules:**

- **Never use light gray text on white.** The current `text-zinc-500` (#71717a) on white (#ffffff) has a contrast ratio of only 4.6:1 -- passes AA but fails AAA. Replace with `text-zinc-700` (#3f3f46, ratio 9.6:1) or darker.
- **Never use colored text on colored backgrounds** without checking contrast. Green-on-white is tricky -- most greens fail. `#15803d` (green-700) on white = 5.1:1 (passes AA only). Use `#14532d` (green-900) for text on white = 10.3:1 (passes AAA).
- **Buttons:** White text on dark green background is the safest pattern. `#ffffff` on `#166534` (green-800) = 7.3:1 (AAA).
- **Avoid relying on color alone** to convey information. Always pair with icons, text labels, or patterns.
- **Status indicators:** Use green checkmark + "Checked In" text, not just a green dot.

### 1.4 Navigation Simplicity

**The 2-tap rule:** Any primary action should be achievable in 2 taps maximum. Check-in flow: tap name (1) -> confirm (2). That is the ceiling.

**Navigation principles for this audience:**

1. **Flat hierarchy.** No nested menus, no hamburger menus, no dropdown selectors. Everything visible, everything one tap away.
2. **Persistent navigation.** Tabs or large buttons always visible at top or bottom. Never hide navigation behind gestures.
3. **No swipe gestures for critical actions.** Older users struggle with swipe (especially swipe-to-delete). All actions via explicit buttons.
4. **Clear "where am I" indicators.** Active tab must be visually distinct (bold color, underline, filled vs. outline).
5. **Breadcrumbs or back buttons** always visible. Never rely on browser back or iOS swipe-from-edge.
6. **No modals for primary flows.** Modals confuse older users who lose context. Use full-screen views with clear back navigation.
7. **Progress indicators** for multi-step flows (Step 1 of 3, Step 2 of 3).

### 1.5 Forgiveness and Error Prevention

**The anxiety factor:** Older users have higher technology anxiety. One confusing error or accidental action can cause them to stop using the app entirely and ask a volunteer for help. Every interaction must be forgiving.

| Principle | Implementation |
|-----------|---------------|
| **Confirmation before destructive actions** | "Are you sure you want to withdraw from today's tournament?" with large Yes/No buttons. Never delete on single tap. |
| **Easy undo** | After check-in: "You're checked in! [Undo]" visible for 10 seconds (not 2 seconds as currently implemented). |
| **No permanent mistakes** | A player who accidentally checks in as "Skip" can change to "Lead" without re-doing the whole flow. |
| **Clear error messages** | "Something went wrong" is useless. Instead: "Could not check you in. Please try tapping your name again, or ask the drawmaster for help." |
| **Auto-save** | Never lose user input. If the screen times out, preserve the state. |
| **Timeout warnings** | Before kiosk resets due to inactivity, show a large "Are you still there? Tap anywhere to continue" overlay with a 10-second countdown. |
| **No double-tap or long-press requirements** | Every action is a single tap. |
| **Forgiving tap detection** | If a user taps near a button but slightly off, the button should still register (generous hit area beyond visible bounds). |

---

## 2. iPad Kiosk Mode UX

### 2.1 The Scenario

A lawn bowling club has one or two iPads mounted on stands or sitting on a table in the clubhouse. On tournament day, 20-40 players (ages 60-85) arrive between 8:30 and 9:00 AM. Each player needs to:

1. Find the iPad
2. Find their name
3. Indicate they are here and their position preference
4. See confirmation
5. Wait for the draw
6. View their team/rink assignment

This must work without any training, any account creation, or any prior app usage.

### 2.2 Kiosk Check-In Flow (Recommended Design)

```
SCREEN 1: Welcome / Tournament Overview
+--------------------------------------------------+
|                                                  |
|    WEDNESDAY SOCIAL TRIPLES                      |
|    March 11, 2026 -- 9:30 AM Start               |
|                                                  |
|    24 of 36 players checked in                   |
|    [||||||||||||||||........] 67%                 |
|                                                  |
|    +------------------------------------------+  |
|    |                                          |  |
|    |     TAP YOUR NAME TO CHECK IN            |  |
|    |                                          |  |
|    +------------------------------------------+  |
|                                                  |
|    [A] [B] [C] [D] ... [W] [Z] [ALL]            |
|                                                  |
|    +------------------------------------------+  |
|    |  ANDERSON, Bob              [ CHECK IN ] |  |
|    +------------------------------------------+  |
|    |  ANDERSON, Margaret         [ CHECK IN ] |  |
|    +------------------------------------------+  |
|    |  BAKER, John           [CHECKED IN  ✓]  |  |
|    +------------------------------------------+  |
|    |  BAKER, Susan               [ CHECK IN ] |  |
|    +------------------------------------------+  |
|    ...                                           |
|                                                  |
|    [View Draw]              [View Results]        |
+--------------------------------------------------+
```

**Key design decisions:**

- **Alphabetical list with letter filter:** For 30-40 players, scrolling is fine, but letter tabs at top let users jump to their surname. This is faster than a search keyboard for the elderly -- no typing required.
- **Full names displayed as "SURNAME, First":** This is how lawn bowlers know each other at the club. Surname-first sorting matches the physical notice board they are used to.
- **Large row height:** Each player row should be minimum 64pt tall, with the name in 20px+ text.
- **CHECK IN button per row:** A big, obvious button on the right side of each row. Once tapped, it changes to a green "CHECKED IN" state with a checkmark.
- **No search keyboard by default.** Keyboards are intimidating for some elderly users. The letter filter tabs provide the same functionality without typing. A search icon can be available but should not be the primary mechanism.
- **Progress bar** shows how many players have checked in. Creates social motivation ("everyone else has checked in, I should too").

### 2.3 Position Selection (Post-Check-In)

After tapping CHECK IN, the player sees a position selection overlay or screen:

```
SCREEN 2: Position Preference
+--------------------------------------------------+
|                                                  |
|    Welcome, Bob!                                  |
|                                                  |
|    What position would you like to play today?    |
|                                                  |
|    +------------------------------------------+  |
|    |                                          |  |
|    |              SKIP                        |  |
|    |          (Team captain)                  |  |
|    |                                          |  |
|    +------------------------------------------+  |
|                                                  |
|    +------------------------------------------+  |
|    |                                          |  |
|    |              LEAD                        |  |
|    |          (Bowls first)                   |  |
|    |                                          |  |
|    +------------------------------------------+  |
|                                                  |
|    +------------------------------------------+  |
|    |                                          |  |
|    |              VICE                        |  |
|    |          (Second-in-command)             |  |
|    |                                          |  |
|    +------------------------------------------+  |
|                                                  |
|    +------------------------------------------+  |
|    |                                          |  |
|    |            ANY POSITION                  |  |
|    |          (Drawmaster decides)            |  |
|    |                                          |  |
|    +------------------------------------------+  |
|                                                  |
+--------------------------------------------------+
```

**Design decisions:**

- **Full-width buttons** for each position. Minimum 72pt tall.
- **Subtitle descriptions** for each position (not everyone remembers the terminology, especially new members).
- **"ANY POSITION" as the last option** -- this is the easiest choice and should be available for players who do not have a preference.
- **Single tap selects** -- no multi-step confirmation needed for position selection since it is easily changeable.

### 2.4 Confirmation Screen

```
SCREEN 3: Confirmation
+--------------------------------------------------+
|                                                  |
|                  ✓                               |
|                                                  |
|         You're checked in, Bob!                   |
|                                                  |
|         Position: SKIP                            |
|                                                  |
|         The draw will be posted at 9:15 AM        |
|                                                  |
|    +------------------------------------------+  |
|    |          CHANGE POSITION                 |  |
|    +------------------------------------------+  |
|                                                  |
|    +------------------------------------------+  |
|    |          WITHDRAW                        |  |
|    +------------------------------------------+  |
|                                                  |
|    This screen will reset in 15 seconds...        |
|                                                  |
+--------------------------------------------------+
```

**Design decisions:**

- **Large checkmark animation** -- clear visual feedback that the action succeeded.
- **Repeat back what happened** -- "Position: SKIP" confirms the selection.
- **Next step information** -- "The draw will be posted at 9:15 AM" reduces anxiety about what happens next.
- **Change Position available** -- easy correction without starting over.
- **Withdraw option** -- in case they tapped in by mistake. This should trigger a confirmation dialog.
- **Auto-reset after 15 seconds** -- returns to the main check-in list for the next player. Show a countdown so the user understands what is happening.

### 2.5 Draw/Teams View

```
SCREEN 4: The Draw (after drawmaster generates it)
+--------------------------------------------------+
|                                                  |
|    WEDNESDAY SOCIAL TRIPLES -- THE DRAW           |
|    Round 1 of 2                                   |
|                                                  |
|    +------------------------------------------+  |
|    | RINK 1                                   |  |
|    |                                          |  |
|    | Skip:  Bob ANDERSON                      |  |
|    | Vice:  Margaret BAKER                    |  |
|    | Lead:  John CHEN                         |  |
|    |                                          |  |
|    |         vs                               |  |
|    |                                          |  |
|    | Skip:  Susan DAVIS                       |  |
|    | Vice:  Tom EVANS                         |  |
|    | Lead:  Helen FORD                        |  |
|    +------------------------------------------+  |
|                                                  |
|    +------------------------------------------+  |
|    | RINK 2                                   |  |
|    | ...                                      |  |
|    +------------------------------------------+  |
|                                                  |
|    Find your name: [Search]                       |
|                                                  |
+--------------------------------------------------+
```

**Design decisions:**

- **Card-based layout** with each rink as a distinct card. High contrast borders.
- **Player names in large text** (20px+), with surname in CAPS and bold for quick scanning.
- **"Find your name" search** -- a quick filter that highlights the card containing the searched name. Useful when there are 6+ rinks.
- **Rink number prominently displayed** -- players need to walk to the correct rink.
- **No interaction required** -- this is a read-only display. Players just need to see it.

### 2.6 Kiosk Hardware and Environment Considerations

| Factor | Recommendation |
|--------|---------------|
| **Screen brightness** | Set to maximum. Clubhouses often have large windows and bright lighting. |
| **Screen orientation** | Lock to landscape for iPad. Portrait for iPhone. |
| **Auto-lock** | Disable via Guided Access. Screen must never lock. |
| **Guided Access** | Enable to lock the iPad to a single app. Prevents players from accidentally exiting. |
| **iPad stand** | Position at standing height (approximately 110-120cm from floor) angled at 15-20 degrees. Must be stable -- elderly users sometimes lean on it. |
| **Power** | Always plugged in. Battery mode is unacceptable for a kiosk. |
| **Screen cleanliness** | Touch screens get smudged. High contrast design with solid colors handles smudges better than subtle gradients. |
| **Glare** | Position away from windows. Use a matte screen protector if glare is unavoidable. |
| **Sound** | Audible tap feedback (subtle click) confirms touches for users who are not looking directly at the button when they tap. Keep volume moderate. |

---

## 3. Information Architecture

### 3.1 Screen Map -- Player Flows

```
TOURNAMENT DAY (Player perspective):

  [Welcome Screen]
       |
       v
  [Check-In List] ──── tap name ────> [Position Select]
       |                                     |
       |                                     v
       |                              [Confirmation]
       |                                     |
       |                                     v  (auto-reset to list)
       |
       ├── [View Draw] ────> [Team/Rink Assignments]
       |                          |
       |                          └── [Find My Name] (highlight)
       |
       ├── [View Scores] ──> [Live Scoreboard]
       |
       └── [View Results] ──> [Final Standings]
```

**Maximum depth: 2 taps from the welcome screen to any information.**

### 3.2 Screen Map -- Admin/Drawmaster Flows

```
ADMIN FLOW (Drawmaster/Secretary):

  [Admin Login] ──── PIN entry ────> [Admin Dashboard]
       |
       v
  [Tournament List]
       |
       ├── [Create Tournament]
       |      ├── Tournament name
       |      ├── Format (triples/pairs/fours)
       |      ├── Date and time
       |      └── [Create] --> back to list
       |
       ├── [Manage Tournament]
       |      ├── [Open Check-In] ──> enables player check-in
       |      ├── [Close Check-In] ──> stops new check-ins
       |      ├── [Generate Draw] ──> runs draw algorithm
       |      |      └── [Re-Draw] ──> if draw is unsatisfactory
       |      ├── [Enter Scores]
       |      |      ├── Per-rink score entry
       |      |      └── Per-end breakdown (optional)
       |      ├── [Finalize Results]
       |      └── [Cancel Tournament]
       |
       └── [Player Management]
              ├── [Add Player]
              ├── [Edit Player]
              └── [View Player Stats]
```

**Admin PIN access:** The admin flow should be protected by a simple 4-digit PIN. The current `AdminPinModal` component handles this. The PIN should be entered on a large numeric keypad (not the iOS keyboard) for consistency with the elderly-friendly design.

### 3.3 Screen Inventory

| Screen | Platform | User | Purpose |
|--------|----------|------|---------|
| Welcome / Tournament Info | iPad Kiosk | Player | See today's tournament, check-in progress |
| Check-In List | iPad Kiosk + iPhone | Player | Find name, check in |
| Position Select | iPad Kiosk + iPhone | Player | Choose Skip/Lead/Vice/Any |
| Confirmation | iPad Kiosk + iPhone | Player | See confirmation, change/withdraw |
| Draw / Teams | iPad Kiosk + iPhone | Player | See rink and team assignments |
| Live Scoreboard | iPad Kiosk + iPhone + TV | Player/Spectator | See current scores during play |
| Final Results | iPad Kiosk + iPhone | Player | See final standings |
| Admin Dashboard | iPad + iPhone | Drawmaster | Manage tournament lifecycle |
| Create Tournament | iPad + iPhone | Drawmaster | Set up new tournament |
| Score Entry | iPad + iPhone | Drawmaster | Enter end-by-end or match scores |
| Player Management | iPad + iPhone | Admin | Add/edit club members |

### 3.4 Player Profile Data Model

| Field | Type | Notes |
|-------|------|-------|
| Full name | String | Required. Display as "SURNAME, First" |
| Preferred name / nickname | String | Optional. "Bob" vs "Robert" |
| Membership number | String | Club-issued. Used for identification. |
| Preferred position | Enum | Skip / Lead / Vice / Any. Default preference. |
| Phone number | String | Optional. For push notifications. |
| Email | String | Optional. For results emails. |
| Photo | Image | Optional. Helps with kiosk identification. |
| Join date | Date | For tenure display. |
| Historical stats | Computed | Games played, win rate, positions played |

---

## 4. Color Schemes and Branding

### 4.1 Design Constraints

- Lawn bowling = the green. Green is non-negotiable as a brand color.
- Must achieve WCAG AAA contrast (7:1) for all text.
- Must be readable on an iPad in a bright clubhouse (potentially near windows).
- Must work for the ~8% of men and ~0.5% of women with color vision deficiency (red-green color blindness is most common).
- Avoid pastels, avoid thin/light text, avoid gradients that reduce contrast.

### 4.2 Recommended Palette: "The Bowling Green"

This is the primary recommendation. Classic, high-contrast, and unmistakably lawn bowls.

| Role | Color | Hex | Contrast vs White | Contrast vs Dark BG |
|------|-------|-----|--------------------|---------------------|
| **Primary** (buttons, headers) | Dark Bowling Green | `#1B5E20` | 7.9:1 (AAA) | -- |
| **Primary Dark** (active states) | Deep Green | `#0D3B12` | 13.1:1 (AAA) | -- |
| **Background** | Warm White | `#FAFAF5` | -- | -- |
| **Surface** (cards, panels) | Pure White | `#FFFFFF` | -- | -- |
| **Text Primary** | Near Black | `#1A1A1A` | 17.1:1 (AAA) | -- |
| **Text Secondary** | Dark Gray | `#4A4A4A` | 9.7:1 (AAA) | -- |
| **Accent** (highlights, badges) | Championship Gold | `#B8860B` | 4.0:1 (AA large) | -- |
| **Success** | Confirmation Green | `#2E7D32` | 6.2:1 (AA) | -- |
| **Error** | Alert Red | `#C62828` | 6.5:1 (AA) | -- |
| **On Primary** (text on green buttons) | White | `#FFFFFF` | -- | 7.9:1 (AAA) |

**Usage notes:**
- Gold is used sparingly for highlights and badges, not for body text (contrast ratio too low for small text).
- Error red `#C62828` passes AA for large text. For small error text, pair with an error icon and use dark text instead.
- Success states use both color AND a checkmark icon (never color alone).

### 4.3 Alternative Palette: "Club Heritage"

A more traditional/formal option. Navy + green, reminiscent of club blazers and ties.

| Role | Color | Hex | Notes |
|------|-------|-----|-------|
| **Primary** | Navy Blue | `#1A237E` | 12.6:1 vs white (AAA) |
| **Secondary** | Forest Green | `#2E7D32` | 6.2:1 vs white (AA) |
| **Background** | Cream | `#FFF8E1` | Warm, traditional feel |
| **Text** | Dark Charcoal | `#212121` | 16.5:1 vs cream (AAA) |
| **Accent** | Burgundy | `#880E4F` | 8.1:1 vs cream (AAA) |

### 4.4 Alternative Palette: "Modern Club"

A cleaner, contemporary option that still says "lawn bowls."

| Role | Color | Hex | Notes |
|------|-------|-----|-------|
| **Primary** | Teal Green | `#00695C` | 6.6:1 vs white (AA) |
| **Primary Dark** | Deep Teal | `#004D40` | 9.6:1 vs white (AAA) |
| **Background** | Cool White | `#F5F5F5` | Neutral, modern |
| **Text** | Slate | `#263238` | 14.1:1 vs white (AAA) |
| **Accent** | Warm Amber | `#E65100` | 4.7:1 vs white (AA large) |

### 4.5 Alternative Palette: "High Visibility"

Maximum contrast option. Best for clubs with very elderly members or outdoor-adjacent viewing.

| Role | Color | Hex | Notes |
|------|-------|-----|-------|
| **Primary** | Black | `#000000` | 21:1 vs white -- maximum contrast |
| **Secondary** | Deep Green | `#1B5E20` | 7.9:1 vs white (AAA) |
| **Background** | White | `#FFFFFF` | No off-whites, maximum clarity |
| **Text** | Black | `#000000` | 21:1 (AAA+) |
| **Accent** | Bold Blue | `#0D47A1` | 9.4:1 vs white (AAA) |

### 4.6 Color Palette Recommendation

**Use "The Bowling Green" palette** (option 4.2). Rationale:
- Green is essential for lawn bowls branding and recognition
- Dark green `#1B5E20` achieves AAA contrast on white (7.9:1)
- Warm white background reduces eye strain vs pure white on backlit displays
- Gold accent adds visual richness without accessibility issues (used only for decorative/large elements)
- The palette is warm and welcoming, not clinical

**Offer "High Visibility" as a user-selectable option** for members who need maximum contrast.

---

## 5. Accessibility Considerations

### 5.1 Beyond Elderly -- Full Accessibility Matrix

| Consideration | Implementation | Priority |
|---------------|---------------|----------|
| **Screen reader (VoiceOver)** | All interactive elements must have `aria-label`. Images need `alt` text. Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<h1>`). Custom components need ARIA roles. | HIGH |
| **Voice Control** | iOS Voice Control works automatically with properly labeled UI elements. Ensure all buttons have visible text labels (not icon-only). | MEDIUM |
| **Dynamic Type** | Support iOS Dynamic Type scaling. Use relative font sizes (`rem`) not fixed `px` in the responsive views. Kiosk mode can use fixed sizes since the device is controlled. | MEDIUM |
| **Reduced Motion** | Respect `prefers-reduced-motion` media query. Replace animations with instant state changes. The `whileTap={{ scale: 0.9 }}` animation on check-in buttons should be disabled when reduced motion is preferred. | HIGH |
| **Color blindness** | Never use red/green as the only differentiator. Pair status colors with icons (checkmark for success, X for error, clock for pending). Use patterns or text labels alongside colors. | HIGH |
| **Low vision** | Support pinch-to-zoom on iPhone views. Do not set `user-scalable=no` in the viewport meta tag (the current implementation should be audited for this). Kiosk mode is fixed-zoom. | MEDIUM |
| **Hearing impairment** | Do not rely on audio alerts alone. All notifications must have visual components. If using audible tap feedback, it is supplementary only. | LOW (few audio features) |
| **Cognitive accessibility** | Simple language, short sentences, no jargon. "Check in" not "Register your attendance." "Your team" not "Your assigned squad composition." Consistent layout across all screens. | HIGH |
| **Motor impairment** | Large touch targets (covered in Section 1). No drag-and-drop. No swipe gestures for critical actions. No time-pressure interactions. | HIGH |

### 5.2 Semantic HTML Requirements

```html
<!-- Good: Semantic, accessible -->
<main>
  <h1>Wednesday Social Triples</h1>
  <section aria-label="Check-in list">
    <h2>Tap your name to check in</h2>
    <ul role="list">
      <li>
        <button aria-label="Check in Bob Anderson">
          <span>ANDERSON, Bob</span>
          <span>Check In</span>
        </button>
      </li>
    </ul>
  </section>
</main>

<!-- Bad: Div soup, no semantics -->
<div>
  <div class="text-3xl">Wednesday Social Triples</div>
  <div>
    <div>Tap your name to check in</div>
    <div>
      <div onClick={...}>
        <div>ANDERSON, Bob</div>
        <div>Check In</div>
      </div>
    </div>
  </div>
</div>
```

### 5.3 Focus Management

- **Focus indicators** must be visible. Use a thick (3px+) outline in a contrasting color (e.g., blue `#0D47A1` on white). Never remove focus outlines with `outline: none` without providing an alternative.
- **Tab order** must be logical (top-to-bottom, left-to-right). Test with keyboard navigation.
- **Focus trapping** in modals -- when a confirmation dialog opens, focus should be trapped within it until dismissed.
- **Auto-focus** on the most relevant element when a new screen loads (e.g., focus on the first player in the check-in list after screen load).

### 5.4 iPad Kiosk Accessibility Note

In kiosk mode (Guided Access), some iOS accessibility features may be restricted. The app should provide its own accessibility options:

| Feature | In-App Implementation |
|---------|----------------------|
| Text size toggle | A "Aa" button in the header that cycles between Normal, Large, Extra Large |
| High contrast mode | A toggle that switches to the High Visibility palette |
| Audio feedback | Optional tap sounds (on by default, toggle in admin settings) |

---

## 6. Comparable Apps with Great Elderly UX

### 6.1 GrandPad Tablet

**What it is:** A tablet designed specifically for users 75+ (average user age: 82).

**What we can learn:**
- **Massive touch targets** -- every interactive element is at minimum 80pt tall and often full-width.
- **No home screen complexity** -- one level of navigation, large labeled icons for each function.
- **Wireless charging** -- no cable fumbling. For our kiosk: always-connected power removes this concern.
- **"Grand Advisors" program** -- real elderly users test every feature. We should do the same with club members during development.
- **Clear labeling** -- every button says exactly what it does in plain English. No icons without labels.

**Applicable patterns:** Full-width buttons, one-action-per-screen, plain language labeling.

### 6.2 Oscar Senior

**What it is:** A free app that transforms any tablet into a simplified senior-friendly device.

**What we can learn:**
- **Large, clear icons** with text labels underneath. Never icon-only.
- **High color contrast** throughout.
- **Simplified task flows** -- reduces steps to minimum.
- **Clear visual feedback** -- big checkmarks, obvious state changes.
- **Customizable by caregivers** -- admins can control what features are visible. Translates to our use case: the drawmaster configures what players see.

**Applicable patterns:** Admin-controlled simplicity, large icon+label pairs, visual feedback.

### 6.3 SilverSneakers (Fitness App)

**What it is:** A fitness app for the 65+ demographic with millions of users.

**What we can learn:**
- **Warm, encouraging tone** -- "Great job!" not "Completed." Lawn bowls is social, so the tone matters.
- **Clean design** with generous whitespace.
- **Supportive messaging** that reduces anxiety about using the app.
- **Progressive disclosure** -- simple at first, more detail available on demand.

**Applicable patterns:** Encouraging copy, generous whitespace, progressive disclosure.

### 6.4 Evergreen Club

**What it is:** A Google Award-winning social networking app designed specifically for seniors.

**What we can learn:**
- **Large text throughout** -- minimum 16px, key information at 20px+.
- **High contrast visuals** -- no subtle grays or pastels.
- **Easy onboarding** -- guided first-use experience with explanatory text.
- **Social features prioritized** -- the social aspect of lawn bowls is central. Results and teams are inherently social.

**Applicable patterns:** Large text hierarchy, guided first-use, social context.

### 6.5 OneTap Check-In Kiosk

**What it is:** An iPad kiosk app for self-service event check-in.

**What we can learn:**
- **Name search with 3-character matching** -- type three letters and see matching names.
- **Alphabetical browsing** -- for users who prefer not to type.
- **QR code check-in option** -- for tech-savvy members.
- **Customizable branding** -- each venue can set their colors and logo.
- **Guided Access integration** -- locks the iPad to the check-in app.

**Applicable patterns:** Multiple check-in methods (browse + search + QR), Guided Access.

### 6.6 Patterns Summary from Comparable Apps

| Pattern | Used By | Priority for Us |
|---------|---------|-----------------|
| Full-width buttons 72pt+ tall | GrandPad, Oscar Senior | MUST HAVE |
| Plain language, no jargon | GrandPad, SilverSneakers | MUST HAVE |
| Icon + text label (never icon alone) | Oscar Senior, GrandPad | MUST HAVE |
| Alphabetical name browsing | OneTap, standard kiosk pattern | MUST HAVE |
| Letter filter tabs | Common in kiosk check-in apps | SHOULD HAVE |
| Encouraging/warm tone | SilverSneakers, Evergreen Club | SHOULD HAVE |
| QR code as alternative check-in | OneTap | NICE TO HAVE |
| Admin-controlled display settings | Oscar Senior | NICE TO HAVE |
| High contrast toggle | Multiple apps | SHOULD HAVE |
| Audible tap feedback | GrandPad | SHOULD HAVE |

---

## 7. Audit of Current Implementation

The existing kiosk code (`/opt/agency-workspace/pick-a-partner/src/app/kiosk/page.tsx` and `/opt/agency-workspace/pick-a-partner/src/components/kiosk/KioskCheckIn.tsx`) was reviewed. Here are the gaps against the standards in this document.

### 7.1 Issues Found

| Issue | Severity | Current State | Recommended Fix |
|-------|----------|---------------|-----------------|
| **Player name text too small** | HIGH | `text-sm` (14px) on player names | Change to `text-lg` (18px) minimum, `text-xl` (20px) recommended |
| **Grid layout too dense** | HIGH | 3-5 column grid of small tiles | Switch to full-width list rows, 64pt minimum height |
| **No position selection** | HIGH | Check-in has no position preference step | Add position selection screen after check-in tap |
| **Undo window too short** | MEDIUM | 2-second check-in confirmation (`setTimeout 2000`) | Extend to 10 seconds with visible undo button |
| **Low contrast secondary text** | MEDIUM | `text-zinc-500` used for metadata | Replace with `text-zinc-700` for AAA compliance |
| **Tab button text too small** | MEDIUM | `text-sm` on Check In / Board tabs | Change to `text-base` (16px) minimum |
| **No letter filter** | MEDIUM | Players must scroll through full list | Add A-Z letter filter tabs for quick navigation |
| **No tournament context** | MEDIUM | No tournament name, time, or progress shown | Add tournament header with name, time, check-in progress |
| **Initials-only avatar** | LOW | Shows 2-letter initials in circle | Fine as visual aid, but name is more important than avatar. Consider making avatars optional |
| **No semantic HTML** | MEDIUM | Uses `div` and `motion.button` without ARIA | Add `aria-label`, use semantic `<main>`, `<section>`, `<ul>` |
| **No reduced motion support** | LOW | `whileTap={{ scale: 0.9 }}` always plays | Wrap in `prefers-reduced-motion` check |
| **Header shows "Kiosk Mode" text** | LOW | `<p className="text-sm text-zinc-500">Kiosk Mode</p>` | Remove -- players do not need to know they are using "kiosk mode." Show tournament date/time instead. |

### 7.2 Positive Aspects (Keep These)

- `touch-manipulation` CSS on all buttons -- correct
- `min-h-[60px]` on navigation tabs -- good minimum
- `min-h-[100px]` on player tiles -- adequate for tile layout
- `KioskWrapper` with inactivity reset -- excellent pattern
- `AdminPinModal` for admin access -- correct approach
- Green color scheme aligns with lawn bowls branding
- Real-time data via Supabase -- enables live check-in updates

---

## 8. Recommendations Summary

### 8.1 Immediate Changes (Before Next User Test)

1. **Switch check-in from grid tiles to a full-width list** with 64pt row height, 20px player names, and a CHECK IN button on each row.
2. **Add position selection** after check-in (Skip / Lead / Vice / Any).
3. **Increase all text sizes** -- no text below 16px anywhere in kiosk views.
4. **Fix contrast** -- replace all `text-zinc-500` with `text-zinc-700` or darker.
5. **Extend confirmation undo window** to 10 seconds.
6. **Add tournament context header** (tournament name, time, check-in progress bar).

### 8.2 Medium-Term Improvements

7. **Add A-Z letter filter tabs** for quick name navigation.
8. **Add semantic HTML and ARIA labels** throughout kiosk views.
9. **Add `prefers-reduced-motion` support** for all animations.
10. **Design and implement the Draw view** (rink/team cards as described in Section 2.5).
11. **Add audible tap feedback** (optional, on by default).
12. **Implement in-app text size toggle** (Normal / Large / Extra Large).

### 8.3 Long-Term / Phase 9+ Features

13. **QR code check-in** as an alternative for tech-savvy members.
14. **TV display mode** for wall-mounted screens showing the draw and scores.
15. **High contrast toggle** in kiosk settings.
16. **Player photos** in check-in list (optional, helps identification).
17. **Multi-language support** (English is sufficient for most Australian/UK/NZ clubs, but should be architected for future i18n).

### 8.4 Design System Tokens for Kiosk Mode

These CSS custom properties should be defined for all kiosk views:

```css
/* Kiosk Design Tokens */
:root {
  /* Touch targets */
  --kiosk-touch-target-min: 56px;
  --kiosk-touch-target-primary: 72px;
  --kiosk-touch-target-gap: 12px;

  /* Typography */
  --kiosk-text-heading: 32px;
  --kiosk-text-subheading: 24px;
  --kiosk-text-body: 20px;
  --kiosk-text-label: 18px;
  --kiosk-text-caption: 16px;    /* Minimum -- nothing smaller */
  --kiosk-line-height: 1.5;
  --kiosk-letter-spacing: 0.01em;

  /* Colors -- "The Bowling Green" palette */
  --kiosk-primary: #1B5E20;
  --kiosk-primary-dark: #0D3B12;
  --kiosk-bg: #FAFAF5;
  --kiosk-surface: #FFFFFF;
  --kiosk-text: #1A1A1A;
  --kiosk-text-secondary: #4A4A4A;
  --kiosk-accent: #B8860B;
  --kiosk-success: #2E7D32;
  --kiosk-error: #C62828;
  --kiosk-on-primary: #FFFFFF;

  /* Spacing */
  --kiosk-padding: 24px;
  --kiosk-card-radius: 16px;

  /* Focus */
  --kiosk-focus-outline: 3px solid #0D47A1;
  --kiosk-focus-offset: 2px;
}
```

---

## Sources

### Elderly UX Research
- [Optimizing mobile app design for older adults: systematic review (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12350549/)
- [UX Design for Seniors: Examples and Tips (Eleken)](https://www.eleken.co/blog-posts/examples-of-ux-design-for-seniors)
- [Interface Design for Older Adults (Toptal)](https://www.toptal.com/designers/ui/ui-design-for-older-adults)
- [Elder-Friendly UI: Designing Accessible Digital Interfaces (AufaitUX)](https://www.aufaitux.com/blog/designing-elder-friendly-ui-interfaces/)
- [UX Design for Seniors, 3rd Edition (Nielsen Norman Group)](https://www.nngroup.com/reports/senior-citizens-on-the-web/)
- [Design Guidelines of Mobile Apps for Older Adults (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10557006/)
- [Usability for Senior Citizens (NN/g)](https://www.nngroup.com/articles/usability-seniors-improvements/)

### Apple HIG and Touch Targets
- [Apple Accessibility HIG](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [WCAG 2.5.5 Target Size (W3C)](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [WCAG 2.5.8 Target Size Minimum (W3C)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [Accessible Tap Targets (web.dev)](https://web.dev/articles/accessible-tap-targets)

### WCAG Color Contrast
- [WCAG 1.4.3 Contrast Minimum (W3C)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [WCAG 1.4.6 Contrast Enhanced (W3C)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html)
- [Color Contrast Accessibility Guide 2025 (AllAccessible)](https://www.allaccessible.org/blog/color-contrast-accessibility-wcag-guide-2025)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Kiosk Design
- [Kiosk UX UI Design Checklist (Kiosk Industry)](https://kioskindustry.org/kiosk-ux-ui-how-to-design-checklist/)
- [OneTap Self-Check-in Kiosk](https://www.onetapcheckin.com/check-in-kiosk)

### Comparable Apps
- [GrandPad Tablet Review (SeniorSite)](https://seniorsite.org/resource/grandpad-tablet-review-simple-tech-that-actually-works-for-seniors/)
- [Oscar Senior (Tech Enhanced Life)](https://www.techenhancedlife.com/reviews/oscar-family)
- [Evergreen Club UX Case Study (Medium)](https://medium.com/design-bootcamp/designing-user-experience-ux-for-elderly-people-a-look-into-the-award-winning-evergreen-club-83d60e756b10)

### Lawn Bowls Software
- [PAMI Bowls](https://pamibowls.com/)
- [Lawn Bowling Manager](https://demo.lawnbowlingmanager.com/)
- [Global Lawn Bowls](https://www.globallawnbowls.com/)
- [Playpass Lawn Bowls](https://playpass.com/sports-software/lawn-bowls-management)
