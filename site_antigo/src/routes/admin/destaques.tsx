import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/AdminShell";
import { toast } from "sonner";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/admin/destaques")({
  head: () => ({ meta: [{ title: "Destaques · Admin" }, { name: "robots", content: "noindex" }] }),
  component: DestaquesAdmin,
});

function DestaquesAdmin() {
  const qc = useQueryClient();
  const { data: products } = useQuery({
    queryKey: ["admin-products-min"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id,nome,sabor,categoria,pedidos_count,ativo").eq("ativo", true).order("nome");
      if (error) throw error;
      return data as Pick<Product, "id" | "nome" | "sabor" | "categoria" | "pedidos_count" | "ativo">[];
    },
  });
  const { data: cfg } = useQuery({
    queryKey: ["featured-cfg"],
    queryFn: async () => {
      const { data, error } = await supabase.from("featured_config").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data as { id: number; modo: string; produto_ids: string[] } | null;
    },
  });

  const [modo, setModo] = useState<"auto" | "manual">("auto");
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    if (cfg) {
      setModo((cfg.modo as "auto" | "manual") ?? "auto");
      setIds(cfg.produto_ids ?? []);
    }
  }, [cfg]);

  function toggle(id: string) {
    setIds((arr) => arr.includes(id) ? arr.filter((x) => x !== id) : arr.length >= 4 ? arr : [...arr, id]);
  }

  async function save() {
    const { error } = await supabase.from("featured_config").upsert({ id: 1, modo, produto_ids: ids });
    if (error) { toast.error(error.message); return; }
    toast.success("Destaques salvos.");
    qc.invalidateQueries({ queryKey: ["featured-cfg"] });
    qc.invalidateQueries({ queryKey: ["featured"] });
  }

  return (
    <AdminShell title="Destaques da Home">
      <div className="border border-[var(--gold)]/15 bg-[var(--surface)]/60 p-4 rounded-sm mb-6">
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2 text-[var(--cream)]">
            <input type="radio" checked={modo === "auto"} onChange={() => setModo("auto")} />
            Automático (top 4 mais pedidos)
          </label>
          <label className="flex items-center gap-2 text-[var(--cream)]">
            <input type="radio" checked={modo === "manual"} onChange={() => setModo("manual")} />
            Manual (escolher até 4)
          </label>
        </div>
      </div>

      {modo === "manual" && (
        <div className="grid sm:grid-cols-2 gap-2 mb-6">
          {products?.map((p) => {
            const sel = ids.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                className={`text-left border p-3 rounded-sm transition-colors ${sel ? "border-[var(--gold)] bg-[var(--gold)]/10" : "border-[var(--gold)]/15 bg-[var(--surface)]/40 hover:border-[var(--gold)]/40"}`}
              >
                <div className="font-display text-sm text-[var(--cream)]">{p.nome}</div>
                <div className="text-xs text-[var(--cream)]/50">{p.sabor} · {p.pedidos_count} pedidos</div>
              </button>
            );
          })}
        </div>
      )}

      <div className="text-xs text-[var(--cream)]/50 mb-3">{modo === "manual" ? `${ids.length}/4 selecionados` : "Atualiza automaticamente"}</div>
      <button onClick={save} className="px-5 py-2.5 bg-[var(--gold)] text-[var(--background)] font-display tracking-widest text-xs uppercase rounded-sm hover:bg-[var(--gold-hover)]">Salvar</button>
    </AdminShell>
  );
}