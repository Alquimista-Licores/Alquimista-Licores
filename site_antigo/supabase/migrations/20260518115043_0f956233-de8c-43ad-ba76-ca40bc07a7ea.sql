
-- Extensions
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Push subscriptions
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text UNIQUE NOT NULL,
  p256dh text NOT NULL,
  auth_key text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_subs_select" ON public.push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_subs_insert" ON public.push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_subs_delete" ON public.push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_push_subs_user ON public.push_subscriptions(user_id);

-- App config (internal, never exposed to clients)
CREATE TABLE public.app_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
-- No policies = no access for anon/authenticated. Only service_role can read.

-- Trigger function: when estoque transitions from >0 to 0, call internal hook
CREATE OR REPLACE FUNCTION public.notify_stock_zero()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  hook_url text;
  hook_secret text;
BEGIN
  IF NEW.estoque = 0 AND OLD.estoque > 0 THEN
    SELECT value INTO hook_url FROM public.app_config WHERE key = 'stock_hook_url';
    SELECT value INTO hook_secret FROM public.app_config WHERE key = 'stock_hook_secret';

    IF hook_url IS NULL OR hook_secret IS NULL THEN
      RAISE NOTICE 'stock_hook_url or stock_hook_secret missing in app_config; skipping push';
      RETURN NEW;
    END IF;

    PERFORM net.http_post(
      url := hook_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-hook-secret', hook_secret
      ),
      body := jsonb_build_object('product_id', NEW.id, 'nome', NEW.nome)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_stock_zero ON public.products;
CREATE TRIGGER trg_products_stock_zero
AFTER UPDATE OF estoque ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.notify_stock_zero();
