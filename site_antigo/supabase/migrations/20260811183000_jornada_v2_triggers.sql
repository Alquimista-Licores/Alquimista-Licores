-- Função para vincular indicação à primeira compra e creditar XP
CREATE OR REPLACE FUNCTION public.handle_order_indication_rewards()
RETURNS TRIGGER AS $$
DECLARE
    v_indicacao RECORD;
    v_xp_indicacao integer := 100; -- Valor fixo conforme jornada_conquistas
BEGIN
    -- Se o pedido foi marcado como PAGO
    IF NEW.status = 'pago' AND OLD.status != 'pago' THEN
        
        -- Buscar se existe uma indicação para este telefone que ainda não foi creditada
        SELECT * INTO v_indicacao 
        FROM public.jornada_indicacoes 
        WHERE telefone_indicado = NEW.cliente_telefone 
          AND xp_creditado = false
        LIMIT 1;

        IF FOUND THEN
            -- 1. Vincular o pedido à indicação
            UPDATE public.jornada_indicacoes 
            SET order_id = NEW.id,
                xp_creditado = true
            WHERE id = v_indicacao.id;

            -- 2. Creditar XP ao indicador
            UPDATE public.clientes 
            SET xp = xp + v_xp_indicacao
            WHERE id = v_indicacao.indicador_id;

            -- 3. Registrar evento de conquista (opcional, para histórico)
            INSERT INTO public.conquistas_desbloqueadas (cliente_id, conquista, desbloqueada_em, xp_recompensa)
            VALUES (v_indicacao.indicador_id, 'mestre-indicacao', now(), v_xp_indicacao)
            ON CONFLICT (cliente_id, conquista) DO NOTHING;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger no site_orders
DROP TRIGGER IF EXISTS tr_order_indication_reward ON public.site_orders;
CREATE TRIGGER tr_order_indication_reward
    AFTER UPDATE OF status ON public.site_orders
    FOR EACH ROW
    WHEN (NEW.status = 'pago')
    EXECUTE FUNCTION public.handle_order_indication_rewards();
