
-- 1. Add missing UPDATE policy on push_subscriptions
CREATE POLICY "own_subs_update" ON public.push_subscriptions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Revoke EXECUTE on internal SECURITY DEFINER functions from public roles.
-- These are only called from server-side code (service role) or triggers.
REVOKE EXECUTE ON FUNCTION public.decrement_estoque(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_pedidos(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_stock_zero() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
-- has_role(uuid, app_role) is intentionally executable: it's referenced by RLS policies.
