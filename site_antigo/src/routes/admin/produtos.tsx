import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/AdminShell";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, Loader2, RefreshCw } from "lucide-react";
import type { Product, PhotoVariants } from "@/lib/types";
import { fmtPrice, categoriaLabel } from "@/lib/site";
import { resizeToVariants, resizeUrlToVariants, type ResizedBlobs } from "@/lib/image-resize";
import { refreshGerenciappStock } from "@/lib/gerenciapp.functions";

export const Route = createFileRoute("/admin/produtos")({
  head: () => ({ meta: [{ title: "Produtos · Admin" }, { name: "robots", content: "noindex" }] }),
  component: ProdutosAdmin,
});

type Form = Partial<Product>;
const empty: Form = {
  nome: "", sabor: "", categoria: "fino", preco: 38, volume_ml: 750,
  estoque: 0, brix: 20, graduacao_gl: 22, notas_aromaticas: "", descricao: "",
  sugestoes: "", ingredientes: "", foto_url: "", fotos_urls: [], fotos: [], ativo: true, ordem: 0,
  codigo_integracao: "", stock_control_type: "manual",
};

function ProdutosAdmin() {
  const qc = useQueryClient();
  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("ordem").order("nome");
      if (error) throw error;
      return (data || []) as unknown as Product[];
    },
  });

  const [editing, setEditing] = useState<Form | null>(null);
  const [uploading, setUploading] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);

  function openNew() { setEditing({ ...empty }); }
  function openEdit(p: Product) {
    const urls = p.fotos_urls ?? [];
    const merged = p.foto_url && !urls.includes(p.foto_url)
      ? [p.foto_url, ...urls]
      : urls;
    setEditing({
      ...p,
      fotos_urls: merged,
      fotos: (p.fotos ?? []) as PhotoVariants[],
      foto_url: p.foto_url || merged[0] || "",
    });
  }

  async function save() {
    if (!editing?.nome || !editing.sabor) {
      toast.error("Nome e sabor são obrigatórios");
      return;
    }
    if (!editing.codigo_integracao?.trim()) {
      toast.error("O código de integração é obrigatório");
      return;
    }
    // Detect transition to zero stock to trigger WhatsApp alert
    const prev = editing.id ? products?.find((p) => p.id === editing.id) : null;
    const wasZero = prev ? Number(prev.estoque) === 0 : false;
    const willBeZero = Number(editing.estoque) === 0;
    const transitionedToZero = !wasZero && willBeZero;
    const payload = {
      nome: editing.nome,
      sabor: editing.sabor,
      codigo_integracao: editing.codigo_integracao.trim().toUpperCase(),
      categoria: editing.categoria!,
      preco: Number(editing.preco) || 0,
      volume_ml: Number(editing.volume_ml) || 750,
      estoque: Number(editing.estoque) || 0,
      brix: Number(editing.brix) || 0,
      graduacao_gl: Number(editing.graduacao_gl) || 0,
      notas_aromaticas: editing.notas_aromaticas || null,
      descricao: editing.descricao || null,
      sugestoes: editing.sugestoes || null,
      ingredientes: editing.ingredientes || null,
      foto_url: editing.foto_url || null,
      fotos: (editing.fotos ?? []) as any,
      ativo: editing.ativo ?? true,
      ordem: Number(editing.ordem) || 0,
      stock_control_type: editing.stock_control_type || "manual",
    };
    const op = editing.id
      ? supabase.from("products").update(payload as any).eq("id", editing.id)
      : supabase.from("products").insert(payload as any);
    const { error } = await op;
    if (error) { toast.error(error.message); return; }
    if (editing.stock_control_type === "gerenciapp") {
      try {
        const sync = await refreshGerenciappStock();
        toast.success(sync.updated > 0 ? "Poção salva e estoque atualizado pelo GerenciApp." : "Poção salva. Confira o código de integração no GerenciApp.");
      } catch (syncError) {
        toast.warning(`Poção salva, mas o estoque não pôde ser atualizado: ${(syncError as Error).message}`);
      }
    } else {
      toast.success("Poção salva.");
    }
    if (transitionedToZero) {
      toast.warning(`⚠️ ${editing.nome} chegou ao estoque zero — notificação push enviada.`);
    }
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  }

  async function remove(id: string) {
    if (!confirm("Remover esta poção?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Removida.");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  async function uploadVariants(blobs: ResizedBlobs): Promise<PhotoVariants | null> {
    const prefix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const bucket = supabase.storage.from("product-images");
    const entries: Array<[keyof PhotoVariants, Blob]> = [
      ["thumb", blobs.thumb],
      ["card", blobs.card],
      ["full", blobs.full],
    ];
    const out: Partial<PhotoVariants> = {};
    for (const [size, blob] of entries) {
      const path = `${prefix}/${size}.webp`;
      const { error } = await bucket.upload(path, blob, { upsert: false, contentType: "image/webp" });
      if (error) { toast.error(error.message); return null; }
      out[size] = bucket.getPublicUrl(path).data.publicUrl;
    }
    return out as PhotoVariants;
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const newVariants: PhotoVariants[] = [];
    for (const f of Array.from(files)) {
      try {
        const blobs = await resizeToVariants(f);
        const v = await uploadVariants(blobs);
        if (v) newVariants.push(v);
      } catch (err) {
        toast.error(`Falha ao processar ${f.name}: ${(err as Error).message}`);
      }
    }
    setEditing((e) => {
      if (!e) return e;
      const fotos = [...((e.fotos ?? []) as PhotoVariants[]), ...newVariants];
      const fotosUrls = fotos.map((v) => v.full);
      const coverCandidate = newVariants[0]?.card ?? null;
      return {
        ...e,
        fotos,
        fotos_urls: fotosUrls,
        foto_url: e.foto_url || coverCandidate || fotosUrls[0] || "",
      };
    });
    setUploading(false);
  }

  function removePhoto(url: string) {
    setEditing((e) => {
      if (!e) return e;
      const idx = (e.fotos_urls ?? []).indexOf(url);
      const fotosUrls = (e.fotos_urls ?? []).filter((u) => u !== url);
      const fotos = ((e.fotos ?? []) as PhotoVariants[]).filter((_, i) => i !== idx);
      const stillHasCover =
        e.foto_url && (fotos.some((v) => v.card === e.foto_url) || fotosUrls.includes(e.foto_url));
      const cover = stillHasCover ? e.foto_url : (fotos[0]?.card ?? fotosUrls[0] ?? "");
      return { ...e, fotos_urls: fotosUrls, fotos, foto_url: cover };
    });
  }

  async function reprocessImages() {
    if (!editing) return;
    const urls = editing.fotos_urls ?? [];
    if (urls.length === 0) { toast.info("Nada para reprocessar."); return; }
    if (!confirm(`Reprocessar ${urls.length} imagem(ns)? As versões antigas continuam no storage; as novas, otimizadas, passam a ser usadas.`)) return;
    setReprocessing(true);
    const newVariants: PhotoVariants[] = [];
    for (const url of urls) {
      try {
        const blobs = await resizeUrlToVariants(url);
        const v = await uploadVariants(blobs);
        if (v) newVariants.push(v);
      } catch (err) {
        toast.error(`Falha em ${url}: ${(err as Error).message}`);
      }
    }
    if (newVariants.length > 0) {
      setEditing((e) => e ? {
        ...e,
        fotos: newVariants,
        fotos_urls: newVariants.map((v) => v.full),
        foto_url: newVariants[0].card,
      } : e);
      toast.success("Imagens reprocessadas. Salve para aplicar.");
    }
    setReprocessing(false);
  }

  function setCover(url: string) {
    setEditing((e) => (e ? { ...e, foto_url: url } : e));
  }

  return (
    <AdminShell title="Poções">
      <button onClick={openNew} className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-[var(--gold)] text-[var(--background)] font-display tracking-widest text-xs uppercase rounded-sm hover:bg-[var(--gold-hover)]">
        <Plus className="w-4 h-4" /> Nova poção
      </button>

      {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-[var(--gold)]" /> : (
        <div className="overflow-x-auto border border-[var(--gold)]/15 rounded-sm">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface)]/60 text-[var(--cream)]/60 text-xs uppercase tracking-widest">
              <tr>
                <th className="text-left px-3 py-2">Nome</th>
                <th className="text-left px-3 py-2">Cat.</th>
                <th className="text-right px-3 py-2">Preço</th>
                <th className="text-right px-3 py-2">Estoque</th>
                <th className="text-center px-3 py-2">Ativo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products?.map((p) => (
                <tr key={p.id} className="border-t border-[var(--gold)]/10 hover:bg-[var(--surface)]/40">
                  <td className="px-3 py-2 text-[var(--cream)]">
                    <div className="font-medium">{p.nome}</div>
                    <div className="text-[var(--cream)]/50 text-xs">{p.sabor}</div>
                  </td>
                  <td className="px-3 py-2 text-[var(--cream)]/70">{categoriaLabel(p.categoria)}</td>
                  <td className="px-3 py-2 text-right text-[var(--gold)]">{fmtPrice(Number(p.preco))}</td>
                  <td className={`px-3 py-2 text-right ${p.estoque <= 3 ? "text-[var(--vinho)]" : "text-[var(--cream)]/80"}`}>{p.estoque}</td>
                  <td className="px-3 py-2 text-center">{p.ativo ? "✓" : "—"}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(p)} className="p-2 text-[var(--gold)] hover:bg-[var(--gold)]/10 rounded-sm"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(p.id)} className="p-2 text-[var(--vinho)] hover:bg-[var(--vinho)]/10 rounded-sm"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--gold)]/30 rounded-md p-6 my-4 sm:my-8 max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <h3 className="font-display text-xl text-[var(--gold)] mb-4">{editing.id ? "Editar poção" : "Nova poção"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Field label="Nome"><input value={editing.nome ?? ""} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} className={inputCls} /></Field>
              <Field label="Sabor"><input value={editing.sabor ?? ""} onChange={(e) => setEditing({ ...editing, sabor: e.target.value })} className={inputCls} /></Field>
              <Field label="Código de integração">
                <input
                  value={editing.codigo_integracao ?? ""}
                  onChange={(e) => setEditing({ ...editing, codigo_integracao: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "-") })}
                  placeholder="LICOR-BANANA-500ML"
                  className={inputCls}
                />
              </Field>
              <Field label="Categoria">
                <select value={editing.categoria} onChange={(e) => setEditing({ ...editing, categoria: e.target.value as any })} className={inputCls}>
                  <option value="fino">Fino</option>
                  <option value="cremoso">Cremoso</option>
                  <option value="especial">Especial</option>
                </select>
              </Field>
              <Field label="Preço (R$)"><input type="number" step="0.01" value={editing.preco ?? 0} onChange={(e) => setEditing({ ...editing, preco: Number(e.target.value) })} className={inputCls} /></Field>
              <Field label="Volume (ml)"><input type="number" value={editing.volume_ml ?? 750} onChange={(e) => setEditing({ ...editing, volume_ml: Number(e.target.value) })} className={inputCls} /></Field>
              <Field label="Estoque">
                <input
                  type="number"
                  value={editing.estoque ?? 0}
                  onChange={(e) => setEditing({ ...editing, estoque: Number(e.target.value) })}
                  disabled={editing.stock_control_type === "gerenciapp"}
                  className={`${inputCls} ${editing.stock_control_type === "gerenciapp" ? "opacity-60 cursor-not-allowed" : ""}`}
                />
                <span className="block mt-1 text-[10px] text-[var(--cream)]/45">
                  {editing.stock_control_type === "gerenciapp" ? "Sincronizado via GerenciApp" : "Controle manual"}
                </span>
              </Field>
              <Field label="Controle de estoque">
                <select
                  value={editing.stock_control_type ?? "manual"}
                  onChange={(e) => setEditing({ ...editing, stock_control_type: e.target.value as "manual" | "gerenciapp" })}
                  className={inputCls}
                >
                  <option value="manual">Manual (site)</option>
                  <option value="gerenciapp">Automático (GerenciApp)</option>
                </select>
              </Field>
              <Field label="Brix"><input type="number" step="0.1" value={editing.brix ?? 0} onChange={(e) => setEditing({ ...editing, brix: Number(e.target.value) })} className={inputCls} /></Field>
              <Field label="Graduação (°GL)"><input type="number" step="0.1" value={editing.graduacao_gl ?? 0} onChange={(e) => setEditing({ ...editing, graduacao_gl: Number(e.target.value) })} className={inputCls} /></Field>
              <Field label="Ordem"><input type="number" value={editing.ordem ?? 0} onChange={(e) => setEditing({ ...editing, ordem: Number(e.target.value) })} className={inputCls} /></Field>
              <Field label="Ativo">
                <label className="flex items-center gap-2 mt-2">
                  <input type="checkbox" checked={editing.ativo ?? true} onChange={(e) => setEditing({ ...editing, ativo: e.target.checked })} />
                  <span className="text-[var(--cream)]/70">visível no site</span>
                </label>
              </Field>
            </div>
            <div className="mt-3 grid gap-3">
              <Field label="Notas aromáticas"><input value={editing.notas_aromaticas ?? ""} onChange={(e) => setEditing({ ...editing, notas_aromaticas: e.target.value })} className={inputCls} /></Field>
              <Field label="Descrição"><textarea value={editing.descricao ?? ""} onChange={(e) => setEditing({ ...editing, descricao: e.target.value })} className={`${inputCls} min-h-[80px]`} /></Field>
              <Field label="Sugestões de consumo"><textarea value={editing.sugestoes ?? ""} onChange={(e) => setEditing({ ...editing, sugestoes: e.target.value })} className={`${inputCls} min-h-[60px]`} /></Field>
              <Field label="Ingredientes"><textarea value={editing.ingredientes ?? ""} onChange={(e) => setEditing({ ...editing, ingredientes: e.target.value })} className={`${inputCls} min-h-[60px]`} placeholder="Ex.: Açúcar, Álcool de Cereais, ..." /></Field>
              <Field label="Fotos">
                <div className="space-y-3">
                  {(editing.fotos_urls && editing.fotos_urls.length > 0) ? (
                    <div className="flex flex-wrap gap-3">
                      {editing.fotos_urls.map((url, i) => {
                        const variant = ((editing.fotos ?? []) as PhotoVariants[])[i];
                        const thumbSrc = variant?.thumb ?? url;
                        const coverCandidate = variant?.card ?? url;
                        const isCover = editing.foto_url === coverCandidate;
                        return (
                          <div key={url} className="relative group">
                            <img src={thumbSrc} alt="" loading="lazy" decoding="async" className={`w-20 h-20 object-cover rounded-sm border ${isCover ? "border-[var(--gold)]" : "border-[var(--gold)]/20"}`} />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1 text-[10px]">
                              {!isCover && <button type="button" onClick={() => setCover(coverCandidate)} className="text-[var(--gold)] uppercase tracking-widest">capa</button>}
                              <button type="button" onClick={() => removePhoto(url)} className="text-[var(--cream)] uppercase tracking-widest">remover</button>
                            </div>
                            {isCover && <span className="absolute top-0 left-0 bg-[var(--gold)] text-[var(--background)] text-[9px] px-1 uppercase tracking-widest">Capa</span>}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-[var(--cream)]/50">Nenhuma imagem ainda.</div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-[var(--gold)]/30 text-[var(--cream)] text-xs rounded-sm hover:border-[var(--gold)] w-fit">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      Enviar imagens
                      <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
                    </label>
                    {(editing.fotos_urls?.length ?? 0) > 0 && (
                      <button
                        type="button"
                        onClick={reprocessImages}
                        disabled={reprocessing}
                        className="inline-flex items-center gap-2 px-3 py-2 border border-[var(--gold)]/30 text-[var(--cream)]/80 text-xs rounded-sm hover:border-[var(--gold)] disabled:opacity-50"
                        title="Gera versões otimizadas (thumb/card/full em WebP) das fotos atuais"
                      >
                        {reprocessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Reprocessar imagens
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-[var(--cream)]/40 leading-relaxed">
                    Envie em alta qualidade. O site gera automaticamente 3 versões em WebP (200 / 600 / 1600 px) e usa a mais leve em cada lugar.
                  </p>
                </div>
              </Field>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-[var(--cream)]/70 hover:text-[var(--cream)]">Cancelar</button>
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
