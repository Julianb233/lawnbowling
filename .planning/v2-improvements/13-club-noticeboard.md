# PRD: Club Noticeboard & Social Feed

## Problem Statement
The activity feed at `/activity` displays only machine-generated events (`check_in`, `match_complete`, `new_player`, `scheduled_game`) sourced from a flat `ActivityItem` table with no social interaction layer — no reactions, no comments, no admin announcements. Club members cannot post results celebrations, green maintenance notices, or upcoming event reminders inside the app, and resort to WhatsApp groups and email chains for everything social.

## Goal
Replace the generic `/activity` feed with a club-scoped noticeboard that surfaces auto-posted tournament results, supports admin announcements with pin capability, and allows members to react with emoji and comment on posts — with push notifications for new activity.

## User Stories
- As a club member, I want to see a feed of recent tournament results with the scores, so that I don't have to be present to know how my club performed.
- As a club admin, I want to post announcements (green maintenance, upcoming events, rule changes) that appear pinned at the top of the noticeboard, so that members see important information before scrolling through results.
- As a player, I want to react to a result with an emoji (thumbs up, clapping hands, fire) so that I can celebrate wins without writing a comment.
- As a player, I want to comment on a tournament result ("Great draw today, well done everyone!") so that the app has the social warmth of a WhatsApp group without leaving the platform.
- As a player, I want to receive a push notification when a new announcement is pinned or a result is posted, so that I stay informed without manually checking the app.
- As a club admin, I want to delete inappropriate comments, so that I can keep the noticeboard civil.

## Requirements

1. **REQ-13-01** — Add a `noticeboard_posts` table in Supabase with columns: `id` (uuid), `venue_id` (uuid, FK), `club_id` (text, optional FK), `author_id` (uuid, FK to players), `type` (text: `announcement` | `tournament_result` | `member_post`), `title` (text, nullable), `body` (text), `tournament_id` (uuid, nullable — for `tournament_result` type), `is_pinned` (boolean, default false), `is_deleted` (boolean, default false), `created_at`, `updated_at`.

2. **REQ-13-02** — Add a `noticeboard_reactions` table: `id`, `post_id` (FK `noticeboard_posts`), `player_id` (FK players), `emoji` (text, one of: `👍` `👏` `🔥` `🎉` `❤️`), `created_at`. Unique constraint on `(post_id, player_id, emoji)`.

3. **REQ-13-03** — Add a `noticeboard_comments` table: `id`, `post_id` (FK), `author_id` (FK players), `body` (text, max 500 chars), `is_deleted` (boolean), `created_at`.

4. **REQ-13-04** — Add TypeScript interfaces `NoticeboardPost`, `NoticeboardReaction`, `NoticeboardComment` to `src/lib/types.ts`. Extend `ActivityItem.type` union to include `'noticeboard_post'` for backward compatibility with the existing feed query in `src/lib/db/activity.ts`.

5. **REQ-13-05** — Create `src/components/noticeboard/NoticeboardFeed.tsx` — the primary feed component. It renders a list of `NoticeboardPostCard` components, sorted with pinned posts first, then by `created_at` descending. Supports infinite scroll (fetch 20 at a time).

6. **REQ-13-06** — Create `src/components/noticeboard/NoticeboardPostCard.tsx` rendering: post header (author avatar, name, timestamp, post type badge), body text (markdown-lite: bold, italics, line breaks only — no HTML), reaction bar with emoji counts and tap-to-react, comment count with expand toggle, admin controls (pin/unpin, delete) visible only to venue admins.

7. **REQ-13-07** — Create `src/components/noticeboard/CommentThread.tsx` rendering the expanded comment list for a post with an inline comment input. Comments are paginated (load 10, show "load more"). Admin delete button on each comment.

8. **REQ-13-08** — Replace the current `src/app/activity/page.tsx` content with `<NoticeboardFeed>`. The page header should change from "Activity" to "Noticeboard". The existing `<ActivityFeed>` component should be preserved but no longer used on the main activity page (it may remain accessible elsewhere, e.g. admin dashboard).

9. **REQ-13-09** — Create API routes:
   - `POST /api/noticeboard/posts` — create a member post or announcement (admin only for announcements).
   - `PATCH /api/noticeboard/posts/[id]` — pin/unpin or soft-delete (admin only).
   - `POST /api/noticeboard/posts/[id]/reactions` — add or toggle a reaction.
   - `POST /api/noticeboard/posts/[id]/comments` — add a comment.
   - `DELETE /api/noticeboard/comments/[id]` — soft-delete a comment (author or admin).

10. **REQ-13-10** — Auto-post tournament results: when a tournament's status changes to `completed`, the system must automatically create a `noticeboard_post` with `type = 'tournament_result'`, a generated title (e.g. "Round Robin — 12 Apr 2025 results"), and a body summarizing the top 3 rink scores. This should be triggered from the existing tournament completion flow (wherever tournament `status` is updated to `completed`).

11. **REQ-13-11** — Admin announcement creation UI: add an "Add Announcement" button to the club admin dashboard (or the noticeboard page header, admin-only). It opens a sheet with a title field, body textarea, and a "Pin this post" toggle. On submit, calls `POST /api/noticeboard/posts`.

12. **REQ-13-12** — Push notifications: when a new pinned announcement is created, send a push notification to all players at the venue using `src/lib/push.ts`. Notification body = announcement title. Use `NotificationType` — add `'noticeboard_announcement'` to the union in `src/lib/types.ts`.

13. **REQ-13-13** — Real-time updates: subscribe to new `noticeboard_posts` and `noticeboard_reactions` via Supabase Realtime in the `NoticeboardFeed` component, following the existing Realtime pattern used in `src/app/tv/page.tsx` (channel subscribe / unsubscribe on unmount).

14. **REQ-13-14** — RLS policies: all authenticated players can read non-deleted posts and comments for their venue; players can insert their own posts (type = `member_post`) and comments; only admins can insert `announcement` type posts; players can insert/delete their own reactions; admins can update `is_pinned` and `is_deleted` on any post or comment.

15. **REQ-13-15** — The noticeboard must be venue-scoped: players only see posts for the venue they are currently checked in to (or their home venue, from `player.venue_id`). A "Global" tab showing cross-venue tournament results may be added in a future iteration but is out of scope here.

## Success Criteria
- A completed tournament automatically generates a result post visible on `/activity` within 60 seconds of status change.
- An admin can pin an announcement, and it appears at the top of the feed for all venue members with a visual "Pinned" indicator.
- A player can tap a fire emoji reaction on a post, the count increments optimistically, and the reaction persists on page reload.
- Tapping the comment count expands the thread and a new comment typed and submitted appears immediately without a full page reload.
- All venue members receive a push notification when a new announcement is pinned (using existing `push.ts` infrastructure).
- The existing `/activity` page loads without error after the migration.

## Technical Approach
- **New tables**: `noticeboard_posts`, `noticeboard_reactions`, `noticeboard_comments` — Supabase migration required.
- **Component location**: `src/components/noticeboard/` — new directory following naming convention of existing component directories (`src/components/social/`, `src/components/stats/`).
- **Auto-post trigger**: find the tournament completion API endpoint (likely in `src/app/api/tournament/` or admin routes) and add a `createResultPost(tournamentId)` call after the status update.
- **Realtime**: use Supabase channel `noticeboard:venue_id=eq.<id>` — follow the pattern in `src/app/tv/page.tsx` lines 46-80.
- **Reaction optimism**: update local state immediately on reaction tap, then sync with API — use `useState` optimistic update pattern, revert on error.
- **Key files to modify**: `src/app/activity/page.tsx`, `src/lib/types.ts`, `src/lib/db/activity.ts` (or equivalent), tournament completion API route.

## Scope & Constraints
- **In scope**: noticeboard feed, post/react/comment, auto-result posts, admin announcements with pin, push notifications for announcements, Realtime updates.
- **Out of scope**: rich text editing (WYSIWYG), photo/video uploads, direct messages between players, cross-venue global feed, notification for every new reaction or comment (only pinned announcements trigger push).
- **Risk**: auto-post volume — busy clubs with many daily tournaments could flood the feed. Mitigate by rate-limiting auto-posts to one per tournament per day.
- **Constraint**: the noticeboard is venue-scoped; clubs without a linked `venueId` (unclaimed entries in `clubs-data.ts`) will not have a noticeboard. This is acceptable — noticeboard is an app-managed-club feature.

## Estimated Effort
L
