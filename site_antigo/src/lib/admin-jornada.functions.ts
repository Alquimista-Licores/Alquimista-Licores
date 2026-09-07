import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getJornadaAdminData = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Buscar solicitações (pendentes, resolvidas, etc) com dados do cliente
    const { data: solicitacoes, error: sError } = await supabaseAdmin
      .from("solicitacoes" as any)
      .select(`
        *,
        cliente:clientes(*)
      `)
      .order("criado_em", { ascending: false });

    if (sError) throw new Error("Erro ao buscar solicitações: " + sError.message);

    // 2. Buscar progresso, conquistas e XP de todos os clientes
    const { data: clientesData, error: cError } = await supabaseAdmin
      .from("clientes" as any)
      .select(`
        *,
        progresso(*),
        conquistas_desbloqueadas(*),
        eventos(tipo, criado_em),
        xp
      `);

    if (cError) throw new Error("Erro ao buscar dados dos clientes: " + cError.message);

    // 3. Buscar site_orders para cruzamento
    const { data: siteOrders, error: oError } = await supabaseAdmin
      .from("site_orders" as any)
      .select("id, codigo_pedido, status, pago_at, cancelado_at, cliente_telefone")
      .order("created_at", { ascending: false });

    if (oError) throw new Error("Erro ao buscar pedidos do site: " + oError.message);

    // Solicitações V2
    const { data: solicitacoesV2, error: sV2Error } = await supabaseAdmin
      .from("jornada_solicitacoes" as any)
      .select(`
        *,
        cliente:clientes(*),
        conquista:jornada_conquistas(*)
      `)
      .order("created_at", { ascending: false });

    // Gerar URLs assinadas para fotos
    const solicitacoesV2Lista = (solicitacoesV2 as any[]) || [];
    const aprovadasPorClienteSlug = solicitacoesV2Lista.reduce((acc: Record<string, number>, s: any) => {
      if (s.status === "aprovado") {
        const chave = `${s.cliente_id}:${s.conquista_slug}`;
        acc[chave] = (acc[chave] || 0) + 1;
      }
      return acc;
    }, {});

    const solicitacoesComFotos = await Promise.all(solicitacoesV2Lista.map(async (s: any) => {
      const chave = `${s.cliente_id}:${s.conquista_slug}`;
      const solicitacaoComProgresso = {
        ...s,
        progresso_atual: Math.min(s.conquista?.meta_objetivo || 1, aprovadasPorClienteSlug[chave] || 0),
      };
      if (s.foto_url) {
        const { data: signedData } = await supabaseAdmin.storage
          .from('jornada-evidencias')
          .createSignedUrl(s.foto_url, 3600);
        return { ...solicitacaoComProgresso, foto_signed_url: signedData?.signedUrl };
      }
      return solicitacaoComProgresso;
    }));

    // Indicações
    const { data: indicacoes } = await supabaseAdmin.from("jornada_indicacoes" as any).select("*, indicador:clientes(*)");

    return {
      solicitacoes: solicitacoes || [],
      solicitacoesV2: solicitacoesComFotos || [],
      clientes: clientesData || [],
      siteOrders: siteOrders || [],
      indicacoes: indicacoes || []
    };
  });

export const processSolicitacao = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ 
    solicitacaoId: z.string().uuid(), 
    status: z.enum(["aprovado", "rejeitado"]),
    motivoRejeicao: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: { user } } = await supabaseAdmin.auth.getUser();

    const { error: processError } = await (supabaseAdmin as any).rpc(
      "processar_solicitacao_conquista_v2",
      {
        p_solicitacao_id: data.solicitacaoId,
        p_status: data.status,
        p_motivo_rejeicao: data.motivoRejeicao || null,
        p_processado_por: user?.id || null,
      },
    );

    if (processError) {
      if (processError.message?.includes("já foi processada")) {
        throw new Error("Esta solicitação já foi processada.");
      }
      throw new Error("Erro ao processar solicitação: " + processError.message);
    }

    return { success: true };
  });

// Compatibilidade com código antigo enquanto migra
export const rejectSolicitacao = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ solicitacaoId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("solicitacoes" as any)
      .update({
        status: "rejeitada",
        resolvida_em: new Date().toISOString()
      })
      .eq("id", data.solicitacaoId)
      .eq("status", "pendente");
    if (error) throw new Error("Falha ao rejeitar solicitação.");
    return { success: true };
  });

export const getRuneSecretCode = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("app_config" as any)
      .select("value")
      .eq("key", "codigo_runa_ativo")
      .single();

    if (error && error.code !== 'PGRST116') throw new Error("Erro ao buscar código secreto.");
    return { code: (data as any)?.value || "" };
  });

export const updateRuneSecretCode = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ code: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("app_config" as any)
      .upsert({ key: "codigo_runa_ativo", value: data.code.trim() }, { onConflict: "key" });

    if (error) throw new Error("Erro ao atualizar código secreto.");
    return { success: true };
  });
