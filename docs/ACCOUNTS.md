# Accounts and approvals checklist

Outside accounts Mouna needs before launch, in the order to start them. All need the company's CR and VAT certificate unless noted. You (the founder) open and own every account. Never send passwords or API keys in chat: when a key is needed, you paste it into the project's secret store yourself (instructions will come with Stage 10).

Approval times are typical ranges, not promises. Start the long ones first.

Status: ☐ not started · ◐ applied, waiting · ☑ active

## Start now (December 2026)

| # | Account | Needed for | Stage | Typical wait | Notes | Status |
|---|---|---|---|---|---|---|
| 1 | **Domain** — `mouna.sa` (and `mouna.com.sa`) | All web addresses, email | 9 | Days | Founder will purchase. `.sa` domains are registered through an accredited registrar under SaudiNIC; the name must match the CR or trademark | ☐ |
| 2 | **Stripe** — confirm settings | Card payments | 8 | Days | Account exists. Check: mada cards enabled, SAR settlement to Mouna's bank, business details match the CR. A test-mode key is enough until Stage 8 | ◐ |
| 3 | **WhatsApp Business Platform (Cloud API)** — connect the registered number | Sign-in codes, approvals, delivery notices | 1, 4, 7 | 1–2 weeks | Number is registered. Needed: Meta business verification complete, API access for the number, and approval of message templates (Arabic + English). I'll write the templates; you submit them in Meta Business Manager | ◐ |
| 4 | **Cloud provider with a Saudi region** | Hosting staging and production | 10 | 1–4 weeks | Compare managed PostgreSQL, containers, storage and in-kingdom backups. Staging needed by February | ☐ |
| — | ~~Bank collection services (virtual IBAN, SADAD)~~ | — | — | — | Not needed (decided 20 Nov 2026). Clients pay by transfer quoting the invoice number; you'll need to download the bank statement daily as CSV/Excel | — |
| — | ~~SMS sender name~~ | — | — | — | Not at launch: codes go by WhatsApp, email as fallback. Revisit after the pilot | — |

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
| GitHub repository `mostafakhzaghlol-web/mouna`, code pushed | 20 Nov 2026 |
| Stripe account | Before 20 Nov 2026 |
| WhatsApp Business number registered | Before 20 Nov 2026 |
| Saudi phone number | Before 20 Nov 2026 |
