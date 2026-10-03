import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * ============================================================================
 * 1. SUPABASE DO SITE & JORNADA DO ALQUIMISTA (Projeto Oficial: bktegbisdaqdhpqtxqxy)
 * ============================================================================
 */
const SITE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdGVnYmlzZGFxZGhwcXR4cXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1Njg2NzksImV4cCI6MjEwNTE0NDY3OX0.nUbhe2vFtcnFOZPO6Nww-IjdGJAPCIC1Z82CladmjG4";

export const SUPABASE_CONFIG = {
  url: import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || "https://bktegbisdaqdhpqtxqxy.supabase.co",
  anonKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || import.meta.env.SUPABASE_PUBLISHABLE_KEY || SITE_ANON_KEY,
  projectId: import.meta.env.VITE_SUPABASE_PROJECT_ID || "bktegbisdaqdhpqtxqxy",
  storage: {
    productImages: "https://bktegbisdaqdhpqtxqxy.supabase.co/storage/v1/object/public/product-images",
    jornadaEvidencias: "https://bktegbisdaqdhpqtxqxy.supabase.co/storage/v1/object/authenticated/jornada-evidencias",
  }
};

/**
 * Instância singleton do cliente Supabase para o Site & Jornada (Padrão)
 */
export const supabase: SupabaseClient = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey || "sb_placeholder_anon_key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: `sb-${SUPABASE_CONFIG.projectId}-auth-token`,
    }
  }
);

// Alias explícito para clareza
export const supabaseSite: SupabaseClient = supabase;

/**
 * ============================================================================
 * 2. SUPABASE DO GERENCIADOR DE PEDIDOS (Projeto Externo: vppvryuvbhrunvucnvax)
 * ============================================================================
 */
const GERENCIADOR_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwcHZyeXV2YmhydW52dWNudmF4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjA2MTc0MSwiZXhwIjoyMTAxNjM3NzQxfQ.3PEgX41NwnlX3JraY-YCPocbYi_Qm9MDOJzqQYnWLLs";

export const GERENCIADOR_CONFIG = {
  url: import.meta.env.PUBLIC_GERENCIADOR_SUPABASE_URL || "https://vppvryuvbhrunvucnvax.supabase.co",
  anonKey: import.meta.env.PUBLIC_GERENCIADOR_SUPABASE_ANON_KEY || GERENCIADOR_ANON_KEY,
  serviceKey: import.meta.env.GERENCIADOR_SUPABASE_SERVICE_KEY || GERENCIADOR_SERVICE_KEY,
  projectId: "vppvryuvbhrunvucnvax",
};

/**
 * Instância do cliente Supabase para o Gerenciador de Pedidos (Anon / Client)
 */
export const supabaseGerenciador: SupabaseClient = createClient(
  GERENCIADOR_CONFIG.url,
  GERENCIADOR_CONFIG.anonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      storageKey: `sb-${GERENCIADOR_CONFIG.projectId}-auth-token`,
    }
  }
);

/**
 * Instância com Service Role Key para operações de escrita e sincronização no Gerenciador
 */
export const supabaseGerenciadorAdmin: SupabaseClient = createClient(
  GERENCIADOR_CONFIG.url,
  GERENCIADOR_CONFIG.serviceKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

export interface CartSyncItem {
  id?: string;
  tipo: "avulso" | "kit-degustacao" | "kit-presenteavel";
  nome: string;
  sabor?: string;
  preco: number;
  qty: number;
  licor?: { id?: string; nome: string; sabor: string };
  acompanhamento?: string;
  embalagem?: string;
  dedicatoria?: string;
  saboresLabels?: Array<{ nome: string; sabor: string }>;
}

export interface GerenciAppOrderSyncInput {
  codigoPedido: string;
  clienteNome: string;
  clienteTelefone: string;
  indicadorNome?: string | null;
  indicadorWhatsapp?: string | null;
  tipoEntrega: "delivery" | "retirada";
  enderecoCompleto?: string;
  cartItems: CartSyncItem[];
  subtotal: number;
  frete: number;
  total: number;
  siteOrderId?: string;
}

/**
 * Sincroniza um pedido finalizado no Site diretamente no GerenciApp (Supabase 2).
 * 1. Verifica se o telefone do cliente já existe (em telefone_normalizado, whatsapp ou telefone).
 * 2. Se existir, reutiliza o cliente. Se não, cria um novo cliente com o nome e telefone informados.
 * 3. Cria o pedido com status 'aguardando_pagamento'.
 * 4. Insere os itens na tabela itens_pedido.
 * 5. Registra o histórico da operação.
 */
export async function syncOrderToGerenciApp(orderData: GerenciAppOrderSyncInput): Promise<{ orderId: string | null; error: string | null }> {
  try {
    const rawDigits = (orderData.clienteTelefone || "").replace(/\D/g, "");
    const digits = rawDigits.replace(/^55(?=\d{10,11}$)/, "");
    const last8 = digits.slice(-8);

    // 1. Busca cliente existente no GerenciApp
    let existingClient: { id: string; nome?: string } | null = null;
    if (digits) {
      const { data: byNorm } = await supabaseGerenciadorAdmin
        .from("clientes")
        .select("id, nome, telefone, whatsapp, telefone_normalizado")
        .eq("telefone_normalizado", digits)
        .is("deleted_at", null)
        .maybeSingle();
      if (byNorm) existingClient = byNorm;
    }

    if (!existingClient && last8.length >= 8) {
      const { data: byWhats } = await supabaseGerenciadorAdmin
        .from("clientes")
        .select("id, nome, telefone, whatsapp, telefone_normalizado")
        .ilike("whatsapp", `%${last8}%`)
        .is("deleted_at", null)
        .limit(1);
      if (byWhats && byWhats.length > 0) existingClient = byWhats[0];
    }

    if (!existingClient && last8.length >= 8) {
      const { data: byPhone } = await supabaseGerenciadorAdmin
        .from("clientes")
        .select("id, nome, telefone, whatsapp, telefone_normalizado")
        .ilike("telefone", `%${last8}%`)
        .is("deleted_at", null)
        .limit(1);
      if (byPhone && byPhone.length > 0) existingClient = byPhone[0];
    }

    let clientId: string;
    if (existingClient) {
      clientId = existingClient.id;
    } else {
      const { data: newClient, error: cErr } = await supabaseGerenciadorAdmin
        .from("clientes")
        .insert({
          nome: orderData.clienteNome.trim(),
          telefone: orderData.clienteTelefone.trim(),
          whatsapp: orderData.clienteTelefone.trim(),
          telefone_normalizado: digits || rawDigits,
          endereco: orderData.tipoEntrega === "delivery" ? (orderData.enderecoCompleto || null) : null,
          origem: "site_alquimista",
          origem_externa: "site_alquimista",
        })
        .select("id, nome")
        .single();

      if (cErr) {
        console.warn("Erro ao cadastrar novo cliente no GerenciApp:", cErr);
        throw cErr;
      }
      clientId = newClient.id;
    }

    // 2. Monta observações descritivas do pedido
    const obsParts: string[] = [];
    if (orderData.tipoEntrega === "delivery") {
      obsParts.push(`🛵 Delivery: ${orderData.enderecoCompleto || "Endereço não informado"}`);
    } else {
      obsParts.push("🏠 Retirada no Local");
    }
    if (orderData.indicadorNome || orderData.indicadorWhatsapp) {
      obsParts.push(`🌟 Indicação: ${orderData.indicadorNome || ""}${orderData.indicadorWhatsapp ? ` (${orderData.indicadorWhatsapp})` : ""}`);
    }

    // 3. Cria o pedido com status 'aguardando_pagamento'
    const { data: newOrder, error: oErr } = await supabaseGerenciadorAdmin
      .from("pedidos")
      .insert({
        numero: `#${orderData.codigoPedido}`,
        cliente_id: clientId,
        status: "aguardando_pagamento",
        data_pedido: new Date().toISOString(),
        data_entrega: null,
        total: orderData.total,
        frete_valor: orderData.frete,
        origem_externa: "site_alquimista",
        site_order_id: orderData.siteOrderId || null,
        observacoes: obsParts.join(" · "),
      })
      .select("id")
      .single();

    if (oErr) {
      console.warn("Erro ao criar pedido no GerenciApp:", oErr);
      throw oErr;
    }

    // 4. Busca variações cadastradas para vincular produto_id e variacao_id quando possível
    const { data: variacoes } = await supabaseGerenciadorAdmin
      .from("variacoes_produto")
      .select("id, produto_id, nome, codigo_integracao")
      .is("deleted_at", null);

    // 5. Monta e insere os itens do pedido
    const itemsToInsert: Array<Record<string, any>> = [];
    for (const item of orderData.cartItems) {
      if (item.tipo === "avulso") {
        const matched = variacoes?.find(
          (v) => item.sabor && v.nome.toLowerCase().trim() === item.sabor.toLowerCase().trim()
        );
        itemsToInsert.push({
          pedido_id: newOrder.id,
          produto_id: matched?.produto_id || null,
          variacao_id: matched?.id || null,
          descricao: `${item.nome} (${item.sabor || "Padrão"})`,
          quantidade: item.qty,
          preco_unitario: item.preco,
          subtotal: item.preco * item.qty,
        });
      } else if (item.tipo === "kit-degustacao") {
        const saboresText = (item.saboresLabels || []).map((s) => `${s.nome} (${s.sabor})`).join(", ");
        itemsToInsert.push({
          pedido_id: newOrder.id,
          produto_id: null,
          variacao_id: null,
          descricao: `Kit Degustação (5x 50ml)${saboresText ? `: ${saboresText}` : ""}`,
          quantidade: item.qty,
          preco_unitario: item.preco,
          subtotal: item.preco * item.qty,
        });
      } else if (item.tipo === "kit-presenteavel") {
        const matched = variacoes?.find(
          (v) => item.licor?.sabor && v.nome.toLowerCase().trim() === item.licor.sabor.toLowerCase().trim()
        );
        const descParts = [
          "Kit Presenteável",
          item.licor ? `${item.licor.nome} (${item.licor.sabor})` : "Licor",
          item.acompanhamento,
          item.embalagem,
        ].filter(Boolean);
        if (item.dedicatoria) {
          descParts.push(`Dedicatória: "${item.dedicatoria}"`);
        }
        itemsToInsert.push({
          pedido_id: newOrder.id,
          produto_id: matched?.produto_id || null,
          variacao_id: matched?.id || null,
          descricao: descParts.join(" · "),
          quantidade: item.qty,
          preco_unitario: item.preco,
          subtotal: item.preco * item.qty,
        });
      }
    }

    if (orderData.frete > 0) {
      itemsToInsert.push({
        pedido_id: newOrder.id,
        produto_id: null,
        variacao_id: null,
        descricao: "Taxa de Entrega (Site)",
        quantidade: 1,
        preco_unitario: orderData.frete,
        subtotal: orderData.frete,
      });
    }

    if (itemsToInsert.length > 0) {
      const { error: itErr } = await supabaseGerenciadorAdmin.from("itens_pedido").insert(itemsToInsert);
      if (itErr) console.warn("Aviso ao inserir itens do pedido no GerenciApp:", itErr);
    }

    // 6. Registra no histórico do GerenciApp
    try {
      await supabaseGerenciadorAdmin.from("historico").insert({
        entidade: "pedido",
        entidade_id: newOrder.id,
        acao: "importado_do_site",
        origem: "site_alquimista",
        dados: {
          codigo_pedido: orderData.codigoPedido,
          cliente_nome: orderData.clienteNome,
          cliente_telefone: orderData.clienteTelefone,
          total: orderData.total,
          itens_count: orderData.cartItems.length,
        },
      });
    } catch (_) {}

    return { orderId: newOrder.id, error: null };
  } catch (err: any) {
    console.error("Falha ao sincronizar pedido com o GerenciApp:", err);
    return { orderId: null, error: err?.message || "Erro desconhecido na sincronização" };
  }
}

/**
 * Helper para chamadas REST genéricas ao Supabase do Site
 */
export async function supabaseRestFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    const url = `${SUPABASE_CONFIG.url}/rest/v1/${endpoint.replace(/^\//, '')}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    };

    if (SUPABASE_CONFIG.anonKey) {
      headers["apikey"] = SUPABASE_CONFIG.anonKey;
      headers["Authorization"] = `Bearer ${SUPABASE_CONFIG.anonKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errText = await response.text();
      return { data: null, error: errText || `HTTP Error ${response.status}` };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err?.message || "Falha na conexão com Supabase" };
  }
}

