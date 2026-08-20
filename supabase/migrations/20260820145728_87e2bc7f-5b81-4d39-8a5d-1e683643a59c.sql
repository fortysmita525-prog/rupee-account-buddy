
REVOKE ALL ON FUNCTION public.seed_demo_data() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.delete_demo_data() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.seed_demo_data() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_demo_data() TO authenticated;
