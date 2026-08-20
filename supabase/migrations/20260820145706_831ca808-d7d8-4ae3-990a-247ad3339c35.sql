
CREATE TYPE public.money_type AS ENUM ('taken','given');
CREATE TYPE public.repayment_condition AS ENUM ('on_demand','specific_date','flexible');
CREATE TYPE public.demand_status AS ENUM ('not_demanded','demanded','partially_paid','fully_paid');
CREATE TYPE public.txn_type AS ENUM ('principal_payment','monthly_extra','other','adjustment');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  currency TEXT NOT NULL DEFAULT 'INR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.money_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  type public.money_type NOT NULL,
  principal_amount NUMERIC(14,2) NOT NULL CHECK (principal_amount > 0),
  date_started DATE NOT NULL,
  monthly_extra_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (monthly_extra_amount >= 0),
  monthly_extra_start_date DATE,
  principal_repayment_condition public.repayment_condition NOT NULL DEFAULT 'on_demand',
  principal_due_date DATE,
  principal_demand_status public.demand_status NOT NULL DEFAULT 'not_demanded',
  principal_demand_date DATE,
  demand_note TEXT,
  notes TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  money_record_id UUID NOT NULL REFERENCES public.money_records(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  transaction_type public.txn_type NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  transaction_date DATE NOT NULL,
  notes TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON public.money_records (user_id, person_id);
CREATE INDEX ON public.transactions (user_id, money_record_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.people TO authenticated;
GRANT ALL ON public.people TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.money_records TO authenticated;
GRANT ALL ON public.money_records TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.money_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "own people" ON public.people FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own records" ON public.money_records FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own transactions" ON public.transactions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_people_updated BEFORE UPDATE ON public.people
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_records_updated BEFORE UPDATE ON public.money_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.seed_demo_data()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID := auth.uid();
  rahul UUID;
  priya UUID;
  rec1 UUID;
  rec2 UUID;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.people WHERE user_id = uid) THEN RETURN; END IF;

  INSERT INTO public.people (user_id, name, phone, notes, is_demo)
    VALUES (uid, 'Rahul', '+91 98200 11223', 'Demo person', true) RETURNING id INTO rahul;
  INSERT INTO public.people (user_id, name, phone, notes, is_demo)
    VALUES (uid, 'Priya', '+91 99300 44556', 'Demo person', true) RETURNING id INTO priya;

  INSERT INTO public.money_records (user_id, person_id, type, principal_amount, date_started,
      monthly_extra_amount, monthly_extra_start_date, principal_repayment_condition, notes, is_demo)
    VALUES (uid, rahul, 'taken', 50000, DATE '2026-08-10', 1000, DATE '2026-08-10', 'on_demand', 'Demo record', true)
    RETURNING id INTO rec1;
  INSERT INTO public.money_records (user_id, person_id, type, principal_amount, date_started,
      monthly_extra_amount, monthly_extra_start_date, principal_repayment_condition, notes, is_demo)
    VALUES (uid, priya, 'given', 20000, DATE '2026-08-15', 500, DATE '2026-08-15', 'on_demand', 'Demo record', true)
    RETURNING id INTO rec2;

  INSERT INTO public.transactions (user_id, money_record_id, person_id, transaction_type, amount, transaction_date, notes, is_demo)
    VALUES (uid, rec1, rahul, 'monthly_extra', 1000, DATE '2026-08-10', 'Demo monthly extra', true);
END; $$;

CREATE OR REPLACE FUNCTION public.delete_demo_data()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  DELETE FROM public.people WHERE user_id = uid AND is_demo = true;
END; $$;

REVOKE ALL ON FUNCTION public.seed_demo_data() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_demo_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.seed_demo_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_demo_data() TO authenticated;
