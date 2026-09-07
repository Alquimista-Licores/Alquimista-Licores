-- 1. Schema Revert (Push Subscriptions)
ALTER TABLE public.push_subscriptions RENAME COLUMN auth TO auth_key;
ALTER TABLE public.push_subscriptions ADD COLUMN IF NOT EXISTS user_agent text;

-- 2. Featured Config Revert
DROP TABLE IF EXISTS public.featured_config CASCADE;
CREATE TABLE public.featured_config (
    id integer PRIMARY KEY,
    modo text DEFAULT 'auto',
    produto_ids text[] DEFAULT '{}',
    updated_at timestamptz DEFAULT now()
);

-- 3. Permissions Reset
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- Permissões para Vitrine
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.kit_prices TO anon;
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT ON public.featured_config TO anon;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- 4. Functions Permissions
REVOKE EXECUTE ON FUNCTION public.decrement_estoque(uuid, int) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_estoque(uuid, int) TO service_role;

-- Verifica e restringe increment_pedidos se existir
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'increment_pedidos') THEN
    REVOKE EXECUTE ON FUNCTION public.increment_pedidos(uuid, int) FROM anon;
  END IF;
END $$;

-- Mantém has_role acessível (ajustando para uuid, app_role conforme has_role habitual)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

-- 5. Seed initial config
INSERT INTO public.featured_config (id, modo) VALUES (1, 'auto') ON CONFLICT DO NOTHING;
