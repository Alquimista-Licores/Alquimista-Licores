import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import { PageHeader } from "@/components/PageHeader";
import type { Product } from "@/lib/types";
import { refreshGerenciappStock } from "@/lib/gerenciapp.functions";

export const Route = createFileRoute("/pocoes")({
  head: () => ({
    meta: [
      { title: "As Poções — Alquimista Licores" },
      { name: "description", content: "Licores artesanais finos, cremosos e especiais. Cada poção do Alquimista é feita à mão, em pequenos lotes, em Criciúma/SC." },
      { property: "og:title", content: "As Poções — Alquimista Licores" },
      { property: "og:description", content: "Licores artesanais finos, cremosos e especiais — cada poção feita à mão pelo Alquimista." },
      { property: "og:url", content: "/pocoes" },
      { property: "og:type", content: "product.group" },
    ],
    links: [{ rel: "canonical", href: "/pocoes" }],
  }),
  component: PocoesPage,
});

const TABS: { id: "all" | "fino" | "cremoso" | "especial"; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "fino", label: "Licores Finos" },
  { id: "cremoso", label: "Licores Cremosos" },
  { id: "especial", label: "Licores Especiais" },
];

function PocoesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState<"all" | "fino" | "cremoso" | "especial">("all");
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    void (async () => {
      await refreshGerenciappStock().catch((error) => console.warn("Estoque do GerenciApp indisponível:", error));
      const { data } = await supabase.from("products").select("*").eq("ativo", true).order("ordem");
      if (data) setProducts(data as any);
    })();
  }, []);

  const filtered = tab === "all" ? products : products.filter((p) => p.categoria === tab);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 pb-16">
      <PageHeader title="As Poções" subtitle="Cada garrafa carrega um ritual." />
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-full text-xs font-display tracking-widest uppercase transition-all ${tab === t.id ? "bg-[var(--gold)] text-[var(--background)]" : "border border-[var(--gold)]/30 text-[var(--cream)]/80 hover:border-[var(--gold)]"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5 lg:gap-6">
        {filtered.map((p) => (
          <ProductCard key={p.id} p={p as any} onClick={() => setSelected(p)} />
        ))}
      </div>

      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
