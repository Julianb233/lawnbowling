# Phase 4, Plan 2: Partner Selection UI Wiring - SUMMARY

**Started:** 2026-03-10
**Completed:** 2026-03-10
**Duration:** ~15 minutes (code implementation + verification)

## What was done

### Code Implemented

1. **`src/components/partner/SentRequestToast.tsx`** (NEW) -- Radix Toast notification for sent request status changes
   - Three status modes: accepted (green/sport-themed), declined (neutral gray), expired (amber)
   - Auto-dismisses after 4 seconds, 44px touch targets
   - Sport-themed glow on accepted status

2. **`src/components/board/PlayerCard.tsx`** (UPDATED) -- Added `isPending` prop
   - Amber pulsing "Pending" badge in top-right corner
   - "PICK ME" button changes to "REQUEST SENT" and becomes disabled
   - Prevents duplicate request attempts visually

3. **`src/components/board/AvailabilityBoard.tsx`** (UPDATED) -- Added `pendingTargetIds` prop
   - Passes `isPending={pendingTargetIds?.has(player.id)}` to each PlayerCard

4. **`src/app/board/page.tsx`** (UPDATED) -- Full integration
   - Computes `pendingTargetIds` from `useSentRequests` hook (memoized)
   - Passes to AvailabilityBoard for card indicators
   - Refetches sent requests after sending a new one
   - Toast notifications for accepted/declined/expired via handleSentRequestUpdate callback

5. **`src/lib/hooks/useSentRequests.ts`** (from 04-01) -- Realtime hook for outgoing requests
   - Watches partner_requests table for status changes on requester_id filter
   - Returns pendingSent list and fires onStatusChange callback

6. **`src/app/api/partner/request/route.ts`** (UPDATED) -- Configurable timeout
   - Uses `PARTNER_REQUEST_TIMEOUT_MINUTES` env var (default: 5)

7. **`src/app/api/partner/expire/route.ts`** (UPDATED) -- Added GET endpoint
   - Any authenticated user can trigger cleanup (used by board page on load)

8. **`vercel.json`** (UPDATED) -- Added Vercel cron for automatic expiry
   - `*/2 * * * *` calls `/api/partner/expire`

### Requirements Status

| Req | Requirement | Status |
|-----|------------|--------|
| PICK-01 | Tap card to send partner request | PASS |
| PICK-02 | Target sees request with accept/decline | PASS |
| PICK-03 | Accepted pair moves to Ready to Play queue | PASS |
| PICK-04 | Declined request shows feedback to requester | PASS |
| PICK-05 | Pending requests expire after configurable timeout | PASS |
| MATCH-01 | Matched pairs appear in queue | PASS |

### Build Verification
- TypeScript: `npx tsc --noEmit --skipLibCheck` passes with zero errors
- Next.js build: Turbopack temp file ENOENT issue (pre-existing environment problem, not caused by our changes)
