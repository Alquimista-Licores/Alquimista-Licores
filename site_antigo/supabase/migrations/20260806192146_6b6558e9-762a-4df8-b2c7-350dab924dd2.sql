-- 1. Ativar RLS
ALTER TABLE public.site_orders ENABLE ROW LEVEL SECURITY;

-- 2. Limpeza total de permissões herdadas (Deny by default)
REVOKE ALL ON TABLE public.site_orders FROM PUBLIC;
REVOKE ALL ON TABLE public.site_orders FROM anon;
REVOKE ALL ON TABLE public.site_orders FROM authenticated;

-- 3. Conceder SELECT apenas para usuários autenticados (Admins)
GRANT SELECT ON TABLE public.site_orders TO authenticated;

-- 4. Conceder acesso total apenas para a service_role (Backend/RPC)
GRANT ALL ON TABLE public.site_orders TO service_role;

-- 5. Única Policy de Leitura: Somente administradores
CREATE POLICY "Admins podem visualizar pedidos" 
ON public.site_orders 
FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));