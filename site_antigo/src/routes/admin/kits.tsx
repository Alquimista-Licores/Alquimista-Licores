import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/AdminShell";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { fmtPrice } from "@/lib/site";

export const Route = createFileRoute("/admin/kits")({
  head: () => ({ meta: [{ title: "Kits · Admin" }, { name: "robots", content: "noindex" }] }),
  component: KitsAdmin,
});

type KP = { id: string; kit_type: string; licor_categoria: string | null; embalagem: string | null; preco: number };

function KitsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-kits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("kit_prices").select("*").order("kit_type").order("preco");
      if (error) throw error;
      return data as KP[];
    },
  });

  const [editing, setEditing] = useState<Partial<KP> | null>(null);

  async function save() {
    if (!editing?.kit_type || editing.preco == null) {
      toast.error("Preencha tipo e preço");
      return;
    }
    const payload = {
      kit_type: editing.kit_type,
      licor_categoria: (editing.licor_categoria || null) as "fino" | "cremoso" | "especial" | null,
      embalagem: editing.embalagem || null,
      preco: Number(editing.preco),
    };
    const op = editing.id
      ? supabase.from("kit_prices").update(payload).eq("id", editing.id)
      : supabase.from("kit_prices").insert(payload);
    const { error } = await op;
    if (error) { toast.error(error.message); return; }
    toast.success("Kit salvo.");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-kits"] });
    qc.invalidateQueries({ queryKey: ["kit_prices"] });
  }

  async function remove(id: string) {
    if (!confirm("Remover preço de kit?")) return;
    const { error } = await supabase.from("kit_prices").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-kits"] });
  }

  return (
    <AdminShell title="Preços de Kits">
      <button onClick={() => setEditing({ kit_type: "presenteavel", licor_categoria: "fino", embalagem: "caixa", preco: 0 })} className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-[var(--gold)] text-[var(--background)] font-display tracking-widest text-xs uppercase rounded-sm hover:bg-[var(--gold-hover)]">
        <Plus className="w-4 h-4" /> Novo preço
      </button>

      <div className="overflow-x-auto border border-[var(--gold)]/15 rounded-sm">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface)]/60 text-[var(--cream)]/60 text-xs uppercase tracking-widest">
            <tr>
              <th className="text-left px-3 py-2">Tipo</th>
              <th className="text-left px-3 py-2">Categoria do licor</th>
              <th className="text-left px-3 py-2">Embalagem</th>
              <th className="text-right px-3 py-2">Preço</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data?.map((k) => (
              <tr key={k.id} className="border-t border-[var(--gold)]/10 hover:bg-[var(--surface)]/40">
                <td className="px-3 py-2 text-[var(--cream)]">{k.kit_type}</td>
                <td className="px-3 py-2 text-[var(--cream)]/70">{k.licor_categoria ?? "—"}</td>
                <td className="px-3 py-2 text-[var(--cream)]/70">{k.embalagem ?? "—"}</td>
                <td className="px-3 py-2 text-right text-[var(--gold)]">{fmtPrice(Number(k.preco))}</td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(k)} className="p-2 text-[var(--gold)] hover:bg-[var(--gold)]/10 rounded-sm"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(k.id)} className="p-2 text-[var(--vinho)] hover:bg-[var(--vinho)]/10 rounded-sm"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--gold)]/30 rounded-md p-6">
            <h3 className="font-display text-lg text-[var(--gold)] mb-4">{editing.id ? "Editar" : "Novo"} preço de kit</h3>
            <div className="grid gap-3 text-sm">
              <Field label="Tipo de kit">
                <select value={editing.kit_type} onChange={(e) => setEditing({ ...editing, kit_type: e.target.value })} className={inputCls}>
                  <option value="degustacao">Degustação</option>
                  <option value="presenteavel">Presenteável</option>
                  <option value="avulso">Avulso</option>
                </select>
              </Field>
              <Field label="Categoria do licor (opcional)">
                <select value={editing.licor_categoria ?? ""} onChange={(e) => setEditing({ ...editing, licor_categoria: e.target.value || null })} className={inputCls}>
                  <option value="">—</option>
                  <option value="fino">Fino</option>
                  <option value="cremoso">Cremoso</option>
                  <option value="especial">Especial</option>
                </select>
              </Field>
              <Field label="Embalagem (opcional)">
                <input value={editing.embalagem ?? ""} onChange={(e) => setEditing({ ...editing, embalagem: e.target.value })} className={inputCls} placeholder="ex: caixa, saco juta" />
              </Field>
              <Field label="Preço (R$)">
                <input type="number" step="0.01" value={editing.preco ?? 0} onChange={(e) => setEditing({ ...editing, preco: Number(e.target.value) })} className={inputCls} />
              </Field>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-[var(--cream)]/70">Cancelar</button>
              <button onClick={save} className="px-4 py-2 bg-[var(--gold)] text-[var(--background)] font-display tracking-widest text-xs uppercase rounded-sm hover:bg-[var(--gold-hover)]">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

const inputCls = "w-full bg-[var(--background)] border border-[var(--gold)]/20 rounded-sm px-3 py-2 text-[var(--cream)] focus:border-[var(--gold)] outline-none";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<label className="block"><span className="block text-[10px] uppercase tracking-widest text-[var(--cream)]/50 mb-1">{label}</span>{children}</label>);
}