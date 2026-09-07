import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/store/cart";
import { fmtPrice, brixClassification, categoriaLabel, waUrl, needsPrep } from "@/lib/site";
import type { Product } from "@/lib/types";

export function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const add = useCart((s) => s.addAvulso);
  const usage = useCart((s) => s.usageByProduct(product.id));
  const [qty, setQty] = useState(1);
  const [openTip, setOpenTip] = useState<null | "grad" | "brix" | "class" | "ingr">(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const gallery = (() => {
    // Prefer the variant objects when available: each entry = 1 foto.
    if (product.fotos && product.fotos.length > 0) {
      return product.fotos.map((v) => v.full || v.card || v.thumb).filter(Boolean) as string[];
    }
    // Fallback (legado): fotos_urls guarda 1 URL por foto; foto_url é a capa.
    const list = product.fotos_urls && product.fotos_urls.length > 0 ? [...product.fotos_urls] : [];
    if (product.foto_url && !list.includes(product.foto_url)) list.unshift(product.foto_url);
    return list;
  })();
  const [activeIdx, setActiveIdx] = useState(0);
  const [smokeKey, setSmokeKey] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [autoplay, setAutoplay] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);
  const [sugExpanded, setSugExpanded] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const activeImg = gallery[activeIdx] ?? product.foto_url ?? null;
  const prevImg = prevIdx != null ? gallery[prevIdx] : null;
  const goTo = (next: number, dir: 1 | -1 = 1) => {
    if (gallery.length <= 1) return;
    const n = (next + gallery.length) % gallery.length;
    setPrevIdx(activeIdx);
    setDirection(dir);
    setActiveIdx(n);
    setSmokeKey((k) => k + 1);
  };
  const handleArrow = (dir: -1 | 1) => {
    setAutoplay(false);
    goTo(activeIdx + dir, dir);
  };
  useEffect(() => {
    if (!autoplay || gallery.length <= 1) return;
    const id = setInterval(() => {
      setActiveIdx((i) => {
        setPrevIdx(i);
        setDirection(1);
        return (i + 1) % gallery.length;
      });
      setSmokeKey((k) => k + 1);
    }, 5000);
    return () => clearInterval(id);
  }, [autoplay, gallery.length]);
  useEffect(() => {
    if (prevIdx == null) return;
    const t = setTimeout(() => setPrevIdx(null), 1200);
    return () => clearTimeout(t);
  }, [activeIdx, prevIdx]);
  const restante = Math.max(0, product.estoque - usage);
  const out = product.estoque <= 0;
  const semDisponivel = !out && restante <= 0;
  const klass = brixClassification(Number(product.brix));
  const DESC_LIMIT = 200;
  const desc = product.descricao ?? "";
  const descTooLong = desc.length > DESC_LIMIT;
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
  // Fecha qualquer tooltip aberto ao clicar fora da área de informações técnicas.
  useEffect(() => {
    if (!openTip) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideStats = statsRef.current?.contains(target);
      const insideTooltip = (target as HTMLElement)?.closest?.("[data-stat-tooltip]");
      if (!insideStats && !insideTooltip) setOpenTip(null);
    };
    const close = () => setOpenTip(null);
    document.addEventListener("mousedown", handler);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [openTip]);
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-stretch md:items-center justify-center bg-[var(--background)]/80 backdrop-blur-sm md:p-4" onClick={onClose}>
      <div className="bg-[var(--surface)] md:border md:border-[var(--gold)]/30 w-full md:w-[min(1100px,95vw)] md:max-w-[1100px] h-[100dvh] md:h-[85vh] md:rounded-sm flex flex-col md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] overflow-hidden overscroll-contain reveal" onClick={(e) => e.stopPropagation()}>
        <div className="relative shrink-0 aspect-square md:aspect-auto md:h-full bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--background)] overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            {activeImg ? (
              <>
                {prevImg && prevImg !== activeImg && (
                  <img
                    key={`prev-${prevImg}-${smokeKey}`}
                    src={prevImg}
                    decoding="async"
                    className={`absolute inset-0 w-full h-full object-cover object-center ${direction === 1 ? "img-slide-out-left" : "img-slide-out-right"}`}
                    alt=""
                    aria-hidden
                  />
                )}
                <img
                  key={`cur-${activeImg}-${smokeKey}`}
                  src={activeImg}
                  decoding="async"
                  className={`absolute inset-0 w-full h-full object-cover object-center ${direction === 1 ? "img-slide-in-right" : "img-slide-in-left"}`}
                  alt={product.nome}
                />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-7xl text-[var(--gold)]/30">⚗</div>
            )}
            {gallery.length > 1 && <div key={smokeKey} className="smoke-layer" />}
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-[var(--gold)]/90 text-[var(--background)] text-[10px] md:text-xs font-serif-soft font-semibold tracking-widest uppercase z-10">{categoriaLabel(product.categoria)}</div>
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => handleArrow(-1)}
                  aria-label="Imagem anterior"
                  className="absolute left-1 top-1/2 -translate-y-1/2 p-2 text-[var(--cream)]/70 hover:text-[var(--gold)] transition-colors z-10"
                >
                  <ChevronLeft size={28} strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => handleArrow(1)}
                  aria-label="Próxima imagem"
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-[var(--cream)]/70 hover:text-[var(--gold)] transition-colors z-10"
                >
                  <ChevronRight size={28} strokeWidth={1.5} />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0 min-h-0 flex flex-col text-[var(--cream)]">
          <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-6 pb-4 md:px-8 md:pt-8">
          <button onClick={onClose} className="float-right text-[var(--text-soft)] hover:text-[var(--gold)]">✕</button>
          <h2 className="text-2xl md:text-3xl text-[var(--gold)]">{product.nome}</h2>
          <p className="font-sans italic text-sm md:text-base text-[var(--text-soft)]">{product.sabor}</p>
          <div className="flex items-center gap-3 my-4 text-[var(--gold)]/40"><span className="h-px flex-1 bg-[var(--gold)]/30"/><span className="text-xl leading-none">☥</span><span className="h-px flex-1 bg-[var(--gold)]/30"/></div>
          <div className="font-display text-3xl md:text-4xl mb-2">{fmtPrice(Number(product.preco))}</div>
          <div className="text-sm text-[var(--text-soft)] mb-4">Volume: {product.volume_ml}ml</div>
          {product.notas_aromaticas && <div className="font-serif-soft text-base md:text-lg italic text-[var(--cream)]/90 mb-3">{product.notas_aromaticas}</div>}
          {desc && (
            <p className="text-sm md:text-base text-[var(--text-soft)] leading-relaxed">
              {descTooLong && !descExpanded ? (
                <>
                  {desc.slice(0, DESC_LIMIT).trimEnd()}…{" "}
                  <button
                    type="button"
                    onClick={() => setDescExpanded(true)}
                    className="text-[var(--gold)] underline underline-offset-2 hover:text-[var(--gold-hover)]"
                  >
                    ver mais
                  </button>
                </>
              ) : (
                <>
                  {desc}
                  {descTooLong && (
                    <>
                      {" "}
                      <button
                        type="button"
                        onClick={() => setDescExpanded(false)}
                        className="text-[var(--gold)] underline underline-offset-2 hover:text-[var(--gold-hover)]"
                      >
                        ver menos
                      </button>
                    </>
                  )}
                </>
              )}
            </p>
          )}

          {needsPrep(product) && (
            <div className="mt-4 p-3 border border-[var(--amber-warm)]/50 text-xs md:text-sm text-[var(--cream)]/90 rounded-sm">
              Esta poção é preparada sob demanda e precisa de 2 dias de maceração após o pedido.
            </div>
          )}

          {/* Toggle mobile-only para recolher sugestões + info técnica */}
          <button
            type="button"
            onClick={() => setDetailsOpen((v) => !v)}
            className="md:hidden mt-4 w-full py-2 border border-[var(--gold)]/30 text-[var(--gold)] text-xs font-display tracking-widest uppercase rounded-sm hover:bg-[var(--gold)]/10 transition-colors"
            aria-expanded={detailsOpen}
          >
            {detailsOpen ? "Ocultar detalhes" : "Mais detalhes"}
          </button>

          <div className={`${detailsOpen ? "block" : "hidden"} md:block`}>
          {product.sugestoes && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setSugExpanded((v) => !v)}
                className="text-xs text-[var(--gold)]/80 hover:text-[var(--gold)] underline underline-offset-4 decoration-[var(--gold)]/30 hover:decoration-[var(--gold)] transition-colors tracking-wide"
                aria-expanded={sugExpanded}
              >
                {sugExpanded ? "ocultar sugestões" : "ver sugestões de consumo"}
              </button>
              {sugExpanded && (
                <div className="mt-2 p-3 border-l-2 border-[var(--gold)]/40 bg-[var(--surface-elevated)]/40 text-sm text-[var(--cream)]/90 leading-relaxed rounded-sm">
                  {product.sugestoes}
                </div>
              )}
            </div>
          )}

          <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 mt-5 text-xs text-[var(--text-soft)] border-t border-[var(--gold)]/15 pt-4">
            <InfoStat
              label="Graduação"
              value={`${product.graduacao_gl}°GL`}
              tip="Mede a intensidade do álcool no licor. Define o equilíbrio entre calor e sabor."
              open={openTip === "grad"}
              onToggle={() => setOpenTip(openTip === "grad" ? null : "grad")}
            />
            <InfoStat
              label="Brix"
              value={`${product.brix}°Bx`}
              tip="Indica o teor de açúcar da bebida: quanto maior o número, mais doce e encorpado é o licor."
              open={openTip === "brix"}
              onToggle={() => setOpenTip(openTip === "brix" ? null : "brix")}
            />
            <InfoStat
              label="Classificação"
              value={klass.label}
              tip={klass.tooltip}
              open={openTip === "class"}
              onToggle={() => setOpenTip(openTip === "class" ? null : "class")}
            />
            <InfoStat
              label="Ingredientes"
              value="ver ing."
              valueIsAction
              tip={product.ingredientes ?? "Ingredientes ainda não cadastrados."}
              open={openTip === "ingr"}
              onToggle={() => setOpenTip(openTip === "ingr" ? null : "ingr")}
              hideLabelTip
            />
          </div>
          </div>
          </div>

          <div className="shrink-0 border-t border-[var(--gold)]/15 bg-[var(--surface)] px-4 py-3 md:px-6 md:py-3">
            {out ? (
              <div className="space-y-3">
                <button disabled className="w-full py-2 bg-[var(--text-faded)]/30 text-[var(--text-faded)] font-display tracking-widest uppercase text-[11px] cursor-not-allowed rounded-sm">
                  Sem estoque no momento
                </button>
                <p className="text-[11px] text-[var(--text-soft)] text-center">
                  Entre em contato com o Alquimista para verificar disponibilidade.
                </p>
                <a
                  href={waUrl(`Olá! Tenho interesse em ${product.nome}. Está disponível?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center w-full py-2 border border-[var(--gold)]/40 text-[var(--gold)] font-display tracking-widest uppercase text-[11px] hover:bg-[var(--gold)] hover:text-[var(--background)] transition-colors rounded-sm"
                >
                  Falar com o Alquimista
                </a>
              </div>
            ) : semDisponivel ? (
              <div className="space-y-2">
                <button disabled className="w-full py-2 bg-[var(--text-faded)]/30 text-[var(--text-faded)] font-display tracking-widest uppercase text-[11px] cursor-not-allowed rounded-sm">
                  Estoque já reservado no caldeirão
                </button>
                <p className="text-[11px] text-[var(--text-soft)] text-center">
                  Você já adicionou todas as {product.estoque} unidades disponíveis.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="inline-flex items-center border border-[var(--gold)]/30 rounded-sm">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-2.5 py-1.5 text-sm">−</button>
                    <span className="px-2 text-sm">{qty}</span>
                    <button
                      onClick={() => setQty(Math.min(restante, qty + 1))}
                      disabled={qty >= restante}
                      className="px-2.5 py-1.5 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                    >+</button>
                  </div>
                  <button onClick={() => {
                    if (qty > restante) {
                      toast.error(`Estoque insuficiente — restam ${restante} de ${product.nome}`);
                      return;
                    }
                    add({ id: product.id, nome: product.nome, sabor: product.sabor, preco: Number(product.preco), foto_url: product.foto_url, categoria: product.categoria }, qty);
                    toast(`✦ ${product.nome} adicionada ao pedido`);
                    onClose();
                  }} className="flex-1 py-2 bg-[var(--gold)] text-[var(--background)] font-display tracking-widest uppercase text-[11px] hover:bg-[var(--gold-hover)] transition-colors rounded-sm">
                    Adicionar ao Caldeirão
                  </button>
                </div>
                <p className="text-[10px] text-[var(--text-soft)] text-center">
                  Restam {restante} {restante === 1 ? "unidade disponível" : "unidades disponíveis"} para este sabor.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function InfoStat({ label, value, tip, open, onToggle, valueIsAction, hideLabelTip }: { label: string; value: string; tip: string; open: boolean; onToggle: () => void; valueIsAction?: boolean; hideLabelTip?: boolean }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; placement: "below" | "above" } | null>(null);
  useEffect(() => {
    if (!open || !btnRef.current) { setPos(null); return; }
    const rect = btnRef.current.getBoundingClientRect();
    const tooltipW = 288; // w-72
    const tooltipH = 120; // estimativa
    const margin = 8;
    let left = rect.left;
    if (left + tooltipW + margin > window.innerWidth) left = window.innerWidth - tooltipW - margin;
    if (left < margin) left = margin;
    const spaceBelow = window.innerHeight - rect.bottom;
    const placement: "below" | "above" = spaceBelow < tooltipH + margin && rect.top > spaceBelow ? "above" : "below";
    const top = placement === "below" ? rect.bottom + 6 : rect.top - 6;
    setPos({ top, left, placement });
  }, [open]);
  return (
    <div className="relative min-w-0">
      {hideLabelTip ? (
        <div className="text-left w-full text-[var(--cream)]/75 whitespace-nowrap">
          <span className="truncate">{label}</span>
        </div>
      ) : (
        <button
          ref={btnRef}
          type="button"
          onClick={onToggle}
          className="text-left w-full text-[var(--cream)]/75 flex items-center gap-1 hover:text-[var(--gold)] transition-colors whitespace-nowrap"
          aria-expanded={open}
        >
          <span className="truncate">{label}</span>
          <span className="opacity-60 shrink-0">(?)</span>
        </button>
      )}
      {valueIsAction ? (
        <button
          ref={btnRef}
          type="button"
          onClick={onToggle}
          className="text-left text-[var(--cream)] underline underline-offset-2 hover:text-[var(--gold)] transition-colors"
        >
          {value}
        </button>
      ) : (
        <div className="text-[var(--cream)]">{value}</div>
      )}
      {open && pos && typeof document !== "undefined" && createPortal(
        <div
          data-stat-tooltip
          style={{
            position: "fixed",
            top: pos.placement === "below" ? pos.top : undefined,
            bottom: pos.placement === "above" ? window.innerHeight - pos.top : undefined,
            left: pos.left,
            width: 288,
          }}
          className="z-[110] p-3 bg-[var(--background)] border border-[var(--gold)]/40 rounded-sm text-[11px] leading-snug text-[var(--cream)] shadow-xl"
        >
          {tip}
        </div>,
        document.body
      )}
    </div>
  );
}