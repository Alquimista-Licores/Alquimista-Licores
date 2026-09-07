import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const itemAvulsoSchema = z.object({
  tipo: z.literal("avulso"),
  id: z.string().uuid(),
  nome: z.string().min(1).max(255),
  sabor: z.string().min(1).max(255),
  preco: z.number().min(0),
  foto_url: z.string().nullable(),
  categoria: z.enum(["fino", "cremoso", "especial"]),
  qty: z.number().int().min(1).max(50),
}).strict();

export const itemKitDegustacaoSchema = z.object({
  tipo: z.literal("kit-degustacao"),
  id: z.string().min(1).max(255),
  nome: z.string().min(1).max(255),
  preco: z.number().min(0),
  qty: z.number().int().min(1).max(50),
  saboresIds: z.array(z.string().uuid()).length(3),
  saboresLabels: z.array(
    z.object({
      nome: z.string().min(1).max(255),
      sabor: z.string().min(1).max(255),
    }).strict()
  ).optional(),
}).strict();

export const itemKitPresenteavelSchema = z.object({
  tipo: z.literal("kit-presenteavel"),
  id: z.string().min(1).max(255),
  nome: z.string().min(1).max(255),
  preco: z.number().min(0),
  qty: z.number().int().min(1).max(50),
  licor: z.object({
    id: z.string().uuid(),
    nome: z.string().min(1).max(255),
    sabor: z.string().min(1).max(255),
  }).strict(),
  acompanhamento: z.string().min(1).max(255),
  embalagem: z.string().min(1).max(255),
  dedicatoria: z.string().max(1000),
}).strict();

export const cartItemSchema = z.discriminatedUnion("tipo", [
  itemAvulsoSchema,
  itemKitDegustacaoSchema,
  itemKitPresenteavelSchema,
]);

export const orderSchema = z.object({
  requestId: z.string().uuid(),
  clienteNome: z.string().min(1),
  clienteTelefone: z.string().min(1),
  indicadorNome: z.string().optional(),
  indicadorWhatsapp: z.string().optional(),
  itemsSnapshot: z.array(cartItemSchema).min(1).max(20),
  subtotal: z.number().min(0),
  freteValor: z.number().min(0),
  total: z.number().min(0),
  tipoEntrega: z.enum(["delivery", "retirada"]),
  enderecoCompleto: z.string().optional(),
  latitude: z.number().finite().min(-90).max(90).optional(),
  longitude: z.number().finite().min(-180).max(180).optional(),
}).strict().superRefine((data, ctx) => {
  if (data.tipoEntrega === "delivery") {
    if (data.latitude === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Latitude obrigatória para delivery",
        path: ["latitude"],
      });
    }
    if (data.longitude === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Longitude obrigatória para delivery",
        path: ["longitude"],
      });
    }
    if (!data.enderecoCompleto || data.enderecoCompleto.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Endereço obrigatório para delivery",
        path: ["enderecoCompleto"],
      });
    }
  }
});

/**
 * Valida a existência, status e preços dos itens no banco de dados,
 * recalculando o subtotal e gerando um snapshot seguro baseado exclusivamente no servidor.
 */
export async function validateAndPriceItems(
  items: z.infer<typeof orderSchema>["itemsSnapshot"],
  adminClient: any
) {
  let subtotalCalculado = 0;
  const itemsSnapshotSeguro = [];

  const parsePreco = (val: any, contexto: string) => {
    const p = Number(val);
    if (!Number.isFinite(p) || p <= 0) {
      throw new Error(`Preço inválido ou nulo para ${contexto}: ${val}`);
    }
    return p;
  };

  for (const item of items) {
    if (item.tipo === "avulso") {
      const { data: prod, error } = await adminClient
        .from("products")
        .select("nome, sabor, preco, foto_url, categoria, ativo, estoque, codigo_integracao")
        .eq("id", item.id)
        .single();

      if (error || !prod) throw new Error(`Produto não encontrado: ${item.id}`);
      if (!prod.ativo) throw new Error(`Produto inativo: ${prod.nome}`);
      if (Number(prod.estoque) < item.qty) throw new Error(`Estoque insuficiente: ${prod.nome}`);
      if (!prod.codigo_integracao) throw new Error(`Produto sem código de integração: ${prod.nome}`);

      const precoFinal = parsePreco(prod.preco, prod.nome);
      subtotalCalculado += precoFinal * item.qty;

      itemsSnapshotSeguro.push({
        tipo: "avulso",
        id: item.id,
        codigoIntegracao: prod.codigo_integracao,
        nome: prod.nome,
        sabor: prod.sabor,
        preco: precoFinal,
        foto_url: prod.foto_url,
        categoria: prod.categoria,
        qty: item.qty
      });

    } else if (item.tipo === "kit-degustacao") {
      const idsUnicos = Array.from(new Set(item.saboresIds));
      const { data: saboresBD, error: errS } = await adminClient
        .from("products")
        .select("id, nome, sabor, ativo")
        .in("id", idsUnicos);

      if (errS || !saboresBD || saboresBD.length !== idsUnicos.length) {
        throw new Error("Kit Degustação: Um ou mais sabores não foram encontrados ou são inválidos");
      }
      if (saboresBD.some((s: any) => !s.ativo)) {
        throw new Error("Kit Degustação: Um dos sabores escolhidos está inativo");
      }

      const { data: kitPrice, error: errP } = await adminClient
        .from("kit_prices")
        .select("preco")
        .eq("kit_type", "degustacao")
        .single();

      if (errP || !kitPrice) throw new Error("Preço do kit degustação não configurado no servidor");

      const precoFinal = parsePreco(kitPrice.preco, "Kit Degustação");
      subtotalCalculado += precoFinal * item.qty;

      const saboresLabelsSeguros = item.saboresIds.map(id => {
        const s = saboresBD.find((x: any) => x.id === id);
        if (!s) throw new Error(`Sabor ${id} não encontrado na lista retornada.`);
        return { nome: s.nome, sabor: s.sabor };
      });

      itemsSnapshotSeguro.push({
        tipo: "kit-degustacao",
        id: item.id,
        nome: "Kit Degustação",
        preco: precoFinal,
        qty: item.qty,
        saboresIds: item.saboresIds,
        saboresLabels: saboresLabelsSeguros
      });

    } else if (item.tipo === "kit-presenteavel") {
      const { data: licorBD, error: errL } = await adminClient
        .from("products")
        .select("nome, sabor, categoria, ativo, codigo_integracao")
        .eq("id", item.licor.id)
        .single();

      if (errL || !licorBD) throw new Error("Licor do kit presenteável não encontrado");
      if (!licorBD.ativo) throw new Error(`Licor inativo: ${licorBD.nome}`);
      if (!licorBD.codigo_integracao) throw new Error(`Licor sem código de integração: ${licorBD.nome}`);

      const { data: kitPrice, error: errP } = await adminClient
        .from("kit_prices")
        .select("preco")
        .eq("kit_type", "presenteavel")
        .eq("licor_categoria", licorBD.categoria)
        .eq("embalagem", item.embalagem === "Box Premium" ? "acrilico" : item.embalagem === "Box MDF" ? "mdf" : item.embalagem)
        .single();

      if (errP || !kitPrice) throw new Error(`Preço para Kit Presenteável (${licorBD.categoria} + ${item.embalagem}) não configurado`);

      const precoFinal = parsePreco(kitPrice.preco, "Kit Presenteável");
      subtotalCalculado += precoFinal * item.qty;

      itemsSnapshotSeguro.push({
        tipo: "kit-presenteavel",
        id: item.id,
        nome: "Kit Presenteável",
        preco: precoFinal,
        qty: item.qty,
        licor: {
          id: item.licor.id,
          codigoIntegracao: licorBD.codigo_integracao,
          nome: licorBD.nome,
          sabor: licorBD.sabor
        },
        acompanhamento: item.acompanhamento,
        embalagem: item.embalagem,
        dedicatoria: item.dedicatoria
      });
    }
  }

  return { itemsSnapshotSeguro, subtotalCalculado };
}

export type ShippingResult = {
  distanciaKm: number;
  freteCalculado: number;
  freteACombinar: boolean;
};

/**
 * Valida as coordenadas e calcula o frete no servidor usando OSRM.
 * Não confia em valores enviados pelo cliente.
 */
export async function validateAndCalculateShipping(
  tipoEntrega: "delivery" | "retirada",
  lat?: number,
  lng?: number
): Promise<ShippingResult> {
  if (tipoEntrega === "retirada") {
    return { distanciaKm: 0, freteCalculado: 0, freteACombinar: false };
  }

  if (lat === undefined || lng === undefined) {
    throw new Error("Coordenadas de entrega são obrigatórias para delivery.");
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Coordenadas geográficas inválidas.");
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new Error("Coordenadas geográficas fora dos limites permitidos.");
  }

  const ORIGEM = { lat: -28.7184, lng: -49.3523 };
  const url = `https://router.project-osrm.org/route/v1/driving/${ORIGEM.lng},${ORIGEM.lat};${lng},${lat}?overview=false`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Erro OSRM: ${response.statusText}`);
    }

    const data = await response.json();
    const distance = Number(data.routes?.[0]?.distance);

    if (!Number.isFinite(distance) || distance < 0) {
      throw new Error("Resposta de distância inválida.");
    }

    const distanciaKm = distance / 1000;

    if (distanciaKm > 35) {
      return {
        distanciaKm,
        freteCalculado: 0,
        freteACombinar: true
      };
    }

    const freteCalculado = Math.max(8, Math.round(distanciaKm * 2));

    return {
      distanciaKm,
      freteCalculado,
      freteACombinar: false
    };

  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error("O serviço de cálculo de frete demorou muito a responder.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data) => orderSchema.parse(data))
  .handler(async ({ data: o }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    try {
      try {
        const { syncStockFromGerenciapp } = await import("@/lib/gerenciapp-integration.server");
        await syncStockFromGerenciapp();
      } catch (syncError) {
        const message = syncError instanceof Error ? syncError.message : String(syncError);
        if (!message.includes("ainda não configurada")) throw syncError;
        console.warn("[createOrder] GerenciApp ainda não configurado; usando estoque local temporariamente.");
      }

      const { itemsSnapshotSeguro, subtotalCalculado } = await validateAndPriceItems(
        o.itemsSnapshot,
        supabaseAdmin
      );

      const { distanciaKm, freteCalculado, freteACombinar } = await validateAndCalculateShipping(
        o.tipoEntrega,
        o.latitude,
        o.longitude
      );

      const { data: dbData, error: dbError } = await supabaseAdmin.rpc("create_site_order_transactional", {
        p_request_id: o.requestId,
        p_cliente_nome: o.clienteNome,
        p_cliente_telefone: o.clienteTelefone,
        p_indicador_nome: o.indicadorNome ?? "",
        p_indicador_whatsapp: o.indicadorWhatsapp ?? "",
        p_items_snapshot: itemsSnapshotSeguro,
        p_subtotal: subtotalCalculado,
        p_frete_valor: freteCalculado,
        p_total: subtotalCalculado + freteCalculado,
        p_tipo_entrega: o.tipoEntrega,
        p_endereco_completo: o.enderecoCompleto ?? "",
        p_status_inicial: "pendente", // Adicionado para compatibilidade com a nova assinatura da RPC
      });

      if (dbError) throw dbError;
      const results = dbData as any[];
      if (!results || results.length === 0) throw new Error("Falha ao criar pedido.");

      const order = results[0] as { id: string; codigo_pedido: string; status: string; created_at: string };

      try {
        const { sendOrderToGerenciapp } = await import("@/lib/gerenciapp-integration.server");
        const linked = await sendOrderToGerenciapp({
          siteOrderId: order.id,
          codigoPedido: order.codigo_pedido,
          clienteNome: o.clienteNome,
          clienteTelefone: o.clienteTelefone,
          enderecoCompleto: o.enderecoCompleto,
          tipoEntrega: o.tipoEntrega,
          items: itemsSnapshotSeguro,
          subtotal: subtotalCalculado,
          frete: freteCalculado,
          total: subtotalCalculado + freteCalculado,
        });
        const { error: linkError } = await supabaseAdmin
          .from("site_orders")
          .update({
            status_gerenciapp: "sincronizado",
            gerenciapp_order_id: linked.orderId,
            sincronizado_gerenciapp_at: new Date().toISOString(),
          })
          .eq("id", order.id);
        if (linkError) throw linkError;
      } catch (integrationError) {
        console.error("[createOrder] Pedido salvo, mas não sincronizado com GerenciApp:", integrationError);
      }

      return { 
        success: true, 
        order,
        pricing: {
          subtotal: subtotalCalculado,
          frete: freteCalculado,
          total: subtotalCalculado + freteCalculado,
          distanciaKm,
          freteACombinar
        }
      };
    } catch (err: any) {
      console.error("Order process failure:", err);
      throw new Error(
        "Não foi possível registrar o pedido. Confira os dados e tente novamente."
      );
    }
  });
