-- Up: add transaction_type enum and nullable relation columns
BEGIN;

-- Create enum (safe additive)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type_enum') THEN
    CREATE TYPE transaction_type_enum AS ENUM (
      'principal',
      'monthly_extra',
      'advance_given',
      'advance_received',
      'principal_adjustment',
      'extra_adjustment',
      'other'
    );
  END IF;
END
$$;

ALTER TABLE IF EXISTS transactions
  ADD COLUMN IF NOT EXISTS transaction_type transaction_type_enum DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS related_transaction_id uuid NULL,
  ADD COLUMN IF NOT EXISTS related_record_id uuid NULL,
  ADD COLUMN IF NOT EXISTS period text NULL; -- e.g. '2026-08' for monthly-extra period

COMMIT;

-- Down (rollback)
-- To roll back, run the following only if you are sure no code relies on the columns:
-- BEGIN;
-- ALTER TABLE IF EXISTS transactions DROP COLUMN IF EXISTS period;
-- ALTER TABLE IF EXISTS transactions DROP COLUMN IF EXISTS related_record_id;
-- ALTER TABLE IF EXISTS transactions DROP COLUMN IF EXISTS related_transaction_id;
-- ALTER TABLE IF EXISTS transactions DROP COLUMN IF EXISTS transaction_type;
-- DO $$
-- BEGIN
--   IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type_enum') THEN
--     DROP TYPE transaction_type_enum;
--   END IF;
-- END
-- $$;
-- COMMIT;
