CREATE OR REPLACE FUNCTION public.decrement_estoque(_product_id uuid, _qty integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET estoque = GREATEST(estoque - _qty, 0)
  WHERE id = _product_id;
END;
$$;