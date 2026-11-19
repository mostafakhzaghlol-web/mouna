# 07 · Open questions

Business gaps that change the design. Each has the assumption used in these documents until the founder decides.

## Commercial

| # | Question | Why it matters | Assumed for now |
|---|---|---|---|
| 1 | Is the tech team (~11 people during build) included in the model's 31 people for 2027, and in its costs? | Budget and hiring timeline | Not checked yet |
| 2 | Minimum order value or minimum monthly spend per site? | Route economics; dispenser programme | Minimum monthly refill spend set per contract |
| 3 | Do clients pay delivery fees? Urgent delivery fee? | Pricing rules, invoice lines | Regular slot free; urgent extra delivery charged |
| 4 | What happens to dispensers when a client leaves — return, or charge? | Contract terms, asset tracking | Returned within 30 days or charged at fixed value |
| 5 | Will Mouna accept small companies (< 50 employees) through website sign-up with card payment? | Marketing site, onboarding flow | Yes, card-only, no free dispensers |
| 6 | Price changes: how often, with how much notice to clients? | Price list validity, contract | Quarterly, 30 days' notice |

## Operations

| # | Question | Why it matters | Assumed for now |
|---|---|---|---|
| 7 | Delivery frequency: weekly for everyone, or by site size? | Slots, routes, standing orders | Weekly; large sites twice a week |
| 8 | Do drivers also install and service dispensers, or separate technicians? | Field app roles, staffing | Drivers do simple swaps; technicians install and repair |
| 9 | Do sites have limited storage (one week of stock) or can they hold a month? | Forecast buffer, delivery frequency | One to two weeks |
| 10 | Will clients' office boys/receivers have smartphones and accounts? | Receiver role, POD by code | Yes; fallback is signature on driver device |
| 11 | When will the second city open, and with its own warehouse? | Multi-warehouse from day one | Data model supports it; only Riyadh at launch |
| 11a | ~~Which Riyadh areas are served at launch?~~ | Zones, slots, fleet size | **Decided 19 Nov 2026:** all of Riyadh city. Proposed: districts grouped into 5 zones (North, East, Central, West, South), each zone on fixed delivery days; exact district-to-zone mapping to be confirmed by dispatch |

## Finance and legal

| # | Question | Why it matters | Assumed for now |
|---|---|---|---|
| 12 | Is the monthly summary tax invoice confirmed with the tax advisor, and the issuance deadline? | Billing design | Allowed; issued by the 15th of the following month |
| 13 | Mouna's ZATCA Phase 2 integration wave as a new taxpayer? | When clearance is mandatory | Build compliant from the first invoice |
| 14 | ~~Virtual IBANs and SADAD?~~ | Payment matching | **Decided 20 Nov 2026:** not needed. Bank transfers matched from uploaded statements by invoice reference |
| 15 | ~~Card gateway choice?~~ | Integration work | **Decided 20 Nov 2026:** existing Stripe account. To check: mada cards accepted and SAR settlement |
| 16 | Will Mouna use SIMAH reports for credit decisions? | Credit flow | Manual upload at launch |
| 17 | ~~Accounting: does Mouna's own bookkeeping (general ledger, payroll, VAT returns) also live in the platform?~~ | "Fully custom" scope | **Decided 19 Nov 2026:** separate accounting package. The platform produces sales, purchasing, stock and payment records and exports them as journal entries. Which package is still open |

## Product

| # | Question | Why it matters | Assumed for now |
|---|---|---|---|
| 18 | What exactly is in Premium analytics (SAR 299–349/month) vs the free dashboard? | Feature gating, pricing | Free: spend, cost per employee, by site/category. Premium: forecast, benchmarks, unlimited exports, API |
| 19 | Will large clients need integration with their procurement systems (punch-out, SAP Ariba, Coupa) at launch? | API scope | After launch, on request |
| 20 | Government or semi-government clients (Etimad, specific tender rules)? | Compliance, invoicing | Not in Phase 1 |
| 21 | Domain names confirmed (`mouna.sa`, `mouna.com.sa`)? | All URLs in this design | Placeholder until registered |
