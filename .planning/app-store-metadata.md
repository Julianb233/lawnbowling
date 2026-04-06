# LawnBowl — App Store Metadata

## App Name
LawnBowl - Club Bowls Manager

## Subtitle (30 chars max)
Tournament draws & live scoring

## Bundle ID
com.lawnbowl.app

## Category
Primary: Sports
Secondary: Social Networking

## Description (4000 chars max)
LawnBowl is the complete lawn bowling companion for clubs, players, and tournament directors. Replace the paper draw sheet with a digital clubhouse experience that feels familiar — because it was designed by bowlers, for bowlers.

CHECK IN with one tap on the clubhouse iPad kiosk. No passwords, no fuss — just tap your name and you're marked as available for today's bowls.

VIEW THE DRAW as soon as the drawmaster generates it. See your rink assignment, your teammates, and your opponents — right on your phone. No more crowding around the noticeboard.

SCORE LIVE with the digital scorecard that mirrors the pencil card you already know. End-by-end scoring with running totals, dead end support, and real-time updates for spectators watching from the clubhouse TV.

FIND A CLUB near you with the directory of 500+ bowling clubs across Australia. See ratings, member counts, facilities, and get directions.

TRACK YOUR STATS across every match — win rate, average margin, positions played, and achievement badges. Your complete bowling history in one place.

LEARN THE GAME with guides on rules, positions, equipment, and game formats. Perfect for new bowlers or experienced players brushing up.

Features:
- Kiosk check-in for clubhouse iPads (72px touch targets for easy tapping)
- Tournament draw generation with automated rink assignments
- Live end-by-end scoring with real-time updates
- Clubhouse TV display with live scores, weather, and upcoming events
- Club directory with map, ratings, and member counts
- Player profiles with stats, badges, and match history
- Pennant competition management with ladders and fixtures
- Team management for pairs, triples, and fours
- Schedule and events calendar
- Photo gallery for club memories
- Works offline — scores sync when you're back online
- Print-ready draw sheets for the noticeboard

Designed with love for the bowling community. Where friendships roll.

## Keywords (100 chars max)
lawn bowling,bowls,tournament,scoring,club,draw sheet,rink,pennant,scorecard,sports,community

## What's New (Version 1.0)
Welcome to LawnBowl! Your complete lawn bowling companion.
- One-tap kiosk check-in for clubhouse iPads
- Live end-by-end scoring
- Tournament draw generation
- Club directory with 500+ clubs
- Player profiles and stats
- Works offline

## Privacy Policy URL
https://www.lawnbowling.app/privacy

## Support URL
https://www.lawnbowling.app/contact

## Marketing URL
https://www.lawnbowling.app

## Age Rating
4+ (No objectionable content)

## Screenshots Needed
- 6.7" iPhone (1290 x 2796) — iPhone 15 Pro Max
- 6.5" iPhone (1284 x 2778) — iPhone 14 Plus
- 12.9" iPad (2048 x 2732) — iPad Pro

### Screenshot Sequence (6 required per device)
1. Home screen (Availability Board) — "Your bowls, at a glance"
2. Kiosk Check-In — "One-tap check-in at the clubhouse"
3. Tournament Draw — "See your rink assignment instantly"
4. Live Scoring — "Score end-by-end, just like the pencil card"
5. Club Directory — "Find a club near you"
6. TV Display — "Live scores on the clubhouse TV"

## Review Notes for Apple
This is a Progressive Web App (PWA) wrapped with Capacitor for native distribution. The app provides genuine value beyond what Safari offers: push notifications for draw announcements, offline scoring capability, and optimized iPad kiosk mode for clubhouse check-in. The primary use case is lawn bowling club management — tournament organization, player check-in, and live scoring.

## Pre-Submission Checklist

### Apple App Store
- [ ] Apple Developer account enrolled ($99/year)
- [ ] Update `TEAM_ID` in `ios/ExportOptions.plist` (replace TEAM_ID_HERE)
- [ ] Update `TEAM_ID` in `public/.well-known/apple-app-site-association`
- [ ] Generate 1024x1024 app icon (no alpha, no transparency, no rounded corners)
- [ ] Take screenshots: 6.7" iPhone, 6.5" iPhone, 12.9" iPad
- [ ] Configure signing certs and provisioning profiles in Xcode
- [ ] Run `npm run cap:submit` from macOS with Xcode
- [ ] Fill in App Store Connect metadata (copy from above)
- [ ] Submit for TestFlight review first
- [ ] Enable Phone auth in Supabase Dashboard (Settings > Auth > Phone)

### Google Play Store
- [ ] Google Play Console account ($25 one-time)
- [ ] Generate signing key: `keytool -genkey -v -keystore lawnbowl.keystore -alias lawnbowl -keyalg RSA -keysize 2048 -validity 10000`
- [ ] Update `sha256_cert_fingerprints` in `public/.well-known/assetlinks.json`
- [ ] Create TWA wrapper using Bubblewrap or PWABuilder
- [ ] Generate 512x512 icon and 1024x500 feature graphic
- [ ] Take phone screenshots
- [ ] Submit for internal testing track first

### Auth Configuration for Native Apps
- [ ] Enable Supabase Phone Auth provider (Twilio or MessageBird)
- [ ] Configure deep links in Supabase: Auth > URL Configuration > Redirect URLs
  - Add: `com.lawnbowl.app://`
  - Add: `https://www.lawnbowling.app/reset-password`
  - Add: `https://www.lawnbowling.app/auth/callback`
- [ ] Test password reset flow end-to-end (forgot → email → reset-password page → new password)
- [ ] Test phone OTP sign-in flow end-to-end
