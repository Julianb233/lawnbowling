# Domain DNS Configuration

## Domains

| Domain | Role | Target |
|--------|------|--------|
| `www.lawnbowl.app` | Primary (serves app) | Vercel |
| `lawnbowl.app` | Redirects to www.lawnbowl.app | Vercel |
| `lawnbowling.app` | Redirects to www.lawnbowl.app | Vercel |
| `www.lawnbowling.app` | Redirects to www.lawnbowl.app | Vercel |
| `lawnbowl.camp` | Redirects to www.lawnbowl.app | Vercel |
| `www.lawnbowl.camp` | Redirects to www.lawnbowl.app | Vercel |

## Vercel Project

- **Project:** `lawn-bowling`
- **Project ID:** `prj_mcr0oITgAt2n40MoipDL8yclS04m`
- **Team ID:** `team_Fs8nLavBTXBbOfb7Yxcydw83`

## Step 1: Add Domains in Vercel

In the Vercel dashboard (or via CLI):

```bash
vercel domains add www.lawnbowl.app
vercel domains add lawnbowl.app
vercel domains add lawnbowling.app
vercel domains add www.lawnbowling.app
vercel domains add lawnbowl.camp
vercel domains add www.lawnbowl.camp
```

## Step 2: DNS Records at Registrar

### lawnbowl.app (primary)

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | `76.76.21.21` | 300 |
| CNAME | www | `cname.vercel-dns.com` | 300 |

### lawnbowling.app (redirect)

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | `76.76.21.21` | 300 |
| CNAME | www | `cname.vercel-dns.com` | 300 |

### lawnbowl.camp (redirect)

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | `76.76.21.21` | 300 |
| CNAME | www | `cname.vercel-dns.com` | 300 |

> Note: `76.76.21.21` is Vercel's A record IP. `cname.vercel-dns.com` is the standard CNAME target.

## Step 3: Verify

After DNS propagation (up to 48h, usually minutes):

1. SSL certificates auto-provision via Vercel
2. Test all redirects:
   - `lawnbowling.app` -> `www.lawnbowl.app`
   - `www.lawnbowling.app` -> `www.lawnbowl.app`
   - `lawnbowl.camp` -> `www.lawnbowl.app`
   - `www.lawnbowl.camp` -> `www.lawnbowl.app`
3. Verify no mixed content warnings

## Environment Variables

Update in Vercel project settings:
```
NEXT_PUBLIC_APP_URL=https://www.lawnbowl.app
```
