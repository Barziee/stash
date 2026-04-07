# UI Redesign — Design Spec

**Date:** 2026-04-07
**Scope:** Full visual overhaul + income privacy toggle + yearly overview

---

## 1. Design Direction

**Dark Finance** — dark background, green accents, Revolut/Robinhood feel.

| Token | Value |
|---|---|
| Background | `#0f0f13` |
| Surface | `#1a1a24` |
| Surface raised | `#252535` |
| Border | `#22222e` |
| Text primary | `#ffffff` |
| Text secondary | `#888888` |
| Text muted | `#444444` |
| Accent green | `#3ecf8e` |
| Danger red | `#f56565` |
| Warning yellow | `#f6c90e` |

Dark-only — no light mode toggle.

Apply globally via `globals.css` CSS variables + Tailwind config. All existing shadcn components inherit via variable overrides.

---

## 2. Dashboard Screen

### 2a. Month Navigation — Horizontal Scroll Strip

Replace the `◀ April 2026 ▶` arrow row with a horizontally scrollable strip of month chips.

- Each chip shows: month abbreviation (3 letters) + net savings for that month (green if positive, red if negative)
- Current month chip is highlighted (surface-raised bg, green text, subtle green border)
- Future months show `—` and are dimmed (opacity 40%)
- Tapping any chip sets the active month (updates hero + chart + transactions below)
- Strip scrolls horizontally; starts scrolled so current month is visible

Below the strip, a **year savings bar**:
- Label: `2026 Savings · ₪XX,XXX`
- Slim 4px progress bar (green fill) showing YTD savings vs annual salary × 12

### 2b. Hero Balance

Large centered balance number:
- Label: `BALANCE` (9px, 2px letter-spacing, muted)
- Amount: 38px, weight 800, white
- Trend: `↑ X% vs last month` in green (or `↓` in red)

### 2c. Income / Spent Cards

Two cards side by side (`grid-cols-2`), surface background, 12px radius:
- INCOME card: green amount
- SPENT card: red amount

### 2d. Spending Chart

Existing Recharts donut — no structural changes, just restyled colors to match dark theme (transparent background, white legend text).

---

## 3. Privacy Mode (👁 Hide)

A persistent toggle button in the top-right of the dashboard header.

**Hidden state hides:**
- Hero balance (CSS `filter: blur(8px)`, `user-select: none`)
- Income card amount (same blur)

**Hidden state keeps visible:**
- Spent card amount
- Spending donut chart
- All transaction amounts
- All budget amounts

**Button states:**
- Default: dark surface bg, muted text, `👁 HIDE`
- Active: green tinted bg (`#3ecf8e22`), green border (`#3ecf8e44`), green text, `👁 SHOW`

**Persistence:** Store in `localStorage` key `privacy_mode` (boolean). Survives page refresh — so if you hand the phone to Itamar, it stays hidden until you tap again.

---

## 4. Transaction Rows

Replace current emoji + plain text rows with:

- **Left border stripe**: 4px wide, full row height, category color, 2px border-radius
- Category name (12px, weight 500, primary text)
- Notes below if present (10px, muted)
- Date below (10px, muted)
- Amount right-aligned (13px, weight 600, green for income / red for expense)
- Delete button removed from row — replaced with swipe-to-delete gesture (long press → trash icon appears) to keep rows clean

**Filter row:** Replace Select dropdowns with pill buttons (`ALL`, `EXPENSES`, `INCOME`). Active pill gets green accent bg.

---

## 5. Budget Cards

Slim redesign inside existing `BudgetCard` component:

- Category color dot (8px circle) + name, no emoji in header
- Amount label right-aligned: `₪XX spent / ₪XX limit`
- Progress bar: 4px height, rounded, gradient fill:
  - Under 80%: `#3ecf8e → #45d68f`
  - 80–99%: `#f6c90e → #f7d325`
  - 100%+: `#f56565 → #f87171`
- Over-budget card gets a subtle red border glow (`border: 1px solid #f5656522`)
- "Over budget" / "Near limit" text replaces Badge component (plain styled `span`)

---

## 6. Global App Shell

- Background: `#0f0f13` full page
- Bottom nav (mobile): dark surface bg, active tab in green
- Sidebar (desktop): same dark surface, active item gets green accent left border

---

## 7. Components Changed

| Component | Change |
|---|---|
| `app/globals.css` | Dark theme CSS variables |
| `app/dashboard/page.tsx` | Month strip, hero, privacy toggle |
| `components/dashboard/MonthlySummary.tsx` | Dark card styling |
| `components/dashboard/SpendingChart.tsx` | Dark chart colors |
| `components/transactions/TransactionItem.tsx` | Left border stripe, remove delete button from row |
| `components/transactions/TransactionFilters.tsx` | Replace selects with pill buttons |
| `components/budgets/BudgetCard.tsx` | Slim progress bar, glow border |
| `components/layout/BottomNav.tsx` | Dark styling, green active |
| `components/layout/Sidebar.tsx` | Dark styling, green active |
| `hooks/usePrivacyMode.ts` | New hook — localStorage toggle |

**New files:**
- `hooks/usePrivacyMode.ts` — `usePrivacyMode(): [boolean, () => void]`
- `components/dashboard/MonthStrip.tsx` — horizontal scroll strip + year savings bar

---

## 8. Out of Scope

- Animations / transitions (can add later)
- Swipe-to-delete implementation (kept as stretch goal; delete button stays for now to keep scope tight)
- Settings screen restyling (functional, not a priority)
