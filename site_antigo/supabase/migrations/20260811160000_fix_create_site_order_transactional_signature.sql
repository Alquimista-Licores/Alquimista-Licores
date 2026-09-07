-- Drop the function first to avoid signature conflicts
DROP FUNCTION IF EXISTS public.create_site_order_transactional(uuid, text, text, text, text, jsonb, numeric, numeric, numeric, text, text);
DROP FUNCTION IF EXISTS public.create_site_order_transactional(uuid, text, text, text, text, jsonb, numeric, numeric, numeric, text, text, text);

-- Re-create the function with the p_status_inicial parameter
CREATE FUNCTION public.create_site_order_transactional(
    p_request_id uuid,
    p_cliente_nome text,
    p_cliente_telefone text,
    p_indicador_nome text,
    p_indicador_whatsapp text,
    p_items_snapshot jsonb,
    p_subtotal numeric,
    p_frete_valor numeric,
    p_total numeric,
    p_tipo_entrega text,
    p_endereco_completo text,
    p_status_inicial text DEFAULT 'pendente'
)
RETURNS TABLE (
    id uuid,
    codigo_pedido text,
    status text,
    created_at timestamptz
) 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_new_codigo text;
    v_attempts int := 0;
    v_existing_id uuid;
    v_constraint_name text;
BEGIN
    -- Idempotência inicial
    SELECT o.id INTO v_existing_id FROM public.site_orders o WHERE o.request_id = p_request_id;
    IF FOUND THEN
        RETURN QUERY SELECT o.id, o.codigo_pedido, o.status::text, o.created_at FROM public.site_orders o WHERE o.id = v_existing_id;
        RETURN;
    END IF;

    -- Loop de concorrência/colisão
    WHILE v_attempts < 10 LOOP
        BEGIN
            v_new_codigo := (floor(random() * 900000 + 100000))::text;

            RETURN QUERY
            INSERT INTO public.site_orders (
                request_id, codigo_pedido, cliente_nome, cliente_telefone, indicador_nome, 
                indicador_whatsapp, items_snapshot, subtotal, frete_valor, total, 
                tipo_entrega, endereco_completo, status
            ) VALUES (
                p_request_id, v_new_codigo, p_cliente_nome, p_cliente_telefone, p_indicador_nome, 
                p_indicador_whatsapp, p_items_snapshot, p_subtotal, p_frete_valor, p_total, 
                p_tipo_entrega, p_endereco_completo, p_status_inicial
            )
            RETURNING site_orders.id, site_orders.codigo_pedido, site_orders.status::text, site_orders.created_at;
            RETURN;

        EXCEPTION WHEN unique_violation THEN
            GET STACKED DIAGNOSTICS v_constraint_name = CONSTRAINT_NAME;
            IF v_constraint_name = 'site_orders_request_id_key' THEN
                RETURN QUERY SELECT o.id, o.codigo_pedido, o.status::text, o.created_at FROM public.site_orders o WHERE o.request_id = p_request_id;
                RETURN;
            ELSIF v_constraint_name = 'site_orders_codigo_pedido_key' THEN
                v_attempts := v_attempts + 1;
            ELSE
                RAISE;
            END IF;
        END;
    END LOOP;
    RAISE EXCEPTION 'Não foi possível gerar um código de pedido único após 10 tentativas.';
END;
$$ LANGUAGE plpgsql;

-- Permissions
REVOKE ALL ON FUNCTION public.create_site_order_transactional(uuid, text, text, text, text, jsonb, numeric, numeric, numeric, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_site_order_transactional(uuid, text, text, text, text, jsonb, numeric, numeric, numeric, text, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.create_site_order_transactional(uuid, text, text, text, text, jsonb, numeric, numeric, numeric, text, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_site_order_transactional(uuid, text, text, text, text, jsonb, numeric, numeric, numeric, text, text, text) TO service_role;
