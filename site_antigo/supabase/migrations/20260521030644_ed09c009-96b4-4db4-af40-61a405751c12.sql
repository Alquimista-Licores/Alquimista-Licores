CREATE OR REPLACE FUNCTION public.notify_stock_zero()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  hook_url text;
  hook_secret text;
  tipo text;
BEGIN
  IF NEW.estoque = 0 AND OLD.estoque > 0 THEN
    tipo := 'zero';
  ELSIF NEW.estoque = 3 AND OLD.estoque > 3 THEN
    tipo := 'low';
  ELSE
    RETURN NEW;
  END IF;

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
    body := jsonb_build_object(
      'product_id', NEW.id,
      'nome', NEW.nome,
      'tipo', tipo,
      'estoque', NEW.estoque
    )
  );
  RETURN NEW;
END;
$function$;