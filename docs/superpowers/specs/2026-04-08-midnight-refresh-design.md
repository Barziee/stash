# Midnight Refresh — Design Spec

**Date:** 2026-04-08
**Branch:** `feat/midnight-refresh`
**Scope:** New color palette + 3 features + improved UI + 3 new test suites

---

## 1. Color Palette — Midnight Indigo

Replaces the neutral charcoal theme with a deep indigo/violet dark palette.
All colors are CSS custom properties in `globals.css` — components consume them via Tailwind utilities and `var()` references.

| Token | Old | New |
|---|---|---|
| Background | `#111113` | `#0c0d18` |
| Surface (card) | `#191919` | `#131425` |
| Surface raised | `#222224` | `#1a1c30` |
| Border | `#272729` | `#1f2140` |
| Text primary | `#d1d1d4` | `#dde0f5` |
| Text muted | `#666668` | `#6b72a8` |
| Primary accent | `#4a9e78` (green) | `#7c6ff7` (violet) |
| Income | — | `#3ecf8e` (emerald) |
| Spend | `#a84444` | `#f0736a` (coral) |
| Warning | `#9e8030` | `#e8a838` (amber) |

Two new semantic variables added: `--income` and `--spend`. These decouple UI intent (good/bad money) from the primary accent, making it easy to theme independently.

---

## 2. Feature: Transaction Edit

**File:** `components/shared/EditTransactionModal.tsx`

Bottom-sheet modal pre-filled from an existing `Transaction`. Supports editing: amount, category, currency, type (expense/income), date, notes. Calls `updateTransaction()` on save.

Edit button added to `TransactionItem` — visible on hover (opacity transition). Both edit and delete buttons share the same hover group, keeping the UI clean when not interacting.

---

## 3. Feature: Transaction Search

**File:** `lib/transactions/filter.ts` (pure function, testable)

Search input added to the Transactions page. Filters the current month's transactions by:
- Notes (substring, case-insensitive)
- Category name (substring, case-insensitive)

Combines with existing type + category dropdown filters. Shows result count when a search term is active. Clear button resets search.

The filter logic lives in a pure function (`filterTransactions`) separate from the component, enabling straightforward unit testing without React.

---

## 4. Feature: Spending Forecast Widget

**File:** `components/dashboard/SpendingForecast.tsx`

Appears on the dashboard (current month only) below the stat chips. Projects end-of-month spend as: `dailyAvg × daysInMonth`.

Visual: progress bar with a salary target marker line. Fill color transitions green → amber → red as the projection approaches/exceeds salary. Shows "expected saving" or "expected overshoot" in the footer.

---

## 5. UI: Improved TransactionItem

Replaced the left color stripe indicator with a circular category icon badge (emoji + semi-transparent category-colored background). Matches the pattern used by Revolut and Monzo — icon + color communicates category faster than color alone.

---

## 6. UI: Empty State

`TransactionList` now shows a 🪹 empty nest emoji + Hebrew text when there are no transactions, instead of the plain English "No transactions" text.

---

## 7. Tests Added

| File | Coverage |
|---|---|
| `__tests__/lib/filter.test.ts` | `filterTransactions` — 9 cases: all filters, combinations, edge cases |
| `__tests__/components/TransactionItem.test.tsx` | render, amounts, notes, icon fallback, date, delete |
| `__tests__/components/TransactionList.test.tsx` | renders list, empty state, notes, amounts |

All 31 tests pass (including existing 22).
