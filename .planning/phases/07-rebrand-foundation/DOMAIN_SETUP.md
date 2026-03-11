# Domain & Vercel Deployment Guide

## Domains

| Domain | Purpose | Status |
|--------|---------|--------|
| `lawnbowl.app` | Primary domain | Configure in Vercel |
| `lawnbowling.app` | Redirect to primary | 301 via vercel.json |
| `www.lawnbowl.app` | Redirect to primary | 301 via vercel.json |
| `www.lawnbowling.app` | Redirect to primary | 301 via vercel.json |
| `lawnbowl.camp` | Insurance microsite | Separate Vercel project |

## Vercel Project Setup

### 1. Create Project

```bash
# Install Vercel CLI
npm i -g vercel

# Link project (from /opt/agency-workspace/lawnbowling)
vercel link

# Deploy
vercel --prod
```

### 2. Add Domains in Vercel Dashboard

Navigate to: Project Settings > Domains

Add these domains:
1. `lawnbowl.app` (primary)
2. `lawnbowling.app` (redirect handled by vercel.json)
3. `www.lawnbowl.app` (redirect handled by vercel.json)
4. `www.lawnbowling.app` (redirect handled by vercel.json)

### 3. DNS Configuration

For each domain, configure DNS records at your registrar:

**lawnbowl.app:**
```
Type: A     Name: @    Value: 76.76.21.21
Type: AAAA  Name: @    Value: 2001:4860:4802:32::15  (if IPv6 supported)
Type: CNAME Name: www  Value: cname.vercel-dns.com
```

**lawnbowling.app:**
```
Type: A     Name: @    Value: 76.76.21.21
Type: CNAME Name: www  Value: cname.vercel-dns.com
```

Note: Vercel will provide exact DNS values when domains are added. The A record IP may differ -- use the value Vercel provides.

### 4. SSL/HTTPS

Vercel automatically provisions and renews SSL certificates via Let's Encrypt for all configured domains. No manual action needed.

## Environment Variables

Set all variables from `.env.local.example` in Vercel:
- Project Settings > Environment Variables
- Set for Production, Preview, and Development as appropriate
- Never expose `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, or `VAPID_PRIVATE_KEY` to the client

### Required for Production

| Variable | Where | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | All | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Yes |
| `NEXT_PUBLIC_APP_URL` | All | Yes (set to https://lawnbowl.app) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | All | For payments |
| `STRIPE_SECRET_KEY` | Server only | For payments |
| `STRIPE_WEBHOOK_SECRET` | Server only | For payments |
| `EMAIL_API_KEY` | Server only | For emails |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | All | For push notifications |
| `VAPID_PRIVATE_KEY` | Server only | For push notifications |
| `CRON_SECRET` | Server only | For scheduled jobs |
| `PRINTIFY_API_KEY` | Server only | For shop |
| `PRINTIFY_SHOP_ID` | Server only | For shop |

## Vercel Configuration

The `vercel.json` file configures:

1. **Framework**: Next.js (auto-detected)
2. **Headers**: Security headers on all routes, cache control for SW and manifest
3. **Redirects**: Domain redirects (lawnbowling.app -> lawnbowl.app)
4. **Crons**: Partner request expiration every 2 minutes

## Stripe Webhook

Register webhook endpoint in Stripe Dashboard:
- URL: `https://lawnbowl.app/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## Printify Webhook

Register webhook in Printify:
- URL: `https://lawnbowl.app/api/shop/webhooks/printify`
- Events: `order:shipment:created`, `order:shipment:delivered`, `order:updated`

## Google Search Console

1. Add property: `https://lawnbowl.app`
2. Verify via meta tag (set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` env var)
3. Submit sitemap: `https://lawnbowl.app/sitemap.xml`

## Post-Deploy Checklist

- [ ] All domains resolve correctly
- [ ] HTTPS works on all domains
- [ ] lawnbowling.app redirects to lawnbowl.app (301)
- [ ] www variants redirect to lawnbowl.app (301)
- [ ] manifest.json loads correctly
- [ ] Service worker registers
- [ ] Supabase connection works
- [ ] Stripe checkout works
- [ ] Email sending works
- [ ] Push notifications work
- [ ] Cron jobs fire (check Vercel logs)
- [ ] Sitemap accessible at /sitemap.xml
- [ ] robots.txt accessible at /robots.txt
- [ ] OG images render correctly
- [ ] Google Search Console verified
