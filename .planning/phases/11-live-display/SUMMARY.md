# Phase 11: Live Display — TV Scoreboard, Notifications, Weather

## Status: COMPLETE

All four success criteria are met by existing code.

## Success Criteria Verification

### 1. /tv route displays live scoreboard for clubhouse TV
- **File**: `src/app/tv/page.tsx` (449 lines)
- Dark-themed full-screen TV display optimized for clubhouse monitors
- Auto-detects active lawn bowling tournament from Supabase
- Supabase Realtime subscription for live score updates (no manual refresh)
- Per-rink ScoreCard components showing: team names, total scores, ends won, end-by-end breakdown
- Status indicators: "Live" pulsing dot, "In Play", "Final", "Pending" badges
- Round tabs for multi-round tournaments
- Clock display with date
- Fullscreen toggle for TV kiosk mode
- **Layout**: `src/app/tv/layout.tsx` — robots noindex, dark theme color

### 2. Draw announcements auto-display when generated
- **File**: `src/app/tv/page.tsx` (lines 117-170)
- Supabase Realtime subscription on `tournament_scores` INSERT events
- When new round scores appear with team player data, a `DrawAnnouncement` overlay displays
- Full-screen modal overlay shows: round number, per-rink team assignments (player names)
- Auto-dismisses after 30 seconds
- Accumulates rinks as they're inserted (progressive display)

### 3. Push notifications for draw announcements
- **Push library**: `src/lib/push.ts` — VAPID-based web push via `web-push` package
  - `sendPushToUser()` — sends to all registered push subscriptions for a user
  - `sendPushToPlayer()` — resolves player to user, checks notification preferences
  - Auto-cleans stale subscriptions (HTTP 410/404)
- **Bowls notifications API**: `src/app/api/bowls/notifications/route.ts`
  - `POST /api/bowls/notifications` with types: `draw_announcement`, `score_update`, `tournament_start`
  - Sends to all checked-in players for the tournament
  - Customizable message, deep-link URL, action buttons
- **Client component**: `src/components/bowls/PushNotificationManager.tsx`
  - Subscribe/unsubscribe toggle with permission status handling
  - States: unsupported, denied, subscribed, unsubscribed
- **Hook**: `src/lib/hooks/usePushSubscription.ts` — manages browser push subscription lifecycle

### 4. Weather widget shows current conditions via Open-Meteo
- **File**: `src/app/tv/WeatherWidget.tsx`
- Calls Open-Meteo API: `api.open-meteo.com/v1/forecast?current=temperature_2m,weather_code,wind_speed_10m`
- Uses browser geolocation with fallback coordinates (Long Beach, CA)
- Displays: temperature (F), weather condition text, wind speed, weather icon
- Weather code mapping covers: clear, cloudy, fog, drizzle, rain, snow, thunderstorm
- Auto-refreshes every 30 minutes
- Also available as: `src/components/bowls/WeatherWidget.tsx` for non-TV contexts

## Minor Note
- The scores page at `src/app/bowls/[id]/scores/page.tsx:452` links to `/bowls/${id}/live` which does not have a dedicated page file. The `/tv` route serves as the primary live TV display. This is a navigation inconsistency but does not affect the core functionality.
