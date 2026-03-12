# lawnbowl.app — Conversion & Growth Strategy

**Prepared:** March 11, 2026
**Linear:** AI-2406

---

## Executive Summary

lawnbowl.app sits in a structurally underserved market: 5,000–8,000 lawn bowling clubs worldwide running on paper sign-up sheets, USB dongles, and spreadsheets. The platform's competitive moat is not just features — it is the combination of position-based draw automation, live scoring, a PWA with offline support, and a modern UX that no incumbent can replicate without a full rebuild. This document maps the visitor-to-admin conversion funnel, acquisition channels, retention mechanics, SEO infrastructure, and monetization pathways needed to capitalize on that moat.

---

## 1. Conversion Funnel

### The Five-Stage Journey

```
Visitor → Reader → Signup → Active User → Club Admin
```

Each stage requires a different intervention. Friction kills at every transition; the job is to minimize resistance and maximize perceived value before asking for commitment.

---

### Stage 1: Visitor → Reader

**Goal:** Keep them on the page long enough to recognize the problem being solved.

**What works:**

- **Lead with the pain, not the product.** The hero headline should name the problem: "No more paper draw sheets. No more manual scorecards." Lawn bowlers instantly recognize this. Generic "manage your club" copy does not land.
- **Demonstrate the draw tool above the fold.** An animated GIF or short video (under 30 seconds, autoplay muted) showing the automated draw being generated in 10 seconds is more persuasive than any paragraph of copy.
- **Club directory as a discovery hook.** A public-facing club directory — searchable by state, city, or country — gives non-registered visitors a reason to land, browse, and return. Each club page is an SEO target. Clubs that appear on the directory have a vested interest in the platform succeeding.
- **Tournament results pages.** Publicly accessible tournament result pages (e.g., `/tournaments/2025-california-state-open`) create SEO-indexed landing pages that attract people searching for specific events or clubs. These pages also serve as social proof.
- **Blog / Learn section.** Content targeting long-tail keywords like "how to run a lawn bowls draw tournament," "lawn bowls rules for beginners," "lawn bowls clubs near me," and "how to set up a lawn bowls league" attracts organic traffic at the top of the funnel.

**CTAs at this stage:**
- "Find clubs near you" (directory search)
- "See how the draw works" (product demo video)
- "Learn to play lawn bowls" (educational content hub)

---

### Stage 2: Reader → Signup

**Goal:** Convert browsers into registered accounts before they leave.

**What works:**

- **Friction-first audit.** The signup form should ask for name + email only. Phone number, club affiliation, and preferences can be collected post-signup via onboarding. Every extra field reduces conversion by 5–10%.
- **Social login.** Google and Apple sign-in reduce signup time to under 10 seconds for mobile users. Given the senior demographic, offering email/password as a clear alternative is equally important — avoid making social login the only option.
- **Contextual CTAs, not generic.** A visitor reading "how to run a draw tournament" should see a CTA that says "Run your next draw in under 5 minutes — free." Not "Sign up." Match the CTA to the content they just consumed.
- **Free tier as the default.** Requiring credit card information before value is demonstrated kills conversion for volunteer-run clubs on tight budgets. The free tier (basic draw tool, up to 2 rinks, no expiry) is the conversion mechanism. Upgrade pressure comes after they have run their first successful tournament.
- **Social proof inline.** A count of active clubs ("312 clubs running tournaments on lawnbowl.app") or a testimonial quote from a club secretary placed beside the signup form increases conversions by 30–40% based on general CRO benchmarks.

**Benchmark:** Visitor-to-signup rates for niche sports SaaS typically land between 2–5%. With a strong free tier and domain-specific messaging, 4–6% is achievable.

---

### Stage 3: Signup → Active User

**Goal:** Get the user to complete their first meaningful action within 72 hours.

**The activation event** for lawnbowl.app is running a successful draw — even a test draw with fake players. Once a club secretary or tournament director has seen the system generate a draw in 10 seconds, retention probability increases sharply.

**Onboarding sequence:**

1. **Immediate:** Welcome email with a single CTA — "Set up your first event." Not five CTAs. One.
2. **Day 1:** In-app checklist — "Add your club details," "Add 8 players," "Run your first draw." Three steps. Completion of all three is the activation event.
3. **Day 3 (if not activated):** Email with subject line "Your first draw takes 60 seconds — here's how." Link to a 90-second screen recording, not a help article.
4. **Day 7 (if not activated):** "We saved you a spot" email with a link to a pre-populated demo tournament they can explore without entering any data.

**Reducing "cold start" friction:** Pre-populate the club with sample players and a sample tournament on signup. Let them explore the full experience before committing to data entry. The "aha moment" needs to happen before they bounce.

---

### Stage 4: Active User → Retained User

*Covered in depth in Section 3 (Retention). Short version: push notifications, event reminders, leaderboard activity, and stat tracking drive weekly active usage.*

---

### Stage 5: Active User → Club Admin

**Goal:** Convert individual players who love the app into club-level paying customers.

This is the B2B2C flywheel. An individual player signs up, uses the app at events, then advocates for the club to adopt it officially. The conversion path:

- Individual player uses app → shares tournament results → club secretary sees the value → club adopts officially.
- **In-app "Invite your club" flow:** After a user runs 2+ tournaments, prompt them: "Running this for your whole club? Invite your club secretary to take over the account — it's free for clubs under 50 members."
- **Club claim flow:** Allow unauthenticated club pages in the directory to be "claimed" by a club admin. This creates a natural upgrade path from directory presence to active management.

---

## 2. User Acquisition Channels

### 2.1 Bowls USA and State Association Partnerships

Bowls USA (bowlsusa.us) is the governing body for lawn bowls in the United States and the primary gatekeeper for reaching U.S. clubs. Their divisions (Northeast, South Central, Southwest, etc.) have their own websites and communications channels.

**Partnership strategy:**

- **Official technology partner designation.** Approach Bowls USA with a proposal to become the recommended tournament management platform. Offer free Club tier accounts to all Bowls USA member clubs for 12 months in exchange for a co-branded announcement and newsletter feature. The cost (e.g., 200 clubs × $50/month × 12 months = $120K in deferred revenue) is offset by the accelerated adoption curve.
- **State association endorsements.** Target the six U.S. regional divisions individually. A single email from a division president to member clubs converts at dramatically higher rates than cold outreach. Offer to present at annual general meetings (many are now hybrid/Zoom).
- **Equivalent strategy in AU/UK/NZ:** Bowls Australia, Bowls England, and Bowls New Zealand are the equivalent governing bodies. BowlsLink (AU) and Bowlr (UK) are incumbent, but neither is truly modern or global. A partnership pitch emphasizing international event management (clubs that travel to tournaments abroad) is a unique angle.

### 2.2 Club Newsletters and Committee Meetings

The lawn bowling club newsletter — typically a monthly PDF emailed to members — is the highest-trust communication channel in the sport. A mention from the club president is worth more than 1,000 ad impressions.

**Tactical approach:**

- Develop a one-page "Club Secretary Brief" PDF that explains lawnbowl.app in plain language, formatted for forwarding. No jargon. "Your next draw: ready in 10 seconds instead of 45 minutes."
- Offer to write the newsletter blurb for them. Volunteer-run clubs have limited time; removing the writing burden increases adoption.
- Target the Match/Bowls Committee specifically — they feel the draw pain most acutely and have direct authority to adopt new tools.

### 2.3 Facebook Groups

Lawn bowling has an active Facebook presence, particularly among senior players. Relevant groups include club-specific groups (hundreds to thousands of members), regional/state groups, and broader lawn bowling communities (e.g., "Lawn Bowls Australia," "UK Bowls Players").

**Strategy:**

- **Authenticity over advertising.** Post tournament results (with club permission), "how we use lawnbowl.app" case studies, and educational content. Paid posts and cold promotional content perform poorly in these groups.
- **Club ambassador seeding.** Identify active members in top groups who are already enthusiastic about the platform and equip them with shareable content (tournament bracket screenshots, leaderboard images).
- **Group admin partnerships.** The admin of a 5,000-member lawn bowling Facebook group is a micro-influencer in this niche. A pinned post from them converts better than any ad spend.

### 2.4 Senior Recreation Centers

Senior centers, retirement communities, and active-aging programs often run lawn bowling as a recreational activity. These are untapped distribution channels with a captive audience.

**Approach:**

- Partner with senior recreation directors at community centers (YMCA, city parks and recreation departments, retirement villages).
- Create a "Senior Recreation Package" — simplified onboarding for centers that don't have a traditional club structure.
- Leverage the social proof that lawn bowls promotes physical and mental health for older adults: a platform that makes organizing easier removes a barrier to participation.

### 2.5 Barefoot Bowls Venues

"Barefoot bowls" (casual corporate and social bowling) is the fastest-growing segment of the sport, particularly in Australia. These events run at pub venues and attract younger participants (25–45 age range) who are more tech-adoptive.

- Position lawnbowl.app's event management features for this use case.
- Venue operators running regular barefoot events need registration, payment, and scheduling tools — features lawnbowl.app already has or can prioritize.

### 2.6 Tournament Result Sharing on Social Media

Every tournament result is a potential acquisition event. When a tournament leaderboard can be shared as a visually formatted image or link directly to `lawnbowl.app/tournaments/[slug]`, every share by a participant is an organic impression.

- Generate shareable tournament summary cards (OG image with winner, club name, date).
- "Powered by lawnbowl.app" attribution on all public-facing tournament pages — subtle but persistent brand exposure.

---

## 3. Retention Strategies

### 3.1 Push Notifications (PWA)

lawnbowl.app's PWA architecture enables push notifications without requiring an App Store install — a significant advantage for a demographic that is reluctant to install new apps.

**High-value notification triggers:**

| Trigger | Timing | Expected Open Rate |
|---------|--------|--------------------|
| "Tournament draw is live — check your rink assignment" | On draw publication | Very high (immediate relevance) |
| "Your club has a new event: [Name]" | On event creation | High |
| "Results are in: [Tournament Name] — you finished [position]" | On result finalization | High |
| "Roll-up starting in 30 minutes — spots still available" | Contextual | Medium-high |
| "[Club Name] championship bracket updated" | On bracket update | Medium |

Sports and recreation apps that send personalized push notifications see up to 40% higher 30-day retention versus apps that do not. The key constraint: **opt-in must be earned, not demanded.** Ask for notification permission after the user has completed their first event, not on first launch.

### 3.2 Stat Tracking and Personal Records

Individual stat tracking converts occasional users into daily active users. For lawn bowlers, meaningful stats include:

- Win/loss record by format (singles, pairs, triples, fours)
- Average shot differential
- Performance by position (lead/second/third/skip)
- Head-to-head record against specific opponents
- Seasonal trends
- Personal bests (highest score in a game, longest win streak)

**Why this matters for retention:** A player who can see their improvement over time has a reason to open the app on non-tournament days. A player who holds the "most wins at [Club Name]" this season has a reason to keep playing. Stats are not just a feature — they are a retention mechanism.

### 3.3 Leaderboards

Club-level leaderboards (updated live during tournaments) and season-long standings create competitive engagement. Key design principles for this demographic:

- Leaderboards should show **relative ranking** ("You're 3rd out of 24 players this season"), not just raw numbers.
- Seasonal resets give every member a fresh start — important for maintaining participation among lower-ranked players.
- "Most improved" and "most consistent" secondary leaderboards recognize non-elite players.

### 3.4 Social Features

- **Activity feed:** Show recent club activity — "Jane Smith won the Saturday draw," "Melbourne Bowls Club posted new results." Low-effort engagement that builds community.
- **Player profiles:** Public profiles showing tournament history, preferred position, and club affiliation. Players who have built a profile have higher retention than those who haven't.
- **Club wall:** A club-specific message board for announcements, event reminders, and social posts.

### 3.5 Calendar Integration

Allow users to add upcoming club events directly to Google Calendar or Apple Calendar with one tap. An event on a user's calendar is a retention commitment. Clubs that keep their event calendar up-to-date on the platform see higher member check-in rates.

---

## 4. Competitive Advantages

### 4.1 Position-Based Draw Engine

This is the single most defensible feature. No competitor offers:
- Automated segregation of players into position pools (skips, leads, seconds, thirds)
- Random team generation respecting position constraints
- Rink assignment with no-repeat logic across rounds
- Real-time accommodation of late arrivals and last-minute withdrawals

BowlsNet handles league management but has no draw automation. Bowlr (UK, 185+ clubs) focuses on club management modules without a proper draw engine. PAMI (the incumbent draw tool in Australia) requires Windows + a USB dongle + $1,000+ setup — and has no mobile or cloud capability.

**Messaging for this advantage:** "The only platform that generates a position-balanced draw in 10 seconds, on an iPad, with no setup."

### 4.2 PWA with Offline Support

Club greens frequently have poor or no WiFi. An app that stops working when the signal drops is a non-starter for tournament day. lawnbowl.app's PWA architecture with offline support and sync-on-reconnect is a technical advantage that competitors cannot easily replicate.

**Messaging:** "Works on any device, even when the WiFi doesn't."

### 4.3 Modern UX for a Senior Demographic

The target user is a retiree, often 65+, who is not a power tech user. Existing tools were built for administrators who tolerate complexity. lawnbowl.app's large touch targets, high contrast UI, and single-action flows are designed for this demographic from the ground up.

**Messaging:** "Simple enough for your club secretary. Powerful enough for your tournament director."

### 4.4 Global from Day One

BowlsLink is AU-only. BowlsHub is NZ-only. Bowlr is UK-focused. lawnbowl.app has no geographic restriction. A club in Canada, South Africa, or Singapore can sign up and use the full feature set today. This is a significant advantage in markets where no incumbent exists.

### 4.5 Live Spectator Experience

End-by-end live scoring accessible via a public tournament URL (no login required) means family members, club officials watching from the clubhouse, and online followers can follow a tournament in real time. No competitor offers this combination of simplicity and real-time access.

---

## 5. Growth Hacking

### 5.1 QR Codes at Clubs

Physical QR codes placed at strategic club touchpoints drive ongoing acquisition with zero recurring cost after initial setup.

**Placement locations:**

| Location | QR Code Links To | Expected Use |
|----------|-----------------|--------------|
| Clubhouse entrance | Club's lawnbowl.app page (directory listing or check-in) | Walk-in discovery |
| Scoreboard / results board | Live tournament leaderboard | During-event engagement |
| Notice board | Upcoming event registration page | Pre-event signups |
| Equipment lockers | Player profile or stat page | Personal engagement |
| Club newsletter footer | Club's lawnbowl.app page | Email-to-digital bridge |

QR codes in sports contexts achieve an average 41% conversion rate when they link to highly relevant content. A QR code on the scoreboard linking to the live leaderboard is as relevant as it gets.

**Offer:** Provide clubs with a printable QR code pack (PDF) as part of onboarding. Remove the effort barrier.

### 5.2 Club Ambassador Program

Identify one enthusiastic member per club as the "lawnbowl.app Club Ambassador." Their role:

- Evangelize the platform within their club
- Provide feedback and feature requests
- Participate in case study content creation

**Incentives for ambassadors:**

- Ambassador recognition badge on their player profile
- Free premium club account for their club while they remain active
- Early access to new features
- Annual ambassador meetup (virtual)

A well-structured ambassador program converts free clubs to paid clubs at 3–5x the rate of non-ambassador clubs, based on patterns from sports SaaS platforms like TeamSnap and LeagueApps.

### 5.3 Free Tier for Clubs

The freemium model is the correct entry strategy for this market. Volunteer-run clubs on tight budgets will not pay before they have experienced value. The free tier serves three functions:

1. **Acquisition:** Zero barrier to entry removes the "let's try it" objection from committee meetings.
2. **Viral distribution:** Free clubs using the platform create public tournament pages, generate shareable results, and add their club to the public directory — all of which attract more visitors.
3. **Upgrade pipeline:** Clubs that have run 5+ tournaments on the free tier convert to paid at a much higher rate than clubs who never used the platform.

**Recommended free tier limits:** Up to 2 active tournaments, up to 50 members in the directory, basic draw tool, public club page. Remove limits on paid tiers.

### 5.4 Tournament Result Sharing

After every tournament, automatically generate:

- A shareable image card (suitable for Facebook, Instagram) showing the top 3 finishers, club name, and tournament name — with "lawnbowl.app" branding.
- A public tournament results URL (e.g., `lawnbowl.app/tournaments/[slug]`) accessible without login.
- An embeddable widget clubs can place on their own website.

Players who share their results on personal social accounts create organic impressions in the exact demographic most likely to be lawn bowlers. Each share is a word-of-mouth acquisition event.

### 5.5 "Challenge a Club" Feature

Allow clubs to invite rival clubs to a head-to-head event managed through lawnbowl.app. The inviting club creates the event; the rival club receives an invitation email with a "Accept Challenge" CTA. This drives new club signups through existing club relationships (the most trusted acquisition channel in community sport).

---

## 6. Monetization + SEO Synergy

### 6.1 Equipment Affiliate Links

Lawn bowling equipment has a relatively small but loyal set of manufacturers: Taylor, Henselite, Drakes Pride, Aero, and Almark. While direct affiliate programs from these manufacturers may require direct outreach to establish, relevant retailer programs through Amazon Associates, or specialist retailers like Bowls.co.uk and BowlsWorld are accessible immediately.

**SEO synergy:** Create content pages targeting product-specific searches:
- "Best lawn bowls for beginners" → affiliate links to entry-level sets
- "Taylor vs Henselite bowls comparison" → high-intent buyer traffic
- "Lawn bowling shoes — what to wear" → lower-competition keyword with purchaser intent

These pages earn affiliate revenue while also ranking for keywords that attract new users to the platform.

### 6.2 Premium Features (Freemium Upgrades)

The upgrade trigger is capacity + advanced features, not time limits.

| Feature | Free | Club ($30–50/mo) | Premium ($80–100/mo) |
|---------|------|-----------------|---------------------|
| Tournaments | 2 active | Unlimited | Unlimited |
| Members | 50 | 300 | Unlimited |
| Draw engine | Basic | Full position-based | Full + custom rules |
| Live scoring | Yes | Yes | Yes + broadcast mode |
| Leaderboards | Club only | Club + public | Club + public + historical |
| Analytics | None | Basic | Advanced (win rates, position performance) |
| Custom domain | No | No | Yes |
| White-label | No | No | Yes |
| API access | No | No | Yes |

### 6.3 Insurance Partnerships

Lawn bowling clubs require public liability insurance, equipment insurance, and (in some countries) player injury insurance. Specialist sports insurance providers — including those that work with Bowls USA, Bowls Australia, and Bowls England — are a natural monetization partner.

**Model:** Referral fee per quote/policy for clubs referred from the platform. Insurance pages (e.g., "Lawn bowling club insurance — what you need") serve double duty as SEO content and referral funnels.

### 6.4 Coaching and Instruction

The "Learn" section of lawnbowl.app (already established at `/learn/lawn-bowling`) is a content hub that can expand into:

- Paid coaching resources (video courses on draw technique, skip strategy)
- Directory of certified coaches for clubs seeking instruction
- Club coaching program management tools (track player development)

**SEO angle:** "How to improve your draw shot," "lawn bowls coaching tips," "how to play skip position" — all low-competition, high-relevance keywords for a non-casual audience.

### 6.5 Corporate/Barefoot Bowls Packages

Barefoot bowls (corporate team events) is a high-margin, fast-growing segment. A "Corporate Event" tier of the platform with:

- Branded event pages
- Online ticket sales and payment collection
- Custom team formation (non-position-based)
- Photo/results sharing package

Could command $150–250/event (one-time) or a venue subscription at $200+/month for venues running weekly barefoot events.

### 6.6 Merchandise

A lawnbowl.app-branded merchandise store (or partnership with a print-on-demand service) targeting the lawn bowling community:

- Club-branded items (players can order club polos, bags with club logos)
- Sport-specific items ("Jack High" cap, "Ask Me About My Draw Weight" apparel)
- Margin is low but serves as brand building and additional touchpoints

**SEO synergy:** Product pages for "lawn bowls accessories," "lawn bowls gifts," and "bowls club merchandise" attract purchaser-intent traffic.

---

## 7. Social Proof

### 7.1 Testimonials — What to Collect and Where to Place

**Who to collect from:**
- Club secretaries and tournament directors (speak to the admin pain solved)
- Players with specific stories ("My club's drawmaster retired — lawnbowl.app meant we could still run tournaments")
- Club presidents (institutional credibility)

**What makes a good testimonial:**
- Specific, measurable before/after ("Our draw used to take 45 minutes and required one specific person who knew what they were doing. Now any committee member can run it in 5 minutes.")
- Named and attributed with club name and location
- Photo of the person if possible

**Where to place:**
- Homepage (beside the signup CTA)
- Pricing page (beside each tier)
- `/learn` content pages (contextual)
- Club directory (beside the "Claim your club" CTA)

### 7.2 Club Case Studies

A structured case study template (500–800 words) for each featured club:

1. **Club background** (size, country, level of play)
2. **Before lawnbowl.app** (specific pain points, manual processes)
3. **What they adopted** (which features, how they rolled it out)
4. **Results** (time saved, member engagement, tournament count)
5. **Quote from the club secretary or president**

Case studies serve three functions: SEO (each one is a unique, indexed page), conversion (social proof for similar clubs considering adoption), and retention (clubs that have been featured feel invested in the platform's success).

**SEO note:** Optimize each case study for "[Club Name] lawn bowling" — club members and local media who search for the club will find the case study, creating additional brand awareness.

### 7.3 Tournament Results as Social Proof

Public tournament result pages indexed by search engines serve as a continuous source of social proof. A potential club admin searching for "lawn bowling tournament software" who lands on a well-formatted, live results page for a real tournament is seeing the product in action — the most powerful form of demonstration.

### 7.4 Club Count and Activity Metrics

Display live metrics on the homepage and marketing pages:

- "X clubs active this month"
- "X tournaments run this year"
- "X players registered"

These numbers, when growing, reinforce momentum and social proof. When the numbers are small (early stage), keep them off the homepage until they are compelling (suggest thresholds: 50 clubs, 500 tournaments, 5,000 players).

---

## 8. Technical SEO

### 8.1 Structured Data

Implement JSON-LD structured data on all relevant page types:

**Club directory pages:**
```json
{
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  "name": "[Club Name]",
  "sport": "Lawn Bowls",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "[City]",
    "addressRegion": "[State/Region]",
    "addressCountry": "[Country]"
  },
  "url": "https://lawnbowl.app/clubs/[slug]",
  "telephone": "[Phone]",
  "foundingDate": "[Year]"
}
```

**Tournament/event pages:**
```json
{
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  "name": "[Tournament Name]",
  "startDate": "[ISO Date]",
  "endDate": "[ISO Date]",
  "location": {
    "@type": "SportsActivityLocation",
    "name": "[Club Name]",
    "address": { ... }
  },
  "organizer": {
    "@type": "SportsOrganization",
    "name": "[Club Name]"
  }
}
```

**Learn/article pages:** `Article` schema with `author`, `datePublished`, `dateModified`.

**FAQ pages:** `FAQPage` schema for all FAQ content — generates rich results in Google.

### 8.2 Meta Tags and Open Graph

Every page type needs optimized meta and OG tags:

**Tournament pages (dynamic):**
```html
<title>[Tournament Name] Results — [Club Name] | lawnbowl.app</title>
<meta name="description" content="Live results and standings for [Tournament Name] at [Club Name]. [Date]. Powered by lawnbowl.app.">
<meta property="og:title" content="[Tournament Name] — [Club Name]">
<meta property="og:description" content="[Winner Name] won [Tournament Name] at [Club Name] with [X] points. See the full leaderboard.">
<meta property="og:image" content="https://lawnbowl.app/api/og/tournament/[slug]"> <!-- Dynamic OG image -->
<meta property="og:url" content="https://lawnbowl.app/tournaments/[slug]">
<meta property="og:type" content="website">
```

**Club pages:**
```html
<title>[Club Name] — Lawn Bowling Club in [City] | lawnbowl.app</title>
<meta name="description" content="[Club Name] in [City, State]. View upcoming events, tournament results, and club information. Managed with lawnbowl.app.">
```

**Dynamic OG images:** Generate tournament result cards server-side (Vercel OG / Satori) for automatic social sharing previews. When a player shares `lawnbowl.app/tournaments/saturday-open-2025`, the preview card should show the tournament name, winner, and club logo automatically.

### 8.3 Site Speed and Core Web Vitals

Core Web Vitals are a Google ranking factor. Targets for 2025/2026:

| Metric | Target | Current Benchmark |
|--------|--------|--------------------|
| LCP (Largest Contentful Paint) | < 2.5s | Good |
| INP (Interaction to Next Paint) | < 200ms | Passing |
| CLS (Cumulative Layout Shift) | < 0.1 | Good |

**PWA-specific optimizations:**
- Pre-cache critical assets (draw tool JS, club directory data) for instant load on repeat visits
- Lazy-load tournament result tables (they can be large)
- Use `next/image` with appropriate `sizes` attributes for all images
- Server-side render club and tournament pages for indexability and initial load performance

A 0.1-second improvement in page load time can increase conversions by 10%. For a platform targeting older adults on potentially slower mobile connections, performance is especially critical.

### 8.4 Sitemap and Crawlability

**Sitemap structure:**
- `/sitemap.xml` — index sitemap pointing to sub-sitemaps
- `/sitemap-clubs.xml` — all public club pages (regenerate on new club signup)
- `/sitemap-tournaments.xml` — all public tournament result pages
- `/sitemap-learn.xml` — all content/educational pages
- `/sitemap-static.xml` — homepage, about, pricing, FAQ

**Key rules:**
- Only index pages with substantial content (exclude thin pages like empty club stubs)
- Include `<lastmod>` on tournament pages — they update frequently, which signals to Google they are worth recrawling
- Submit sitemap to Google Search Console and Bing Webmaster Tools
- Ensure `robots.txt` does not inadvertently block `/tournaments/`, `/clubs/`, or `/learn/`

### 8.5 URL Structure for SEO

Well-structured URLs matter both for ranking and for sharing:

| Page Type | URL Pattern | Notes |
|-----------|-------------|-------|
| Club directory | `/clubs/[city]-[club-slug]` | City prefix helps local SEO |
| Tournament results | `/tournaments/[year]-[tournament-slug]` | Year prefix aids time-based queries |
| Learn/content | `/learn/[topic-slug]` | Descriptive, no IDs |
| Player profiles | `/players/[username]` | Username, not numeric ID |
| State/regional landing pages | `/clubs/[state]` | Targets "[state] lawn bowling clubs" searches |

### 8.6 Local SEO for Club Pages

Each club page on lawnbowl.app is a local SEO opportunity. Clubs with complete profiles (address, phone, hours, photos) will rank for "[club name] lawn bowling" and "[city] lawn bowling club" searches.

**Google Business Profile strategy:** Encourage clubs to link their Google Business Profile to their lawnbowl.app page. A club that manages their lawnbowl.app page actively (posting results, events) creates fresh content that signals to Google that the business is active — a local ranking factor.

---

## 9. Prioritized Action Plan

### Immediate (Months 1–2)

1. **Free tier launch** — Remove any friction from club signup; ensure "free forever for small clubs" messaging is prominent
2. **Dynamic OG images** — Implement Vercel OG for tournament and club pages
3. **Structured data** — Deploy `SportsOrganization` and `SportsEvent` schema on all applicable pages
4. **Club onboarding email sequence** — 5-email sequence triggered on signup (Days 0, 1, 3, 7, 14)
5. **Bowls USA outreach** — Draft and send partnership proposal to Bowls USA and all six regional divisions

### Short-Term (Months 3–4)

6. **Content hub** — Publish 10 foundational learn articles targeting top-funnel keywords
7. **QR code pack** — Create downloadable PDF for clubs with placement instructions
8. **Push notification system** — Implement PWA push for draw-live and results-ready triggers
9. **Shareable tournament cards** — Auto-generate result images for social sharing
10. **Testimonial collection** — Reach out to first 20 active clubs for quotes and case studies

### Medium-Term (Months 5–6)

11. **Ambassador program** — Identify and recruit 10–20 club ambassadors
12. **State/regional landing pages** — Create SEO-optimized pages for top 10 markets (CA, FL, AU-NSW, AU-VIC, UK)
13. **Equipment affiliate program** — Integrate affiliate links into learn content
14. **Stat tracking dashboard** — Launch individual player stats (win/loss, position performance)
15. **Challenge a Club feature** — Club-to-club invitation flow

---

## Sources

- [Clevertap — App Conversion Rate Strategies](https://clevertap.com/blog/increase-app-conversion-rate/)
- [Bowls USA — Official Site](https://www.bowlsusa.us/)
- [Global Lawn Bowls — Platform](https://www.globallawnbowls.com/)
- [Airship — Push Notifications & Sports/Recreation App Retention](https://www.airship.com/resources/benchmark-report/how-push-notifications-impact-sports-recreation-app-retention-rates/)
- [London Tech Insights — BowlsNet](https://londontechinsights.co.uk/bowlsnet/)
- [Bowlr App](https://bowlr.app/)
- [QR Planet — QR Codes for Sporting Events](https://qrplanet.com/qr-codes-for-sporting-events)
- [Flowcode — QR Codes for Sports](https://www.flowcode.com/industries/sports)
- [Schema.org — SportsOrganization](https://schema.org/SportsOrganization)
- [Schema.org — SportsTeam](https://schema.org/SportsTeam)
- [Schemantra — SportsOrganization Schema Generator](https://schemantra.com/schema_list/SportsOrganization)
- [UXify — Core Web Vitals 2025](https://uxify.com/blog/post/core-web-vitals)
- [Slatebytes — Next.js SEO Best Practices 2025](https://www.slatebytes.com/articles/next-js-seo-in-2025-best-practices-meta-tags-and-performance-optimization-for-high-google-rankings)
- [Progressier — PWA vs Native 2026](https://progressier.com/pwa-vs-native-app-comparison-table)
- [WizerNotify — Social Proof Statistics](https://wisernotify.com/blog/social-proof-statistics/)
- [Jack High Bowls — Player Positions](https://www.jackhighbowls.com/help/lawn-bowls-player-positions/)
- [Getagameofbowls — Tournament Ideas](https://www.getagameofbowls.com/ggtour.php)
- [Bowls Academy — Top Lawn Bowl Manufacturers](https://bowlsacademy.com/the-big-four-comparing-the-top-lawn-bowl-manufacturers/)
- [WildApricot — Sports Management Software](https://www.wildapricot.com/blog/sports-management-software)
