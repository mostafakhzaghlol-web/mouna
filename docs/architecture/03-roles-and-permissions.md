# 03 · Roles and permissions

A user can hold several roles in a company. Every role has a **scope**: the whole company, or chosen sites and cost centres. A site manager in Jeddah sees only Jeddah.

## 1. Client roles

| Role | Typical person | Can do |
|---|---|---|
| **Company admin** | Office / admin manager at head office | Everything in the company: users, sites, cost centres, approval rules, budgets, standing orders, settings |
| **Approver** | Department head, site manager | Approve, edit or reject requests in their scope, up to their approval limit |
| **Requester** | Any employee allowed to ask for supplies | Browse the approved catalogue, create requests, see their own requests |
| **Receiver** | Office boy, receptionist, facilities staff | See upcoming deliveries for their site, confirm receipt with a one-time code, report shortages or damage |
| **Finance** | Accountant, finance manager | Invoices, statements, payments, budgets, all spend reports; can approve over-budget requests if a rule says so |
| **Viewer** | Senior management, procurement | Read-only dashboards and reports in scope |

### Client permission matrix

| Action | Admin | Approver | Requester | Receiver | Finance | Viewer |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Browse approved catalogue and prices | ✓ | ✓ | ✓ | – | ✓ | ✓ |
| Create a request | ✓ | ✓ | ✓ | ✓ ¹ | – | – |
| Approve / reject / edit a request | ✓ | ✓ ² | – | – | ✓ ³ | – |
| Create or change standing orders | ✓ | ✓ ² | – | – | – | – |
| Confirm delivery, report issues | ✓ | ✓ | – | ✓ | – | – |
| See invoices, statements, pay online | ✓ | – | – | – | ✓ | – |
| Set budgets | ✓ | – | – | – | ✓ | – |
| Set approval rules | ✓ | – | – | – | – | – |
| Manage users, sites, cost centres | ✓ | – | – | – | – | – |
| Consumption and spend analytics | ✓ | ✓ ² | – | – | ✓ | ✓ |
| Premium analytics (forecast, benchmarks, exports) | ✓ ⁴ | ✓ ⁴ | – | – | ✓ ⁴ | ✓ ⁴ |

¹ Receivers can raise a request for refills they see running out (common in practice: the office boy knows first).
² Within their sites / cost centres and approval limit.
³ Only for rules that route to Finance (e.g. over budget).
⁴ Only if the company has the Premium analytics tier.

## 2. Mouna roles (back office)

| Role | Can do |
|---|---|
| **Super admin** | System settings, roles, integrations, ZATCA configuration. Two people at most |
| **Sales rep** | Leads, site surveys, quotes, onboarding of own clients; sees own clients only |
| **Sales manager** | All sales data, targets, contract approval up to a discount limit |
| **Account manager** | Day-to-day relationship with active clients: standing orders on the client's behalf, price changes (with approval), complaints |
| **Catalogue & pricing manager** | Products, units, images, list and tier prices, client price lists (with margin floor check) |
| **Credit controller** | Credit applications, limits, holds and releases, collections, dunning |
| **Finance / billing** | Monthly invoice run, credit notes, ZATCA errors, payment matching, supplier payments |
| **Purchasing** | Suppliers, supplier prices, purchase orders, receiving disputes |
| **Warehouse lead / staff** | Receiving, putaway, picking, packing, counts, adjustments (adjustments above a value need lead approval) |
| **Dispatcher** | Delivery zones and slots, daily route plans, van and driver assignment, live tracking, rescheduling |
| **Driver** | Field app: own trip, proof of delivery, returns collection |
| **Technician** | Field app: dispenser install, service and removal jobs |
| **Support agent** | Tickets, delivery issues, returns requests; read access to a client's orders and deliveries |
| **Management** | Read-only dashboards across the business |

Sensitive actions need a second person ("four-eyes"): credit limit increase above a threshold, price below margin floor, stock write-off above a threshold, invoice cancellation, refund.

## 3. Mouna staff acting for a client

Account managers and support agents often need to act inside a client's account ("place this order for us"). They do it through **act-on-behalf**: the action is recorded with both identities ("placed by Mouna account manager X on behalf of Company Y"), follows the client's approval rules, and is visible to the client admin.
