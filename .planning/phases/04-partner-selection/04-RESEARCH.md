# Phase 4 Research: Partner Selection

## What Already Exists

### Backend (Fully Built)
- **`src/lib/db/partner-requests.ts`** — Complete CRUD: `createPartnerRequest`, `getPartnerRequest`, `getPendingRequestsForPlayer`, `updateRequestStatus`, `hasPendingRequest`, `expireStaleRequests`
- **`src/lib/db/matches.ts`** — Complete: `createMatch` (inserts match + match_players + marks players unavailable), `getQueuedMatches`, `getActiveMatches`, `updateMatchStatus`, `listMatches`, `getMatchPlayers`
- **`src/app/api/partner/request/route.ts`** — POST endpoint: validates auth, checks availability, prevents self-request, checks for duplicate pending requests, creates request with 5-min expiry
- **`src/app/api/partner/respond/route.ts`** — POST endpoint: validates auth + target ownership, checks expiry, on accept: updates request status + creates match; on decline: updates request status
- **`src/app/api/partner/expire/route.ts`** — POST endpoint: admin or cron-secret auth, calls `expireStaleRequests()`

### Frontend Components (Fully Built)
- **`src/components/partner/RequestModal.tsx`** — Radix Dialog with sport selector, target player card (avatar/initials, skill stars), "PICK EM" submit button, success animation. Uses `framer-motion`, `@radix-ui/react-dialog`, `@radix-ui/react-select`.
- **`src/components/partner/IncomingRequest.tsx`** — Toast notification for incoming requests with countdown timer, accept/decline buttons, auto-dismiss on expiry. Uses `@radix-ui/react-toast`. Also exports `IncomingRequestProvider` wrapper.
- **`src/components/partner/MatchQueue.tsx`** — Real-time match queue display with Supabase Realtime subscription on `matches` table. Shows queued matches with player pills, sport badge, queue position, court assignment status.

### Hooks (Fully Built)
- **`src/lib/hooks/usePartnerRequests.ts`** — Real-time hook: fetches pending requests for a player, subscribes to `partner_requests` table INSERT/UPDATE via Supabase Realtime. Auto-removes responded/expired requests.

### Types (Fully Defined)
- `PartnerRequest` interface with `requester_id`, `target_id`, `sport`, `status`, `expires_at`, `responded_at`
- `RequestStatus = "pending" | "accepted" | "declined" | "expired"`
- `Match` interface with `sport`, `court_id`, `venue_id`, `status`, `started_at`, `ended_at`
- `MatchStatus = "queued" | "playing" | "completed"`
- `MatchPlayer` interface with `match_id`, `player_id`, `team`

### Board Integration
- **`src/components/board/PlayerCard.tsx`** — Exists (needs to wire tap-to-request)
- **`src/components/board/AvailabilityBoard.tsx`** — Exists (needs to integrate RequestModal + IncomingRequest + MatchQueue)

## What Needs Integration/Wiring

### Plan 04-01: Backend + Real-time Notifications
The backend API routes and DB functions are fully built. What remains:
1. **Wire PlayerCard tap → RequestModal** in the board page
2. **Wire IncomingRequest toast** into the board layout with `usePartnerRequests` hook
3. **Real-time notification sound/vibration** on incoming request (optional but good UX)
4. **Auto-expire cron** — either a Vercel cron job or client-side polling to call `/api/partner/expire`
5. **Edge case: both players send requests simultaneously** — the API prevents duplicates one-way (`hasPendingRequest(A, B)`) but doesn't check `hasPendingRequest(B, A)`. Should auto-match if both request each other.

### Plan 04-02: UI Integration + Status Handling
1. **Board page integration** — Import and render `RequestModal`, `IncomingRequestProvider`, `IncomingRequest`, and `MatchQueue` in the main board/page
2. **Request status feedback** — Show toast/notification when your sent request is accepted or declined
3. **Player card state** — Disable/dim player cards that already have a pending request from the current user
4. **Match queue visibility** — Show the "Ready to Play" queue on the board (sidebar or bottom section)
5. **Post-match return** — When a match is declined, both players should visually return to the available board (already handled by API not changing `is_available` on decline)

## Technical Considerations

### Supabase Realtime
- Already used in `usePartnerRequests` and `MatchQueue` — proven pattern
- Channel naming: `partner-requests-{playerId}` for requests, `match-queue` for matches
- No additional Realtime setup needed

### Request Timeout
- 5-minute default expiry set in request API route
- `IncomingRequest` component already has countdown timer
- `expireStaleRequests()` cleans up server-side
- Consider: configurable timeout via venue settings (exists in `notification_preferences` but not venue-level)

### Concurrency
- Supabase handles concurrent requests at the DB level
- `hasPendingRequest` check prevents duplicate requests
- Race condition on accept: if both accept simultaneously, `createMatch` would create duplicate matches. Consider: use Supabase RPC/transaction for atomic accept.

## Dependencies
- Phase 3 (Live Availability Board) must provide: checked-in players list, player cards, board page
- Phase 2 (Player Profiles) must provide: player profiles with sports and skill levels
- Phase 1 (Foundation) must provide: auth, Supabase client, database schema

## Conclusion
Phase 4 is ~80% built. The main work is **integration**: wiring existing components into the board page, handling edge cases, and ensuring the real-time flow works end-to-end. No new major components need to be created.

## RESEARCH COMPLETE
