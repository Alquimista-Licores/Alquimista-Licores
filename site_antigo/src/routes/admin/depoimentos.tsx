import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/AdminShell";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/depoimentos")({
  head: () => ({ meta: [{ title: "Depoimentos · Admin" }, { name: "robots", content: "noindex" }] }),
  component: DepoimentosAdmin,
});

type T = { id: string; nome: string; texto: string; ativo: boolean };

function DepoimentosAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as T[];
    },
  });

  const [editing, setEditing] = useState<Partial<T> | null>(null);

  async function save() {
    if (!editing?.nome || !editing.texto) { toast.error("Preencha nome e texto"); return; }
    const payload = { nome: editing.nome, texto: editing.texto, ativo: editing.ativo ?? true };
    const op = editing.id
      ? supabase.from("testimonials").update(payload).eq("id", editing.id)
      : supabase.from("testimonials").insert(payload);
    const { error } = await op;
    if (error) { toast.error(error.message); return; }
    toast.success("Depoimento salvo.");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
    qc.invalidateQueries({ queryKey: ["testimonials"] });
  }

  async function remove(id: string) {
    if (!confirm("Remover depoimento?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
  }

  return (
    <AdminShell title="Depoimentos">
      <button onClick={() => setEditing({ nome: "", texto: "", ativo: true })} className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-[var(--gold)] text-[var(--background)] font-display tracking-widest text-xs uppercase rounded-sm hover:bg-[var(--gold-hover)]">
        <Plus className="w-4 h-4" /> Novo depoimento
      </button>

      <div className="grid gap-3">
        {data?.map((t) => (
          <div key={t.id} className="border border-[var(--gold)]/15 bg-[var(--surface)]/60 p-4 rounded-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="font-display text-sm text-[var(--gold)]">{t.nome} {!t.ativo && <span className="text-[var(--cream)]/40 text-xs">(oculto)</span>}</div>
                <p className="font-sans italic text-[var(--cream)]/80 mt-1">"{t.texto}"</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing(t)} className="p-2 text-[var(--gold)] hover:bg-[var(--gold)]/10 rounded-sm"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => remove(t.id)} className="p-2 text-[var(--vinho)] hover:bg-[var(--vinho)]/10 rounded-sm"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--gold)]/30 rounded-md p-6">
            <h3 className="font-display text-lg text-[var(--gold)] mb-4">{editing.id ? "Editar" : "Novo"} depoimento</h3>
            <div className="grid gap-3 text-sm">
              <input value={editing.nome ?? ""} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} placeholder="Nome do cliente" className={inputCls} />
              <textarea value={editing.texto ?? ""} onChange={(e) => setEditing({ ...editing, texto: e.target.value })} placeholder="Texto do depoimento" className={`${inputCls} min-h-[100px]`} />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editing.ativo ?? true} onChange={(e) => setEditing({ ...editing, ativo: e.target.checked })} />
                <span className="text-[var(--cream)]/70">Visível no site</span>
              </label>
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