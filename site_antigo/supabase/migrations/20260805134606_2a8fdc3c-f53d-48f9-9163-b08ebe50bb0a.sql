
-- Revoke public execution on SECURITY DEFINER functions to address linter warnings
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Re-implement missing functions reported by build errors
CREATE OR REPLACE FUNCTION public.decrement_estoque(_product_id UUID, _qty INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.products SET estoque = estoque - _qty WHERE id = _product_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_pedidos(_product_id UUID, _qty INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.products SET pedidos_count = pedidos_count + _qty WHERE id = _product_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.decrement_estoque(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.decrement_estoque(UUID, INTEGER) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.increment_pedidos(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_pedidos(UUID, INTEGER) TO authenticated, service_role;
