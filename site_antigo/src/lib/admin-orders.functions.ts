import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { validateAndPriceItems, validateAndCalculateShipping, orderSchema, cartItemSchema } from "./orders.functions";

const updateStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["pago", "cancelado"]),
});

const deleteOrderSchema = z.object({
  orderId: z.string().uuid(),
});

export const updateOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((data) => updateStatusSchema.parse(data))
  .handler(async ({ data }) => {
    const { orderId, status } = data;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Obter usuário logado para auditoria (status_alterado_por)
    const { data: { user } } = await supabaseAdmin.auth.getUser();
    
    const now = new Date().toISOString();
    const updateData: any = { 
      status,
      status_alterado_por: user?.id || null 
    };

    if (status === "pago") updateData.pago_at = now;
    else if (status === "cancelado") updateData.cancelado_at = now;

    const { error } = await supabaseAdmin
      .from("site_orders")
      .update(updateData)
      .eq("id", orderId);

    if (error) {
      console.error("Admin order update error:", error);
      throw new Error("Falha ao atualizar status do pedido.");
    }

    return { success: true };
  });

export const deleteOrder = createServerFn({ method: "POST" })
  .inputValidator((data) => deleteOrderSchema.parse(data))
  .handler(async ({ data }) => {
    const { orderId } = data;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("site_orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      console.error("Admin order delete error:", error);
      throw new Error("Falha ao excluir o pedido.");
    }

    return { success: true };
  });

const manualOrderSchema = z.object({
  requestId: z.string().uuid(),
  clienteNome: z.string().min(1),
  clienteTelefone: z.string().min(1),
  indicadorNome: z.string().optional(),
  indicadorWhatsapp: z.string().optional(),
  itemsSnapshot: z.array(cartItemSchema).min(1),
  tipoEntrega: z.enum(["delivery", "retirada"]),
  enderecoCompleto: z.string().optional(),
  latitude: z.number().finite().min(-90).max(90).optional(),
  longitude: z.number().finite().min(-180).max(180).optional(),
  freteManual: z.number().min(0).optional(), // Frete pode ser manual para pedidos admin
  statusInicial: z.enum(["pendente", "pago", "cancelado"]), // Tornado obrigatório para garantir intenção explícita
}).strict().superRefine((data, ctx) => {
  if (data.tipoEntrega === "delivery") {
    if (data.latitude === undefined || data.longitude === undefined || !data.enderecoCompleto) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Dados de entrega completos são obrigatórios para delivery.",
        path: ["tipoEntrega"],
      });
    }
  }
});

export const createManualOrder = createServerFn({ method: "POST" })
  .inputValidator((data) => manualOrderSchema.parse(data))
  .handler(async ({ data: o }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      // 1. Validação Segura de Itens e Preços
      const { itemsSnapshotSeguro, subtotalCalculado } = await validateAndPriceItems(
        o.itemsSnapshot,
        supabaseAdmin
      );

      // 2. Validação Segura de Frete e Distância
      let freteCalculado = o.freteManual || 0; // Usa frete manual se fornecido, senão calcula
      let distanciaKm = 0;
      let freteACombinar = false;

      if (!o.freteManual) { // Se não houver frete manual, calcula
        const shippingResult = await validateAndCalculateShipping(
          o.tipoEntrega,
          o.latitude,
          o.longitude
        );
        freteCalculado = shippingResult.freteCalculado;
        distanciaKm = shippingResult.distanciaKm;
        freteACombinar = shippingResult.freteACombinar;
      }
      
      const totalCalculado = subtotalCalculado + freteCalculado;

      // 3. Persistência Transacional (usando status inicial definido)
      const { data: dbData, error: dbError } = await supabaseAdmin.rpc("create_site_order_transactional", {
        p_request_id: o.requestId,
        p_cliente_nome: o.clienteNome,
        p_cliente_telefone: o.clienteTelefone,
        p_indicador_nome: o.indicadorNome ?? "",
        p_indicador_whatsapp: o.indicadorWhatsapp ?? "",
        p_items_snapshot: itemsSnapshotSeguro,
        p_subtotal: subtotalCalculado,
        p_frete_valor: freteCalculado,
        p_total: totalCalculado,
        p_tipo_entrega: o.tipoEntrega,
        p_endereco_completo: o.enderecoCompleto ?? "",
        p_status_inicial: o.statusInicial, // Passa o status inicial
      });

      if (dbError) throw dbError;
      const results = dbData as any[];
      if (!results || results.length === 0) throw new Error("Falha ao criar pedido.");

      const order = results[0] as { id: string; codigo_pedido: string; status: string; created_at: string };

      return { 
        success: true, 
        order,
        pricing: {
          subtotal: subtotalCalculado,
          frete: freteCalculado,
          total: totalCalculado,
          distanciaKm,
          freteACombinar
        }
      };
    } catch (err: any) {
      console.error("Manual order creation failure:", err);
      // Retorna o erro real para facilitar o debug no frontend
      throw new Error(err.message || "Não foi possível registrar o pedido manual.");
    }
  });