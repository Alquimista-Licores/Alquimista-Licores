-- Validações manuais e indicações da Jornada.
-- Migração não destrutiva: preserva dados e índices existentes.

CREATE UNIQUE INDEX IF NOT EXISTS jornada_indicacoes_indicador_comprador_uidx
ON public.jornada_indicacoes (indicador_id, telefone_indicado);

CREATE OR REPLACE FUNCTION public.processar_solicitacao_conquista_v2(
  p_solicitacao_id uuid,
  p_status text,
  p_motivo_rejeicao text DEFAULT NULL,
  p_processado_por uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_solicitacao public.jornada_solicitacoes%ROWTYPE;
  v_meta integer;
  v_xp integer;
  v_aprovadas integer := 0;
  v_desbloqueada boolean := false;
BEGIN
  IF p_status NOT IN ('aprovado', 'rejeitado') THEN
    RAISE EXCEPTION 'Status inválido.';
  END IF;

  SELECT *
  INTO v_solicitacao
  FROM public.jornada_solicitacoes
  WHERE id = p_solicitacao_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solicitação não encontrada.';
  END IF;

  IF v_solicitacao.status <> 'pendente' THEN
    RAISE EXCEPTION 'Esta solicitação já foi processada.';
  END IF;

  UPDATE public.jornada_solicitacoes
  SET status = p_status,
      motivo_rejeicao = CASE WHEN p_status = 'rejeitado' THEN nullif(trim(p_motivo_rejeicao), '') ELSE NULL END,
      processado_em = now(),
      processado_por = p_processado_por
  WHERE id = p_solicitacao_id;

  IF p_status = 'aprovado' THEN
    SELECT greatest(1, coalesce(meta_objetivo, 1)), coalesce(xp_recompensa, 0)
    INTO v_meta, v_xp
    FROM public.jornada_conquistas
    WHERE slug = v_solicitacao.conquista_slug;

    IF v_solicitacao.conquista_slug = 'memoria-encantada' THEN
      SELECT count(DISTINCT data_evidencia)::integer
      INTO v_aprovadas
      FROM public.jornada_solicitacoes
      WHERE cliente_id = v_solicitacao.cliente_id
        AND conquista_slug = v_solicitacao.conquista_slug
        AND status = 'aprovado';
    ELSE
      SELECT count(*)::integer
      INTO v_aprovadas
      FROM public.jornada_solicitacoes
      WHERE cliente_id = v_solicitacao.cliente_id
        AND conquista_slug = v_solicitacao.conquista_slug
        AND status = 'aprovado';
    END IF;

    IF v_aprovadas >= v_meta THEN
      SELECT public.desbloquear_conquista_unica(
        v_solicitacao.cliente_id,
        v_solicitacao.conquista_slug,
        v_xp
      ) INTO v_desbloqueada;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'status', p_status,
    'progresso_atual', v_aprovadas,
    'conquista_desbloqueada', v_desbloqueada
  );
END;
$$;

REVOKE ALL ON FUNCTION public.processar_solicitacao_conquista_v2(uuid, text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.processar_solicitacao_conquista_v2(uuid, text, text, uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.processar_indicacao_site_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_indicador uuid;
  v_tel_cliente text;
  v_tel_indicador text;
  v_total integer;
  v_inserida uuid;
BEGIN
  IF NEW.status NOT IN ('pago', 'concluido') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status IN ('pago', 'concluido') THEN
    RETURN NEW;
  END IF;

  v_tel_cliente := public.normalizar_telefone(NEW.cliente_telefone);
  v_tel_indicador := public.normalizar_telefone(coalesce(NEW.indicador_whatsapp, ''));

  IF v_tel_cliente = '' OR v_tel_indicador = '' OR v_tel_indicador = v_tel_cliente THEN
    RETURN NEW;
  END IF;

  SELECT id
  INTO v_indicador
  FROM public.clientes
  WHERE public.normalizar_telefone(telefone) = v_tel_indicador
  LIMIT 1;

  IF v_indicador IS NULL THEN
    RETURN NEW;
  END IF;

  -- Somente a primeira compra paga/concluída do comprador qualifica uma indicação.
  IF EXISTS (
    SELECT 1
    FROM public.site_orders o
    WHERE o.id <> NEW.id
      AND public.normalizar_telefone(o.cliente_telefone) = v_tel_cliente
      AND o.status IN ('pago', 'concluido')
  ) THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.jornada_indicacoes (
    indicador_id,
    telefone_indicado,
    order_id,
    qualificada_at,
    xp_creditado
  )
  VALUES (
    v_indicador,
    v_tel_cliente,
    NEW.id,
    now(),
    true
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_inserida;

  IF v_inserida IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT count(DISTINCT telefone_indicado)::integer
  INTO v_total
  FROM public.jornada_indicacoes
  WHERE indicador_id = v_indicador
    AND qualificada_at IS NOT NULL;

  IF v_total >= 1 THEN
    PERFORM public.desbloquear_conquista_unica(v_indicador, 'primeiro-convite-guilda', 200);
  END IF;
  IF v_total >= 3 THEN
    PERFORM public.desbloquear_conquista_unica(v_indicador, 'circulo-aprendizes', 350);
  END IF;
  IF v_total >= 5 THEN
    PERFORM public.desbloquear_conquista_unica(v_indicador, 'embaixador-guilda', 500);
  END IF;

  RETURN NEW;
END;
$$;
