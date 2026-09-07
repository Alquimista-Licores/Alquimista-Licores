import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell } from "@/components/AdminShell";
import { Package, Gift, Quote, Star, Database } from "lucide-react";
import { EnablePushButton } from "@/components/EnablePushButton";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Painel · Alquimista" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [p, t, low] = await Promise.all([
        supabase.from("products").select("id,estoque,ativo,pedidos_count"),
        supabase.from("testimonials").select("id,ativo"),
        supabase.from("products").select("id,nome,estoque").eq("estoque", 0).eq("ativo", true),
      ]);
      const prods = p.data ?? [];
      return {
        total: prods.length,
        ativos: prods.filter((x) => x.ativo).length,
        estoque: prods.reduce((s, x) => s + (x.estoque ?? 0), 0),
        pedidos: prods.reduce((s, x) => s + (x.pedidos_count ?? 0), 0),
        depoimentos: t.data?.length ?? 0,
        zerado: low.data ?? [],
      };
    },
  });

  const links = [
    { to: "/admin/produtos", icon: Package, label: "Produtos" },
    { to: "/admin/kits", icon: Gift, label: "Kits" },
    { to: "/admin/depoimentos", icon: Quote, label: "Depoimentos" },
    { to: "/admin/destaques", icon: Star, label: "Destaques" },
    { to: "/admin/backup", icon: Database, label: "Backup" },
  ];

  return (
    <AdminShell title="Painel do Alquimista">
      <EnablePushButton />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { l: "Poções ativas", v: `${data?.ativos ?? 0}/${data?.total ?? 0}` },
          { l: "Estoque total", v: data?.estoque ?? 0 },
          { l: "Pedidos contabilizados", v: data?.pedidos ?? 0 },
          { l: "Depoimentos", v: data?.depoimentos ?? 0 },
        ].map((s) => (
          <div key={s.l} className="border border-[var(--gold)]/15 bg-[var(--surface)]/60 p-4 rounded-sm">
            <div className="text-xs uppercase tracking-widest text-[var(--cream)]/50">{s.l}</div>
            <div className="font-display text-2xl text-[var(--gold)] mt-1">{s.v}</div>
          </div>
        ))}
      </div>

      {data?.zerado && data.zerado.length > 0 && (
        <div className="border border-red-500/50 bg-red-500/10 p-4 rounded-sm mb-8">
          <div className="font-display text-sm text-red-300 mb-2">⚠️ Estoque zerado</div>
          <ul className="text-sm text-[var(--cream)]/90 space-y-1">
            {data.zerado.map((p) => (
              <li key={p.id}>· <strong className="text-red-300">{p.nome}</strong> chegou ao estoque zero.</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="border border-[var(--gold)]/20 bg-[var(--surface)] p-5 rounded-sm hover:border-[var(--gold)] transition-colors flex items-center gap-3"
          >
            <l.icon className="w-5 h-5 text-[var(--gold)]" />
            <span className="font-display text-sm tracking-widest uppercase text-[var(--cream)]">{l.label}</span>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}