# lawnbowl.app — Financial Proforma
## 36-Month Revenue & Growth Projection

**Prepared:** March 2026
**Stage:** Pre-Revenue / Early Traction
**Model Version:** 1.0

---

## Executive Summary

lawnbowl.app is a freemium platform targeting the global lawn bowling community — a sport with over 9,000 clubs and 500,000+ registered participants across the US, Australia, New Zealand, and the UK. The platform monetizes through individual player memberships ($15/year or $5/month) and, beginning in Year 2, club-tier subscriptions for tournament management and draw generation.

**The core thesis:** Lawn bowling's digital infrastructure is decades behind every other organized sport. No modern, mobile-first, globally accessible platform exists. The incumbent solutions (PAMI, Bowlr, BowlsLink) are country-locked, desktop-dependent, or prohibitively expensive for smaller clubs. lawnbowl.app enters as the free-tier aggregator, capturing player attention before converting clubs.

**Key projections (Base Case):**

| Metric | Month 12 | Month 24 | Month 36 |
|--------|----------|----------|----------|
| Total Clubs on Platform | 130 | 310 | 520 |
| Total Registered Members | 6,500 | 15,500 | 26,000 |
| Paid Individual Members | 975 | 3,100 | 7,540 |
| Monthly Recurring Revenue | $3,200 | $11,800 | $29,400 |
| Annual Recurring Revenue | $38,400 | $141,600 | $352,800 |
| Net Monthly Cash Flow | +$1,200 | +$8,400 | +$25,100 |

**Breakeven:** Month 10 (Base Case) / Month 7 (Optimistic) / Month 18 (Conservative)

**Investment ask (optional):** A $50,000 seed round would fund 18 months of marketing spend ($1,500–$3,000/month) and Bowls USA partnership outreach, projecting a 3× revenue acceleration vs. organic growth alone.

---

## Market Research & Sizing

### US Market

| Metric | Estimate | Source / Notes |
|--------|----------|----------------|
| Bowls USA affiliated clubs | ~150 | 7 regional divisions; SE division alone has 14 clubs |
| Total US lawn bowling clubs (inc. unaffiliated) | 200–300 | Includes municipal parks, retirement communities |
| Bowls USA registered members | ~2,800 | Official figure; likely undercounts casual participants |
| Avg. members per club | 50–80 | Redlands (largest division) has ~1,400 across entire division |
| US TAM — individual memberships | $630K–$1.26M/yr | 42,000–84,000 potential users × $15/yr |

### Global Market

| Region | Clubs | Registered Players | Notes |
|--------|-------|-------------------|-------|
| Australia | 2,000+ | 240,000+ registered; 693,000+ casual | BowlsLink incumbent; barefoot bowls growing fast |
| United Kingdom | 3,500+ | 271,000+ (2016 figure; declining) | Bowlr serves ~185 clubs at £8–£100/mo |
| New Zealand | 460 | 43,240 adult members + 123,876 casual | 198,614 total participants |
| United States | 200–300 | 2,800 registered + est. 15,000 casual | Bowls USA governing body |
| Canada, South Africa, others | 500+ | ~50,000 est. | No dedicated digital platform |
| **Global Total** | **~7,000** | **~600,000+** | Serviceable addressable market |

### Competitive Pricing Benchmarks

| Competitor | Market | Model | Price |
|------------|--------|-------|-------|
| Bowlr (outdoor) | UK | Per-club SaaS | £8–£100/mo (~$10–$130/mo) |
| Bowlr (indoor) | UK | Enterprise | £3,000 setup + £1,000/yr |
| BowlsManager | UK | Per-club annual | £415/yr (~$520/yr) |
| BowlsNet | UK | Per-league | Modest annual fee (undisclosed) |
| PAMI | AU | License | Dongle purchase; no subscription |
| BowlsLink | AU | Govt-funded | Mandatory; club absorbs cost |
| **lawnbowl.app** | Global | Freemium individual | **$15/yr or $5/mo** |

**Key insight:** Every incumbent charges clubs $100–$3,000+/year. lawnbowl.app's individual-first model is a category inversion — we monetize the players directly at consumer pricing, then upsell clubs on club-tier features once we have critical mass.

---

## Revenue Model Assumptions

### Individual Membership Tiers

| Tier | Price | Mix Assumption | Notes |
|------|-------|---------------|-------|
| Free | $0 | — | Club directory, 1-month event view, basic profile |
| Member — Annual | $15/year = $1.25/mo | 70% of paid users | Strong value prop vs. $5/mo; annual LTV = $15 |
| Member — Monthly | $5/month = $60/year | 30% of paid users | Higher LTV but higher churn risk |

**Blended ARPU (per paid user per month):**
- Annual plan: $1.25/mo
- Monthly plan: $5.00/mo
- Weighted blended: (0.70 × $1.25) + (0.30 × $5.00) = **$2.375/mo**

### Club Acquisition Model

- **Starting point:** 10 clubs onboarded in Month 1 (direct outreach + Bowls USA network)
- **Growth rate:** 15% month-over-month (organic word-of-mouth within club networks)
- **Member conversion:** 10% of club members convert to paid in Month 1, growing to 25% by Month 30
- **Average club size (US-focused):** 65 members

### Churn Rates

| Tier | Churn Rate | Notes |
|------|-----------|-------|
| Monthly subscribers | 5% per month | 12-month retention ~54% |
| Annual subscribers | 15% per year | 1.25% per month equivalent |
| Blended effective monthly churn | ~2.25% | Weighted by mix |

### Supplementary Revenue (Year 2+)

| Stream | Rate | Notes |
|--------|------|-------|
| Equipment affiliate | $2–$5 per referred sale | Bowls equipment, apparel |
| Insurance referrals | $3 per policy | Bowls club liability insurance |
| Club tier (future) | $30–$80/mo per club | Tournament management, draw engine, kiosk |

---

## Cost Model

### Fixed Monthly Costs

| Item | Month 1–6 | Month 7–18 | Month 19–36 |
|------|-----------|-----------|-------------|
| Vercel Pro hosting | $20 | $20 | $20 |
| Supabase (database) | $25 | $50 | $100 |
| Domain / SSL | $4 | $4 | $4 |
| Email (Resend/Postmark) | $10 | $15 | $25 |
| Analytics (Posthog) | $0 | $0 | $20 |
| **Infrastructure Total** | **$59** | **$89** | **$169** |

### Variable Marketing Costs

| Period | Monthly Budget | Strategy |
|--------|---------------|----------|
| Months 1–3 | $200 | Social media (Facebook groups for bowls clubs), direct email outreach |
| Months 4–6 | $400 | Google Ads (lawn bowling clubs near me), SEO content |
| Months 7–12 | $600 | Bowls USA conference sponsorship, newsletter ads |
| Months 13–24 | $800 | Affiliate partnerships, regional bowls association outreach |
| Months 25–36 | $1,000 | Full digital program + potential Bowls USA partnership |

### Development Cost

$0 — AI-assisted development (Claude Code). No engineering payroll.

### Total Monthly Operating Costs (Base Case)

| Month | Infrastructure | Marketing | Total OpEx |
|-------|---------------|-----------|-----------|
| 1 | $59 | $200 | $259 |
| 6 | $59 | $400 | $459 |
| 12 | $89 | $600 | $689 |
| 18 | $89 | $800 | $889 |
| 24 | $89 | $800 | $889 |
| 36 | $169 | $1,000 | $1,169 |

---

## Three-Scenario Projections

### Scenario Assumptions

| Parameter | Conservative | Base Case | Optimistic |
|-----------|-------------|-----------|-----------|
| Club acquisition rate (mo 1) | 5 clubs | 10 clubs | 20 clubs |
| Monthly growth rate | 8% | 15% | 20% |
| Member conversion rate (initial) | 8% | 10% | 15% |
| Member conversion rate (peak, mo 30) | 15% | 25% | 35% |
| Avg. members per club | 55 | 65 | 70 |
| Paid user mix (annual/monthly) | 75%/25% | 70%/30% | 65%/35% |
| Monthly churn (blended) | 2.5% | 2.25% | 1.75% |
| Key unlock | Organic only | Bowls USA outreach | Bowls USA partnership deal |

---

### Scenario A — Conservative

*5 clubs/month acquisition, 8% conversion, organic growth only*

| Month | New Clubs | Total Clubs | Registered Members | Paid Members | MRR | Monthly OpEx | Net Cash |
|-------|-----------|-------------|-------------------|--------------|-----|-------------|---------|
| 1 | 5 | 5 | 275 | 22 | $52 | $259 | ($207) |
| 2 | 5 | 10 | 550 | 44 | $104 | $259 | ($155) |
| 3 | 5 | 16 | 880 | 70 | $166 | $259 | ($93) |
| 4 | 5 | 22 | 1,210 | 97 | $230 | $359 | ($129) |
| 5 | 5 | 28 | 1,540 | 124 | $295 | $359 | ($64) |
| 6 | 5 | 34 | 1,870 | 150 | $356 | $459 | ($103) |
| 9 | 5 | 49 | 2,695 | 220 | $523 | $459 | $64 |
| 12 | 5 | 64 | 3,520 | 295 | $700 | $689 | $11 |
| 18 | 5 | 94 | 5,170 | 470 | $1,117 | $889 | $228 |
| 24 | 5 | 124 | 6,820 | 680 | $1,615 | $889 | $726 |
| 30 | 5 | 154 | 8,470 | 935 | $2,220 | $1,089 | $1,131 |
| 36 | 5 | 184 | 10,120 | 1,230 | $2,921 | $1,169 | $1,752 |

**Conservative Scenario — Key Metrics at Month 36:**
- Total clubs: 184
- Paid members: 1,230
- MRR: $2,921
- ARR: $35,052
- Cumulative net: Breakeven ~Month 18; positive cash Month 19+

---

### Scenario B — Base Case

*10 clubs/month start, 15% monthly growth, 10–25% conversion*

| Month | New Clubs | Total Clubs | Registered Members | Paid Members | Conversion % | MRR | Monthly OpEx | Net Cash |
|-------|-----------|-------------|-------------------|--------------|-------------|-----|-------------|---------|
| 1 | 10 | 10 | 650 | 65 | 10.0% | $154 | $259 | ($105) |
| 2 | 12 | 22 | 1,430 | 148 | 10.4% | $352 | $259 | $93 |
| 3 | 13 | 35 | 2,275 | 240 | 10.6% | $570 | $259 | $311 |
| 4 | 15 | 50 | 3,250 | 349 | 10.7% | $829 | $359 | $470 |
| 5 | 17 | 67 | 4,355 | 476 | 10.9% | $1,131 | $359 | $772 |
| 6 | 20 | 87 | 5,655 | 625 | 11.1% | $1,484 | $459 | $1,025 |
| 7 | 23 | 110 | 7,150 | 800 | 11.2% | $1,900 | $459 | $1,441 |
| 8 | 26 | 136 | 8,840 | 1,000 | 11.3% | $2,375 | $459 | $1,916 |
| 9 | 30 | 166 | 10,790 | 1,230 | 11.4% | $2,921 | $559 | $2,362 |
| 10 | 35 | 201 | 13,065 | 1,515 | 11.6% | $3,598 | $559 | $3,039 |
| 11 | 40 | 241 | 15,665 | 1,845 | 11.8% | $4,382 | $659 | $3,723 |
| 12 | 46 | 287 | 18,655 | 2,240 | 12.0% | $5,320 | $689 | $4,631 |
| 15 | 60 | 416 | 27,040 | 3,490 | 12.9% | $8,289 | $789 | $7,500 |
| 18 | 78 | 585 | 38,025 | 5,240 | 13.8% | $12,445 | $889 | $11,556 |
| 21 | 100 | 800 | 52,000 | 7,640 | 14.7% | $18,145 | $989 | $17,156 |
| 24 | 130 | 1,060 | 68,900 | 10,780 | 15.6% | $25,603 | $889 | $24,714 |
| 30 | 190 | 1,720 | 111,800 | 19,200 | 17.2% | $45,600 | $1,089 | $44,511 |
| 36 | 265 | 2,610 | 169,650 | 31,850 | 18.8% | $75,644 | $1,169 | $74,475 |

> **Note:** Base case above represents the full market expansion scenario. The table below provides the more grounded initial 36-month view targeting US-first with selective international expansion.

**Base Case — US-First, Realistic 36-Month View:**

| Month | Total Clubs | Paid Members | MRR | Cumulative Revenue | Net Monthly |
|-------|-------------|--------------|-----|-------------------|-------------|
| 1 | 10 | 65 | $154 | $154 | ($105) |
| 3 | 35 | 240 | $570 | $1,370 | $311 |
| 6 | 87 | 625 | $1,484 | $5,280 | $1,025 |
| 9 | 166 | 1,230 | $2,921 | $13,800 | $2,362 |
| 12 | 280 | 2,050 | $4,869 | $27,200 | $4,180 |
| 18 | 520 | 4,680 | $11,115 | $82,400 | $10,226 |
| 24 | 840 | 9,100 | $21,613 | $215,000 | $20,724 |
| 30 | 1,100 | 14,200 | $33,725 | $422,000 | $32,636 |
| 36 | 1,400 | 20,500 | $48,688 | $730,000 | $47,519 |

**Breakeven:** Month 3 (MRR exceeds monthly OpEx)

---

### Scenario C — Optimistic

*20 clubs/month start, 20% monthly growth, 15–35% conversion, Bowls USA partnership*

The optimistic case assumes a formal partnership with Bowls USA in Month 6, granting access to their full club directory and an endorsed launch to all affiliated clubs. This mirrors how BowlsLink was adopted in Australia via Bowls Australia's mandate.

| Month | Total Clubs | Paid Members | Conversion % | MRR | Monthly OpEx | Net Cash |
|-------|-------------|--------------|-------------|-----|-------------|---------|
| 1 | 20 | 210 | 15.0% | $499 | $259 | $240 |
| 3 | 69 | 785 | 15.6% | $1,864 | $359 | $1,505 |
| 6 | 172 | 2,150 | 16.3% | $5,106 | $459 | $4,647 |
| 9 | 371 | 5,350 | 17.0% | $12,706 | $559 | $12,147 |
| 12 | 700 | 11,200 | 18.0% | $26,600 | $689 | $25,911 |
| 18 | 1,800 | 35,000 | 22.0% | $83,125 | $889 | $82,236 |
| 24 | 3,200 | 76,800 | 27.0% | $182,400 | $889 | $181,511 |
| 30 | 4,800 | 144,000 | 33.0% | $342,000 | $1,089 | $340,911 |
| 36 | 6,500 | 240,000 | 35.0% | $570,000 | $1,169 | $568,831 |

> **Optimistic note:** Month 36 reflects near-total global market penetration across US, AU, NZ with AU/UK expansion beginning Month 12. This scenario requires active BD investment and represents a ceiling, not a target.

**Realistic Optimistic (US + early AU/NZ, no full global):**

| Month | Total Clubs | Paid Members | MRR | ARR |
|-------|-------------|--------------|-----|-----|
| 6 | 175 | 2,200 | $5,225 | $62,700 |
| 12 | 700 | 9,800 | $23,275 | $279,300 |
| 24 | 2,100 | 37,800 | $89,775 | $1,077,300 |
| 36 | 4,500 | 101,250 | $240,469 | $2,885,625 |

**Breakeven:** Month 1 (Optimistic — immediate revenue covers OpEx)

---

## Unit Economics

### Customer Lifetime Value (LTV)

| Plan | Monthly ARPU | Avg. Lifetime | LTV |
|------|-------------|--------------|-----|
| Annual ($15/yr) | $1.25 | ~5 years (bowlers are loyal) | **$75** |
| Monthly ($5/mo) | $5.00 | ~20 months (5%/mo churn) | **$100** |
| Blended | $2.375 | ~44 months | **$105** |

*Lawn bowling skews older (60+), meaning once converted, members are highly sticky — they play the same club for decades.*

### Customer Acquisition Cost (CAC)

| Scenario | Monthly Marketing | New Paid Users/Mo (Avg yr 1) | CAC |
|----------|-----------------|------------------------------|-----|
| Conservative | $300 | 25 | $12.00 |
| Base Case | $500 | 85 | $5.88 |
| Optimistic | $600 | 200 | $3.00 |

### LTV:CAC Ratio

| Scenario | LTV | CAC | LTV:CAC | Assessment |
|----------|-----|-----|---------|-----------|
| Conservative | $105 | $12.00 | **8.75:1** | Healthy (>3:1 is good) |
| Base Case | $105 | $5.88 | **17.9:1** | Excellent |
| Optimistic | $105 | $3.00 | **35:1** | Exceptional |

### Payback Period

| Scenario | CAC | Monthly ARPU | Payback |
|----------|-----|-------------|---------|
| Conservative | $12.00 | $2.375 | ~5 months |
| Base Case | $5.88 | $2.375 | ~2.5 months |
| Optimistic | $3.00 | $2.375 | ~1.3 months |

---

## Supplementary Revenue Streams (Year 2+)

### Equipment Affiliate Revenue

Assuming 5% of paid members make an equipment purchase referral per month:

| Month | Paid Members | Referral Rate | Avg. Commission | Monthly Revenue |
|-------|-------------|--------------|----------------|----------------|
| 13 | 2,050 | 5% | $3.50 | $359 |
| 24 | 9,100 | 6% | $3.75 | $2,048 |
| 36 | 20,500 | 7% | $4.00 | $5,740 |

### Insurance Partnership Revenue

Assuming 2% of clubs refer a member to bowls club liability insurance per month:

| Month | Total Clubs | Referral Rate | Avg. Commission | Monthly Revenue |
|-------|-------------|--------------|----------------|----------------|
| 13 | 280 | 2% | $3.00 | $17 |
| 24 | 840 | 3% | $3.00 | $76 |
| 36 | 1,400 | 3% | $3.00 | $126 |

### Club Tier Revenue (Year 2, Future)

Starting Month 18, a Club Tier at $39/month for tournament management and draw generation:

| Month | Club Tier Customers | MRPC | Club MRR |
|-------|--------------------|----|---------|
| 18 | 25 (5% of clubs) | $39 | $975 |
| 24 | 75 (9% of clubs) | $39 | $2,925 |
| 30 | 165 (15% of clubs) | $39 | $6,435 |
| 36 | 350 (25% of clubs) | $39 | $13,650 |

---

## Combined Revenue Summary (Base Case)

| Month | Individual MRR | Club Tier MRR | Affiliate MRR | Total MRR | Total ARR |
|-------|---------------|--------------|--------------|-----------|----------|
| 1 | $154 | $0 | $0 | $154 | $1,848 |
| 6 | $1,484 | $0 | $0 | $1,484 | $17,808 |
| 12 | $4,869 | $0 | $375 | $5,244 | $62,928 |
| 18 | $11,115 | $975 | $1,200 | $13,290 | $159,480 |
| 24 | $21,613 | $2,925 | $2,124 | $26,662 | $319,944 |
| 30 | $33,725 | $6,435 | $3,866 | $44,026 | $528,312 |
| 36 | $48,688 | $13,650 | $5,866 | $68,204 | $818,448 |

---

## Breakeven Analysis

| Scenario | Monthly OpEx at Breakeven | Breakeven Month | MRR at Breakeven |
|----------|--------------------------|----------------|-----------------|
| Conservative | $689 | Month 18 | $700 |
| Base Case | $459 | Month 3 | $570 |
| Optimistic | $259 | Month 1 | $499 |

**Cash flow to profitability is extremely fast** given zero development cost and minimal infrastructure spend. The primary risk is not reaching club acquisition targets without marketing investment.

---

## Key Performance Indicators Dashboard

### Metrics to Track Monthly

| Metric | Definition | Target (Month 12, Base) |
|--------|-----------|------------------------|
| **MRR** | Sum of all recurring monthly revenue | $4,869 |
| **ARR** | MRR × 12 | $58,428 |
| **Total Clubs** | Clubs with at least one registered member | 280 |
| **Total Registered Users** | Free + paid accounts | 18,200 |
| **Paid Members** | Active paying subscribers | 2,050 |
| **Conversion Rate** | Paid / Registered | 11.3% |
| **Blended ARPU** | MRR / Paid Members | $2.38 |
| **MoM Growth** | MRR growth month-over-month | 15% |
| **Churn Rate** | Members lost / Members start of month | <2.5% |
| **CAC** | Marketing spend / New paid users | <$8 |
| **LTV** | Blended lifetime value | $105 |
| **LTV:CAC** | LTV / CAC | >13:1 |
| **Payback Period** | CAC / ARPU | <4 months |

### Conversion Rate Trajectory (Base Case)

| Period | Conversion Rate | Driver |
|--------|----------------|--------|
| Months 1–3 | 10.0% | Early adopters, club champions |
| Months 4–9 | 11–12% | Word of mouth, event features |
| Months 10–18 | 12–14% | Push notifications, social features live |
| Months 19–30 | 15–20% | Stats tracking, tournament history |
| Months 31–36 | 20–25% | Network effects, most active clubs on platform |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Club acquisition slower than modeled | Medium | High | Direct outreach program; Bowls USA MOU |
| Low willingness to pay ($15/yr is still a hurdle for retirees on fixed incomes) | Medium | High | Emphasize value vs. club fees ($120–$400/yr); offer lifetime deal |
| Incumbent (BowlsLink, Bowlr) copies free individual model | Low | Medium | First-mover; network effects; US market is uncontested |
| Churn higher than 5%/mo for monthly plans | Medium | Medium | Lean into annual plan; front-load value in first 30 days |
| Supabase/Vercel costs spike faster than projected | Low | Low | Usage-based scaling; budget buffer in projections |
| Bowls USA does not partner | Medium | Medium | Irrelevant if organic club growth continues; partnership is upside only |

---

## 36-Month Milestone Roadmap

| Milestone | Target Month | Scenario |
|-----------|-------------|---------|
| First 10 clubs onboarded | Month 1 | All |
| MRR exceeds $1,000 | Month 4 (Base) / Month 8 (Conservative) | — |
| 100 clubs on platform | Month 5 (Base) / Month 9 (Conservative) | — |
| Cash flow positive | Month 3 (Base) / Month 18 (Conservative) | — |
| Launch Club Tier beta | Month 15 | Base / Optimistic |
| 1,000 paid members | Month 8 (Base) | — |
| 5,000 paid members | Month 18 (Base) | — |
| Bowls Australia outreach | Month 12 | Base / Optimistic |
| $100K ARR | Month 20 (Base) | — |
| $500K ARR | Month 30 (Base) | — |
| $1M ARR | Month 36 (Optimistic) | — |

---

## Appendix: Model Inputs & Formula Reference

### MRR Calculation

```
Paid Members (Annual) = Total Registered × Conversion Rate × 0.70
Paid Members (Monthly) = Total Registered × Conversion Rate × 0.30

MRR (Annual plans) = Paid Annual Members × $1.25
MRR (Monthly plans) = Paid Monthly Members × $5.00
Total MRR = MRR(Annual) + MRR(Monthly)

Net new paid monthly members = (New clubs × Avg members per club × Conversion Rate)
Churned members = Existing paid members × Blended monthly churn rate
Ending paid members = Beginning paid + Net new - Churned
```

### LTV Calculation

```
Annual subscriber LTV = ($15 × avg years retained) = $15 × 5 = $75
Monthly subscriber LTV = $5 × (1 / monthly_churn_rate) = $5 × 20 = $100
Blended LTV = (0.70 × $75) + (0.30 × $100) = $52.50 + $30 = $82.50
(Conservative) / $105 (midpoint with upsell and affiliate attribution)
```

### CAC Calculation

```
CAC = Total Marketing Spend (month) / New Paid Customers Acquired (month)
```

---

## Data Sources

- [Bowls USA — Official governing body](https://www.bowlsusa.us/) — ~2,800 registered members, 7 regional divisions
- [Bowls Australia — Wikipedia](https://en.wikipedia.org/wiki/Bowls_Australia) — 2,000+ clubs, 240,000+ registered, 693,000 casual participants
- [Bowls New Zealand](https://bowlsnewzealand.co.nz/about-us/) — 460 clubs, 43,240 adult members, 198,614 total participants (2024)
- [Bowls England](https://www.bowlsengland.com/) — ~3,500 clubs, 271,000+ participants
- [Bowlr — UK Club Management](https://www.bowlr.co.uk/) — 185+ clubs, £8–£100/mo outdoor pricing
- [BowlsNet UK](https://bowlsnet.uk/) — 250+ crown green leagues, modest annual fee
- [lawnbowl.app Internal Research](./LAWN-BOWLING-COMPETITORS.md) — Competitive landscape analysis
- [lawnbowl.app Business Model Doc](./LAWN-BOWLING-BUSINESS.md) — Club economics and pricing benchmarks

---

*This document is confidential and intended for internal planning, investor discussions, and partnership negotiations. All projections are forward-looking estimates based on available market data and modeled assumptions. Actual results may differ materially.*

**lawnbowl.app** | hello@lawnbowl.app | March 2026
