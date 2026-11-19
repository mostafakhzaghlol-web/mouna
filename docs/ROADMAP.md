# Mouna — build roadmap to go-live

Working agreement (19 Nov 2026): Claude builds the platform step by step as the engineering team (architecture, code, tests, infrastructure-as-code, documentation). The founder makes business decisions, owns all accounts and contracts, and does the steps that need a person, a signature, a payment or an official login.

Each stage ends with a **demo you can click through** and a **commit**. A stage is only marked done when its "done when" checks pass.

Status keys: ☐ not started · ◐ in progress · ☑ done

## Who does what

| Claude (the build team) | You (the founder) |
|---|---|
| Write all code: API, portal, back office, field web app, marketing site | Decide business rules when asked (open questions in `architecture/07`) |
| Database design, migrations, test data | Provide real data: products, buy/sell prices, suppliers, delivery zones |
| Automated tests, ZATCA sandbox tests | Create and pay for accounts: GitHub, cloud provider, domain, WhatsApp Business, SMS sender ID, card gateway, Wathq |
| Infrastructure-as-code and deployment scripts | Log in where an official identity or OTP is needed (ZATCA Fatoora portal, bank, government portals) and paste keys into the secret store yourself |
| Documentation and runbooks | Legal: terms of service, privacy policy, contracts reviewed by a lawyer |
| Explain every step and what it costs | Test with real office managers, drivers and pilot clients |

What Claude cannot replace, and you should plan for:
- **An independent security review / penetration test** before go-live (outside firm).
- **A tax advisor** sign-off on the ZATCA invoice design.
- **A person on call** after launch for production incidents. Claude can diagnose and fix when a session is open, but does not run in the background watching production.
- **Continuity**: Claude does not remember between sessions on its own. Everything needed to continue lives in this repository (`CLAUDE.md`, `docs/`, this roadmap). Start each work session in the `Documents\Mouna` folder.

## Stages

### Stage 0 · Workstation and accounts ◐
- ☑ Node.js 26 LTS (current LTS line) and pnpm 10 installed
- ◐ Docker Desktop installed but cannot run: virtualization is disabled in this computer's BIOS/firmware. Workaround in place: PostgreSQL runs inside the project without Docker (`pnpm db:local`). To fix properly, turn on Intel VT-x / AMD-V (SVM) in the BIOS. Docker is needed later for building production images, which CI can also do.
- ☑ Git repository created
- ☑ GitHub repository `mostafakhzaghlol-web/mouna` linked; `main` and `setup/foundations` pushed
- ☐ Outside accounts and approvals: see `docs/ACCOUNTS.md` (company is registered, so all can start)

**Done when:** `pnpm dev` starts the empty apps locally.

### Stage 1 · Foundations ◐ (target: 3 weeks)
- ☑ Monorepo: `apps/api`, `apps/portal`, `apps/ops`, `apps/field`, `apps/web`; `packages/brand`, `packages/i18n`, `packages/ui`
- ☑ Local environment: PostgreSQL running locally in UTF-8 (no Docker); migrations (`pnpm db:migrate`) and seed data (`pnpm db:seed`). Redis not needed until background jobs
- ◐ CI: GitHub Actions runs type-check, build and tests (with a PostgreSQL service) on every push; lint still to add
- ◐ Design system: brand tokens, fonts, Arabic/English with RTL, shell, buttons, form fields, cards, badges, error notes
- ◐ Identity: sign-in with one-time codes (WhatsApp for mobiles, email for addresses), rate limits, 5-try lock, cookie sessions per app, staff roles, client roles with site scope, audit log. Still to do: real WhatsApp/email delivery (Stage 7; codes show in the API log and a dev-only button for now) and a second factor for staff
- ☑ Accounts & sites: companies, legal entities (CR/VAT), billing accounts, sites with zones and short address, headcount history, cost centres, invited members; back-office screens and portal home

**Done-when check (20 Nov 2026): passed.** In the browser: admin signed in to the back office, created a client in Arabic with two sites and an invited client admin; she signed in on a phone-sized portal with a code and saw her company, role and both sites. Covered by 16 API tests.

Technical choices made in this stage: Node.js 26 LTS, pnpm workspaces + Turborepo, TypeScript 6 (TypeScript 7 is out but tooling support for NestJS decorators is not proven yet), Next.js 16 + Tailwind 4, NestJS 12, Drizzle ORM on PostgreSQL 17.

**Done when:** a Mouna admin can create a client company with two sites in the back office, invite a client admin, and the client admin can sign in to the portal in Arabic or English.

### Stage 2 · Catalogue and pricing ☐ (2 weeks)
- Products, variants, units, images, categories (Phase 2 categories hidden)
- List, tier and client price lists; margin floor; approved catalogue per client
- Arabic-aware search
- Import from Excel (your product list)

**Done when:** your real product list is imported and a client sees its own prices.

### Stage 3 · Purchasing, inventory and warehouse ☐ (4 weeks) — must be live by 1 March 2027
- Suppliers, purchase orders, goods receipt with lots and expiry
- Stock ledger, bins, reservations, counts, adjustments with approval
- Barcode scanning in the back office
- Supplier invoice three-way match

**Done when:** a purchase order is received with a scanner, stock appears in bins, and a count corrects it.

### Stage 4 · Ordering, approvals, budgets, standing orders ☐ (5 weeks)
- Catalogue → cart → request → approval rules → order
- Budgets with commitments and alerts
- Standing orders per site and delivery slot; review-before-cut-off
- Mobile-first portal and WhatsApp-link approvals

**Done when:** a requester orders on a phone, an approver approves from a link, budget updates, and the order lands on the right delivery slot.

### Stage 5 · Sales, onboarding and credit ☐ (3 weeks)
- Leads, site surveys, quotes, contracts
- Wathq CR lookup
- Credit applications, limits, available-credit check, holds

**Done when:** a rep converts a lead into an active client with a credit limit and a starter standing order.

### Stage 6 · Dispatch, field web app, dispensers ☐ (6 weeks)
- Zones, slots, route planning, pick lists, load check
- Field web app (offline): stops, proof of delivery, failed delivery, returns
- Dispenser fleet, install / service / remove jobs, refill compatibility

**Done when:** a full dry-run route runs on a phone with network switched off for part of it, and every POD syncs.

### Stage 7 · Notifications ☐ (2 weeks, overlaps)
- WhatsApp, SMS, email templates in Arabic and English; user preferences

**Done when:** every event in `architecture/05` §7 sends to a test phone.

### Stage 8 · Billing, ZATCA, payments, accounting export ☐ (5 weeks)
- Monthly summary invoice run, credit notes, PDF + XML
- ZATCA Phase 2: device onboarding, signing, QR, hash chain, clearance (sandbox first)
- Customer ledger, payments (virtual IBAN, SADAD, card), matching, statements, dunning
- Daily journal export to your accounting package

**Done when:** a month of test deliveries becomes ZATCA-cleared sandbox invoices, a payment is matched, and the journal file imports into the accounting package.

### Stage 9 · Marketing website ☐ (3 weeks, overlaps)
- Pages from `architecture/05` §2, cost-per-employee calculator, survey booking, sign-up

**Done when:** a lead from the website appears in the back office.

### Stage 10 · Production readiness ☐ (3 weeks)
- Staging and production on the KSA cloud (Terraform), backups, monitoring, alerts
- Security hardening; external penetration test; fixes
- ZATCA production onboarding
- Load and end-to-end tests; runbooks

**Done when:** the launch checklist in `architecture/06` §5 is complete.

### Stage 11 · Pilot and go-live ☐ (target: 1 April 2027)
- Pilot with 3–5 friendly clients for two weeks
- Fixes from the pilot; staff training
- Go-live

### Stage 12 · After launch ☐
- Auto-adjusted standing orders, forecasts, spike alerts
- Premium analytics
- Review of phone usage → client mobile app
- SSO, public API, client ERP connectors

## Log

| Date | What happened |
|---|---|
| 19 Nov 2026 | Architecture v0.1 written; decisions on payment, delivery, custom build, web first, separate accounting. Git repository created. Roadmap agreed. Node.js 26 LTS, pnpm 10 and Docker Desktop installed; restart needed to finish WSL2. |
| 19 Nov 2026 | After restart: Docker blocked by firmware virtualization setting; switched local DB to embedded PostgreSQL. Stage 1 started: monorepo with 4 web apps + API scaffolded; all build, type-check and pass tests; API health check reaches the database; portal verified in Arabic (RTL) and English. |
| 20 Nov 2026 | Founder confirmed: company registered, GitHub repo `mouna` exists, delivery covers all Riyadh, starter catalogue from supermarket-style range. Added accounts checklist (`docs/ACCOUNTS.md`) and 64-product starter catalogue (`data/catalogue`), prices still estimates. |
| 20 Nov 2026 | Code pushed to GitHub. Decided: no bank collection service (statement upload + reference matching), cards via existing Stripe account, sign-in codes and notifications by WhatsApp (email fallback, no SMS at launch). Founder buying the domain. |
| 20 Nov 2026 | Stage 1 core done: database schema + migrations, one-time-code sign-in, companies/sites/members API with role checks and audit log, back-office client screens, portal home. Fixed: local DB was WIN1252 (now UTF-8), wrong site count. 20 tests pass. CI added on GitHub. |
