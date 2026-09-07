import { supabaseAdmin } from "@/integrations/supabase/client.server";

function config() {
  const url = process.env.GERENCIAPP_INTEGRATION_URL?.replace(/\/+$/, "");
  const secret = process.env.GERENCIAPP_INTEGRATION_SECRET;
  if (!url || !secret) throw new Error("Integração com GerenciApp ainda não configurada.");
  return { url, secret };
}

export async function syncStockFromGerenciapp() {
  const { url, secret } = config();
  const response = await fetch(`${url}/api/public/integration/site`, {
    headers: { "x-integration-secret": secret },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`GerenciApp recusou consulta de estoque (${response.status}).`);

  const body = (await response.json()) as {
    products?: Array<{ codigoIntegracao: string; available: number }>;
  };
  const products = body.products ?? [];
  if (products.length === 0) throw new Error("GerenciApp não retornou licores mapeados.");

  // O GerenciApp só pode sobrescrever produtos explicitamente configurados
  // para controle automático. Produtos manuais preservam o valor do site.
  const { data: automaticProducts, error: automaticProductsError } = await supabaseAdmin
    .from("products")
    .select("id, codigo_integracao")
    .eq("stock_control_type", "gerenciapp")
    .eq("ativo", true)
    .not("codigo_integracao", "is", null);
  if (automaticProductsError) throw automaticProductsError;

  const byIntegrationCode = new Map(
    products.map((product) => [product.codigoIntegracao.trim().toUpperCase(), product]),
  );
  const productsToUpdate = (automaticProducts ?? []).flatMap((siteProduct) => {
    const code = siteProduct.codigo_integracao?.trim().toUpperCase();
    const gerenciappProduct = code ? byIntegrationCode.get(code) : undefined;
    return gerenciappProduct ? [{ id: siteProduct.id, product: gerenciappProduct }] : [];
  });

  const results = await Promise.all(
    productsToUpdate.map(({ id, product }) =>
      supabaseAdmin
        .from("products")
        .update({ estoque: Math.max(0, Math.floor(Number(product.available) || 0)) })
        .eq("id", id),
    ),
  );
  const failure = results.find((result) => result.error)?.error;
  if (failure) throw failure;
  return {
    updated: productsToUpdate.length,
    automatic: automaticProducts?.length ?? 0,
    ignoredManual: Math.max(0, products.length - productsToUpdate.length),
  };
}

export async function sendOrderToGerenciapp(input: {
  siteOrderId: string;
  codigoPedido: string;
  clienteNome: string;
  clienteTelefone: string;
  enderecoCompleto?: string;
  tipoEntrega: "delivery" | "retirada";
  items: unknown[];
  subtotal: number;
  frete: number;
  total: number;
}) {
  const { url, secret } = config();
  const response = await fetch(`${url}/api/public/integration/site`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-integration-secret": secret,
    },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(10000),
  });
  const result = (await response.json().catch(() => ({}))) as { orderId?: string; error?: string };
  if (!response.ok || !result.orderId) {
    throw new Error(result.error || `GerenciApp recusou o pedido (${response.status}).`);
  }
  return { orderId: result.orderId };
}

export function integrationAuthorized(request: Request) {
  const received = request.headers.get("x-integration-secret") ?? "";
  const expected = process.env.GERENCIAPP_INTEGRATION_SECRET ?? "";
  return expected.length >= 32 && received === expected;
}
