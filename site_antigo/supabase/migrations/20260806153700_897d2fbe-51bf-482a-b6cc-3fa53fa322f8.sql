-- Garantindo permissões de execução para o novo projeto
GRANT EXECUTE ON FUNCTION public.decrement_estoque(uuid, int) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.increment_pedidos(uuid, int) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Garantindo acesso às tabelas do site
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
