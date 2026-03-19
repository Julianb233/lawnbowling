# Browserbase Visual UX Audit — lawnbowling.app
**Date**: 2026-03-17
**Overall Score**: 8/10

## CRITICAL (Must Fix)

### 1. Kiosk Check-In Infinite Spinner
- **URL**: /kiosk → Check In view
- **Issue**: Loading spinner never resolves. Primary kiosk function is broken.
- **Impact**: Club director setting up iPad on tournament morning = stuck.
- **Priority**: P0

### 2. No "Sign In" Link in Main Navigation
- **URL**: / (homepage)
- **Issue**: Nav has Clubs, Learn, Shop, Gallery, About, Get Started — but no Sign In/Dashboard
- **Impact**: Returning club director has no obvious way to access their account
- **Fix**: Add "Sign In" to nav or make "Get Started" context-aware
- **Priority**: P0

### 3. Missing 404 Page
- **Issue**: Non-existent URLs redirect to sign-in page instead of showing 404
- **Priority**: P1

## HIGH PRIORITY

### 4. Map Defaults to Europe
- **URL**: /clubs (map view)
- **Issue**: 85/165 clubs are US-based but map centers on UK/France
- **Fix**: Default to user geolocation or US center
- **Priority**: P1

### 5. API /api/clubs Returns Empty
- **Issue**: Returns `{"clubs":[],"total":0}` while frontend shows 165 clubs
- **Impact**: External integrations relying on this API would fail
- **Priority**: P1

## MEDIUM PRIORITY

### 6. No "Request to Visit" on Club Directory Cards
- **Impact**: New members must click into each club to find contact info
- **Priority**: P2

### 7. No Social Auth (Google/Apple)
- **Impact**: Extra friction for elderly users who struggle with passwords
- **Priority**: P2

### 8. Hero Text Contrast
- **Issue**: Sub-text over hero photo needs stronger shadow/overlay for WCAG
- **Priority**: P2

## WHAT WORKS EXCEPTIONALLY WELL
- Learn section is outstanding (96 glossary terms, all 4 formats, stat cards)
- Club directory: 165 clubs, excellent filtering
- Signup: 1 step, 3 fields — perfect for demographic
- Kiosk button sizes meet 56px+ target
- Visual design: cohesive green theme, professional photography
- Testimonials feel authentic (Margaret H., Bob T., Patricia L.)
- Insurance page: strong value prop
- Shop: fun niche merch building community identity
