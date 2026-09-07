import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const submissionSchema = z.object({
  clienteId: z.string().uuid(),
  conquistaSlug: z.string(),
  textoEvidencia: z.string().optional(),
  fotoPath: z.string().optional(),
});

export const submitConquistaSolicitacao = createServerFn({ method: "POST" })
  .inputValidator((data) => submissionSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Validar se a conquista existe e se permite validação automática
    const { data: conquista, error: cError } = await supabaseAdmin
      .from("jornada_conquistas" as any)
      .select("*")
      .eq("slug", data.conquistaSlug)
      .single();

    if (cError || !conquista) throw new Error("Conquista não encontrada.");
    const c = conquista as any;

    // 2. Validação automática (Caçador de Runas)
    let status = "pendente";
    if (c.validacao_automatica && c.codigo_validacao) {
      if (data.textoEvidencia === c.codigo_validacao) {
        status = "aprovado";
      } else {
        throw new Error("Código secreto inválido.");
      }
    }

    // 3. Criar solicitação
    const { data: sol, error: sError } = await supabaseAdmin
      .from("jornada_solicitacoes" as any)
      .insert({
        cliente_id: data.clienteId,
        conquista_slug: data.conquistaSlug,
        texto_evidencia: data.textoEvidencia,
        foto_url: data.fotoPath,
        status: status
      })
      .select()
      .single();

    if (sError) {
      if (sError.code === '23505') throw new Error("Você já tem uma solicitação pendente para esta conquista.");
      throw new Error("Falha ao enviar solicitação.");
    }

    // 4. Se aprovado automaticamente (Caçador de Runas), creditar XP
    if (status === "aprovado") {
      // Operação atômica e idempotente no banco real
      // Colunas: cliente_id, conquista, desbloqueada_em, xp_recompensa
      const { data: conquistaDesbloqueada, error: jaError } = await supabaseAdmin
        .from("conquistas_desbloqueadas" as any)
        .insert({
          cliente_id: data.clienteId,
          conquista: data.conquistaSlug,
          desbloqueada_em: new Date().toISOString(),
          xp_recompensa: c.xp_recompensa
        })
        .select()
        .single();

      if (!jaError && conquistaDesbloqueada) {
        // Creditar XP apenas se o insert acima funcionou (idempotência via UNIQUE no banco)
        await (supabaseAdmin as any).rpc('increment_xp', { 
          p_cliente_id: data.clienteId, 
          p_amount: c.xp_recompensa 
        });
      }
    }

    return { success: true, status };
  });

export const getJornadaClientData = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ clienteId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: conquistas } = await supabaseAdmin.from("jornada_conquistas" as any).select("*").order("xp_recompensa", { ascending: true });
    const { data: desbloqueadas } = await supabaseAdmin.from("conquistas_desbloqueadas" as any).select("*").eq("cliente_id", data.clienteId);
    const { data: solicitacoes } = await supabaseAdmin.from("jornada_solicitacoes" as any).select("*").eq("cliente_id", data.clienteId);

    return {
      conquistas: (conquistas || []) as any[],
      desbloqueadas: (desbloqueadas || []) as any[],
      solicitacoes: (solicitacoes || []) as any[]
    };
  });
