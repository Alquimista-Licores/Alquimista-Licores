import { CauldronIcon } from "./CauldronIcon";
import { toast } from "sonner";
import { useCart } from "@/store/cart";
import { fmtPrice, categoriaLabel, needsPrep } from "@/lib/site";
import type { Product } from "@/lib/types";

export function ProductCard({ p, onClick }: { p: Product; onClick: () => void }) {
  const add = useCart((s) => s.addAvulso);
  const usage = useCart((s) => s.usageByProduct(p.id));
  const out = p.estoque <= 0;
  // Esgotados também recebem o efeito de ampliação ao hover (com o selo "Esgotado" mantido).
  const hoverable = true;

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col md:block aspect-auto md:aspect-[3/4] bg-[var(--surface)] border border-[var(--gold)]/15 rounded-sm overflow-hidden ${out ? "cursor-not-allowed" : "cursor-pointer"} transition-all duration-500 hover:-translate-y-1 gold-glow-hover`}
    >
      {/* IMAGE LAYER — grows to full height on hover and fades */}
      <div
        className={`relative w-full aspect-square md:absolute md:inset-x-0 md:top-0 md:h-[62%] md:aspect-auto md:w-auto bg-gradient-to-b from-[var(--surface-elevated)] to-[var(--background)] overflow-hidden transition-[height,opacity] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          hoverable ? "md:group-hover:h-full md:group-hover:opacity-30" : ""
        } ${out ? "opacity-60" : ""}`}
      >
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_50%_0%,_rgba(184,111,42,0.35)_0%,_transparent_60%)] z-10" />
        {p.foto_url ? (
          <img
            src={p.foto_url}
            alt={p.nome}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--gold)]/30 text-7xl">⚗</div>
        )}
        {needsPrep(p) && !out && (
          <div className="absolute top-0 inset-x-0 bg-[var(--amber-warm)]/80 text-[var(--background)] text-[10px] md:text-sm lg:text-base font-display tracking-widest uppercase text-center py-0.5 backdrop-blur-sm">
            Sob encomenda · 2 dias
          </div>
        )}
        {out && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--background)]/40">
            <span className="px-6 py-2.5 bg-[var(--gold)] text-[var(--background)] text-sm md:text-base font-display tracking-widest uppercase rounded-sm shadow-lg">
              Esgotado
            </span>
          </div>
        )}
        {/* MOBILE: name overlay inside image square */}
        <div className="md:hidden absolute inset-x-0 bottom-0 pt-10 px-3 pb-2 bg-gradient-to-t from-black/85 via-black/55 to-transparent pointer-events-none">
          <div className="font-display text-xs text-[var(--gold)] tracking-widest uppercase leading-tight">
            {categoriaLabel(p.categoria)}
          </div>
          <div className="font-body text-sm text-[var(--cream)] mt-0.5 leading-tight">
            {p.sabor}
          </div>
        </div>
      </div>
      {/* MOBILE: thin solid bottom bar with price + cauldron */}
      <div className="md:hidden relative h-12 px-3 flex items-center justify-between bg-[var(--surface)] border-t border-[var(--gold)]/15">
        <div className="font-display font-bold text-xl text-[var(--gold)]">{fmtPrice(p.preco)}</div>
        {!out && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (usage + 1 > p.estoque) {
                toast.error(`Estoque insuficiente — restam ${Math.max(0, p.estoque - usage)} de ${p.nome}`);
                return;
              }
              add({
                id: p.id,
                nome: p.nome,
                sabor: p.sabor,
                preco: Number(p.preco),
                foto_url: p.foto_url,
                categoria: p.categoria,
              });
              toast(`✦ ${p.nome} adicionada ao pedido`);
            }}
            className="w-8 h-8 flex items-center justify-center border border-[var(--gold)]/40 text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--background)] transition-colors rounded-sm"
            title="Adicionar ao caldeirão"
            aria-label="Adicionar ao caldeirão"
          >
            <CauldronIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      {/* DESKTOP INFO LAYER — pinned to bottom; becomes transparent on hover */}
      <div
        className={`hidden md:block absolute inset-x-0 bottom-0 p-5 bg-[var(--surface)] transition-colors duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          hoverable ? "group-hover:bg-transparent" : ""
        }`}
      >
        <div className="font-display font-bold text-base lg:text-xl text-[var(--gold)] tracking-widest uppercase leading-tight">
          {p.nome}
        </div>
        <div className="font-body text-sm lg:text-base text-[var(--text-soft)] mt-2">{p.sabor}</div>
        <div className="flex items-end justify-between mt-4 pt-4 border-t border-[var(--gold)]/10">
          <div className="font-display font-bold text-3xl lg:text-4xl text-[var(--gold)]">{fmtPrice(p.preco)}</div>
          {!out && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (usage + 1 > p.estoque) {
                  toast.error(`Estoque insuficiente — restam ${Math.max(0, p.estoque - usage)} de ${p.nome}`);
                  return;
                }
                add({
                  id: p.id,
                  nome: p.nome,
                  sabor: p.sabor,
                  preco: Number(p.preco),
                  foto_url: p.foto_url,
                  categoria: p.categoria,
                });
                toast(`✦ ${p.nome} adicionada ao pedido`);
              }}
              className="w-9 h-9 flex items-center justify-center border border-[var(--gold)]/40 text-[var(--gold)] bg-[var(--surface)]/60 hover:bg-[var(--gold)] hover:text-[var(--background)] transition-colors rounded-sm backdrop-blur-sm"
              title="Adicionar ao caldeirão"
              aria-label="Adicionar ao caldeirão"
            >
              <CauldronIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}