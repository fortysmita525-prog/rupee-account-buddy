CREATE OR REPLACE FUNCTION public.delete_demo_data()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
DECLARE uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  DELETE FROM public.people WHERE user_id = uid AND is_demo = true;
END; $function$;

CREATE OR REPLACE FUNCTION public.seed_demo_data()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY INVOKER
 SET search_path TO 'public'
AS $function$
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
END; $function$;

REVOKE EXECUTE ON FUNCTION public.seed_demo_data() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.delete_demo_data() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.seed_demo_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_demo_data() TO authenticated;