import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/AdminShell";
import { toast } from "sonner";
import { Download, Upload, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/backup")({
  head: () => ({ meta: [{ title: "Backup · Admin" }, { name: "robots", content: "noindex" }] }),
  component: BackupAdmin,
});

function BackupAdmin() {
  const [busy, setBusy] = useState(false);

  async function exportAll() {
    setBusy(true);
    try {
      const [p, k, t, f] = await Promise.all([
        supabase.from("products").select("*"),
        supabase.from("kit_prices").select("*"),
        supabase.from("testimonials").select("*"),
        supabase.from("featured_config").select("*"),
      ]);
      const dump = {
        version: 1,
        exported_at: new Date().toISOString(),
        products: p.data ?? [],
        kit_prices: k.data ?? [],
        testimonials: t.data ?? [],
        featured_config: f.data ?? [],
      };
      // Usamos UTF-8 explicitamente (padrão do JSON.stringify e Blob)
      const blob = new Blob([new TextEncoder().encode(JSON.stringify(dump, null, 2))], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `alquimista-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup gerado.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function importFile(file: File) {
    if (!confirm("Isto vai sobrescrever os dados atuais. Continuar?")) return;
    setBusy(true);
    try {
      // O método file.text() já tenta detectar e decodificar para UTF-8 corretamente.
      // Em casos extremos de encoding exótico, o TextDecoder resolve a maioria.
      const buffer = await file.arrayBuffer();
      const txt = new TextDecoder("utf-8").decode(buffer);
      const dump = JSON.parse(txt);
      
      // Validação básica de formato
      if (!dump || typeof dump !== 'object' || dump.version !== 1) {
        throw new Error("Formato de arquivo inválido ou versão não suportada.");
      }
      // Limpa dados atuais com segurança
      // Removemos em ordem para evitar problemas de FK se existirem (embora o dump pareça plano)
      console.log("Iniciando limpeza das tabelas...");
      await supabase.from("featured_config").delete().neq("id", 0);
      await supabase.from("testimonials").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("kit_prices").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      console.log("Iniciando inserção dos dados do backup...");

      // Insere os dados do backup
      if (dump.products?.length) {
        // Removemos fotos_urls se vier do backup antigo para evitar erro de coluna inexistente
        const productsToInsert = dump.products.map((p: any) => {
          const { fotos_urls, ...rest } = p;
          return rest;
        });
        const { error } = await supabase.from("products").insert(productsToInsert);
        if (error) throw new Error(`Produtos: ${error.message}`);
      }
      
      if (dump.kit_prices?.length) {
        const { error } = await supabase.from("kit_prices").insert(dump.kit_prices);
        if (error) throw new Error(`Kits: ${error.message}`);
      }
      
      if (dump.testimonials?.length) {
        const { error } = await supabase.from("testimonials").insert(dump.testimonials);
        if (error) throw new Error(`Depoimentos: ${error.message}`);
      }
      
      if (dump.featured_config?.length) {
        const { error } = await supabase.from("featured_config").insert(dump.featured_config);
        if (error) throw new Error(`Destaques: ${error.message}`);
      }
      toast.success("Backup restaurado.");
    } catch (e: any) {
      toast.error("Falha ao importar: " + e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminShell title="Backup">
      <div className="grid gap-4 max-w-xl">
        <div className="border border-[var(--gold)]/15 bg-[var(--surface)]/60 p-5 rounded-sm">
          <h3 className="font-display text-[var(--gold)] mb-2">Exportar</h3>
          <p className="text-sm text-[var(--cream)]/70 mb-4">Baixa um arquivo JSON com poções, kits, depoimentos e destaques.</p>
          <button onClick={exportAll} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--gold)] text-[var(--background)] font-display tracking-widest text-xs uppercase rounded-sm hover:bg-[var(--gold-hover)] disabled:opacity-60">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Baixar backup
          </button>
        </div>

        <div className="border border-[var(--vinho)]/40 bg-[var(--vinho)]/5 p-5 rounded-sm">
          <h3 className="font-display text-[var(--gold)] mb-2">Restaurar</h3>
          <p className="text-sm text-[var(--cream)]/70 mb-4">⚠ Substitui todos os dados atuais pelo conteúdo do arquivo.</p>
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-[var(--gold)]/40 text-[var(--cream)] font-display tracking-widest text-xs uppercase rounded-sm hover:border-[var(--gold)]">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Enviar arquivo JSON
            <input type="file" accept="application/json" className="hidden" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) importFile(f); }} />
          </label>
        </div>
      </div>
    </AdminShell>
  );
}