import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";
import type { Product } from "@/lib/types";
import { refreshGerenciappStock } from "@/lib/gerenciapp.functions";

export function FeaturedSection() {
  const [selected, setSelected] = useState<Product | null>(null);
  const { data: featured } = useQuery({
    queryKey: ["featured"],
    queryFn: async () => {
      await refreshGerenciappStock().catch((error) => console.warn("Estoque do GerenciApp indisponível:", error));
      const { data: cfg } = await supabase.from("featured_config").select("*").eq("id", 1).maybeSingle();
      const modo = cfg?.modo ?? "auto";
      const ids = (cfg?.produto_ids ?? []) as string[];
      let query = supabase.from("products").select("*").eq("ativo", true);
      if (modo === "manual" && ids.length > 0) {
        query = query.in("id", ids);
      } else {
        query = query.order("pedidos_count", { ascending: false }).limit(4);
      }
      const { data } = await query;
      return (data ?? []) as unknown as Product[];
    },
  });

  if (!featured || featured.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-medium text-[var(--cream)] tracking-wide">Poções em destaque</h2>
        <div className="w-16 h-px bg-[var(--gold)]/40 mx-auto mt-4" />
        <p className="font-sans italic text-[var(--text-soft)] mt-2">Os preferidos do Alquimista.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
        {featured.map((p) => (
          <ProductCard key={p.id} p={p} onClick={() => setSelected(p)} />
        ))}
      </div>
      <div className="text-center mt-10">
        <Link to="/pocoes" className="inline-block px-12 py-5 bg-transparent border border-[var(--gold)] text-[var(--gold)] font-sans font-semibold tracking-[0.2em] uppercase hover:bg-[var(--gold)] hover:text-[var(--background)] transition-all rounded-sm text-xs">
          Ver todas as poções
        </Link>
      </div>
      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
