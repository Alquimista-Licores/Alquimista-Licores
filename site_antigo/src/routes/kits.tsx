import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import degustacaoImg from "@/assets/kits/degustacao.png.asset.json";
import premiumImg from "@/assets/kits/caixa-premium.png.asset.json";

export const Route = createFileRoute("/kits")({
  head: () => ({
    meta: [
      { title: "Kits & Presentes — Alquimista Licores" },
      { name: "description", content: "Kits artesanais para presentear: Degustação com 5 mini-poções ou Presenteável em caixa de madeira ou pergaminho." },
      { property: "og:title", content: "Kits & Presentes — Alquimista Licores" },
      { property: "og:description", content: "Degustação ou Presenteável: combinações pensadas para quem quer presentear, conhecer ou se permitir." },
      { property: "og:url", content: "/kits" },
      { property: "og:type", content: "product.group" },
    ],
    links: [{ rel: "canonical", href: "/kits" }],
  }),
  component: KitsPage,
});

function KitsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 pb-20">
      <PageHeader title="Kits & Presentes" subtitle="Combinações pensadas para quem quer presentear, conhecer ou se permitir." />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-8 border border-[var(--gold)]/20 rounded-sm bg-[var(--surface)]/40 hover:border-[var(--gold)] transition-colors">
          <div className="aspect-[4/3] mb-4 overflow-hidden rounded-sm bg-[var(--surface-elevated)]">
            <img src={degustacaoImg.url} alt="Kit Degustação" loading="lazy" decoding="async" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl text-[var(--gold)] tracking-wide">Kit Degustação</h2>
          <p className="font-sans italic text-[var(--text-soft)] mt-3">Três mini-poções de 50ml para descobrir o universo do Alquimista. Ideal para experimentar antes de escolher seu favorito.</p>
          <div className="text-[var(--gold)] font-sans text-sm tracking-widest uppercase mt-6">apenas R$ 20</div>
          <Link to="/monte-seu-kit" search={{ modo: "degustacao" } as any} className="mt-6 inline-block px-5 py-2.5 bg-[var(--gold)] text-[var(--background)] font-sans tracking-widest text-xs uppercase hover:bg-[var(--gold-hover)] transition-colors rounded-sm">Montar Degustação</Link>
        </div>

        <div className="p-8 border border-[var(--gold)]/20 rounded-sm bg-[var(--surface)]/40 hover:border-[var(--gold)] transition-colors">
          <div className="aspect-[4/3] mb-4 overflow-hidden rounded-sm bg-[var(--surface-elevated)]">
            <img src={premiumImg.url} alt="Kit Presenteável" loading="lazy" decoding="async" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl text-[var(--gold)] tracking-wide">Kit Presenteável</h2>
          <p className="font-sans italic text-[var(--text-soft)] mt-3">Um presente completo: Garrafa de 500ml à escolha acompanhada de doce artesanal, tacinha de vidro, chaveiro exclusivo e embalagem personalizada.</p>
          <div className="text-[var(--gold)] font-sans text-sm tracking-widest uppercase mt-6">A partir de R$ 110</div>
          <Link to="/monte-seu-kit" search={{ modo: "presenteavel" } as any} className="mt-6 inline-block px-5 py-2.5 bg-[var(--gold)] text-[var(--background)] font-sans tracking-widest text-xs uppercase hover:bg-[var(--gold-hover)] transition-colors rounded-sm">Montar Presente</Link>
        </div>
      </div>

      <div className="text-center mt-14">
        <Link to="/pocoes" className="text-xs font-body tracking-widest uppercase text-[var(--gold)]/80 hover:text-[var(--gold)] underline underline-offset-4">Quero apenas garrafas avulsas →</Link>
      </div>
    </div>
  );
}