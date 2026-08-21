````markdown
name=.github/PR_DESCRIPTION_feature_ledger_advances.md

# Draft PR: feature/ledger-advances

Status: READY FOR REVIEW (draft PR not yet created) — I finished the feature work and attached screenshots. Please create the draft PR from branch `feature/ledger-advances` or allow me to create it for you (I need PR creation permission).

Summary

This branch implements advance/adjustment-aware transactions, refactors transaction types, scopes data to users, and adds a sci‑fi theme polish across pages.

Key changes

- DB migration (additive): adds transaction_type enum and optional relation columns (see db/migrations/20260821_add_transaction_type_and_relations.sql)
- Domain logic: tracker summarise now includes transactions linked via related_record_id and calculates principal, extra, advances and remaining principal separately.
- Transactions: new transaction types (principal, monthly_extra, advance_given, advance_received, principal_adjustment, extra_adjustment, other); transactions page uses new field names; per-transaction view & edit routes added.
- UI: sci‑fi theme (scoped under `.sci-fi`) applied to the app shell and shared UI primitives (StatCard, TxnIcon, EmptyState). Polished Dashboard, People, Transactions, Reminders pages.
- People: Add Person and inline Remove Person flow added (uses confirmation dialog before destructive delete).

Files of interest (high level)

- db/migrations/20260821_add_transaction_type_and_relations.sql
- src/lib/tracker.ts (summary & totals)
- src/routes/_authenticated/dashboard.tsx
- src/routes/_authenticated/people.tsx
- src/routes/_authenticated/transactions.tsx
- src/routes/_authenticated/transactions/$id.tsx
- src/routes/_authenticated/transactions/$id.edit.tsx
- src/components/app-shell.tsx (applies sci‑fi theme)
- src/styles/sci-fi.css
- public/screenshots/*.svg (mockups)

Manual test checklist (TEST 1–10)

1. Create a Money Taken record (Person A, principal ₹50,000, monthly_extra ₹1,000 starting this month). Verify remaining principal = ₹50,000.
2. Record a monthly_extra for the same record and verify principal unchanged and extraPaid updated.
3. Record a principal payment and verify remaining principal decreases correctly.
4. Attempt to record a duplicate monthly_extra for the same YYYY-MM — UI should warn and require confirmation.
5. Record an advance (I Gave an Advance / I Received an Advance) optionally linking to a related record and verify advances show separately from principal.
6. Make an advance adjustment against principal (creates principal_adjustment) and verify balances update and history preserved.
7. Create multiple records for the same person and verify they remain separate and calculations are record-scoped.
8. Edit a transaction and verify updated_at (or an edit indicator) is visible and balances recalc correctly.
9. Delete transaction flow: confirm prompt appears and balances update after deletion.
10. Authentication & user scoping: create a different user and verify they cannot see the other user's data.

How to open the draft PR

Option A — via web (fast):
1. Visit: https://github.com/fortysmita525-prog/rupee-account-buddy/pull/new/feature/ledger-advances
2. Confirm base branch (main) and head (feature/ledger-advances).
3. Use this file as the PR description, mark as Draft and create PR.

Option B — via gh CLI:

  gh pr create --base main --head feature/ledger-advances --title "feat: ledger advances & transaction types" --body-file .github/PR_DESCRIPTION_feature_ledger_advances.md --draft

Option C — Allow me to create the draft PR for you (I will need permission or a token with repo write access). Reply: "Grant PR permission" and I will create it.

Notes before merging

- Run the DB migration on staging first and validate the TEST 1–10 checklist.
- Backup production DB before applying the migration in production.
- If you want me to run the migration on staging, grant access or run the SQL in Supabase SQL editor.

Screenshots

- public/screenshots/sci-fi-dashboard.svg — Dashboard mock
- public/screenshots/sci-fi-people.svg — People mock
- public/screenshots/sci-fi-ledger.svg — Person ledger mock
- public/screenshots/sci-fi-transactions.svg — Transactions mock
- public/screenshots/sci-fi-reminders.svg — Reminders mock


````
