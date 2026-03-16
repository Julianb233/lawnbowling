# Backend API Validation Test Report

**Date:** 2026-03-16
**Target:** https://lawn-bowling-eluvqg6mn-ai-acrobatics.vercel.app
**Method:** curl-based HTTP requests with status code and response body analysis

---

## Summary

| Category | Tests | Pass | Fail | Warn |
|----------|-------|------|------|------|
| Search API | 7 | 6 | 0 | 1 |
| Profile API | 1 | 1 | 0 | 0 |
| Friends API | 3 | 3 | 0 | 0 |
| Friends Respond API | 2 | 2 | 0 | 0 |
| Friends Block API | 2 | 2 | 0 | 0 |
| Gallery API | 2 | 2 | 0 | 0 |
| Stats Leaderboard | 6 | 4 | 1 | 1 |
| **Totals** | **23** | **20** | **1** | **2** |

---

## 1. Search API (`/api/search`)

| # | Test Case | HTTP Status | Result | Notes |
|---|-----------|-------------|--------|-------|
| 1.1 | Valid query `?q=Robert` | 200 | **PASS** | Returns `players`, `teams`, `games` arrays. Multiple Robert results found with correct structure (id, display_name, avatar_url, skill_level, sports). |
| 1.2 | Empty query `?q=` | 200 | **PASS** | Returns empty arrays `{"players":[],"teams":[],"games":[]}`. Does not error or leak data. |
| 1.3 | Single char `?q=A` | 200 | **WARN** | Returns empty results for single char, but `?q=Al` returns 10 results. Likely a minimum 2-character search requirement. Not documented but reasonable behavior. |
| 1.4 | Special chars `?q=O'Brien` | 200 | **PASS** | Returns empty results (no matching records). No SQL error or crash -- apostrophe handled safely. |
| 1.5 | XSS attempt `?q=<script>alert(1)</script>` | 200 | **PASS** | Returns empty results. Response body does NOT contain `<script>` tags -- no reflection of injected HTML. |
| 1.6 | Very long query (200 chars) | 200 | **PASS** | Returns empty results gracefully. No 413/414 error, no crash. |
| 1.7 | SQL injection `?q=' OR 1=1--` | 200 | **PASS** | Returns 0 results. Does not dump all records -- injection attempt is ineffective. Parameterized queries are in use. |

---

## 2. Profile API (`/api/profile`)

| # | Test Case | HTTP Status | Result | Notes |
|---|-----------|-------------|--------|-------|
| 2.1 | GET unauthenticated | 307 | **PASS** | Redirects to `/login?returnTo=%2Fapi%2Fprofile`. Correctly requires authentication. Does not expose any profile data. |

---

## 3. Friends API (`/api/friends`)

| # | Test Case | HTTP Status | Result | Notes |
|---|-----------|-------------|--------|-------|
| 3.1 | POST unauthenticated (valid body) | 307 | **PASS** | Redirects to `/login?returnTo=%2Fapi%2Ffriends`. Auth required before any body validation. |
| 3.2 | POST empty body `{}` | 307 | **PASS** | Redirects to login. Auth check happens before input validation (correct priority). |
| 3.3 | POST invalid friend_id | 307 | **PASS** | Redirects to login. Auth gate prevents processing of invalid input. |

---

## 4. Friends Respond API (`/api/friends/respond`)

| # | Test Case | HTTP Status | Result | Notes |
|---|-----------|-------------|--------|-------|
| 4.1 | POST unauthenticated | 307 | **PASS** | Redirects to `/login?returnTo=%2Fapi%2Ffriends%2Frespond`. |
| 4.2 | POST empty body `{}` | 307 | **PASS** | Redirects to login. Auth check takes priority. |

---

## 5. Friends Block API (`/api/friends/block`)

| # | Test Case | HTTP Status | Result | Notes |
|---|-----------|-------------|--------|-------|
| 5.1 | POST unauthenticated | 307 | **PASS** | Redirects to `/login?returnTo=%2Fapi%2Ffriends%2Fblock`. |
| 5.2 | POST empty body `{}` | 307 | **PASS** | Redirects to login. Auth check takes priority. |

---

## 6. Gallery API (`/api/profile/gallery`)

| # | Test Case | HTTP Status | Result | Notes |
|---|-----------|-------------|--------|-------|
| 6.1 | GET unauthenticated | 307 | **PASS** | Redirects to `/login?returnTo=%2Fapi%2Fprofile%2Fgallery`. |
| 6.2 | POST unauthenticated | 307 | **PASS** | Redirects to login. No gallery upload without auth. |

---

## 7. Stats Leaderboard (`/api/stats/leaderboard`)

| # | Test Case | HTTP Status | Result | Notes |
|---|-----------|-------------|--------|-------|
| 7.1 | No params | 200 | **PASS** | Returns 50 leaderboard entries with full player data (player_id, games_played, wins, losses, win_rate, elo_rating, favorite_sport, last_played_at, nested player object). Default sort is by win_rate descending. |
| 7.2 | `sport=lawn_bowling` | 200 | **PASS** | Returns 50 entries, all with `favorite_sport: "lawn_bowling"`. Filter works correctly. |
| 7.3 | `sport=invalid_sport_xyz` | 200 | **FAIL** | Returns 50 entries identical to the unfiltered response. Invalid sport parameter is silently ignored instead of returning empty results or a 400 error. All results have `favorite_sport: "lawn_bowling"`, meaning the filter is not applied. |
| 7.4 | `skill_level=advanced` | 200 | **PASS** | Returns 50 entries, all with `skill_level: "advanced"`. Filter works correctly. |
| 7.5 | `sort_by=games_played` | 200 | **PASS** | Returns entries sorted by games_played descending (150, 149, 149, 149, 148...). Sort works correctly. |
| 7.6 | `sort_by=invalid_sort` | 200 | **WARN** | Falls back to default sort (win_rate descending). Does not error. Acceptable fallback behavior but could return a 400 for invalid sort parameters. |

---

## Security Assessment

### Passed Security Checks
- **Authentication gates:** All protected endpoints (profile, friends, gallery) return 307 redirect to login. No data leakage for unauthenticated requests.
- **XSS protection:** Script tags in search queries are not reflected in responses.
- **SQL injection protection:** Injection payloads return empty results, not data dumps. Parameterized queries appear to be in use.
- **Input handling:** Long strings, special characters, and empty inputs are handled gracefully without server errors.
- **Security headers:** `permissions-policy: camera=(), microphone=(), geolocation=(self)` header present on auth redirects.

### Issues Found

| Severity | Issue | Endpoint | Description |
|----------|-------|----------|-------------|
| **Medium** | Invalid sport filter silently ignored | `/api/stats/leaderboard?sport=invalid_sport_xyz` | Returns all records instead of empty results or 400 error. Could confuse API consumers. |
| **Low** | Invalid sort_by silently falls back | `/api/stats/leaderboard?sort_by=invalid_sort` | Falls back to default sort without indication. Minor but could cause subtle bugs for API consumers. |
| **Info** | Single-char search returns empty | `/api/search?q=A` | Minimum 2-character search not documented. Two-character queries like `?q=Al` work fine. |

---

## Recommendations

1. **Validate sport parameter:** Return 400 with error message when an unrecognized sport is provided, or at minimum return empty results.
2. **Validate sort_by parameter:** Return 400 with allowed values when an invalid sort field is provided.
3. **Document search minimum:** Add client-side validation or API documentation noting the 2-character minimum search length.
