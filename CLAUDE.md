# Mouna (مونة) — project memory

Context for Claude Code. Everything here was decided or produced in planning sessions up to 12 Nov 2026. Figures are projections from the founder's financial model, not results.

## What Mouna is

- A B2B supplier for companies in Saudi Arabia, founded by Mostafa Zaghlol.
- Clients order through a website and mobile app that controls their orders and analyses their consumption.
- Brand name: **Mouna (مونة)**, the Arabic word for household provisions kept in stock. Tagline: "Always stocked" / "مونة مكتبك، دايماً جاهزة".
- The name has only had a quick web search. Still to check: Ministry of Commerce commercial name, SAIP trademark, domain.

## Strategy (decided by the founder)

1. **Phase 1, Years 1–2:** specialise in two categories only: washroom & hygiene, and kitchen & pantry.
2. **Phase 2, from month 25:** sell other office categories (paper, toner, stationery, filing, IT accessories) to the existing clients.
3. Free dispensers (hand towel, soap, air freshener) installed at each client, so they buy Mouna refills.
4. Target clients: companies with more than 50 employees.

## Founder's planning criteria

| Item | Value |
|---|---|
| Companies in Saudi Arabia | 1,700,000 |
| Companies with more than 50 employees | 21,000 |
| Target by end of Year 2 | 10% of the 21,000 = 2,100 clients |
| Washroom + kitchen consumption | SAR 38 per employee per month |
| Investment | SAR 22M, one injection at month 1 |

## Investor deal (decided by the founder)

- Investor funds SAR 22M once, in January 2027.
- No repayment before the last year.
- SAR 22M is repaid at the end of Year 5 (Dec 2031).
- Plus 50% of cumulative five-year net profit (early losses deducted), paid within 6 months after Year 5 (by June 2032).
- The deal ends after that; the founder owns 100%.
- Base case: investor receives SAR 44.6M in total (2.0×, about 14% a year).
- Legal form not decided. A lawyer should set it (KSA legal and Zakat/tax treatment).

## Financial model, base case (v3)

File: `Office_Supplies_KSA_Financial_Model_v3_Target10pct.xlsx`. Model starts Jan 2027; sales start in month 4 (Apr 2027); Riyadh first.

| SAR millions | 2027 | 2028 | 2029 | 2030 | 2031 |
|---|---|---|---|---|---|
| Client companies (year end) | 526 | 2,096 | 2,414 | 2,732 | 3,044 |
| Revenue | 9.2 | 62.3 | 132.9 | 174.8 | 216.7 |
| Gross margin | 22.6% | 24.4% | 25.0% | 26.2% | 27.1% |
| EBITDA | (2.9) | (0.8) | 13.1 | 21.5 | 30.6 |
| Net profit | (3.1) | (1.6) | 10.1 | 16.5 | 23.4 |
| Team size | 31 | 89 | 93 | 104 | 114 |

- First EBITDA-positive month: month 20 (Aug 2028). Peak cash need: SAR 20.1M.
- Cumulative five-year net profit: SAR 45.3M.
- Cash at end of 2031 before the investor settlement: SAR 54.7M; about SAR 4.2M after it.
- Conservative scenario: 1,405 clients by Year 2, Year 5 revenue SAR 114M.

### Assumptions that are estimates, not validated

- Average client size: 100 employees. This was assumed, not given by the founder.
- All buy and sell prices on the "COGS & Products" sheet, except a few retail checks (A4 paper, HP toner, box files).
- About 150 new clients a month in Year 2; each field sales rep signs 10 a month.
- Clients pay in 45–55 days.
- Monthly churn 0.8–1.5%.
- Targets for Year 1 and Years 3–5 (2.5%, 11.5%, 13%, 14.5%) were suggested steps, not the founder's numbers.

### Known weak points

- Fixed costs are high, so profit falls much faster than sales if the client target is missed.
- Rent, management staff and the fixed marketing budget are entered by year and do not shrink with a smaller target.
- Revenue per employee (about SAR 1.9M) is well above the main competitor's (about SAR 0.9M), so staffing may be too thin.
- The model sheets show the business before the investor settlement; only the "Investor Returns" sheet shows it after.

## Platform to build (website + app)

Features agreed in planning:

- Company accounts with roles: employee requests, manager approves, finance sees.
- Budgets per department, branch or project, with alerts.
- Approved catalogue per company with negotiated prices.
- Automatic refills and standing orders.
- Consumption analysis: cost per employee, spend by branch, trends, unusual spikes, reorder forecast.
- One consolidated monthly ZATCA-compliant e-invoice (Phase 2 e-invoicing).
- Optional paid "Premium analytics" tier (SAR 299–349 a month in the model).
- Arabic and English.
- Web portal first; a light mobile app mainly for requests and approvals, built only after the portal is tested with real clients (decided 19 Nov 2026).

Decided 19 Nov 2026: credit terms with one consolidated monthly invoice (card for small/new clients); own Riyadh warehouse and own fleet; fully custom build (no off-the-shelf ERP); full feature set targeted for April 2027.

Architecture draft (v0.1, 19 Nov 2026) is in `docs/architecture/`: modular-monolith TypeScript stack (Next.js, NestJS, PostgreSQL; React Native/Expo only for the later client app), hosted in a KSA cloud region. Proposed, not yet approved by the founder. Open questions are in `docs/architecture/07-open-questions.md`.

Also decided 19 Nov 2026: launch is web only — marketing site, mobile-first client portal, back office, and an offline field web app (PWA) for drivers and technicians; no native apps at launch. General ledger, payroll and VAT returns stay in a separate accounting package; the platform exports journal entries to it.

Also decided 19 Nov 2026: Mouna is legally registered (CR and VAT in place). Delivery covers all of Riyadh city from launch. The starter catalogue uses the kitchen and washroom products commonly sold in Saudi supermarkets (Tamimi, Othaim type range); prices are estimates until distributor quotes arrive. Code lives in a private GitHub repository named `mouna`.

Not decided yet: cloud provider, payment gateway, bank, accounting package, client ERP integrations.

## Build

Claude is building the whole platform step by step as the founder's engineering team (agreed 19 Nov 2026). The stage plan, who-does-what and progress log are in `docs/ROADMAP.md`. Read it at the start of every work session, continue from the first unfinished stage, and update its status and log at the end.

## Brand identity (first direction)

- Logo: the letter "m" drawn as a tap with two arches (washroom and kitchen); the last stroke releases a saffron drop.
- Colours: Pine `#0F5C52` (primary), Saffron `#E9A23B` (accent, fills only), Ink `#12211E` (text), Mist `#C4DAD2`, Paper `#F6F8F5`.
- Fonts: Space Grotesk (headlines, wordmark), Inter (body, interface), IBM Plex Sans Arabic (Arabic).
- Voice: plain, practical, exact; no hype.

## Market and competitors

- Main competitor studied: EZ Order (shop.ezorder.com.sa). Riyadh since 2005; last reported sales SAR 93M in 2015; current revenue estimated at SAR 80–130M (estimate, not published).
- Others: Penny / Souq Penny, Lawazem, Kmiyat, Jarir, Amazon.sa, local stationers. Facility-management companies and hygiene brand dealers also supply washroom products.

## Deliverables so far

- Financial model v3 (current), plus v1 (full catalogue) and v2 (focused, small scale) kept for reference.
- Market study doc: https://claude.ai/artifact/NyEH2wJNe24Sh4VnnMnC2W (written for the earlier full-catalogue plan; its market sizing does not use the 21,000-company criteria).
- Investor one-pager (A4) and brand identity board: https://claude.ai/artifact/MTnDbtxNXWFMEvB5HhXDft

## Open items

- Validate SAR 38 per employee and the 100-employee average with 10–15 office managers.
- Get price lists from 2–3 KSA distributors and replace the estimated buy prices.
- Run a sales pilot to test 10 new clients per rep per month.
- Confirm the name legally and register domains.
- Choose the tech stack and plan the MVP.
- Decide the legal structure of the investor deal with a lawyer.
