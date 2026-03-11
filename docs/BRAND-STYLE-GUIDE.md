# Lawnbowling — Brand & Style Guide

The definitive reference for every screen, component, and marketing asset. Follow this guide to maintain visual consistency across the entire Lawnbowling platform.

---

## 1. Brand Identity

| Attribute | Value |
|-----------|-------|
| **Name** | Lawnbowling (one word, capital L) |
| **Short name** | Lawnbowl |
| **Domain** | lawnbowl.app |
| **Redirect** | lawnbowling.app → lawnbowl.app |
| **Microsite** | lawnbowl.camp (DEI insurance) |
| **Twitter** | @lawnbowlapp |

### Taglines

- **Primary:** "The World's Best Lawn Bowling App"
- **Hero:** "Where friendships *roll.*"
- **Functional:** "Tournament management, club directory, and everything lawn bowling."
- **Short CTA:** "Replace the paper draw sheet."

### Logo

The logo consists of a **CircleDot icon** (Lucide) inside a rounded square container, paired with the "Lawnbowling" wordmark in Playfair Display bold.

```
┌─────────────┐
│  ┌───────┐  │
│  │  (●)  │  │  Lawnbowling
│  └───────┘  │
└─────────────┘
 #1B5E20 bg     Playfair Display Bold, #0A2E12
```

**Implementation:**
```tsx
<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1B5E20]">
  <CircleDot className="h-5 w-5 text-white" />
</div>
<span style={{ fontFamily: "var(--font-display)" }}
      className="text-lg font-bold tracking-tight text-[#0A2E12]">
  Lawnbowling
</span>
```

**Logo files:**
- `/public/images/logo/bowls-icon.png` — Standalone icon
- `/public/images/logo/bowls-wordmark.png` — Wordmark
- `/public/images/lawn-bowl-logo.png` — Logo mark
- `/public/icons/icon-192.png`, `icon-512.png` — PWA icons
- `/public/icons/icon-maskable-512.png` — Maskable PWA icon

---

## 2. Color Palette

### Primary — "The Bowling Green"

| Swatch | Name | Hex | Usage |
|--------|------|-----|-------|
| ██ | **Forest Green** | `#1B5E20` | Primary buttons, logo bg, theme color, PWA chrome |
| ██ | **Deep Forest** | `#0A2E12` | Headings, body text, hero overlays |
| ██ | **Forest Mid** | `#2E7D32` | Button hover states, section headings |
| ██ | **Forest Muted** | `#3D5A3E` | Secondary text, nav links |

### Accent

| Swatch | Name | Hex | Usage |
|--------|------|-----|-------|
| ██ | **Gold** | `#B8860B` | Accent stripe, kiosk accent, premium touches |
| ██ | **Mint** | `#A8D5BA` | Hero overlay text, italic emphasis |

### Surface & Background

| Swatch | Name | Hex | Usage |
|--------|------|-----|-------|
| ██ | **Cream** | `#FEFCF9` | Main page background |
| ██ | **White** | `#FFFFFF` | Cards, form inputs, surfaces |
| ██ | **Kiosk BG** | `#FAFAF5` | Kiosk background |
| ██ | **Green Tint** | `#F0FFF4` | PWA splash bg, hover states |

### Semantic

| Name | Hex | Usage |
|------|-----|-------|
| **Success** | `#2E7D32` | Confirmations, check marks |
| **Error** | `#991B1B` | Error states, destructive actions |
| **Info** | `#0D47A1` | Focus outlines (accessibility) |
| **Body text** | `#1A1A1A` | Kiosk text (near-black, never pure black) |
| **Text secondary** | `#4A4A4A` | Kiosk secondary text |

### OG Image Gradient

```css
background: linear-gradient(135deg, #0D3B12 0%, #1B5E20 30%, #388E3C 70%, #4CAF50 100%);
```

### Landing Gradient

```css
/* .landing-gradient — soft tri-color wash */
background: linear-gradient(135deg, #ecfdf5 0%, #eff6ff 50%, #fffbeb 100%);
```

> **Rule:** Never use `emerald-500`, `blue-600`, or emerald-to-blue gradients. All green should be the brand forest green palette (`#1B5E20` family). Generic Tailwind greens (`green-500`, `emerald-600`) are off-brand.

---

## 3. Typography

### Font Stack

| CSS Variable | Family | Role |
|-------------|--------|------|
| `--font-display` | **Playfair Display** | Headings (h1–h2), logo, statistics, hero text |
| `--font-sans` | **Plus Jakarta Sans** | Body text, labels, nav, UI components |
| `--font-geist-mono` | **Geist Mono** | Code, monospaced content |

### Weights Available

- **Playfair Display:** 400, 500, 600, 700, 800, 900
- **Plus Jakarta Sans:** 300, 400, 500, 600, 700, 800

### Type Scale

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| Hero H1 | `text-4xl` → `text-7xl` | `font-bold` | Playfair Display |
| Section H2 | `text-3xl` → `text-5xl` | `font-bold` | Playfair Display |
| Section eyebrow | `text-sm` | `font-semibold uppercase tracking-[0.15em]` | Plus Jakarta, `text-[#1B5E20]` |
| Nav links | `text-sm` | `font-medium` | Plus Jakarta |
| Body | `text-base` / `text-lg` | `font-normal` | `leading-relaxed` |
| Card body | `text-sm` | normal | `leading-relaxed` |
| Stat number | `text-2xl` / `text-3xl` | `font-extrabold` | Playfair Display |
| Caption | `text-xs` / `text-sm` | `font-medium` | `uppercase tracking-wider` |

### Heading Pattern

```tsx
<p className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-[#1B5E20]">
  Section Eyebrow
</p>
<h2 className="text-3xl font-bold text-[#0A2E12] lg:text-5xl"
    style={{ fontFamily: "var(--font-display)" }}>
  Section Heading
</h2>
```

### Kiosk Typography (60-80+ year old users)

| Token | Value |
|-------|-------|
| `--kiosk-text-heading` | 32px |
| `--kiosk-text-subheading` | 32px |
| `--kiosk-text-body` | 20px |
| `--kiosk-text-label` | 18px |
| `--kiosk-text-caption` | 16px (minimum) |
| `--kiosk-line-height` | 1.5 |

> **Rule:** No text below 16px in kiosk mode. Body never pure black — use `#1A1A1A` or `#0A2E12`.

---

## 4. Spacing & Layout

### Max Widths

| Context | Class | Pixels |
|---------|-------|--------|
| Marketing pages | `max-w-7xl` | 1280px |
| Content pages | `max-w-6xl` | 1152px |
| App inner pages | `max-w-3xl` | 768px |
| Form containers | `max-w-md` | 448px |

### Horizontal Padding

```
px-4 sm:px-6 lg:px-8
```

### Border Radius

| Element | Class | Size |
|---------|-------|------|
| Primary CTA buttons | `rounded-full` | Pill |
| Cards | `rounded-2xl` | 16px |
| Secondary buttons | `rounded-xl` | 12px |
| Inputs | `rounded-xl` | 12px |
| Icon containers | `rounded-xl` | 12px |
| Image containers | `rounded-3xl` | 24px |
| Nav logo | `rounded-xl` | 12px |
| Badges | `rounded-full` | Pill |

### Kiosk Touch Targets

| Token | Value |
|-------|-------|
| `--kiosk-touch-target-min` | 56px |
| `--kiosk-touch-target-primary` | 72px |
| `--kiosk-touch-target-gap` | 12px |
| `--kiosk-padding` | 24px |
| `--kiosk-card-radius` | 16px |

---

## 5. Component Patterns

### Primary CTA Button (green pill)

```tsx
className="rounded-full bg-[#1B5E20] px-5 py-2.5 text-sm font-semibold text-white
           shadow-lg shadow-[#1B5E20]/20 transition-all
           hover:bg-[#2E7D32] hover:shadow-xl hover:shadow-[#1B5E20]/25
           active:scale-[0.97]"
```

### Hero CTA Button (white pill on dark bg)

```tsx
className="rounded-full bg-white px-7 py-4 text-base font-semibold text-[#1B5E20]
           shadow-2xl transition-all hover:bg-[#F0FFF4]"
```

### Ghost CTA Button (border on dark bg)

```tsx
className="rounded-full border-2 border-white/30 px-7 py-4 text-base font-semibold text-white
           backdrop-blur-sm transition-all hover:border-white/60 hover:bg-white/10"
```

### Secondary Button (light surface)

```tsx
className="rounded-full border border-[#0A2E12]/10 bg-[#FEFCF9] py-3 px-6 text-sm font-semibold
           text-[#0A2E12] shadow-sm transition
           hover:border-[#1B5E20]/20 hover:shadow-md active:scale-[0.98]"
```

### Form Input

```tsx
className="block w-full rounded-xl border border-[#0A2E12]/10 bg-[#FEFCF9] py-3 pl-10 pr-3
           text-[#0A2E12] placeholder-[#3D5A3E]/40 shadow-sm transition
           focus:border-[#1B5E20] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20"
```

### Feature Card

```tsx
className="group relative rounded-2xl border border-[#0A2E12]/5 bg-[#FEFCF9] p-6
           transition-all hover:border-[#1B5E20]/15 hover:shadow-lg hover:shadow-[#1B5E20]/5"
```

### Glass Card

```css
.glass-card-light {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 1rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}
```

### Error Message

```tsx
<div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
  {error}
</div>
```

### Link Text

```tsx
className="font-medium text-[#1B5E20] hover:text-[#2E7D32]"
```

---

## 6. Hero & Image Overlays

### Hero Image Section

```tsx
<div className="relative h-[70vh] min-h-[500px] max-h-[800px] w-full overflow-hidden">
  <Image src="/images/hero-friends-wide.png" alt="..." fill priority
         className="object-cover object-center" sizes="100vw" />
  {/* Gradient overlays */}
  <div className="absolute inset-0 bg-gradient-to-t from-[#0A2E12]/90 via-[#0A2E12]/30 to-transparent" />
  <div className="absolute inset-0 bg-gradient-to-r from-[#0A2E12]/40 to-transparent" />
</div>
```

### Hero Images Available

| File | Description |
|------|-------------|
| `hero-friends-wide.png` | Main homepage hero (golden hour, friends) |
| `action-bowl.png` | Bowl curving toward jack |
| `community-bonding.png` | Full-bleed community section |
| `clubhouse-golden.png` | Golden hour clubhouse |
| `celebration-win.png` | Celebrating players |
| `bowls-pattern.svg` | Repeating circle pattern (bg texture) |

---

## 7. Animation & Motion

### Framer Motion Variants

| Variant | From | To |
|---------|------|----|
| `fade-up` | `opacity: 0, y: 30` | Visible, 0.6s ease |
| `fade-in` | `opacity: 0` | Visible |
| `scale-in` | `opacity: 0, scale: 0.95` | Visible |
| `slide-left` | `opacity: 0, x: 60` | Visible |
| `slide-right` | `opacity: 0, x: -60` | Visible |

**Stagger:** `0.08–0.1s` between children

### Button Interactions

```
hover: scale-[1.02] or shadow increase
active: scale-[0.97]
transition: 0.15s ease (transform, box-shadow, background-color)
```

### Background Animations

- **Ken Burns** on hero images: `scale 1 → 1.15` over 20s
- **Floating orbs**: 16–25s orbit cycles, muted colors at 0.3 opacity
- **Live pulse**: green dot 2s infinite for "live" indicators

---

## 8. Navigation

### Desktop Nav

```
Height: h-16
Background: bg-[#FEFCF9]/80 backdrop-blur-xl
Border: border-b border-[#1B5E20]/5
Logo left, links center-right, CTA far right
```

### Nav Link Style

```tsx
className="rounded-lg px-3.5 py-2 text-sm font-medium text-[#3D5A3E]
           transition hover:text-[#0A2E12] hover:bg-[#1B5E20]/5"
```

---

## 9. PWA & Meta

| Property | Value |
|----------|-------|
| `theme_color` | `#1B5E20` |
| `background_color` | `#f0fdf4` |
| Apple status bar | `black-translucent` |
| OG image size | 1200x630 |
| Favicon | `/src/app/favicon.ico` |

---

## 10. Do's and Don'ts

### Do

- Use `#1B5E20` for all primary interactive elements
- Use Playfair Display for all headings (`style={{ fontFamily: "var(--font-display)" }}`)
- Use `#FEFCF9` cream as the page background
- Use `#0A2E12` deep forest for heading text
- Use `rounded-full` for primary CTA buttons
- Maintain WCAG AAA (7:1) contrast in kiosk mode
- Use `shadow-[#1B5E20]/20` for button shadows

### Don't

- Use generic `emerald-500`, `emerald-600`, `green-500` Tailwind classes
- Use `emerald-to-blue` gradients (old Pick a Partner branding)
- Use `bg-white` for page backgrounds (use `bg-[#FEFCF9]`)
- Use `text-gray-900` for headings (use `text-[#0A2E12]`)
- Use `text-gray-500` for body (use `text-[#3D5A3E]`)
- Use `rounded-xl` on primary buttons (use `rounded-full`)
- Put text below 16px in kiosk views
- Use pure black (#000) for text anywhere

---

## 11. Quick Copy-Paste Reference

```
Page background:     bg-[#FEFCF9]
Card background:     bg-white
Heading text:        text-[#0A2E12]  font-display
Body text:           text-[#3D5A3E]
Secondary text:      text-[#3D5A3E]/70
Primary button bg:   bg-[#1B5E20]
Button hover:        hover:bg-[#2E7D32]
Button shadow:       shadow-lg shadow-[#1B5E20]/20
Focus ring:          focus:ring-[#1B5E20]/20
Input border:        border-[#0A2E12]/10
Input bg:            bg-[#FEFCF9]
Link color:          text-[#1B5E20] hover:text-[#2E7D32]
Eyebrow label:       text-sm font-semibold uppercase tracking-[0.15em] text-[#1B5E20]
Section border:      border-[#1B5E20]/5
Card border:         border-[#0A2E12]/5
```
