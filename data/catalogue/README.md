# Starter catalogue

`starter-products.csv` is the Phase 1 starter catalogue (washroom & hygiene, kitchen & pantry): 64 products, the range a Saudi supermarket such as Tamimi or Othaim carries for office kitchens and washrooms, plus Mouna's own dispenser refills.

It will be imported into the platform in Stage 2 and used as test data before then.

## Read before using the prices

- **All prices are estimates, not quotes.** Generic items use the buy and sell prices from the financial model v3 ("COGS & Products" sheet). Branded items are estimated relative to those. Prices are SAR **excluding VAT**.
- Replace `est_buy_sar` with real distributor quotes (open item in CLAUDE.md), then set `est_sell_sar` from the pricing policy.
- Brand list and pack sizes are typical of what Saudi supermarkets stock. Each item should be checked against the actual supplier's product list, barcode and pack size before going live.

## Columns

| Column | Meaning |
|---|---|
| `sku` | Mouna code: `WP` washroom paper, `SS` soap/sanitiser/fragrance, `CW` cleaning & waste, `BV` beverages, `KD` kitchen disposables & care |
| `phase` | 1 = sold from launch; 2 = office categories from month 25 |
| `department` | `washroom` or `kitchen` |
| `category` | Same five Phase 1 categories as the financial model |
| `brand` | `Mouna` = own-brand refill for Mouna dispensers; `Generic` = unbranded / private label |
| `name_en`, `name_ar` | Product name shown to clients |
| `pack_en`, `pack_ar` | What one unit contains |
| `unit` | The unit the client orders (pack, case, box, bottle…) |
| `units_per_carton` | How many units come in the supplier's carton (for purchasing and picking) |
| `est_buy_sar`, `est_sell_sar` | Estimated price per unit, excl. VAT |
| `dispenser_refill` | Dispenser model this refill fits: `DSP-TOWEL` hand towel, `DSP-SOAP` foam soap, `DSP-AIR` auto-spray air freshener |
