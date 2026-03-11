# Phase 11: Live Display & Engagement

## Scope
TV scoreboard mode, live draw display, push notifications, and weather widget for clubhouse engagement.

## Sub-phases

### 11-01: TV Scoreboard & Live Draw Display
- [x] `/tv` route with dark theme optimized for large screens
- [x] Real-time score updates via Supabase Realtime channels
- [x] Draw announcement overlay auto-displayed when new rounds are created
- [x] Round tab navigation for multi-round tournaments
- [x] ScoreCard component with end-by-end breakdown, team colors, win badges
- [x] Fullscreen toggle for TV kiosk mode
- [x] Live indicator dot animation
- [x] Auto-dismiss draw announcements after 30 seconds
- [x] Clock and date display in header
- [x] TV layout with robots noindex, custom viewport theme color

### 11-02: Push Notifications & Weather Widget
- [x] Web Push via VAPID keys (web-push library)
- [x] Service worker (`public/push-sw.js`) handles push events and notification clicks
- [x] Subscribe/unsubscribe hook (`usePushSubscription`)
- [x] API routes: `POST/DELETE /api/push/subscribe`, `POST /api/push/send`
- [x] Push notifications sent on draw generation (`/api/bowls/draw`)
- [x] `sendPushToTournamentPlayers()` broadcasts to all checked-in players
- [x] Notification preferences in settings (push_partner_requests, push_match_ready, etc.)
- [x] Draw announcements always sent (not subject to preference opt-out)
- [x] PushNotificationManager component for subscribe/unsubscribe UI
- [x] NotificationCenter dropdown with real-time updates
- [x] Weather widget on TV page (Open-Meteo free API, no key required)
- [x] Full WeatherWidget component with wind direction, speed, bowler warnings
- [x] Geolocation with Long Beach, CA fallback
- [x] Auto-refresh weather every 10-30 minutes

## Key Files
- `src/app/tv/page.tsx` - TV scoreboard page
- `src/app/tv/layout.tsx` - TV layout metadata
- `src/app/tv/WeatherWidget.tsx` - Compact weather for TV header
- `src/components/bowls/WeatherWidget.tsx` - Full weather widget
- `src/components/bowls/PushNotificationManager.tsx` - Push subscription UI
- `src/components/notifications/NotificationCenter.tsx` - Notification dropdown
- `src/components/settings/NotificationSettings.tsx` - Notification preferences
- `src/lib/push.ts` - Server-side push notification sending
- `src/lib/hooks/usePushSubscription.ts` - Client-side push subscription hook
- `src/lib/hooks/useNotifications.ts` - Notifications data hook
- `src/app/api/push/subscribe/route.ts` - Push subscription API
- `src/app/api/push/send/route.ts` - Push send API (admin)
- `src/app/api/bowls/draw/route.ts` - Draw generation with push broadcast
- `public/push-sw.js` - Push notification service worker
