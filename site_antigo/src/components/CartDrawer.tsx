import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Trash2, Minus, Plus } from "lucide-react";
import { useCart, type CartItem } from "@/store/cart";
import { fmtPrice } from "@/lib/site";
import { CheckoutForm } from "@/components/CheckoutForm";
import { refreshGerenciappStock } from "@/lib/gerenciapp.functions";

export function CartDrawer() {
  const open = useCart((s) => s.open);
  const setOpen = useCart((s) => s.setOpen);
  const items = useCart((s) => s.items);
  const remove = useCart((s) => s.remove);
  const setQty = useCart((s) => s.setQty);
  const total = useCart((s) => s.total());
  const usageByProduct = useCart((s) => s.usageByProduct);
  const navigate = useNavigate();
  const [stage, setStage] = useState<"list" | "checkout">("list");

  const { data: products = [] } = useQuery({
    queryKey: ["products-stock"],
    queryFn: async () => {
      await refreshGerenciappStock().catch((error) => console.warn("Estoque do GerenciApp indisponível:", error));
      const { data } = await supabase.from("products").select("id,estoque").eq("ativo", true);
      return (data || []) as { id: string; estoque: number }[];
    },
  });
  const stockMap = new Map(products.map((p) => [p.id, p.estoque]));

  function canIncrement(item: CartItem): { ok: true } | { ok: false; reason: string } {
    // For each product this item consumes per unit, check usage + 1 vs stock.
    const perUnit: Record<string, number> = {};
    if (item.tipo === "avulso") {
      perUnit[item.id] = 1;
    } else if (item.tipo === "kit-degustacao") {
      for (const id of item.saboresIds) perUnit[id] = (perUnit[id] || 0) + 1;
    } else if (item.tipo === "kit-presenteavel") {
      perUnit[item.licor.id] = 1;
    }
    for (const [pid, per] of Object.entries(perUnit)) {
      const stock = stockMap.get(pid);
      if (stock === undefined) continue;
      const used = usageByProduct(pid);
      if (used + per > stock) {
        return { ok: false, reason: `Estoque insuficiente para este produto (restam ${Math.max(0, stock - used)})` };
      }
    }
    return { ok: true };
  }

  function tryIncrement(item: CartItem) {
    const r = canIncrement(item);
    if (!r.ok) {
      toast.error(r.reason);
      return;
    }
    setQty(item.id, item.qty + 1);
  }

  function close() {
    setOpen(false);
    setStage("list");
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setStage("list"); }}>
      <SheetContent
        side="right"
        className="bg-[var(--background)] border-l border-[var(--gold)]/20 text-[var(--cream)] w-full sm:max-w-md flex flex-col"
      >
        <SheetHeader>
          <SheetTitle className="font-display tracking-widest text-[var(--gold)]">
            {stage === "checkout" ? "Fechar pedido" : "Seu Caldeirão"}
          </SheetTitle>
        </SheetHeader>

        {stage === "list" ? (
          <>
            <div className="flex-1 overflow-y-auto py-4 -mx-6 px-6">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4 text-[var(--gold)]/40">⚗</div>
                  <p className="font-sans italic text-[var(--text-soft)] mb-6">
                    Seu caldeirão está vazio. Escolha suas poções.
                  </p>
                  <button
                    onClick={() => { close(); navigate({ to: "/pocoes" }); }}
                    className="px-5 py-2.5 border border-[var(--gold)] text-[var(--gold)] text-xs font-body tracking-widest uppercase hover:bg-[var(--gold)] hover:text-[var(--background)] transition-colors rounded-sm"
                  >
                    Ver as Poções
                  </button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((i) => (
                    <li key={i.id} className="flex gap-3 pb-4 border-b border-[var(--gold)]/10">
                      <ItemThumb item={i} />
                      <div className="flex-1 min-w-0">
                        <div className="font-display text-sm text-[var(--gold)] truncate">{itemTitle(i)}</div>
                        <div className="font-sans italic text-xs text-[var(--text-soft)]">{itemSubtitle(i)}</div>
                        <div className="text-base md:text-lg mt-1">{fmtPrice(i.preco)} un.</div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="inline-flex items-center border border-[var(--gold)]/30 rounded-sm">
                            <button onClick={() => setQty(i.id, i.qty - 1)} className="px-2 py-1 hover:text-[var(--gold)]">
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs">{i.qty}</span>
                            <button onClick={() => tryIncrement(i)} className="px-2 py-1 hover:text-[var(--gold)]">
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button onClick={() => remove(i.id)} className="ml-auto text-[var(--text-faded)] hover:text-[var(--wine)]">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-lg md:text-xl font-display text-[var(--gold)]">
                        {fmtPrice(i.preco * i.qty)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-[var(--gold)]/20 pt-4 space-y-3">
                <div className="flex justify-between items-baseline font-display tracking-wider">
                  <span className="text-lg md:text-xl">Total</span>
                  <span className="text-[var(--gold)] text-3xl md:text-4xl">{fmtPrice(total)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { close(); navigate({ to: "/pocoes" }); }}
                    className="py-3 border border-[var(--gold)]/40 text-[var(--gold)] text-xs font-body tracking-widest uppercase hover:bg-[var(--gold)]/10 transition-colors rounded-sm"
                  >
                    Continuar comprando
                  </button>
                  <button
                    onClick={() => setStage("checkout")}
                    className="py-3 bg-[var(--gold)] text-[var(--background)] font-body tracking-widest uppercase text-xs hover:bg-[var(--gold-hover)] transition-colors rounded-sm"
                  >
                    Finalizar pedido
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 overflow-y-auto py-4 -mx-6 px-6">
            <CheckoutForm onBack={() => setStage("list")} onSent={close} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function itemTitle(i: CartItem) {
  if (i.tipo === "avulso") return i.nome;
  if (i.tipo === "kit-degustacao") return "Kit Degustação";
  return "Kit Presenteável";
}

function itemSubtitle(i: CartItem) {
  if (i.tipo === "avulso") return i.sabor;
  if (i.tipo === "kit-degustacao") return i.saboresLabels.map((s) => s.nome).join(" · ");
  return `${i.licor.nome} · ${i.acompanhamento} · ${i.embalagem}`;
}

function ItemThumb({ item }: { item: CartItem }) {
  const foto = item.tipo === "avulso" ? item.foto_url : null;
  const emoji = item.tipo === "kit-degustacao" ? "⚗" : item.tipo === "kit-presenteavel" ? "🎁" : "⚗";
  return (
    <div className="w-16 h-20 bg-[var(--surface-elevated)] rounded-sm overflow-hidden flex items-center justify-center text-[var(--gold)]/50 text-xl shrink-0">
      {foto ? <img src={foto} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" /> : emoji}
    </div>
  );
}
