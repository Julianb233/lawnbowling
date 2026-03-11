# lawnbowl.camp Standalone Microsite

## Purpose

A dedicated insurance marketing microsite at `lawnbowl.camp` focused on driving
per-session insurance signups for lawn bowling clubs and players. Unlike the in-app
insurance pages (which target existing app users), this microsite targets organic
search traffic from bowlers and club secretaries who are not yet using the app.

## Target Audience

1. **Club secretaries / treasurers** - Looking for affordable insurance options for
   their club's members and events
2. **Individual bowlers** - Searching for personal injury coverage for lawn bowling
3. **Tournament organizers** - Seeking bulk event insurance for competitions
4. **Bowling associations** - Regional and national bodies evaluating insurance partnerships

## Tech Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | Next.js 15 (App Router) | Same stack as main app, SSG for performance |
| Styling | Tailwind CSS 4 | Consistent with main app |
| Hosting | Vercel | Separate Vercel project for independent deploys |
| Domain | lawnbowl.camp | Custom domain via Vercel |
| Analytics | Vercel Analytics + PostHog | Track conversion funnel |
| CMS | None (static) | Content changes are infrequent |

## Page Structure

### / (Home)
- Hero: "Per-Session Insurance for Lawn Bowlers" with CTA to get a quote
- Injury statistics section (54% falls, 35% fractures, $12K+ avg ER)
- Coverage tiers: Basic ($3), Standard ($8), Premium ($15)
- How it works (3-step flow)
- Testimonials from club secretaries and tournament directors
- Trust badges (AIG, Lloyd's, Great American)
- CTA: Link to DEI quote flow

### /coverage
- Detailed coverage breakdown for each tier
- What's covered vs what's not
- Comparison table (Basic vs Standard vs Premium)
- Sport-specific risks for lawn bowling

### /clubs
- Club bulk pricing information
- How to set up coverage for your entire club
- Integration with the Lawnbowling app's check-in system
- Contact form for club secretaries

### /tournaments
- Tournament event coverage packages
- Per-player pricing for events
- How coverage activates at check-in
- Bulk quote request form

### /faq
- Comprehensive FAQ targeting common search queries
- Structured data (FAQ schema) for rich snippets
- Questions segmented by audience (players, clubs, organizers)

### /about
- About Daily Event Insurance partnership
- Underwriter information (AIG, Lloyd's, Great American)
- Licensing and compliance (all 50 states)

### /blog (future)
- SEO content targeting "lawn bowling insurance" keywords
- Injury prevention articles
- Club risk management guides

## Integration Points with Main App

| Integration | Direction | Mechanism |
|-------------|-----------|-----------|
| Quote flow | Microsite -> DEI | External link to DEI quote form |
| App signup | Microsite -> App | Links to lawnbowling.app/signup |
| Coverage status | App -> Microsite | Shared Supabase (read-only) for stats |
| Check-in flow | App only | Microsite explains, app executes |

## Domain Configuration

```
Domain: lawnbowl.camp
Registrar: Namecheap / Cloudflare
DNS: Vercel (CNAME to cname.vercel-dns.com)
SSL: Auto via Vercel
```

### Vercel Project Setup
```
Project name: lawnbowl-camp
Framework: Next.js
Root directory: /
Build command: next build
Output directory: .next
Node version: 20.x
```

## SEO Strategy

### Target Keywords
- "lawn bowling insurance" (primary)
- "lawn bowls insurance" (primary)
- "bowls insurance per session"
- "lawn bowling liability coverage"
- "lawn bowls injury insurance"
- "bowling green insurance"
- "lawn bowls tournament insurance"
- "per-session sports insurance"
- "daily event insurance lawn bowls"

### Technical SEO
- Static generation (SSG) for all pages -- fast load times
- Structured data: Organization, FAQ, Product schemas
- Open Graph and Twitter Card meta tags on all pages
- XML sitemap at /sitemap.xml
- robots.txt allowing full crawl
- Canonical URLs to avoid duplicate content with main app

### Content Strategy
- Each page targets 1-2 primary keywords
- FAQ page targets long-tail conversational queries
- Blog (future) targets informational queries
- Internal linking between microsite pages and to main app

## Deployment Plan

### Phase 1: Static Marketing Site
1. Create new Next.js project (separate repo)
2. Build pages with static content from existing insurance pages
3. Deploy to Vercel with lawnbowl.camp domain
4. Set up analytics and conversion tracking

### Phase 2: Dynamic Features (Future)
1. Inline quote calculator (estimate coverage cost)
2. Club signup form with Supabase backend
3. Coverage status check (for existing app users)
4. Blog with MDX content

### Phase 3: Full Integration (Future)
1. SSO with main Lawnbowling app
2. Direct insurance purchase flow
3. Club dashboard for coverage management
4. API integration with DEI for real-time quotes

## Timeline Estimate

| Phase | Effort | Priority |
|-------|--------|----------|
| Phase 1 | 2-3 days | High |
| Phase 2 | 1-2 weeks | Medium |
| Phase 3 | 2-4 weeks | Low |

## Notes

- This microsite is a **separate deployment** from the main Lawnbowling app
- It should NOT be built inside the main app's repository
- Content should be adapted from existing `/insurance/lawn-bowls` page but expanded
  for standalone SEO purposes
- The microsite drives traffic to DEI's quote flow and to the main app's signup
