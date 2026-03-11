# PRD: Post-Tournament Social Sharing

## Problem Statement
When a tournament completes, the app provides no way to share the results: there is no auto-generated summary card, no push notification to club members, and no sharing mechanism for WhatsApp, email, Facebook, or a copyable link. The social moment that defines a bowls day — "who won?" — is entirely absent from the app.

## Goal
When a tournament is finalized, the app auto-generates a shareable results summary card (as an image), pushes a notification to club members, and provides one-tap sharing to WhatsApp, email, Facebook, and clipboard. Optionally, an email digest is sent to the club mailing list.

## User Stories
- As a **drawmaster**, I want a "Share Results" button that appears when a tournament is finalized so that I can instantly post the winner to the club WhatsApp group.
- As a **player**, I want to receive a push notification when the tournament I played in is finalized so that I can see the final standings without refreshing the app.
- As a **club member who didn't play**, I want to receive a notification when a club tournament finishes so that I can see how my clubmates did.
- As a **drawmaster**, I want the results to be automatically formatted as a social media image (portrait card) so that I don't need to screenshot and crop manually.
- As a **club admin**, I want to opt the club in to an automatic email digest sent to a club mailing list address so that members who don't have the app still see the results.
- As a **player**, I want to share a link to the results page that non-members can view without logging in so that I can send it to friends outside the club.

## Requirements

- **PSS-01** — When a tournament's state transitions to `complete` (via the progression API's `complete` action), the server must trigger result card generation. This must be non-blocking — the finalization API call must return immediately and card generation runs asynchronously.
- **PSS-02** — A new API route `GET /api/bowls/[tournamentId]/share-card` must generate and return a PNG image of the results summary card. The card must include: tournament name, date, game format, top 3 players by standings (with shot difference as tiebreaker), and the club's logo/name.
- **PSS-03** — The share card image must be generated server-side using `@vercel/og` (already a Next.js dependency) or an equivalent React-to-PNG renderer, not via canvas in the browser. The image dimensions must be 1080x1080px (square, optimized for WhatsApp and Facebook).
- **PSS-04** — The results page (`/bowls/[id]/results/page.tsx`) must display a "Share Results" button when `progression.current_state === "complete"`. This button must open a share sheet component.
- **PSS-05** — The share sheet component must provide the following sharing targets: (a) Copy link to clipboard, (b) Share to WhatsApp (via `whatsapp://send?text=` deep link), (c) Share via Email (via `mailto:` with pre-filled subject and body), (d) Share to Facebook (via Facebook share dialog URL), (e) Native share (via `navigator.share()` on mobile, with the above as fallback on desktop).
- **PSS-06** — The shareable link must be a public URL (`/bowls/[tournamentId]/results`) that is accessible without authentication and renders the top 3 standings and tournament metadata. The existing results page must be updated to render this public view when the request is unauthenticated.
- **PSS-07** — When the tournament is finalized, the server must send a push notification to all players who participated in the tournament (are in `bowls_checkins` for that `tournament_id`). Notification title: "[Tournament Name] Results", body: "The results are in! See the final standings."
- **PSS-08** — Optionally (controlled by a club-level setting `notify_all_members_on_tournament_complete: boolean`), the push notification must also be sent to all players whose `home_club_id` matches the tournament's `club_id`, not just participants.
- **PSS-09** — A club admin must be able to configure a `club_mailing_list_email` field in club settings. When set, a formatted HTML email digest must be sent to that address when a tournament completes. The email must include the results card image as an inline attachment and a text summary of the top 5 standings.
- **PSS-10** — The share card image must be cached: once generated for a given `tournament_id`, it must be stored and served from the cache (Vercel Blob, Supabase Storage, or equivalent) rather than regenerated on every request.
- **PSS-11** — The share card must be accessible from the results page for at least 90 days after the tournament ends (image must not expire or be purged within that window).
- **PSS-12** — The results page must include Open Graph meta tags (`og:title`, `og:description`, `og:image`) pointing to the generated share card image so that link previews render correctly when pasted into WhatsApp, iMessage, Slack, or Facebook.
- **PSS-13** — The "Share Results" UI must be available to: (a) the drawmaster (tournament creator), (b) any participant, (c) any authenticated user with the link. It must NOT be restricted only to admins.
- **PSS-14** — If the share card generation fails (e.g., OG image renderer error), the "Share Results" button must still function — the share sheet must fall back to sharing the plain text link without the image. The failure must be logged but not surface as an error to the user.
- **PSS-15** — The email digest must use the existing email infrastructure in `src/lib/email/` and must not introduce a new email provider dependency. If the existing infrastructure cannot send attachments, the email must link to the hosted image instead of inlining it.
- **PSS-16** — The push notification dispatch must use the existing push infrastructure in `src/lib/push.ts`. It must batch-send to all relevant `player_id` values and must not send duplicate notifications if the finalization action is called more than once.
- **PSS-17** — The share card's visual design must follow the brand color palette established in `src/lib/design.ts` and include the app name/logo. If a club has a `primary_color` set, the card accent color must use the club's color.

## Success Criteria
- When a drawmaster clicks "Finalize Tournament," the results page displays a "Share Results" button within 5 seconds of the finalization completing.
- Clicking "Copy link" copies a URL that, when opened in a private/incognito browser window, shows the top 3 standings without requiring login.
- Clicking "Share to WhatsApp" opens WhatsApp with a pre-filled message containing the results link.
- The generated share card image renders at 1080x1080px with correct tournament data verified by manual inspection.
- All participants in a finalized tournament receive a push notification (verified in staging with test devices).
- The Open Graph image tag on the results page causes a thumbnail preview to appear when the link is pasted into a WhatsApp chat (manual QA test).
- The share card image is retrievable at the same URL 24 hours after generation (caching works).

## Technical Approach

**Key files to modify / create:**
- `src/app/bowls/[id]/results/page.tsx` — Add "Share Results" button; add `<ShareSheet>` component; add OG meta tags (move page to a server component wrapper to support `generateMetadata`).
- `src/app/api/bowls/[tournamentId]/share-card/route.ts` (new) — Image generation endpoint using `@vercel/og`. Fetches top 3 standings and club data, renders `ResultsCardTemplate`, returns PNG with `Cache-Control: public, max-age=31536000`.
- `src/components/bowls/ShareSheet.tsx` (new) — Bottom sheet / modal component with sharing targets. Uses `navigator.share()` with fallback.
- `src/components/bowls/ResultsCardTemplate.tsx` (new) — The OG image React component. Renders pure JSX/inline styles (required by `@vercel/og`). No Tailwind classes — use inline styles only.
- `src/app/bowls/[id]/results/opengraph-image.tsx` (new) — Next.js OG image route using the same `ResultsCardTemplate`.
- `src/app/api/bowls/progression/route.ts` — In the `complete` action handler, add calls to: (a) `sendTournamentCompleteNotifications(tournamentId)` and (b) `sendClubDigestEmail(tournamentId)` (both async, non-blocking via `void promise`).
- `src/lib/push.ts` — Add `sendTournamentCompleteNotifications(tournamentId: string): Promise<void>` function. Fetches participant `player_id` list, looks up push tokens, dispatches notifications.
- `src/lib/email/tournament-digest.ts` (new) — HTML email template and send function for the club digest.

**Share card image route:**
```ts
// src/app/api/bowls/[tournamentId]/share-card/route.ts
import { ImageResponse } from "next/og";
import { ResultsCardTemplate } from "@/components/bowls/ResultsCardTemplate";

export async function GET(req, { params }) {
  const data = await fetchTournamentResultsForCard(params.tournamentId);
  return new ImageResponse(<ResultsCardTemplate {...data} />, {
    width: 1080, height: 1080,
  });
}
```

**OG meta tags (server component wrapper):**
```ts
export async function generateMetadata({ params }) {
  return {
    openGraph: {
      title: `${tournamentName} Results`,
      images: [`/api/bowls/${params.id}/share-card`],
    },
  };
}
```

**Native share fallback:**
```ts
async function handleShare(link: string) {
  if (navigator.share) {
    await navigator.share({ title, text, url: link });
  } else {
    setShowFallbackSheet(true); // show manual options
  }
}
```

**Dependencies:**
- `@vercel/og` — likely already available via Next.js 14+; confirm in `package.json`.
- Vercel Blob or Supabase Storage for image caching (check existing `supabase/storage` buckets).
- Existing `src/lib/email/` and `src/lib/push.ts` — no new providers.

## Scope & Constraints

**In scope:**
- Server-side share card image generation (1080x1080 PNG)
- Share sheet with 5 targets: clipboard, WhatsApp, email, Facebook, native share
- Public results page (unauthenticated access)
- Open Graph meta tags on results page
- Push notification to participants on tournament finalization
- Optional push notification to all club members (club-level setting)
- Optional club mailing list email digest

**Out of scope:**
- Twitter/X card sharing (can be added later with same OG infrastructure)
- Video recap / highlight reel generation
- Scheduled/delayed sharing (e.g., "share in 1 hour")
- Per-player shareable stats cards ("My tournament stats" — separate feature)
- In-app commenting or reactions on results

**Risks:**
- `@vercel/og` / `ImageResponse` does not support all CSS properties. The `ResultsCardTemplate` must use only inline styles and a limited subset of flexbox. Complex layouts may need to be simplified relative to the main app's design.
- Push notification delivery depends on players having granted push permissions. Notification send failures must be silently swallowed (not cause tournament finalization to fail).
- The public results page requirement (PSS-06) requires a review of existing RLS policies to ensure unauthenticated reads of `tournament_scores` and `players` display names are permitted. This may require adding a public read policy or a dedicated public-facing data endpoint.
- Facebook sharing via URL only works if the OG tags are server-rendered. Confirm the results page is not a pure client component before implementing.

## Estimated Effort
M
