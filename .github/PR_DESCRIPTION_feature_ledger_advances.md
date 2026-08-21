# Draft PR: feature/ledger-advances

Summary

This draft PR implements advances, adjustments and clearer transaction types for the tracker app.
It updates the DB schema (additive migration), scopes data to signed-in users, extends transaction types and wiring in the UI for recording advances and adjustments.

Branches / Commits

- branch: feature/ledger-advances
- Key commits: migration + data scoping + tracker logic + UI wiring for dialogs, add-money menu and advance/adjust flows.

Files changed (high-level)

- db/migrations/20260821_add_transaction_type_and_relations.sql — additive migration
- src/lib/data.ts — user-scoped queries/mutations
- src/lib/tracker.ts — new txn types and summarise logic
- src/components/app-shell.tsx — Add Money menu wiring
- src/components/tracker-dialogs.tsx — dialogs/forms updated to support advances, adjustments, monthly_extra period detection, principal overpayment confirmation

Why this change

- Separates principal payments, monthly extras, advances and adjustments as explicit transaction types.
- Keeps principal/extra/advance accounting explicit and auditable.
- Prevents accidental duplicate monthly-extra entries for the same YYYY-MM period.
- Scopes all data to user_id for security.

Migration

Path: db/migrations/20260821_add_transaction_type_and_relations.sql

Supabase UI steps (recommended - staging first)
1. In your Supabase project, open SQL editor.
2. Paste the migration SQL file contents and run it against a staging or local copy first.
3. Verify the `transactions` table has these new nullable columns: transaction_type, related_transaction_id, related_record_id, period.
4. Run the application against staging and exercise the TEST 1–10 checklist below.

psql (alternative):

  psql 'postgres://<user>:<pass>@<host>:<port>/<db>' -f db/migrations/20260821_add_transaction_type_and_relations.sql

IMPORTANT: Back up the production database before applying the migration to production.

Rollback notes

- The migration is additive and nullable, so rolling back is straightforward but will require manual cleanup if the new enum values were used. If you must rollback:
  1. Remove any rows that use the new enum values or set them to 'other' first.
  2. Drop columns and enum (reverse the migration).

TEST 1–10 (manual checklist)

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

What I will do next on this branch (continuing work)

- Finish remaining UI polish for Person ledger page and Transactions page (filters, edit/delete UX, show edit timestamps).
- Complete Reminders page actions and Dashboard cards.
- Run the checklist above on a staging DB and fix any issues found.
- When green, I will ask you to back up production and run the migration there (or I can run it if you provide access).

How to open the draft PR yourself (two quick options)

- GitHub web UI (fast):
  1. Visit: https://github.com/fortysmita525-prog/rupee-account-buddy/pull/new/feature/ledger-advances
  2. Confirm base branch (main) and head (feature/ledger-advances).
  3. Use the contents of this file as the PR description, mark as draft and create PR.

- gh CLI:
  1. Save this file locally as `.github/PR_DESCRIPTION_feature_ledger_advances.md` (already present in branch).
  2. Run:

     gh pr create --base main --head feature/ledger-advances --title "feat: ledger advances & transaction types" --body-file .github/PR_DESCRIPTION_feature_ledger_advances.md --draft

I can create the draft PR for you if you grant me permission to do so or provide a token/CI runner with PR creation rights. Otherwise please open the draft PR using one of the quick options above.

If you want, I will now:
- Option A (recommended): finish the remaining UI polish and run TEST 1–10 on staging, then I’ll prepare the final PR and notify you.
- Option B: open the draft PR now for early review (I will continue working and push updates to the PR).

Please reply with: "Open PR now" or "Finish first then PR". If you want me to create the PR directly, confirm I have your permission to create it in the repository.