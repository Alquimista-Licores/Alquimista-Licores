import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/store/cart";
import { fmtPrice, needsPrep } from "@/lib/site";
import type { Product } from "@/lib/types";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import degustacaoImg from "@/assets/kits/degustacao.png.asset.json";
import premiumImg from "@/assets/kits/caixa-premium.png.asset.json";
import browniesImg from "@/assets/kits/brownies.png.asset.json";
import paesMelImg from "@/assets/kits/paes-de-mel.png.asset.json";
import kitMdfImg from "@/assets/kits/kit-mdf.jpg.asset.json";
import { refreshGerenciappStock } from "@/lib/gerenciapp.functions";

type Modo = "degustacao" | "presenteavel" | "";

export const Route = createFileRoute("/monte-seu-kit")({
  validateSearch: (s: Record<string, unknown>) => ({ kit: (s.kit as Modo) || (s.modo as Modo) || ("" as Modo) }),
  head: () => ({
    meta: [
      { title: "Monte seu Kit — Alquimista Licores" },
      { name: "description", content: "Monte seu kit Degustação ou Presenteável de licores artesanais e adicione ao caldeirão." },
      { property: "og:title", content: "Monte seu Kit — Alquimista Licores" },
      { property: "og:description", content: "Escolha o caminho da sua poção: Degustação ou Presenteável." },
      { property: "og:url", content: "/monte-seu-kit" },
    ],
    links: [{ rel: "canonical", href: "/monte-seu-kit" }],
  }),
  component: MontePage,
});

type KitPrice = { id: string; kit_type: string; licor_categoria: string | null; embalagem: string | null; preco: number };

function MontePage() {
  const { kit: modo } = Route.useSearch();
  const navigate = useNavigate();
  const setMode = (m: Modo | "") => navigate({ to: "/monte-seu-kit", search: { kit: m }, replace: true });

  // Legacy ?modo=avulsos → redirect to /pocoes
  useEffect(() => {
    if ((modo as string) === "avulsos") navigate({ to: "/pocoes", replace: true });
  }, [modo, navigate]);

  const { data: products = [] } = useQuery({
    queryKey: ["products-active"],
    queryFn: async () => {
      await refreshGerenciappStock().catch((error) => console.warn("Estoque do GerenciApp indisponível:", error));
      const { data } = await supabase.from("products").select("*").eq("ativo", true).order("ordem");
      return (data || []) as unknown as Product[];
    },
    placeholderData: (prev) => prev,
  });
  const { data: kitPrices = [] } = useQuery({
    queryKey: ["kit-prices"],
    queryFn: async () => {
      const { data } = await supabase.from("kit_prices").select("*");
      return (data || []) as KitPrice[];
    },
    placeholderData: (prev) => prev,
  });

  if (!modo || (modo as string) === "avulsos") {
    return (
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <PageHeader title="Monte seu Kit" subtitle="Escolha o caminho da sua poção." />
        <div className="grid sm:grid-cols-2 gap-4">
          {([
            { id: "degustacao", t: "Kit Degustação", d: "3 mini-poções (50ml) por R$ 20,00", img: degustacaoImg.url },
            { id: "presenteavel", t: "Kit Presenteável", d: "Licor 500ml + acompanhamento + caixa", img: premiumImg.url },
          ] as { id: Modo; t: string; d: string; img: string }[]).map((o) => (
            <button key={o.id} onClick={() => setMode(o.id)} className="p-6 border border-[var(--gold)]/30 rounded-sm hover:border-[var(--gold)] hover:bg-[var(--gold)]/5 transition-all text-left gold-glow-hover">
              <div className="aspect-[4/3] mb-3 overflow-hidden rounded-sm bg-[var(--surface-elevated)]">
                <img src={o.img} alt={o.t} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <div className="font-display text-[var(--gold)] tracking-widest uppercase text-2xl md:text-3xl">{o.t}</div>
              <div className="font-sans italic text-[var(--text-soft)] text-xs md:text-sm mt-2">{o.d}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl md:max-w-5xl mx-auto px-6 pb-16">
      <PageHeader title={modo === "degustacao" ? "Kit Degustação" : "Kit Presenteável"} />
      <div className="text-center -mt-8 mb-4">
        <button onClick={() => setMode("")} className="text-sm md:text-base text-[var(--text-faded)] underline underline-offset-2 hover:text-[var(--gold)]">← Trocar tipo de kit</button>
      </div>
      <div className="mt-6">
        {modo === "degustacao" && <Degustacao products={products} kitPrices={kitPrices} />}
        {modo === "presenteavel" && <Presenteavel products={products} kitPrices={kitPrices} />}
      </div>
    </div>
  );
}

/* ---------- Stepper ---------- */
function Stepper({ step, total, labels }: { step: number; total: number; labels: string[] }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {Array.from({ length: total }).map((_, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full border font-display transition-all ${active ? "bg-[var(--gold)] text-[var(--background)] border-[var(--gold)] scale-110" : done ? "bg-[var(--gold)]/20 border-[var(--gold)] text-[var(--gold)]" : "border-[var(--gold)]/30 text-[var(--text-faded)]"}`}>
                {done ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : <span className="text-2xl md:text-3xl leading-none translate-y-[1px]">{n}</span>}
              </div>
              <div className={`text-[11px] md:text-xs mt-1 tracking-widest uppercase ${active ? "text-[var(--gold)]" : "text-[var(--text-faded)]"}`}>{labels[i]}</div>
            </div>
            {i < total - 1 && <div className={`w-8 h-px ${done ? "bg-[var(--gold)]" : "bg-[var(--gold)]/20"}`} />}
          </div>
        );
      })}
    </div>
  );
}

function NavBtns({ onPrev, onNext, nextLabel = "Continuar", nextDisabled }: { onPrev?: () => void; onNext?: () => void; nextLabel?: string; nextDisabled?: boolean }) {
  return (
    <div className="flex gap-3 mt-8">
      {onPrev && <button onClick={onPrev} className="flex-1 py-3 border border-[var(--gold)]/30 text-[var(--cream)] font-body tracking-widest uppercase text-sm rounded-sm hover:border-[var(--gold)]">← Voltar</button>}
      {onNext && <button onClick={onNext} disabled={nextDisabled} className="flex-1 py-3 bg-[var(--gold)] text-[var(--background)] font-body tracking-widest uppercase text-sm rounded-sm hover:bg-[var(--gold-hover)] disabled:opacity-40 disabled:cursor-not-allowed">{nextLabel}</button>}
    </div>
  );
}

function ProductGrid({ products, isSelected, onPick, disabled, showPrice = false, centered = false, italicSabor = true }: { products: Product[]; isSelected: (p: Product) => boolean; onPick: (p: Product) => void; disabled?: (p: Product) => boolean; showPrice?: boolean; centered?: boolean; italicSabor?: boolean }) {
  return (
    <div className={centered ? "max-w-xs mx-auto" : "grid grid-cols-2 md:grid-cols-3 gap-3"}>
      {products.map(p => {
        const out = p.estoque <= 0 || (disabled?.(p) ?? false);
        const sel = isSelected(p);
        return (
          <button
            key={p.id}
            onClick={() => !out && onPick(p)}
            disabled={out}
            className={`relative p-4 border rounded-sm text-left transition-all ${sel ? "border-[var(--gold)] bg-[var(--gold)]/10" : "border-[var(--gold)]/20 hover:border-[var(--gold)]/60"} ${out ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <div className="aspect-square bg-[var(--surface-elevated)] rounded-sm overflow-hidden flex items-center justify-center text-[var(--gold)]/30 text-4xl mb-2">
              {p.foto_url ? <img src={p.foto_url} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" /> : "⚗"}
            </div>
            <div className="font-display font-bold text-base md:text-lg text-[var(--gold)] tracking-wider uppercase leading-tight">{p.nome}</div>
            <div className={`text-sm md:text-base text-[var(--text-soft)] mt-0.5 ${italicSabor ? "italic" : ""}`}>{p.sabor}</div>
            {showPrice && <div className="text-xs text-[var(--gold)]/80 mt-1">{fmtPrice(Number(p.preco))}</div>}
            {needsPrep(p) && !out && (
              <div className="absolute top-1 left-1 right-1 text-[9px] font-display tracking-widest uppercase text-[var(--amber-warm)] bg-[var(--background)]/80 px-1 py-0.5 text-center rounded-sm">Sob demanda · 2 dias</div>
            )}
            {sel && <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--gold)] text-[var(--background)] flex items-center justify-center"><Check className="w-3 h-3" /></div>}
            {p.estoque <= 0 && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--background)]/40 rounded-sm">
                <span className="px-3 py-1 bg-[var(--gold)] text-[var(--background)] text-[10px] font-display tracking-widest uppercase rounded-sm shadow-lg">
                  Esgotado
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Post-add CTA ---------- */
function AddedActions({ onReset }: { onReset: () => void }) {
  const navigate = useNavigate();
  const setOpen = useCart((s) => s.setOpen);
  return (
      <div className="mt-8 p-5 border border-[var(--gold)]/30 rounded-sm bg-[var(--gold)]/5 text-center space-y-4">
      <div className="text-[var(--gold)] font-display tracking-widest uppercase text-sm">✦ Kit adicionado ao caldeirão</div>
      <p className="text-sm text-[var(--text-soft)] font-sans italic">Quer adicionar mais alguma coisa ou finalizar agora?</p>
      <div className="grid sm:grid-cols-3 gap-2">
        <button onClick={onReset} className="py-3 border border-[var(--gold)]/40 text-[var(--cream)] font-body tracking-widest uppercase text-xs rounded-sm hover:border-[var(--gold)]">Montar outro kit</button>
        <button onClick={() => navigate({ to: "/pocoes" })} className="py-3 border border-[var(--gold)]/40 text-[var(--cream)] font-body tracking-widest uppercase text-xs rounded-sm hover:border-[var(--gold)]">Continuar comprando</button>
        <button onClick={() => setOpen(true)} className="py-3 bg-[var(--gold)] text-[var(--background)] font-body tracking-widest uppercase text-xs rounded-sm hover:bg-[var(--gold-hover)]">Ir para o caldeirão</button>
      </div>
    </div>
  );
}

/* ---------- Degustação ---------- */
function Degustacao({ products, kitPrices }: { products: Product[]; kitPrices: KitPrice[] }) {
  const [step, setStep] = useState(1);
  const [sel, setSel] = useState<string[]>([]);
  const [added, setAdded] = useState(false);
  const addKit = useCart((s) => s.addKit);
  const max = 3;
  const preco = kitPrices.find(k => k.kit_type === "degustacao")?.preco ?? 20;

  function pick(p: Product) {
    if (p.estoque <= 0) {
      toast.error(`${p.nome} está esgotado`);
      return;
    }
    setSel(s => s.length < max ? [...s, p.id] : s);
  }
  function removeAt(idx: number) {
    setSel(s => s.filter((_, i) => i !== idx));
  }

  function adicionar() {
    const saboresLabels = sel.map((id) => {
      const p = products.find(x => x.id === id);
      return { nome: p?.nome ?? "", sabor: p?.sabor ?? "" };
    });
    addKit({
      tipo: "kit-degustacao",
      id: `kit-degustacao-${Date.now()}`,
      nome: "Kit Degustação",
      preco: Number(preco),
      qty: 1,
      saboresIds: [...sel],
      saboresLabels,
    });
    toast(`✦ Kit Degustação adicionado ao caldeirão`);
    setAdded(true);
  }

  function reset() {
    setSel([]);
    setStep(1);
    setAdded(false);
  }

  if (added) return <AddedActions onReset={reset} />;

  return (
    <div>
      <Stepper step={step} total={2} labels={["Sabores", "Resumo"]} />

      {step === 1 && (
        <>
          <p className="font-sans italic text-[var(--text-soft)] text-center">Escolha 3 sabores (pode repetir). Cada um vem em mini-garrafa de 50ml.</p>
          <div className="text-center mt-2 text-base md:text-lg text-[var(--gold)]/90 font-display tracking-widest uppercase">Você escolheu {sel.length} de {max}</div>
          {sel.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {sel.map((id, i) => (
                <span key={i} className="inline-flex items-center gap-2 px-3 py-1 text-xs bg-[var(--gold)]/15 border border-[var(--gold)]/40 rounded-sm text-[var(--gold)]">
                  {products.find(p => p.id === id)?.nome}
                  <button onClick={() => removeAt(i)} className="hover:text-[var(--wine)]">×</button>
                </span>
              ))}
            </div>
          )}
          {sel.length < max && (
            <div className="mt-6">
              <ProductGrid products={products} isSelected={() => false} onPick={pick} disabled={(p) => sel.length >= max || p.estoque <= 0} />
            </div>
          )}
          <NavBtns onNext={() => setStep(2)} nextDisabled={sel.length !== max} />
        </>
      )}

      {step === 2 && (
        <>
          <div className="p-5 border border-[var(--gold)]/20 rounded-sm bg-[var(--surface)]/40">
            <div className="font-display tracking-widest uppercase text-base md:text-lg text-[var(--gold)] mb-3">Resumo do kit</div>
            <ul className="space-y-2 text-base">
              {sel.map((id, i) => {
                const p = products.find(x => x.id === id);
                return <li key={i} className="flex justify-between"><span>• {p?.nome} <em className="text-[var(--text-soft)]">({p?.sabor})</em> · 50ml</span></li>;
              })}
            </ul>
            <div className="flex justify-between mt-4 pt-3 border-t border-[var(--gold)]/15 font-sans text-sm md:text-base items-end">
              <span>Total do kit</span>
              <span className="text-[var(--gold)] font-display text-3xl md:text-4xl">{fmtPrice(Number(preco))}</span>
            </div>
          </div>
          <NavBtns onPrev={() => setStep(1)} onNext={adicionar} nextLabel="Adicionar ao caldeirão" />
        </>
      )}
    </div>
  );
}

/* ---------- Presenteável ---------- */
const ACOMP = [
  { id: "brownies", label: "3 Brownies", img: browniesImg.url },
  { id: "paes-mel", label: "3 Pães de Mel", img: paesMelImg.url },
];
const EMBS = [
  { id: "mdf", label: "Box MDF", img: kitMdfImg.url },
  { id: "acrilico", label: "Box Premium", img: premiumImg.url },
];

function Presenteavel({ products, kitPrices }: { products: Product[]; kitPrices: KitPrice[] }) {
  const [step, setStep] = useState(1);
  const [productId, setProductId] = useState<string>("");
  const [acomp, setAcomp] = useState<string>("");
  const [embalagem, setEmbalagem] = useState<string>("");
  const [dedicatoria, setDedicatoria] = useState("");
  const [added, setAdded] = useState(false);
  const addKit = useCart((s) => s.addKit);
  const usageByProduct = useCart((s) => s.usageByProduct);

  const product = products.find(p => p.id === productId);
  function priceFor(cat: string | undefined, emb: string) {
    if (!cat) return null;
    return kitPrices.find(k => k.kit_type === "presenteavel" && k.licor_categoria === cat && k.embalagem === emb)?.preco ?? null;
  }
  const subtotal = product && embalagem ? (priceFor(product.categoria, embalagem) ?? 0) : 0;

  function adicionar() {
    if (!product || !acomp || !embalagem) return toast.error("Complete todas as escolhas");
    if (usageByProduct(product.id) + 1 > product.estoque) {
      return toast.error(`Estoque insuficiente — restam ${Math.max(0, product.estoque - usageByProduct(product.id))} de ${product.nome}`);
    }
    addKit({
      tipo: "kit-presenteavel",
      id: `kit-presenteavel-${Date.now()}`,
      nome: "Kit Presenteável",
      preco: Number(subtotal),
      qty: 1,
      licor: { id: product.id, nome: product.nome, sabor: product.sabor },
      acompanhamento: ACOMP.find(a => a.id === acomp)?.label ?? acomp,
      embalagem: EMBS.find(e => e.id === embalagem)?.label ?? embalagem,
      dedicatoria: dedicatoria.trim(),
    });
    toast(`✦ Kit Presenteável adicionado ao caldeirão`);
    setAdded(true);
  }

  function reset() {
    setProductId(""); setAcomp(""); setEmbalagem(""); setDedicatoria("");
    setStep(1); setAdded(false);
  }

  if (added) return <AddedActions onReset={reset} />;

  return (
    <div>
      <Stepper step={step} total={4} labels={["Licor", "Acomp.", "Caixa", "Resumo"]} />

      {step === 1 && (
        <>
          <p className="font-sans italic text-[var(--text-soft)] text-center mb-6">Escolha o licor (500ml) que será o centro do seu kit.</p>
          <ProductGrid
            products={productId ? products.filter(p => p.id === productId) : products}
            isSelected={(p) => p.id === productId}
            onPick={(p) => setProductId(productId === p.id ? "" : p.id)}
            disabled={(p) => usageByProduct(p.id) >= p.estoque}
            centered={!!productId}
            italicSabor={false}
          />
          <NavBtns onNext={() => setStep(2)} nextDisabled={!productId} />
        </>
      )}

      {step === 2 && (
        <>
          <p className="font-sans italic text-[var(--text-soft)] text-center mb-6">Escolha o acompanhamento (incluso no preço).</p>
          <div className="grid grid-cols-2 gap-4">
            {ACOMP.map(a => (
              <button key={a.id} onClick={() => setAcomp(a.id)} className={`p-6 border rounded-sm text-center transition-all ${acomp === a.id ? "border-[var(--gold)] bg-[var(--gold)]/10" : "border-[var(--gold)]/20 hover:border-[var(--gold)]/60"}`}>
                <div className="aspect-square mb-3 overflow-hidden rounded-sm bg-[var(--surface-elevated)]">
                  <img src={a.img} alt={a.label} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </div>
                <div className="font-display tracking-widest uppercase text-base md:text-lg text-[var(--gold)]">{a.label}</div>
              </button>
            ))}
          </div>
          <NavBtns onPrev={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!acomp} />
        </>
      )}

      {step === 3 && (
        <>
          <p className="font-sans italic text-[var(--text-soft)] text-center mb-6">Escolha a embalagem.</p>
          <div className="grid grid-cols-2 gap-4">
            {EMBS.map(e => {
              const p = priceFor(product?.categoria, e.id);
              return (
                <button key={e.id} onClick={() => setEmbalagem(e.id)} className={`p-6 border rounded-sm text-center transition-all ${embalagem === e.id ? "border-[var(--gold)] bg-[var(--gold)]/10" : "border-[var(--gold)]/20 hover:border-[var(--gold)]/60"}`}>
                  <div className="aspect-square mb-3 overflow-hidden rounded-sm bg-[var(--surface-elevated)]">
                    <img src={e.img} alt={e.label} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </div>
                  <div className="font-display tracking-widest uppercase text-sm text-[var(--gold)]">{e.label}</div>
                  {p !== null && <div className="text-xs text-[var(--cream)]/80 mt-2">Total do kit: <strong className="text-[var(--gold)]">{fmtPrice(Number(p))}</strong></div>}
                </button>
              );
            })}
          </div>
          <NavBtns onPrev={() => setStep(2)} onNext={() => setStep(4)} nextDisabled={!embalagem} />
        </>
      )}

      {step === 4 && (
        <>
          <div className="p-5 border border-[var(--gold)]/20 rounded-sm bg-[var(--surface)]/40">
            <div className="font-display tracking-widest uppercase text-base md:text-lg text-[var(--gold)] mb-3">Resumo do kit</div>
            <ul className="space-y-1 text-base">
              <li>• Licor: <strong>{product?.nome}</strong> ({product?.sabor})</li>
              <li>• Acompanhamento: <strong>{ACOMP.find(a => a.id === acomp)?.label}</strong></li>
              <li>• Embalagem: <strong>{EMBS.find(e => e.id === embalagem)?.label}</strong></li>
            </ul>
            <div className="flex justify-between mt-4 pt-3 border-t border-[var(--gold)]/15 font-sans text-sm md:text-base items-end">
              <span>Total do kit</span>
              <span className="text-[var(--gold)] font-display text-3xl md:text-4xl">{fmtPrice(Number(subtotal))}</span>
            </div>
          </div>
          <NavBtns onPrev={() => setStep(3)} onNext={adicionar} nextLabel="Adicionar ao caldeirão" />
        </>
      )}
    </div>
  );
}
