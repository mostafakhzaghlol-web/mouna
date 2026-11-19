# 05 · User experience

## 1. Experience principles

1. **"Nothing to do" is the best screen.** When a site is stocked, budgets are fine and nothing waits for approval, the home screen says so in one line. Work appears only when there is work.
2. **Approve in one tap, from anywhere.** Approvers are busy managers. An approval arrives on WhatsApp or push, opens straight on the request, and is approved without logging in again (device trusted, short-lived link).
3. **Reorder in three taps.** "Same as last time", "add to Tuesday's delivery", done.
4. **Always show the next delivery.** Date, window, what is on it, and until when it can be changed.
5. **Arabic first.** RTL layout by default, Arabic product names written for office managers (not supplier codes), Hijri and Gregorian dates, Arabic-Indic or Western digits by user choice, amounts in SAR with VAT shown separately.
6. **Speak like the brand.** Plain, practical, exact. "Your delivery is on Tuesday, 9–11." Not "Your awesome order is on its way! 🚀".
7. **Every number can be opened.** A spend figure opens the orders behind it; an invoice line opens the delivery and the signed POD.

Visual system from the brand board: Pine `#0F5C52` for primary actions and navigation, Saffron `#E9A23B` only as fill for highlights and status (never text), Ink `#12211E` text, Mist `#C4DAD2` borders and quiet surfaces, Paper `#F6F8F5` background. Space Grotesk for headings, Inter for interface, IBM Plex Sans Arabic for Arabic.

## 2. Marketing website — `mouna.sa`

```
Home
├── How it works          (survey → free dispensers → standing order → one monthly invoice)
├── What we supply
│   ├── Washroom & hygiene
│   └── Kitchen & pantry
├── For companies         (approvals, budgets, analytics, ZATCA invoice)
├── Free dispensers       (the programme, terms, models)
├── Pricing approach      (contract pricing; sample savings calculator per employee)
├── About / contact
├── Book a site survey    (lead form → sales rep)
├── Sign up               (small companies, card payment)
└── Log in                → app.mouna.sa
```

Key element: a **cost-per-employee calculator** — enter headcount and current monthly spend; it shows the Mouna estimate and books a survey.

## 3. Client portal — `app.mouna.sa`

### Site map

```
Home (role-aware)
├── Order
│   ├── Catalogue            (approved items, refills for my dispensers first, search AR/EN)
│   ├── Quick reorder        (last orders, favourites, "same as last time")
│   ├── Cart                 (site, cost centre, budget remaining, delivery date)
│   └── My requests
├── Approvals                (inbox, history, delegate while away)
├── Deliveries
│   ├── Upcoming             (per site: date, window, contents, change-until time)
│   ├── Standing orders      (per site: items, frequency, auto-adjust, pause)
│   └── History + delivery notes + PODs
├── Budgets                  (by cost centre / site / project, committed vs actual)
├── Insights
│   ├── Overview             (spend, cost per employee, vs last period)
│   ├── By site / by department / by category
│   ├── Spikes & alerts
│   └── Forecast & benchmarks   (Premium)
├── Billing
│   ├── Invoices             (PDF + XML, per-site breakdown, Excel)
│   ├── Statement & ageing
│   └── Pay                  (bank details + reference to quote, pay by card)
├── Dispensers               (installed units per site, report a fault)
├── Support                  (raise issue on a delivery, track tickets)
└── Company settings
    ├── Users & roles
    ├── Sites & headcount
    ├── Cost centres
    ├── Approval rules
    ├── Billing accounts & PO rules
    └── Notifications & language
```

### Home screen by role

| Role | Home shows |
|---|---|
| Requester | Next delivery for my site · my open requests · "Order" button · favourites |
| Approver | Waiting for you (count, oldest first) · next delivery to review before cut-off · budget status in my scope |
| Receiver | Today's / next delivery with window and driver · "Confirm delivery" · "Running low? Tell us" |
| Finance | Amount due and next due date · last invoice · budget alerts · spend this month vs last |
| Admin | All of the above in summary + setup checklist until the account is fully configured |

### Key screens

**Upcoming delivery (review before cut-off)**
```
┌───────────────────────────────────────────────────────────┐
│ Riyadh HQ · Tuesday 25 Nov · 9:00–11:00                   │
│ Changes possible until Mon 24 Nov, 9:00  (20h left)       │
├───────────────────────────────────────────────────────────┤
│ Standing order · auto-adjusted                            │
│  Hand towel Z-fold, carton      6  (usual 5, +1 headcount)│
│  Foam soap refill 1L           12                         │
│  Coffee beans 1kg               4                         │
│  ...                                                      │
│ + 2 approved requests merged                              │
├───────────────────────────────────────────────────────────┤
│ Total SAR 3,420 + VAT · Facilities budget: 68% used       │
│ [ Approve as is ]   [ Edit ]   [ Skip this delivery ]     │
└───────────────────────────────────────────────────────────┘
```

**Approval (mobile, from a notification)**
```
┌─────────────────────────────┐
│ Request from Sara · HR      │
│ Jeddah branch               │
│ 8 items · SAR 1,240 + VAT   │
│ HR budget after: 91% ⚠      │
│ ─────────────────────────── │
│ Tea bags 100s        ×10    │
│ Paper cups 7oz       ×20    │
│ ... show all                │
│ ─────────────────────────── │
│ [ Approve ]  [ Edit ]  [ ✕ ]│
└─────────────────────────────┘
```

**Insights overview**
- Top row: Spend this month · Cost per employee (vs last month, vs company target) · Deliveries on time % · Open requests.
- Chart: monthly spend by category, last 12 months.
- Table: sites ranked by cost per employee, with spikes flagged.
- Premium adds: next-month forecast, benchmark against similar-size companies (anonymised), export to Excel / API.

## 4. The portal on a phone (launch) and the client app (later)

At launch there is no client app. The portal is designed **mobile-first** for the people who use it on phones (approvers, receivers, requesters):

- On a phone the portal shows a bottom bar with the same five sections the future app will have (below), so moving to the app later feels familiar.
- WhatsApp links open straight on the request or delivery, signed in through a trusted-device session; approve, edit or reject in one tap.
- The receiver confirms a delivery by reading out a one-time code sent by WhatsApp, or by signing on the driver's phone; no login needed.
- The portal can be added to the home screen (PWA), so frequent users get an app icon without an app store.
- What testers do on their phones (which screens, how often, what fails) is measured and decides what the native app must do better.

**Client app (after testing)** — five tabs, kept deliberately small:

| Tab | Content |
|---|---|
| **Home** | Next delivery, items waiting for me |
| **Order** | Search, favourites, quick reorder, cart |
| **Approvals** | Inbox with swipe to approve / reject (approvers only) |
| **Deliveries** | Track today's van, confirm receipt with code, report issue with photo |
| **More** | Invoices (view only), dispensers, support, profile, language |

Everything else (settings, rules, budgets setup, detailed analytics) stays in the web portal.

## 5. Back office — `ops.mouna.sa`

```
Dashboard          (today: orders, routes, stock alerts, ZATCA errors, overdue, tickets)
Sales
├── Leads & pipeline
├── Site surveys
├── Quotes & contracts
└── Targets            (per rep: signed clients / month vs 10 target)
Clients
├── Companies → sites, users, contract, price list, dispensers, orders, ledger, health
├── Act on behalf
└── Onboarding queue
Catalogue
├── Products & units
├── Price lists & client prices   (margin floor warnings)
└── Dispenser models & compatibility
Orders
├── All orders / on hold / exceptions
└── Standing orders overview
Warehouse
├── Receiving
├── Stock & lots     (expiry alerts)
├── Picking & packing
├── Counts & adjustments
└── Transfers         (when more cities open)
Dispatch
├── Zones & slots
├── Route planning     (map + list, drag stops between vans)
├── Live tracking
└── Failed deliveries
Field service
├── Dispenser fleet   (by status, by site)
└── Service jobs
Purchasing
├── Suggested POs
├── Purchase orders
├── Suppliers & prices
└── Supplier invoices & matching
Finance
├── Invoice run & review
├── ZATCA submissions
├── Credit notes
├── Payments & matching
├── Credit control    (limits, holds, ageing, dunning)
└── Reports           (revenue, margin by client/category, DSO)
Support
└── Tickets
Admin
├── Staff & roles
├── Integrations
├── Notification templates
└── Audit log
```

Design note: the back office is dense by design — tables with filters, keyboard shortcuts, bulk actions. Speed for staff matters more than looks.

## 6. Field web app (drivers and technicians) — `field.mouna.sa`

Installed to the home screen of company Android phones. Opens and works without network; everything done offline is queued and sent when the phone reconnects, with a clear "3 items waiting to sync" banner.

```
Today
├── Trip overview          (stops on map and list, van load)
├── Load check             (scan every package)
├── Stop
│   ├── Navigate
│   ├── Contacts & access notes
│   ├── Deliver            (per line: delivered / short / damaged)
│   ├── Receiver code or signature + photo
│   ├── Service jobs here  (install / service / remove dispenser, scan serial)
│   ├── Collect returns
│   └── Failed delivery    (reason + photo)
└── End of day             (returns to warehouse, cash/card if any, sync)
```

Works offline for the whole trip. Large buttons, Arabic and English, readable in sunlight (high contrast mode).

## 7. Notifications

| Event | Who | Channel |
|---|---|---|
| Request waiting for approval | Approver | WhatsApp, email digest |
| Request approved / rejected | Requester | WhatsApp or email, in-portal |
| Delivery ready to review (standing order) | Site approver | WhatsApp |
| Cut-off in 4 hours, not reviewed | Site approver | WhatsApp, email |
| Delivery today with window and driver | Receiver | WhatsApp |
| Delivered, delivery note ready | Receiver, requester | In-app |
| Budget at 80% / 100% | Budget owner, Finance | Email, in-app |
| Spike detected | Admin, account manager | Email |
| Invoice issued | Finance | Email with PDF + Excel |
| Payment due / overdue | Finance | Email, WhatsApp |
| Credit hold | Admin, Finance | Email, WhatsApp |

Users choose channels per event type; mandatory ones (invoices, credit hold) cannot be switched off. App push notifications are added when the client app launches.
