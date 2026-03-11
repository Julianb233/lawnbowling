# Domain Setup — lawnbowl.app

## Domains

| Domain | Role | Status |
|--------|------|--------|
| lawnbowl.app | Primary domain | Configure in Vercel |
| www.lawnbowl.app | Redirect to primary | 301 via vercel.json |
| lawnbowling.app | Redirect to primary | 301 via vercel.json |
| www.lawnbowling.app | Redirect to primary | 301 via vercel.json |

## Vercel Project Setup

### 1. Add Domains in Vercel Dashboard

Go to **Project Settings > Domains** and add all four domains:

```
lawnbowl.app          (primary)
www.lawnbowl.app      (redirect)
lawnbowling.app       (redirect)
www.lawnbowling.app   (redirect)
```

Vercel will auto-provision SSL certificates for each domain.

### 2. DNS Configuration

#### lawnbowl.app (primary domain)

At your domain registrar, set the following DNS records:

```
Type    Name    Value                   TTL
A       @       76.76.21.21             300
AAAA    @       2606:4700:20::681a:1521 300
CNAME   www     cname.vercel-dns.com    300
```

#### lawnbowling.app (redirect domain)

```
Type    Name    Value                   TTL
A       @       76.76.21.21             300
AAAA    @       2606:4700:20::681a:1521 300
CNAME   www     cname.vercel-dns.com    300
```

> Note: Vercel's IP addresses may change. Always confirm the latest values in
> the Vercel dashboard under Project Settings > Domains after adding each domain.

### 3. Redirect Configuration

All redirects are handled in `vercel.json` using host-based 301 redirects:

- `lawnbowling.app/*` → `https://lawnbowl.app/*` (301)
- `www.lawnbowl.app/*` → `https://lawnbowl.app/*` (301)
- `www.lawnbowling.app/*` → `https://lawnbowl.app/*` (301)

## Environment Variables

Set the following in Vercel Project Settings > Environment Variables:

### Required

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://lawnbowl.app` | Used for canonical URLs |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase service role key (server only) |

### Optional

| Variable | Value | Notes |
|----------|-------|-------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe secret key for checkout |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe webhook signing secret |
| `EMAIL_FROM` | `Lawnbowling <noreply@lawnbowl.app>` | Sender address for emails |
| `VAPID_PUBLIC_KEY` | `B...` | Web push VAPID public key |
| `VAPID_PRIVATE_KEY` | `...` | Web push VAPID private key |
| `ENABLE_SERWIST` | `1` | Enable PWA service worker (when Turbopack support is ready) |

## Security Headers

The following security headers are configured in `vercel.json`:

- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY (prevents clickjacking)
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Strict-Transport-Security**: max-age=63072000; includeSubDomains; preload (HSTS)
- **Permissions-Policy**: camera=(), microphone=(), geolocation=(self)

## Cron Jobs

| Path | Schedule | Purpose |
|------|----------|---------|
| `/api/partner/expire` | Every 2 minutes | Clean up expired partner requests |

## Verification Checklist

After DNS propagation (up to 48 hours):

- [ ] `https://lawnbowl.app` loads correctly with SSL
- [ ] `https://www.lawnbowl.app` redirects to `https://lawnbowl.app`
- [ ] `https://lawnbowling.app` redirects to `https://lawnbowl.app`
- [ ] `https://www.lawnbowling.app` redirects to `https://lawnbowl.app`
- [ ] SSL certificates are valid for all domains
- [ ] HSTS header is present in responses
- [ ] Cron job `/api/partner/expire` runs every 2 minutes
- [ ] OG images load at `https://lawnbowl.app/opengraph-image.png`
- [ ] `https://lawnbowl.app/sitemap.xml` is accessible
- [ ] `https://lawnbowl.app/robots.txt` is accessible
