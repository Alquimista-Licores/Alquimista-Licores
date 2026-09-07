import { supabase } from "@/integrations/supabase/client";

export type OrderItem = { id: string; nome: string; qty: number };

/**
 * Increments pedidos_count for each item. Stock-zero alerts are handled
 * automatically by a Postgres trigger that fires a web-push notification
 * to the admin's registered devices.
 */
export async function recordOrder(items: OrderItem[]) {
  if (!items.length) return;
  await Promise.all(
    items.flatMap((i) => [
      supabase.rpc("increment_pedidos", { _product_id: i.id, _qty: i.qty }),
      supabase.rpc("decrement_estoque", { _product_id: i.id, _qty: i.qty }),
    ]),
  );
}