# Lawnbowling App -- Retention & Engagement Strategy

**Prepared:** March 11, 2026
**App:** lawnbowl.app
**Target Demographic:** Lawn bowlers, primarily age 60+, active in local clubs
**Existing Features:** Player profiles, club directory, events calendar, availability board, check-in, match history, stats, chat, push notifications, shop, membership tiers ($15/yr or $5/mo)

---

## Design Principles for This Demographic

Before any feature spec, these principles govern every retention mechanic:

1. **Community over competition.** Seniors bowl for social connection. Every feature must strengthen bonds between people, not pit them against each other.
2. **Weekly rhythms, not daily grinds.** Most bowlers play 2-3 times per week. Engagement loops must match real bowling schedules, not mobile gaming cadence.
3. **Gentle progression, no pressure.** Research shows older adults respond well to progress visualization and positive feedback, but reject complex gamification or abstract constructs (virtual currencies, avatars, XP systems).
4. **Large touch targets, clear language, minimal cognitive load.** Every feature must pass the "can I use this in bright sunlight with reading glasses" test.
5. **Respect attention.** Seniors opt out of notifications at far higher rates than younger users when they feel spammed. Fewer, higher-value notifications always win.

---

## 1. Daily/Weekly Engagement Hooks

### 1.1 "Who's at the Green?" Live Board (Already Exists -- Enhance)

The existing board/check-in system is the single most powerful retention feature. Enhance it.

**Current state:** Real-time availability board with check-in, partner requests, court status.

**Enhancements:**

| Enhancement | Spec | Complexity | Impact | Priority |
|-------------|------|------------|--------|----------|
| **Today's Roll-Up Summary** | Show a card on the home screen: "12 bowlers checked in at Redlands BC today" with avatar stack. Tap to see who's there. Pull data from existing check-in table. | Low | High | P0 |
| **"Planning to Bowl" Pre-Check-In** | Let users signal intent the evening before: "I'm planning to bowl tomorrow at 9am." Others see this and are motivated to show up. Simple toggle with time picker. Stored as a `planned_checkins` row with date, time, venue_id. | Medium | High | P0 |
| **Weather at Your Club** | Display current weather conditions at the user's home club on their dashboard. Use a free weather API (Open-Meteo, no API key needed) with the club's lat/lng. Show temp, wind speed, rain probability. Bowlers care about wind and rain -- this is genuinely useful. | Low | Medium | P1 |
| **Green Conditions Report** | Club admins or greenskeepers post daily green speed/condition. Simple dropdown: Fast / Medium / Slow / Closed. Displayed on club page and home dashboard. Uses existing `green_conditions` table. | Low | Medium | P1 |
| **Daily Bowling Tip** | Rotate through a library of 365 tips (technique, etiquette, equipment care, rules). Show one per day on the home screen. Stored as a `daily_tips` table with `id`, `tip_text`, `category`, `day_of_year`. No AI, no generation -- hand-curated content. | Low | Medium | P2 |

### 1.2 Weekly Digest

| Feature | Spec | Complexity | Impact | Priority |
|---------|------|------------|--------|----------|
| **Weekly Club Summary Email/Push** | Every Monday at 9am local time, send a digest: "Last week at [Club]: 47 games played, 23 bowlers active, 3 events upcoming. Your stats: 2 games, 1 win." Aggregated from existing match history and events data. Rendered as a push notification with a deep link to a summary page. | Medium | High | P0 |
| **"This Week at the Club" Calendar Card** | Home screen card showing this week's scheduled events and roll-ups at the user's club. Pulls from existing events data. Shows day, time, format, and RSVP count. | Low | High | P0 |

---

## 2. Social Stickiness

### 2.1 Bowling Buddy System

| Feature | Spec | Complexity | Impact | Priority |
|---------|------|------------|--------|----------|
| **Regular Partners List** | Track who you bowl with most frequently. Auto-calculated from match history: anyone you've played 3+ games with appears as a "Regular Partner." Displayed on profile. Uses existing match data -- no new input needed. | Low | High | P0 |
| **"Bowl With [Name] Again" Prompt** | After a match, prompt: "You bowled with Margaret today. Tap to suggest bowling together again this Thursday." Creates a lightweight invitation (push notification to the partner). Stored as a `partner_invitations` table: `id`, `from_player`, `to_player`, `suggested_date`, `venue_id`, `status`. | Medium | High | P0 |
| **New Member Welcome** | When a new player joins a club, existing members at that club see a notification: "[Name] just joined [Club]! Say hello." Tap opens their profile. Reduces new-member isolation, which is the number one drop-off factor for club sports. | Low | High | P0 |

### 2.2 Photo & Memory Sharing

| Feature | Spec | Complexity | Impact | Priority |
|---------|------|------------|--------|----------|
| **Post-Game Photo** | After a match is recorded, prompt "Add a photo from today's game?" Upload to Supabase Storage, linked to the match record. Displayed on the club's activity feed and the user's profile. Max 1 photo per match to keep it simple. | Medium | Medium | P1 |
| **"On This Day" Throwbacks** | Once a user has 1+ year of history, show them a card: "1 year ago today, you played triples with Bob and Carol at Redlands BC. Score: 18-12." Query match history for same calendar date in prior years. Powerful nostalgia trigger. | Low | High | P1 |
| **Club Photo Gallery** | A simple photo feed for each club. Members upload photos from social events, tournaments, green maintenance days. Moderated by club admins. Grid layout, tap to enlarge. Stored in `club_photos` table: `id`, `club_id`, `uploaded_by`, `image_url`, `caption`, `created_at`. | Medium | Medium | P2 |

### 2.3 Social Feed Enhancements (Existing Activity Feed)

| Feature | Spec | Complexity | Impact | Priority |
|---------|------|------------|--------|----------|
| **Reactions on Activity Items** | Add a simple heart/thumbs-up reaction to activity feed items (match results, event RSVPs, milestones). Single-tap, no comments. Stored as `activity_reactions` table. Generates a push: "Bob liked your game result." | Low | Medium | P1 |
| **Milestone Celebrations** | Auto-post to club feed when a member hits milestones: 50th game, 100th game, 1-year anniversary, first tournament win. The system generates the post; the member gets congratulatory reactions. | Low | High | P1 |

---

## 3. Progress & Achievement

### 3.1 Seasons & Milestones (Non-Intimidating Progression)

Do NOT use: XP, levels, leaderboard ranks, competitive badges, streaks with loss penalties.

DO use: Cumulative milestones that celebrate participation, not skill.

| Milestone Category | Examples | Spec | Complexity | Impact | Priority |
|-------------------|----------|------|------------|--------|----------|
| **Games Played** | 10, 25, 50, 100, 250, 500, 1000 games | Count from `match_history`. Display as a simple counter with a progress bar to the next milestone. Award a small badge icon (a bowling jack, a green, bowls in different colors). | Low | High | P0 |
| **Seasons Bowled** | 1st season, 2nd season, ... 10th season | Track seasons based on date ranges. A "season" is roughly Oct-Apr (Southern Hemisphere) or Apr-Oct (Northern Hemisphere). Configurable per club/region. | Low | Medium | P1 |
| **Partners Met** | 5, 10, 25, 50 unique partners | Count distinct opponents/teammates from match history. Celebrates social breadth. | Low | Medium | P1 |
| **Clubs Visited** | 2, 5, 10 clubs played at | Count distinct venues from match history. Encourages visiting other clubs for social days. | Low | Medium | P2 |
| **Formats Played** | Singles, Pairs, Triples, Fours | Track which formats the player has logged games in. "Format Explorer" badge when all four are completed. | Low | Low | P2 |
| **Events Attended** | 5, 10, 25 events | Count RSVPs where status = attended. | Low | Low | P2 |

### 3.2 Personal Stats Dashboard (Enhance Existing)

The app already has `PlayerStatsCard`, `ProfileStatsSection`, `MatchHistory`, and `WeeklyActivity`. Enhance with:

| Feature | Spec | Complexity | Impact | Priority |
|---------|------|------------|--------|----------|
| **Win/Draw/Loss Record** | Simple pie chart or bar: W-D-L this season and all-time. Not displayed publicly unless the user opts in. Private by default to avoid embarrassment. | Low | Medium | P1 |
| **Personal Best Tracking** | Track highest margin of victory, longest winning streak, most ends won in a single game. Auto-calculated from match data. "New personal best!" toast when broken. | Medium | Medium | P1 |
| **Season Comparison** | "This season vs. last season" -- games played, partners, win rate. Simple side-by-side numbers. Only shown to users with 2+ seasons of data. | Low | Medium | P2 |
| **Position History** | Track which positions (Lead, Second, Third, Skip) the user has played. Pie chart showing distribution. Interesting for players developing versatility. | Low | Low | P2 |

### 3.3 Achievement Display

| Feature | Spec | Complexity | Impact | Priority |
|---------|------|------------|--------|----------|
| **Profile Badge Shelf** | A row on the profile showing earned milestone badges. Max 6 displayed (user picks favorites if they have more). Simple SVG icons with labels. Not a "trophy case" -- more like pins on a hat. | Low | Medium | P1 |
| **Annual Summary** | End-of-season summary page: "Your 2025-26 Season: 47 games, 12 partners, 3 tournaments, Member since 2024." Shareable as an image. Similar to Spotify Wrapped but for bowling. Generated client-side from existing data. | Medium | High | P1 |

---

## 4. Streak & Habit Building

### 4.1 Weekly Streaks (Not Daily)

Critical design decision: daily streaks punish seniors who don't play every day. Weekly streaks match actual bowling behavior.

| Feature | Spec | Complexity | Impact | Priority |
|---------|------|------------|--------|----------|
| **Weekly Activity Streak** | "You've bowled at least once every week for 6 weeks!" Track weeks with at least one check-in or logged game. Display as a simple counter with a flame icon (existing `WeeklyActivity` component uses Flame icon). No penalty messaging if broken -- just "Start a new streak!" | Low | High | P0 |
| **Monthly Bowl Counter** | "You've bowled 8 times this month." Simple counter, no target, no pressure. Just visibility into activity. Resets monthly. | Low | Medium | P1 |
| **Seasonal Goal (Opt-In)** | At the start of a season, user can optionally set a goal: "I want to bowl 40 times this season." Progress bar throughout the season. No punishment for not meeting it. Default: no goal set. | Medium | Medium | P2 |

### 4.2 Gentle Reminders

| Feature | Spec | Complexity | Impact | Priority |
|---------|------|------------|--------|----------|
| **"Haven't Seen You" Nudge** | If a user hasn't checked in for 2 weeks (configurable), send ONE push: "We haven't seen you at [Club] in a while. 3 roll-ups are scheduled this week." No follow-up if ignored. Cool-down: 30 days before another nudge. | Low | Medium | P1 |
| **Roll-Up Day Reminder** | If user's club has regular roll-up days (e.g., Tuesday/Thursday mornings), send a reminder the evening before: "Roll-up at [Club] tomorrow at 9am. 5 others are planning to attend." Only if user has opted in. | Low | High | P0 |

---

## 5. Content & Education

### 5.1 Tips & Technique Library

| Feature | Spec | Complexity | Impact | Priority |
|---------|------|------------|--------|----------|
| **Tip of the Day** | 365 pre-written tips covering: technique (40%), etiquette (20%), rules (15%), equipment (15%), fitness/stretching (10%). Displayed as a card on the home screen. Tap to expand full text. Categories: "Drawing to the Jack," "Reading the Green," "Choosing Your Line," etc. Stored in a `tips` table seeded via migration. | Low | Medium | P1 |
| **Learn Section (Existing `/learn`)** | Enhance with structured content: "Beginner's Guide" (5 articles), "Improving Your Draw" (3 articles), "Understanding Positions" (4 articles), "Rules You Might Not Know" (5 articles). Static MDX content in the `/learn` route. | Medium | Medium | P1 |
| **Equipment Guides** | Buyers guide for bowls (bias, size, grip), shoes, clothing, bags. Links to shop items where relevant (cross-sell opportunity). 4-5 articles, static content. | Low | Low | P2 |

### 5.2 Video Content (Phase 2)

| Feature | Spec | Complexity | Impact | Priority |
|---------|------|------------|--------|----------|
| **Technique Video Library** | Curated YouTube embeds or self-hosted short videos (60-90 seconds each). Topics: "The Delivery Stance," "Weight Control," "Reading the Head," "Skip's Hand Signals." Categorized by skill level. Requires content creation or licensing -- not a pure code task. | High | Medium | P2 |
| **Rules Refresher Quizzes** | Simple 5-question quiz on laws of the sport. Multiple choice. No scoring pressure -- "You got 4/5! Here's what rule 12.3 actually says..." Educational, not competitive. Fun for the car ride home from the club. | Medium | Low | P2 |

---

## 6. Community Events & Challenges

### 6.1 In-App Social Coordination

| Feature | Spec | Complexity | Impact | Priority |
|---------|------|------------|--------|----------|
| **Roll-Up Coordinator** | A dedicated "Organize a Roll-Up" flow: pick date, time, format, min/max players, club. Auto-creates an event. Players RSVP. When min threshold is met, all RSVPs get notified: "Roll-up confirmed for Thursday at 9am -- 8 players!" Builds on existing events system. | Medium | High | P0 |
| **Inter-Club Social Day Matching** | Club admins can propose a "Social Day" and invite another club. The other club's admin accepts. Players from both clubs see the event and RSVP. Draws are generated from the combined player pool. Stored as events with a `visiting_club_id` field. | Medium | High | P1 |
| **Monthly Club Challenge** | Each month, a simple club-wide challenge: "Log 100 total games as a club this month." Progress bar visible to all members. Collaborative, not individual. Clubs that hit the target get a small badge on their club profile. | Medium | Medium | P1 |

### 6.2 Tournaments (Existing -- Enhance)

| Feature | Spec | Complexity | Impact | Priority |
|---------|------|------------|--------|----------|
| **Tournament Discovery Feed** | A feed of upcoming tournaments across all clubs in the user's region. Filter by format, date, entry fee. "Tournaments Near You" card on home screen. | Medium | Medium | P1 |
| **Post-Tournament Social** | After a tournament ends, auto-generate a summary: winner, runner-up, best margin, number of participants. Post to club feed. Participants tagged. Photo upload prompt. | Medium | Medium | P2 |
| **Season Championship Tracking** | For clubs running pennant/championship seasons, display the current standings, upcoming fixtures, and results in a dedicated tab. Leverages existing `pennant_season` and `pennant_tracking` tables. | Medium | Medium | P1 |

---

## 7. Personalization

### 7.1 Profile Enhancements

| Feature | Spec | Complexity | Impact | Priority |
|---------|------|------------|--------|----------|
| **Bowl Details on Profile** | Let users record their bowls: brand (Henselite, Drakes Pride, Taylor, Aero), model, size, color/logo. Displayed on profile. Conversation starter and identity marker. Fields: `bowl_brand`, `bowl_model`, `bowl_size`, `bowl_color`. | Low | Medium | P1 |
| **Preferred Positions** | User indicates which positions they prefer (Lead, Second, Third, Skip) and which they're willing to play. Helps draw generators and team selectors. Stored as an array on the profile. | Low | Medium | P1 |
| **Bio/About Me** | Free-text field (250 chars max) on profile. "Retired teacher, been bowling since 2018, love a good triples game." Already standard on most social apps but critical for community feel. | Low | Medium | P1 |
| **Availability Schedule** | User sets their typical weekly availability: "Tuesdays and Thursdays, mornings." Not a commitment, just a signal. Helps others know when to expect them. Displayed on profile. Stored as a JSON field: `{"tue": "morning", "thu": "morning"}`. | Low | High | P0 |

### 7.2 Home Screen Customization

| Feature | Spec | Complexity | Impact | Priority |
|---------|------|------------|--------|----------|
| **Configurable Dashboard Cards** | Let users choose which cards appear on their home screen and in what order: "Who's at the Green," "This Week's Events," "Weather," "My Stats," "Tip of the Day," "Club Feed." Drag-to-reorder. Default layout for new users. Stored as a JSON preference. | Medium | Medium | P2 |
| **Favorite Club Pin** | Users with multiple club memberships can pin one as their "home club." All default views (board, events, feed) show this club first. Simple star icon on club list. | Low | Medium | P1 |

---

## 8. Notification Strategy

### 8.1 Core Principles

1. **Maximum 3 push notifications per day.** Hard limit. If multiple triggers fire, prioritize by: partner request > event reminder > social.
2. **Quiet hours: 8pm - 8am local time.** Queue notifications and deliver at 8am.
3. **Weekly max: 10 notifications.** After 10 in a week, suppress non-critical notifications until next week.
4. **Every notification must be actionable.** "Bob accepted your partner request" (action: open board). Never send decorative notifications.
5. **Opt-out granularity.** Let users control categories independently: Partner requests, Event reminders, Club announcements, Social (likes, milestones), Weekly digest. Default: all on except Social.

### 8.2 Notification Taxonomy

| Trigger | Message Template | When to Send | Category | Priority |
|---------|-----------------|--------------|----------|----------|
| Partner request received | "[Name] wants to bowl with you at [Club]" | Immediately (within quiet hours) | Partner | P0 |
| Partner request accepted | "[Name] accepted! See you at [Club]" | Immediately | Partner | P0 |
| Event RSVP threshold met | "[Event] is confirmed -- [N] players registered" | When min players reached | Events | P0 |
| Event reminder | "[Event] at [Club] tomorrow at [Time]" | 6pm evening before | Events | P0 |
| Roll-up day reminder | "Roll-up at [Club] tomorrow at [Time]. [N] planning to attend" | 6pm evening before | Events | P1 |
| New member at your club | "[Name] just joined [Club]. Welcome them!" | Within 2 hours of signup | Social | P1 |
| Weekly digest | "Your week: [N] games, [N] events. This week: [N] events upcoming" | Monday 9am | Digest | P1 |
| Match result reaction | "[Name] liked your game result" | Batched, max 1 per hour | Social | P2 |
| Milestone reached | "Congrats! You've played 100 games on Lawnbowling!" | Next app open (in-app only) | Social | P2 |
| "Haven't seen you" nudge | "We miss you at [Club]! [N] roll-ups this week" | After 14 days inactive, 10am | Re-engagement | P2 |
| "On This Day" memory | "1 year ago, you bowled with [Name] at [Club]" | 9am on anniversary date | Social | P2 |
| Green conditions posted | "[Club] green is [condition] today" | When admin posts, morning only | Club | P2 |

### 8.3 Notification Preferences Schema

```sql
CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id),
  partner_requests BOOLEAN DEFAULT true,
  event_reminders BOOLEAN DEFAULT true,
  club_announcements BOOLEAN DEFAULT true,
  social_updates BOOLEAN DEFAULT false,  -- off by default
  weekly_digest BOOLEAN DEFAULT true,
  re_engagement BOOLEAN DEFAULT true,
  quiet_start TIME DEFAULT '20:00',
  quiet_end TIME DEFAULT '08:00',
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Implementation note:** The existing `notification_preferences` migration should be checked against this schema and extended if needed.

---

## 9. Onboarding Retention -- First 7 Days

The existing onboarding wizard (`OnboardingWizard.tsx`, `PlayerOnboarding.tsx`) handles initial profile setup. The first 7 days after that determine whether a user stays.

### Day-by-Day Plan

| Day | Trigger | Action | Goal |
|-----|---------|--------|------|
| **Day 0** | Signup complete | Complete profile wizard: name, experience level, home club, preferred positions, bowl details. End with: "Find bowlers at your club" CTA leading to the board. | Identity established |
| **Day 1** | Morning after signup | Push: "Welcome to [Club]! [N] members are already here. See who's bowling today." Deep link to board. | First board visit |
| **Day 1** | If user viewed board | In-app prompt: "Want to be notified when your club mates check in? Enable notifications." | Notification opt-in |
| **Day 2** | Morning | Push: "Today's bowling tip: [tip text]. Open for more tips." | Content engagement |
| **Day 3** | Morning | Push: "[N] events are happening at [Club] this month. View the calendar." | Event discovery |
| **Day 4** | No action | Push: "[N] bowlers are checked in at [Club] right now. Join them!" Only if others are checked in. | Social pull |
| **Day 5** | Morning | In-app card: "Have you bowled a game yet? Log your first match to start tracking your stats." Link to match logging. | First match logged |
| **Day 7** | Morning | Push: "You've been on Lawnbowling for a week! You've [done X]. Keep it up." Summary of first-week activity. | Reflection + habit |

### Onboarding Metrics to Track

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Profile completion rate | >80% | Incomplete profiles reduce social engagement |
| Board view within 48 hours | >60% | Board is the core engagement loop |
| Notification opt-in rate | >50% | Without push, re-engagement drops dramatically |
| First match logged within 14 days | >30% | Match logging is the value-creation moment |
| Return visit within 7 days | >40% | Industry benchmark for community apps |

### Implementation

| Component | Spec | Complexity | Impact | Priority |
|-----------|------|------------|--------|----------|
| **Onboarding drip notifications** | A scheduled job (Supabase Edge Function or cron) that fires onboarding notifications based on `created_at` and user activity. Check `onboarding_state` table for progress. | Medium | High | P0 |
| **Onboarding checklist card** | A persistent card on the home screen for the first 14 days: "Getting started: 3/5 complete." Steps: Complete profile, View the board, Enable notifications, Log a match, RSVP to an event. Dismissible after completion. | Low | High | P0 |
| **First-match celebration** | When a user logs their first match, show a confetti animation (lightweight, CSS-only) and a card: "First game logged! You're officially tracking your bowling journey." | Low | Medium | P1 |

---

## 10. Seasonal Retention -- Off-Season Strategy

Lawn bowling is seasonal in many regions (roughly April-October in Northern Hemisphere, October-April in Southern Hemisphere). Keeping users through 4-6 months of no bowling is the hardest retention challenge.

### 10.1 Off-Season Content

| Feature | Spec | Complexity | Impact | Priority |
|---------|------|------------|--------|----------|
| **Indoor Bowls Directory** | Many areas have indoor bowling facilities. Directory of indoor venues with addresses, hours, and whether they're affiliated with outdoor clubs. Populated via admin panel or community submissions. | Medium | High | P1 |
| **Season Recap** | End-of-season auto-generated summary for each player (see "Annual Summary" in Section 3.3). Shared on social, keeps the app top-of-mind. | Medium | High | P1 |
| **Off-Season Content Series** | Weekly article/tip during off-season: equipment maintenance, rule changes for next season, stretching routines, history of the sport, profile of a famous bowler. 20-25 articles to cover the off-season. Published as blog posts in the existing `/blog` route. | Low | Medium | P1 |
| **Pre-Season Hype** | 4 weeks before season opens: countdown on home screen, "Season starts in [N] days." Push notification when season officially opens. Club admins post opening-day events. | Low | Medium | P1 |

### 10.2 Off-Season Social

| Feature | Spec | Complexity | Impact | Priority |
|---------|------|------------|--------|----------|
| **Off-Season Social Events** | Clubs use the events system for non-bowling social events: dinners, meetings, AGMs, trivia nights. Events system already supports this -- just needs encouragement via templates. | Low | Medium | P1 |
| **Next Season Planning** | Club admins create draft schedules for next season during off-season. Members can indicate availability preferences for next season. "I'm available Tuesdays and Thursdays next season." | Medium | Medium | P2 |
| **Club Chat (Existing)** | Chat stays active year-round. Off-season is when club gossip, planning, and social bonding happens. Promote chat visibility during off-season with a home-screen card: "Stay connected with your club mates." | Low | Medium | P1 |

### 10.3 Off-Season Engagement Triggers

| Trigger | Timing | Message |
|---------|--------|---------|
| Season ends | Day after last scheduled event | "What a season! You played [N] games with [N] partners. See your Season Recap." |
| Monthly during off-season | First Monday of each month | "Off-season update from [Club]: [N] social events planned. New article: [title]." |
| Pre-season countdown | 4 weeks before | "Season starts in 28 days! Update your availability for the new season." |
| Pre-season countdown | 1 week before | "[Club] opening day is [date]. [N] members have RSVP'd. Join them!" |
| Season opener | Day of first event | "The season is here! [Club] has [event] today at [time]. See you on the green!" |

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4) -- P0 Items

These features have the highest retention impact with the lowest implementation cost.

1. **Roll-Up Day Reminder notifications** -- leverages existing events data
2. **Weekly Club Summary push** -- aggregation query + push notification
3. **"Planning to Bowl" pre-check-in** -- new table + simple UI toggle
4. **Today's Roll-Up Summary card** on home screen -- query existing check-ins
5. **Onboarding drip notification system** -- Edge Function + `onboarding_state`
6. **Onboarding checklist card** -- client component tracking 5 steps
7. **Games Played milestones** -- count query + badge display
8. **Weekly Activity Streak** -- enhance existing `WeeklyActivity` component
9. **Regular Partners List** -- derived from match history
10. **"Bowl With [Name] Again" prompt** -- post-match flow addition
11. **Availability Schedule on profile** -- JSON field + simple UI
12. **New Member Welcome notification** -- trigger on profile creation
13. **Roll-Up Coordinator** -- extend events system with RSVP threshold

### Phase 2: Social & Content (Weeks 5-8) -- P1 Items

1. Tip of the Day library + home screen card
2. "On This Day" throwback cards
3. Post-game photo upload
4. Reactions on activity feed items
5. Milestone celebrations auto-posts
6. Profile badge shelf
7. Annual Season Summary
8. Bowl details on profile
9. Preferred positions on profile
10. Weather at Your Club card
11. Green Conditions report
12. "Haven't Seen You" re-engagement nudge
13. Inter-Club Social Day matching
14. Monthly Club Challenge
15. Tournament Discovery feed
16. Pennant/Championship standings
17. Learn section content expansion
18. Off-season content series
19. Indoor Bowls Directory
20. Personal best tracking
21. Win/Draw/Loss record (private)

### Phase 3: Polish & Depth (Weeks 9-12) -- P2 Items

1. Configurable dashboard cards
2. Club Photo Gallery
3. Seasonal Goal setting
4. Season Comparison stats
5. Position History chart
6. Equipment Guides content
7. Technique Video Library
8. Rules Refresher Quizzes
9. Post-Tournament Social summaries
10. Next Season Planning tools
11. Clubs Visited / Formats Played badges

---

## Database Schema Additions

New tables required (in addition to existing schema):

```sql
-- Pre-check-in: "I'm planning to bowl tomorrow"
CREATE TABLE planned_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  planned_date DATE NOT NULL,
  planned_time TIME,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, venue_id, planned_date)
);

-- Daily tips library
CREATE TABLE daily_tips (
  id SERIAL PRIMARY KEY,
  tip_text TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('technique', 'etiquette', 'rules', 'equipment', 'fitness')),
  day_of_year INT NOT NULL CHECK (day_of_year BETWEEN 1 AND 366),
  UNIQUE(day_of_year)
);

-- Partner invitations ("bowl with me again")
CREATE TABLE partner_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_player UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_player UUID REFERENCES profiles(id) ON DELETE CASCADE,
  suggested_date DATE,
  venue_id UUID REFERENCES venues(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Activity feed reactions
CREATE TABLE activity_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'clap', 'bowl')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(activity_id, user_id)
);

-- Club photos
CREATE TABLE club_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  match_id UUID,
  event_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Player milestones/badges
CREATE TABLE player_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL,
  milestone_value INT NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, milestone_type, milestone_value)
);

-- Onboarding drip tracking
CREATE TABLE onboarding_drip (
  player_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  signup_date DATE NOT NULL,
  day1_sent BOOLEAN DEFAULT false,
  day2_sent BOOLEAN DEFAULT false,
  day3_sent BOOLEAN DEFAULT false,
  day4_sent BOOLEAN DEFAULT false,
  day5_sent BOOLEAN DEFAULT false,
  day7_sent BOOLEAN DEFAULT false,
  board_viewed BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT false,
  first_match_logged BOOLEAN DEFAULT false,
  first_event_rsvp BOOLEAN DEFAULT false,
  profile_complete BOOLEAN DEFAULT false
);

-- Player bowl equipment details
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS
  bowl_brand TEXT,
  bowl_model TEXT,
  bowl_size TEXT,
  bowl_color TEXT,
  preferred_positions TEXT[], -- ['lead', 'skip']
  availability_schedule JSONB, -- {"tue":"morning","thu":"morning"}
  bio TEXT;

-- Player seasonal goals
CREATE TABLE seasonal_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  season TEXT NOT NULL, -- '2025-26'
  goal_type TEXT NOT NULL, -- 'games_played'
  target_value INT NOT NULL,
  current_value INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, season, goal_type)
);
```

---

## Key Metrics to Track

### Retention Metrics

| Metric | Definition | Target | Measurement |
|--------|-----------|--------|-------------|
| D1 Retention | % of users who return day after signup | >40% | `profiles.created_at` vs next-day activity |
| D7 Retention | % returning within 7 days | >30% | Same, 7-day window |
| D30 Retention | % returning within 30 days | >25% | Same, 30-day window |
| Weekly Active Users (WAU) | Users with 1+ action per week | Growing 5% MoM | Any logged activity per week |
| Monthly Active Users (MAU) | Users with 1+ action per month | Growing 5% MoM | Any logged activity per month |
| Notification opt-in rate | % of users with push enabled | >50% | Push subscription table |
| Match logging rate | % of active users logging 1+ match/month | >40% | Match history table |
| Paid conversion rate | % of free users converting to paid | >15% | Subscription table |

### Feature-Specific Metrics

| Feature | Success Metric | Target |
|---------|---------------|--------|
| Pre-check-in | % of planned check-ins that convert to actual check-ins | >60% |
| Roll-up coordinator | Events created per club per month | >2 |
| Partner invitations | Acceptance rate | >40% |
| Weekly digest | Open rate | >30% |
| Onboarding checklist | Completion rate (5/5 steps) | >40% |
| Milestone badges | % of users earning first badge within 30 days | >50% |

---

## Summary of Priority Matrix

| Priority | Count | Theme |
|----------|-------|-------|
| **P0** | 13 features | Core engagement loop: check-in, notifications, onboarding, basic social |
| **P1** | 21 features | Social depth, content, stats, off-season, personalization |
| **P2** | 11 features | Polish, advanced content, customization |

**The single highest-impact investment:** The Roll-Up Day Reminder + "Planning to Bowl" pre-check-in combination. These two features together answer the question every bowler asks: "Is anyone else going tomorrow?" That question, answered in-app, is why they open the app. Everything else is built on top of that habit.
