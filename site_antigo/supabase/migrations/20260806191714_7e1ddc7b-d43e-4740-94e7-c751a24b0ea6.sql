-- Fase 1: Estrutura básica de pedidos do site

-- 1. Tabela Base
CREATE TABLE public.site_orders (
    -- Identificadores e Idempotência
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id uuid UNIQUE NOT NULL,
    codigo_pedido text UNIQUE NOT NULL,

    -- Dados do Cliente e Indicação
    cliente_nome text NOT NULL,
    cliente_telefone text NOT NULL,
    indicador_nome text,
    indicador_whatsapp text,

    -- Detalhes do Pedido e Valores
    items_snapshot jsonb NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    frete_valor numeric(12,2) NOT NULL DEFAULT 0,
    total numeric(12,2) NOT NULL,

    -- Logística
    tipo_entrega text NOT NULL,
    endereco_completo text,

    -- Status e Integração
    status text NOT NULL DEFAULT 'pendente',
    status_gerenciapp text NOT NULL DEFAULT 'pendente',
    gerenciapp_order_id text,
    sincronizado_gerenciapp_at timestamptz,

    -- Timestamps e Controle
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    pago_at timestamptz,
    cancelado_at timestamptz,
    arquivado_at timestamptz,
    status_alterado_por uuid REFERENCES auth.users(id),

    -- Constraints
    CONSTRAINT check_codigo_pedido_format 
        CHECK (codigo_pedido ~ '^[0-9]{6}$'),
    
    CONSTRAINT check_cliente_nome_not_empty 
        CHECK (btrim(cliente_nome) <> ''),
    
    CONSTRAINT check_cliente_telefone_not_empty 
        CHECK (btrim(cliente_telefone) <> ''),
    
    CONSTRAINT check_status_valid 
        CHECK (status IN ('pendente', 'pago', 'cancelado', 'arquivado')),
    
    CONSTRAINT check_status_gerenciapp_valid 
        CHECK (status_gerenciapp IN ('pendente', 'sincronizado', 'cancelado')),
    
    CONSTRAINT check_tipo_entrega_valid 
        CHECK (tipo_entrega IN ('delivery', 'retirada')),
    
    CONSTRAINT check_valores_non_negative 
        CHECK (subtotal >= 0 AND frete_valor >= 0 AND total >= 0),
    
    CONSTRAINT check_total_calculado 
        CHECK (total = subtotal + frete_valor),
    
    CONSTRAINT check_endereco_delivery_mandatory 
        CHECK (
            (tipo_entrega = 'retirada') OR 
            (tipo_entrega = 'delivery' AND endereco_completo IS NOT NULL AND btrim(endereco_completo) <> '')
        )
);

-- 2. Índices
CREATE INDEX idx_site_orders_status ON public.site_orders(status);
CREATE INDEX idx_site_orders_created_at ON public.site_orders(created_at DESC);

-- 3. Função de Timestamp
CREATE FUNCTION public.set_site_orders_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_site_orders_updated_at
    BEFORE UPDATE ON public.site_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.set_site_orders_updated_at();

-- 4. Permissões Iniciais
REVOKE ALL ON public.site_orders FROM PUBLIC;
REVOKE ALL ON public.site_orders FROM anon;

GRANT SELECT ON public.site_orders TO authenticated;
GRANT ALL ON public.site_orders TO service_role;

-- 5. RLS
ALTER TABLE public.site_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin select site_orders"
ON public.site_orders
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Função Transacional de Criação
CREATE OR REPLACE FUNCTION public.create_site_order_transactional(
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
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_codigo text;
    v_tentativas int := 0;
    v_existing_id uuid;
    v_existing_codigo text;
    v_existing_status text;
    v_existing_created timestamptz;
BEGIN
    -- Idempotência: Verifica se o request_id já foi processado
    SELECT o.id, o.codigo_pedido, o.status, o.created_at 
    INTO v_existing_id, v_existing_codigo, v_existing_status, v_existing_created
    FROM public.site_orders o 
    WHERE o.request_id = p_request_id;

    IF FOUND THEN
        RETURN QUERY SELECT v_existing_id, v_existing_codigo, v_existing_status, v_existing_created;
        RETURN;
    END IF;

    -- Loop de inserção com retry para colisão de código aleatório
    LOOP
        BEGIN
            -- Gera código de 6 dígitos entre 100000 e 999999
            v_codigo := (floor(random() * 900000 + 100000))::text;
            
            INSERT INTO public.site_orders (
                request_id, codigo_pedido, cliente_nome, cliente_telefone,
                indicador_nome, indicador_whatsapp, items_snapshot,
                subtotal, frete_valor, total,
                tipo_entrega, endereco_completo
            ) VALUES (
                p_request_id, v_codigo, p_cliente_nome, p_cliente_telefone,
                p_indicador_nome, p_indicador_whatsapp, p_items_snapshot,
                p_subtotal, p_frete_valor, p_total,
                p_tipo_entrega, p_endereco_completo
            )
            RETURNING site_orders.id, site_orders.codigo_pedido, site_orders.status, site_orders.created_at
            INTO v_existing_id, v_existing_codigo, v_existing_status, v_existing_created;
            
            RETURN QUERY SELECT v_existing_id, v_existing_codigo, v_existing_status, v_existing_created;
            EXIT;

        EXCEPTION 
            WHEN unique_violation THEN
                -- Se a violação for no request_id (concorrência pura), o loop termina na próxima tentativa via SELECT
                -- Se for no codigo_pedido, tenta novamente até 10 vezes
                v_tentativas := v_tentativas + 1;
                IF v_tentativas >= 10 THEN
                    RAISE EXCEPTION 'Falha ao gerar código único de pedido após 10 tentativas.';
                END IF;
                
                -- Verifica se a colisão foi no request_id durante a transação
                SELECT o.id, o.codigo_pedido, o.status, o.created_at 
                INTO v_existing_id, v_existing_codigo, v_existing_status, v_existing_created
                FROM public.site_orders o 
                WHERE o.request_id = p_request_id;
                
                IF FOUND THEN
                    RETURN QUERY SELECT v_existing_id, v_existing_codigo, v_existing_status, v_existing_created;
                    EXIT;
                END IF;
        END;
    END LOOP;
END;
$$;

-- 7. Permissões da Função
REVOKE ALL ON FUNCTION public.create_site_order_transactional FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_site_order_transactional TO service_role;
