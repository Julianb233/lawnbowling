# LawnBowl iOS App Store Submission Guide

## Overview

LawnBowl is a Capacitor-wrapped PWA pointing to `https://www.lawnbowling.app`. The iOS project lives in `ios/` and is ready for build + submission.

## Prerequisites

- [ ] **Apple Developer account** ($99/year) — https://developer.apple.com/enroll
- [ ] **Xcode 16+** installed on macOS
- [ ] **Apple Developer Team ID** — find at https://developer.apple.com/account → Membership Details
- [ ] **App Store Connect** app record created — https://appstoreconnect.apple.com

## Quick Start

```bash
# 1. Update ExportOptions.plist with your Team ID
sed -i '' 's/TEAM_ID_HERE/YOUR_TEAM_ID/' ios/ExportOptions.plist

# 2. Run the build script
npm run cap:submit
```

## Step-by-Step Manual Process

### 1. Create App Record in App Store Connect

1. Go to https://appstoreconnect.apple.com → My Apps → (+) New App
2. Fill in:
   - **Platform:** iOS
   - **Name:** LawnBowl - Club Bowls Manager
   - **Primary Language:** English (Australia)
   - **Bundle ID:** com.lawnbowl.app
   - **SKU:** lawnbowl-v1
3. Save

### 2. Sync Capacitor Assets

```bash
npm run cap:sync
```

### 3. Open in Xcode

```bash
npm run cap:open
```

### 4. Configure Signing

1. Select the **App** target → **Signing & Capabilities**
2. Check **Automatically manage signing**
3. Select your Team from the dropdown
4. Xcode will create the App ID and provisioning profile automatically

### 5. Set Version & Build Number

In Xcode, App target → General:
- **Version:** 1.0.0
- **Build:** 1

### 6. Build Archive

1. Select **Product → Archive** (ensure destination is "Any iOS Device")
2. Wait for build to complete
3. Organizer window will open with the archive

### 7. Upload to App Store Connect

1. In Organizer, select the archive → **Distribute App**
2. Choose **App Store Connect**
3. Choose **Upload**
4. Follow prompts (automatic signing recommended)
5. Wait for upload + processing

### 8. Fill App Store Metadata

See `.planning/app-store-metadata.md` for all copy. Key fields:

| Field | Value |
|-------|-------|
| App Name | LawnBowl - Club Bowls Manager |
| Subtitle | Tournament draws & live scoring |
| Category | Sports / Social Networking |
| Age Rating | 4+ |
| Privacy URL | https://www.lawnbowling.app/privacy |
| Support URL | https://www.lawnbowling.app/contact |
| Marketing URL | https://www.lawnbowling.app |

### 9. Screenshots

Required sizes (see metadata doc for sequence):
- 6.7" iPhone (1290 × 2796)
- 6.5" iPhone (1284 × 2778)
- 12.9" iPad (2048 × 2732)

Take 6 screenshots per device showing: Home, Kiosk Check-In, Tournament Draw, Live Scoring, Club Directory, TV Display.

### 10. Submit for Review

1. In App Store Connect, go to the build → **Add for Review**
2. Answer the export compliance question: **No** (ITSAppUsesNonExemptEncryption is already set to false in Info.plist)
3. Add Review Notes (from metadata doc)
4. Submit

## App Review Notes

> This is a Progressive Web App (PWA) wrapped with Capacitor for native distribution. The app provides genuine value beyond what Safari offers: push notifications for draw announcements, offline scoring capability, and optimized iPad kiosk mode for clubhouse check-in. The primary use case is lawn bowling club management — tournament organization, player check-in, and live scoring.

## Files Reference

| File | Purpose |
|------|---------|
| `capacitor.config.ts` | Capacitor config (app ID, server URL, plugins) |
| `ios/ExportOptions.plist` | xcodebuild export options for App Store submission |
| `ios/App/App/Info.plist` | iOS app configuration |
| `ios/App/App/Assets.xcassets/AppIcon.appiconset/` | App icons (all sizes included) |
| `.planning/app-store-metadata.md` | Full App Store listing copy |
| `scripts/build-ios.sh` | Automated build + upload script |

## Troubleshooting

**"No signing certificate" error:**
Ensure you're signed into Xcode with your Apple Developer account (Xcode → Settings → Accounts).

**"App ID not available" error:**
The bundle ID `com.lawnbowl.app` may need to be registered at https://developer.apple.com/account/resources/identifiers.

**Build fails with "provisioning profile" error:**
Try: Xcode → Product → Clean Build Folder, then rebuild.
