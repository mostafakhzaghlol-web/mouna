# Accounts and approvals checklist

Outside accounts Mouna needs before launch, in the order to start them. All need the company's CR and VAT certificate unless noted. You (the founder) open and own every account. Never send passwords or API keys in chat: when a key is needed, you paste it into the project's secret store yourself (instructions will come with Stage 10).

Approval times are typical ranges, not promises. Start the long ones first.

Status: ☐ not started · ◐ applied, waiting · ☑ active

## Start now (December 2026)

| # | Account | Needed for | Stage | Typical wait | Notes | Status |
|---|---|---|---|---|---|---|
| 1 | **Domain** — `mouna.sa` (and `mouna.com.sa`) | All web addresses, email | 9 | Days | `.sa` domains are registered through an accredited registrar under SaudiNIC; the name must match the CR or trademark. Check availability first | ☐ |
| 2 | **Bank collection services** — virtual IBAN per client + SADAD biller number | Automatic payment matching | 8 | 4–8 weeks | Ask your bank's corporate team for "virtual accounts / collection" and SADAD biller registration | ☐ |
| 3 | **Card payment gateway** — mada, Visa/Mastercard, Apple Pay | Card-paying clients | 8 | 2–6 weeks | Pick one SAMA-licensed gateway (e.g. Moyasar, HyperPay, Tap, PayTabs). Ask each for B2B fees and settlement days | ☐ |
| 4 | **SMS sender name** ("Mouna") | One-time codes, delivery alerts | 4, 7 | 1–3 weeks | Through a local SMS provider (e.g. Unifonic, Taqnyat, Msegat); the provider registers the sender name with the regulator | ☐ |
| 5 | **WhatsApp Business Platform** | Approvals, delivery notices | 4, 7 | 1–3 weeks | Meta business verification with CR documents, then display name and message template approvals. Many SMS providers also offer WhatsApp — one provider for both is simpler | ☐ |
| 6 | **Cloud provider with a Saudi region** | Hosting staging and production | 10 | 1–4 weeks | Compare managed PostgreSQL, containers, storage and in-kingdom backups. Staging needed by February | ☐ |

## Start in January 2027

| # | Account | Needed for | Stage | Typical wait | Notes | Status |
|---|---|---|---|---|---|---|
| 7 | **Wathq API** (Ministry of Commerce) | CR lookup at client onboarding | 5 | 1–2 weeks | Subscription for commercial registration data | ☐ |
| 8 | **National Address API** (SPL) | Validating client site addresses | 5, 6 | 1–2 weeks | | ☐ |
| 9 | **Google Maps Platform** | Maps, geocoding, routes | 6 | Same day | Needs a billing card; set a monthly budget cap | ☐ |
| 10 | **Business email** on the domain (Google Workspace or Microsoft 365) + transactional email sender | Staff email; invoices and alerts to clients | 7 | Days | DNS records (SPF, DKIM, DMARC) so invoices don't land in spam | ☐ |
| 11 | **Accounting package** | Journal export | 8 | Days | Your accountant chooses (Odoo, Zoho Books, Qoyod, Daftra, SAP B1) | ☐ |
| 12 | **ZATCA Fatoora portal access** | E-invoicing device onboarding | 8, 10 | Days | Log in with the company's ZATCA (ERAD) credentials. Sandbox work needs no account; production onboarding happens in March with a one-time code you generate | ☐ |

## Before launch (February–March 2027)

| # | Item | Why | Status |
|---|---|---|---|
| 13 | **Tax advisor sign-off** on the monthly summary invoice and ZATCA design | Compliance | ☐ |
| 14 | **Lawyer review**: client terms of service, privacy policy, dispenser loan terms | Contracts with clients | ☐ |
| 15 | **Personal data (PDPL)**: check whether Mouna must register on SDAIA's data governance platform and appoint a data protection contact | Legal compliance | ☐ |
| 16 | **Penetration test firm** booked for mid-March | Security | ☐ |
| 17 | **SIMAH commercial membership** (optional) | Credit decisions | ☐ |

## Later (client mobile app, from June 2027)

| # | Account | Typical wait | Notes |
|---|---|---|---|
| 18 | **Apple Developer (organisation)** | 2–4 weeks | Needs a D-U-N-S number for the company — request it in spring, it can take weeks |
| 19 | **Google Play Console (organisation)** | Days–2 weeks | Organisation verification |

## Already done

| Item | Date |
|---|---|
| Company registered (CR, VAT) | Before 19 Nov 2026 |
| GitHub account with private repository `mouna` | 19 Nov 2026 |
