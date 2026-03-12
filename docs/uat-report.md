# Lawnbowling UAT Report

**Date:** 2026-03-11
**Tester:** Automated (curl-based UAT)
**Target:** https://www.lawnbowling.app
**Overall Result: CRITICAL FAILURE -- Site is completely unreachable due to infinite redirect loop**

---

## Critical Issue: Infinite Redirect Loop

All pages on the site are unreachable. An infinite 308 redirect loop exists between:

```
www.lawnbowling.app  --308-->  lawnbowl.app  --308-->  www.lawnbowling.app  (loop)
```

**Root Cause:** Conflicting redirect rules between Vercel dashboard settings and `vercel.json`:

- **Vercel dashboard** has `lawnbowl.app` configured to redirect to `www.lawnbowling.app` (308)
- **vercel.json** has a redirect rule sending `www.lawnbowling.app` to `lawnbowl.app` (308/permanent)

These two rules conflict, creating an infinite loop. No page on any domain variant can be reached.

**Fix required:** Either:
1. Remove the `www.lawnbowling.app` -> `lawnbowl.app` redirect from `vercel.json` and keep `www.lawnbowling.app` as the canonical domain, OR
2. Change the Vercel dashboard primary domain to `lawnbowl.app` (remove the redirect from `lawnbowl.app` -> `www.lawnbowling.app` in Vercel dashboard settings)

---

## Page-by-Page Results

All pages tested from `https://www.lawnbowling.app` (the domain specified in the task):

| # | Page | HTTP Status | Result | Notes |
|---|------|-------------|--------|-------|
| 1 | `/` | 308 | FAIL | Redirects to `lawnbowl.app/` which redirects back -- infinite loop |
| 2 | `/login` | 308 | FAIL | Redirects to `lawnbowl.app/login` -- infinite loop |
| 3 | `/signup` | 308 | FAIL | Redirects to `lawnbowl.app/signup` -- infinite loop |
| 4 | `/clubs` | 308 | FAIL | Redirects to `lawnbowl.app/clubs` -- infinite loop |
| 5 | `/shop` | 308 | FAIL | Redirects to `lawnbowl.app/shop` -- infinite loop |
| 6 | `/events` | 308 | FAIL | Redirects to `lawnbowl.app/events` -- infinite loop |
| 7 | `/learn` | 308 | FAIL | Redirects to `lawnbowl.app/learn` -- infinite loop |
| 8 | `/learn/lawn-bowling` | 308 | FAIL | Redirects to `lawnbowl.app/learn/lawn-bowling` -- infinite loop |
| 9 | `/about` | 308 | FAIL | Redirects to `lawnbowl.app/about` -- infinite loop |
| 10 | `/faq` | 308 | FAIL | Redirects to `lawnbowl.app/faq` -- infinite loop |
| 11 | `/terms` | 308 | FAIL | Redirects to `lawnbowl.app/terms` -- infinite loop |
| 12 | `/privacy` | 308 | FAIL | Redirects to `lawnbowl.app/privacy` -- infinite loop |
| 13 | `/pricing` | 308 | FAIL | Redirects to `lawnbowl.app/pricing` -- infinite loop |
| 14 | `/blog` | 308 | FAIL | Redirects to `lawnbowl.app/blog` -- infinite loop |
| 15 | `/leaderboard` | 308 | FAIL | Redirects to `lawnbowl.app/leaderboard` -- infinite loop |
| 16 | `/tv` | 308 | FAIL | Redirects to `lawnbowl.app/tv` -- infinite loop |
| 17 | `/contact` | 308 | FAIL | Redirects to `lawnbowl.app/contact` -- infinite loop |
| 18 | `/shop/equipment` | 308 | FAIL | Redirects to `lawnbowl.app/shop/equipment` -- infinite loop |
| 19 | `/shop/custom-merch` | 308 | FAIL | Redirects to `lawnbowl.app/shop/custom-merch` -- infinite loop |
| 20 | `/shop/checkout` | 308 | FAIL | Redirects to `lawnbowl.app/shop/checkout` -- infinite loop |
| 21 | `/board` | 308 | FAIL | Redirects to `lawnbowl.app/board` -- infinite loop (cannot test auth redirect) |
| 22 | `/profile` | 308 | FAIL | Redirects to `lawnbowl.app/profile` -- infinite loop (cannot test auth redirect) |
| 23 | `/settings` | 308 | FAIL | Redirects to `lawnbowl.app/settings` -- infinite loop (cannot test auth redirect) |
| 24 | `/chat` | 308 | FAIL | Redirects to `lawnbowl.app/chat` -- infinite loop (cannot test auth redirect) |
| 25 | `/onboarding/player` | 308 | FAIL | Redirects to `lawnbowl.app/onboarding/player` -- infinite loop |
| 26 | `/sitemap.xml` | 308 | FAIL | Redirects to `lawnbowl.app/sitemap.xml` -- infinite loop |

---

## Domain Redirect Tests

| Source Domain | HTTP Status | Redirects To | Result |
|---------------|-------------|--------------|--------|
| `https://www.lawnbowling.app` | 308 | `https://lawnbowl.app` | FAIL -- loop (vercel.json rule) |
| `https://lawnbowl.app` | 308 | `https://www.lawnbowling.app` | FAIL -- loop (Vercel dashboard rule) |
| `https://lawnbowling.app` (no www) | 301 | `https://www.lawnbowling.app` | Redirects to www, then enters loop |
| `https://www.lawnbowl.app` | 308 | `https://www.lawnbowling.app` | Redirects to www, then enters loop |
| `http://lawnbowling.app` | 308 | `https://lawnbowling.app` | Upgrades to HTTPS, then enters loop |
| `http://lawnbowl.app` | 308 | `https://lawnbowl.app` | Upgrades to HTTPS, then enters loop |
| `https://lawnbowl.camp` | N/A | N/A | DNS not resolving / not configured |
| `https://www.lawnbowl.camp` | N/A | N/A | DNS not resolving / not configured |

---

## Asset / PWA Tests

| Asset | HTTP Status | Result | Notes |
|-------|-------------|--------|-------|
| `/manifest.json` | 308 | FAIL | Caught in redirect loop, PWA not installable |
| `/images/hero-friends-wide.png` | 308 | FAIL | Caught in redirect loop, image not loadable |
| `/images/logo/bowls-icon.png` | 308 | FAIL | Caught in redirect loop, image not loadable |

---

## Summary

| Category | Total | Pass | Fail |
|----------|-------|------|------|
| Public pages | 20 | 0 | 20 |
| Auth-protected pages | 4 | 0 | 4 |
| Special endpoints | 2 | 0 | 2 |
| Domain redirects | 8 | 0 | 8 |
| Static assets | 3 | 0 | 3 |
| **Total** | **37** | **0** | **37** |

**Pass rate: 0%**

---

## Recommended Fix

The conflict is in `/vercel.json` lines 30-63, which redirect `www.lawnbowling.app` -> `lawnbowl.app`. Meanwhile, the Vercel dashboard has `lawnbowl.app` set as a secondary domain that redirects to the primary domain `www.lawnbowling.app`.

The simplest fix: update `vercel.json` to use `www.lawnbowling.app` as the canonical domain (matching Vercel dashboard), and redirect all other domains TO `www.lawnbowling.app` instead of to `lawnbowl.app`. Alternatively, change the Vercel dashboard primary domain to `lawnbowl.app`.
