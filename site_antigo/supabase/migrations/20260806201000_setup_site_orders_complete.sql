-- 1. ESTRUTURA: Tabela e Índices
CREATE TABLE public.site_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_pedido text UNIQUE NOT NULL CHECK (codigo_pedido ~ '^[0-9]{6}$'), -- 6 dígitos gerados no servidor
    request_id uuid UNIQUE NOT NULL,    -- Idempotência do checkout
    
    -- Cliente
    cliente_nome text NOT NULL CHECK (btrim(cliente_nome) <> ''),
    cliente_telefone text NOT NULL CHECK (btrim(cliente_telefone) <> ''),
    
    -- Indicação
    indicador_nome text,
    indicador_whatsapp text,
    
    -- Pedido
    items_snapshot jsonb NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    frete_valor numeric(12,2) NOT NULL DEFAULT 0,
    total numeric(12,2) NOT NULL,
    
    -- Entrega (Simplificado)
    tipo_entrega text NOT NULL CHECK (tipo_entrega IN ('delivery', 'retirada')),
    endereco_completo text,
    
    -- Status e Controle
    status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado', 'arquivado')),
    status_gerenciapp text NOT NULL DEFAULT 'pendente' CHECK (status_gerenciapp IN ('pendente', 'sincronizado', 'cancelado')),
    
    -- Auditoria e Integração
    gerenciapp_order_id text,
    sincronizado_gerenciapp_at timestamptz,
    pago_at timestamptz,
    cancelado_at timestamptz,
    arquivado_at timestamptz,
    status_alterado_por uuid REFERENCES auth.users(id),
    
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    -- Constraints de Integridade
    CONSTRAINT check_total_arithmetic CHECK (total = subtotal + frete_valor),
    CONSTRAINT check_positive_values CHECK (subtotal >= 0 AND frete_valor >= 0 AND total >= 0),
    CONSTRAINT check_endereco_delivery_mandatory CHECK (
        (tipo_entrega = 'retirada') 
        OR (
            tipo_entrega = 'delivery' 
            AND endereco_completo IS NOT NULL 
            AND btrim(endereco_completo) <> ''
        )
    )
);

-- Índices
CREATE INDEX idx_site_orders_status ON public.site_orders(status);
CREATE INDEX idx_site_orders_created_at ON public.site_orders(created_at DESC);

-- 2. AUTOMAÇÃO: Updated_at
CREATE FUNCTION public.set_site_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_site_orders_updated_at
BEFORE UPDATE ON public.site_orders
FOR EACH ROW
EXECUTE FUNCTION public.set_site_orders_updated_at();

-- 3. SEGURANÇA: RLS e Permissões da Tabela
ALTER TABLE public.site_orders ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.site_orders FROM PUBLIC;
REVOKE ALL ON TABLE public.site_orders FROM anon;
REVOKE ALL ON TABLE public.site_orders FROM authenticated;

GRANT SELECT ON TABLE public.site_orders TO authenticated;
GRANT ALL ON TABLE public.site_orders TO service_role;

CREATE POLICY "Admins podem visualizar pedidos" 
ON public.site_orders 
FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'));

-- 4. LÓGICA: Função Transacional
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
    p_endereco_completo text
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
                tipo_entrega, endereco_completo
            ) VALUES (
                p_request_id, v_new_codigo, p_cliente_nome, p_cliente_telefone, p_indicador_nome, 
                p_indicador_whatsapp, p_items_snapshot, p_subtotal, p_frete_valor, p_total, 
                p_tipo_entrega, p_endereco_completo
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

-- 5. PERMISSÕES: Função Transacional
REVOKE ALL ON FUNCTION public.create_site_order_transactional(uuid, text, text, text, text, jsonb, numeric, numeric, numeric, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_site_order_transactional(uuid, text, text, text, text, jsonb, numeric, numeric, numeric, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.create_site_order_transactional(uuid, text, text, text, text, jsonb, numeric, numeric, numeric, text, text) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.create_site_order_transactional(uuid, text, text, text, text, jsonb, numeric, numeric, numeric, text, text) TO service_role;
