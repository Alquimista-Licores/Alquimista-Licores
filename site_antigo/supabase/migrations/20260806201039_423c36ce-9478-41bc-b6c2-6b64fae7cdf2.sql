DROP FUNCTION IF EXISTS public.create_site_order_transactional(uuid, text, text, text, text, jsonb, numeric, numeric, numeric, text, text);
DROP TRIGGER IF EXISTS trg_site_orders_updated_at ON public.site_orders;
DROP FUNCTION IF EXISTS public.set_site_orders_updated_at();
DROP TABLE IF EXISTS public.site_orders CASCADE;