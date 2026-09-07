BEGIN;
DELETE FROM public.featured_config;
DELETE FROM public.testimonials;
DELETE FROM public.kit_prices;
DELETE FROM public.products;
-- O script completo está em /tmp/restore.sql, mas vou executar via dispatch por segurança.
COMMIT;