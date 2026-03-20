# Go-Live Today Checklist

Date: 2026-03-19  
Branch: `cursor/app-go-live-requirements-8c30`

## Launch Readiness Snapshot (from this audit)

- Domain checks: `https://www.lawnbowling.app` is reachable (HTTP 200), with redirects from `lawnbowl.app` and `www.lawnbowl.app`.
- Unit tests: `npm run test` passed (`19` files, `362` tests).
- Production build: `npm run build` succeeds when required env vars are set.
- Build fails without env vars (expected): Supabase URL/key must exist at build/runtime.
- Lint status: `npm run lint` reports `110 errors` and `143 warnings` (not launch-blocking unless CI enforces lint).
- CI workflows: no `.github/workflows` files found (no automated quality gate in repo).

---

## P0 - Must Complete Before Publishing Today

1. **Lock canonical domain + redirect policy**
   - Decide one canonical host (currently `www.lawnbowling.app` is live canonical).
   - Ensure Vercel dashboard + `vercel.json` redirect rules match exactly.
   - Verify:
     - `curl -I -L https://www.lawnbowling.app`
     - `curl -I -L https://lawnbowl.app`
     - `curl -I -L https://www.lawnbowl.app`

2. **Set all required Vercel environment variables**
   - Use `.env.local.example` as the source-of-truth checklist.
   - Minimum for core app:
     - `NEXT_PUBLIC_APP_URL`
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `SUPABASE_WEBHOOK_SECRET`
   - Minimum for cron/webhook integrity:
     - `CRON_SECRET`
     - `STRIPE_WEBHOOK_SECRET`
     - `STRIPE_MEMBERSHIP_WEBHOOK_SECRET`
     - `PRINTIFY_WEBHOOK_SECRET`

3. **Commerce and notification readiness**
   - Stripe:
     - `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - all required `PRICE_ID` vars
   - Printify:
     - `PRINTIFY_API_TOKEN` and `PRINTIFY_API_KEY` (set both to same PAT today; code references both)
     - `PRINTIFY_SHOP_ID`
   - Email:
     - `EMAIL_API_KEY`
     - `EMAIL_FROM`
   - Push:
     - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
     - `VAPID_PRIVATE_KEY`

4. **Run pre-launch smoke test suite on production URL**
   - Public pages: `/`, `/clubs`, `/learn`, `/shop`, `/faq`, `/pricing`
   - Auth flow: signup/login/logout
   - Authenticated pages: `/board`, `/profile`, `/friends`, `/chat`
   - Billing: test-mode checkout session creation
   - Webhooks: Stripe + Printify signature verification path

5. **Database and migration verification**
   - Confirm all required Supabase migrations are applied in production.
   - Confirm RLS policies allow expected authenticated flows (profile, friends, board).

6. **Operational safety checks**
   - Confirm cron endpoints reject invalid secret and accept valid secret.
   - Confirm Sentry env vars are set if source-map upload/monitoring is expected.

---

## P1 - Strongly Recommended in Next Iteration (Not Required for Today Launch)

1. Add API rate limiting (especially high-risk routes like email send, friends, messages).
2. Consolidate duplicate Printify webhook handling (`/api/webhooks/printify` vs `/api/shop/webhooks/printify`) into one canonical path.
3. Resolve Printify env naming mismatch (`PRINTIFY_API_TOKEN` vs `PRINTIFY_API_KEY`) to a single variable.
4. Set `metadataBase` in root metadata to remove social URL fallback warnings.
5. Migrate `middleware.ts` to `proxy.ts` per Next.js 16 deprecation warning.
6. Add CI workflow (build + tests at minimum; lint if desired).
7. Burn down current lint errors before enforcing lint in CI.

---

## Linear Ticket Draft (copy/paste)

**Title**  
`[P0] Production go-live checklist and launch gate`

**Assignee**  
`Hitesh`

**Tags**  
`launch`, `production`, `p0`, `go-live`

**Description**

```md
## Goal
Get the app safely live today with explicit launch gates.

## Definition of Done (P0)
- [ ] Canonical domain + redirects verified across all variants
- [ ] Required env vars configured in Vercel (Supabase, Stripe, Printify, Email, Push, Cron)
- [ ] Production smoke tests pass on core user journeys
- [ ] Stripe + Printify webhooks verified with signature validation
- [ ] Supabase migrations and RLS verified in production
- [ ] Cron secrets validated in production

## Notes from latest audit
- Unit tests pass locally (`362/362`)
- Build passes when env vars are set
- Lint currently has many errors; not a same-day launch blocker unless CI enforces lint
- Two Printify webhook endpoints exist; should be unified post-launch
- Printify env naming is inconsistent (`PRINTIFY_API_TOKEN` and `PRINTIFY_API_KEY`)

## Owner
@hitesh
```
