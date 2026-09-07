import { useState, useRef } from "react";
import { toast } from "sonner";
import { useFrete, buildPedidoMsg, type TipoEntrega } from "@/lib/checkout";
import { fmtPrice, SITE, waUrl } from "@/lib/site";
import { useCart } from "@/store/cart";
import { createOrder } from "@/lib/orders.functions";

export function CheckoutForm({ onBack, onSent }: { onBack: () => void; onSent: () => void }) {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.total());
  const clear = useCart((s) => s.clear);
  const requestIdRef = useRef(crypto.randomUUID());

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipo, setTipo] = useState<TipoEntrega>("delivery");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [indicadorNome, setIndicadorNome] = useState("");
  const [indicadorWhats, setIndicadorWhats] = useState("");
  const [loading, setLoading] = useState(false);
  const frete = useFrete();

  const freteValor = tipo === "delivery" && frete.valor && frete.km && frete.km <= 35 ? frete.valor : 0;
  const total = subtotal + freteValor;

  async function enviar() {
    if (items.length === 0) return toast.error("Seu caldeirão está vazio");
    if (!nome.trim()) return toast.error("Informe seu nome");
    if (!telefone.trim()) return toast.error("Informe seu telefone");
    if (tipo === "delivery" && !frete.endereco) return toast.error("Calcule o frete");
    if (tipo === "delivery" && !numero.trim()) return toast.error("Informe o número do endereço");
    
    setLoading(true);
    const enderecoCompleto = `${frete.endereco}${numero ? `, ${numero}` : ""}${complemento ? ` - ${complemento}` : ""}`;
    const requestId = requestIdRef.current;

    try {
      const { order, pricing } = await createOrder({
        data: {
          requestId,
          clienteNome: nome.trim(),
          clienteTelefone: telefone.trim(),
          indicadorNome: indicadorNome.trim(),
          indicadorWhatsapp: indicadorWhats.trim(),
          itemsSnapshot: items,
          subtotal,
          freteValor,
          total,
          tipoEntrega: tipo,
          enderecoCompleto: tipo === "delivery" ? enderecoCompleto : undefined,
          latitude: tipo === "delivery" ? frete.lat : undefined,
          longitude: tipo === "delivery" ? frete.lon : undefined,
        }
      });

      const msg = buildPedidoMsg({
        codigo: order.codigo_pedido,
        nome,
        tipo,
        enderecoCompleto,
        subtotal: pricing.subtotal,
        frete: pricing.frete,
        items,
        indicador: { nome: indicadorNome.trim(), whatsapp: indicadorWhats.trim() },
      });

      window.open(waUrl(msg), "_blank");
      clear();
      requestIdRef.current = crypto.randomUUID(); // Renovação pós-sucesso
      onSent();
    } catch (err: any) {
      console.error("Erro ao registrar pedido:", err);
      toast.error(err.message || "Erro ao processar seu pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs md:text-sm text-[var(--text-faded)] underline hover:text-[var(--gold)]">← Voltar ao caldeirão</button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome*"
          className="w-full bg-[var(--background)] border border-[var(--gold)]/30 px-4 py-2.5 text-sm rounded-sm focus:border-[var(--gold)] outline-none text-[var(--cream)]"
        />
        <input
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="Seu WhatsApp (com DDD)*"
          className="w-full bg-[var(--background)] border border-[var(--gold)]/30 px-4 py-2.5 text-sm rounded-sm focus:border-[var(--gold)] outline-none text-[var(--cream)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {([
          { id: "delivery" as const, label: "Delivery", emoji: "🛵" },
          { id: "retirada" as const, label: "Retirada", emoji: "🏠" },
        ]).map((o) => (
          <button
            key={o.id}
            onClick={() => setTipo(o.id)}
            className={`p-3 border rounded-sm text-center transition-all ${tipo === o.id ? "border-[var(--gold)] bg-[var(--gold)]/10" : "border-[var(--gold)]/20 hover:border-[var(--gold)]/60"}`}
          >
            <div className="text-2xl mb-1">{o.emoji}</div>
            <div className="font-display tracking-widest uppercase text-sm md:text-base text-[var(--gold)]">{o.label}</div>
          </button>
        ))}
      </div>

      {tipo === "delivery" ? (
        <div className="space-y-3">
          <div className="p-4 border border-[var(--gold)]/20 rounded-sm bg-[var(--surface)]/40">
            <div className="font-display tracking-widest uppercase text-sm md:text-base text-[var(--gold)] mb-2">Calcular frete motoboy</div>
            <div className="relative">
              <input
                value={frete.query}
                onChange={(e) => { frete.setQuery(e.target.value); if (frete.endereco) frete.limpar(); }}
                onFocus={() => frete.suggestions.length > 0 && frete.setShowSuggestions(true)}
                onBlur={() => setTimeout(() => frete.setShowSuggestions(false), 150)}
                placeholder="Digite o nome da rua"
                className="w-full bg-[var(--background)] border border-[var(--gold)]/30 px-3 py-2 text-sm rounded-sm focus:border-[var(--gold)] outline-none text-[var(--cream)]"
              />
              {frete.loadingSuggestions && (
                <div className="text-[11px] text-[var(--text-faded)] mt-1">Buscando endereços…</div>
              )}
              {frete.showSuggestions && frete.suggestions.length > 0 && (
                <ul className="absolute z-20 left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-[var(--surface)] border border-[var(--gold)]/30 rounded-sm shadow-lg">
                  {frete.suggestions.map((s, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); frete.selecionar(s); }}
                        className="w-full text-left px-3 py-2 text-sm text-[var(--cream)] hover:bg-[var(--gold)]/10 border-b border-[var(--gold)]/10 last:border-b-0"
                      >
                        {s.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {frete.loading && <div className="text-xs text-[var(--text-soft)] mt-2">Calculando frete…</div>}
            {frete.erro && <div className="text-xs text-[var(--wine)] mt-2">{frete.erro}</div>}
            {frete.valor !== null && frete.km !== null && (
              <div className="text-sm text-[var(--cream)] mt-3">
                {frete.km > 35 ? (
                  <span className="text-[var(--amber-warm)]">Distância acima de 35km — combinaremos o frete pelo WhatsApp.</span>
                ) : (
                  <>Distância: <strong>{frete.km.toFixed(1)} km</strong> — Frete: <strong className="text-[var(--gold)]">{fmtPrice(frete.valor)}</strong></>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Número*" className="bg-[var(--background)] border border-[var(--gold)]/30 px-3 py-2 text-sm rounded-sm focus:border-[var(--gold)] outline-none text-[var(--cream)]" />
            <input value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Complemento" className="bg-[var(--background)] border border-[var(--gold)]/30 px-3 py-2 text-sm rounded-sm focus:border-[var(--gold)] outline-none text-[var(--cream)]" />
          </div>
        </div>
      ) : (
        <div className="p-3 border border-[var(--gold)]/20 rounded-sm bg-[var(--surface)]/40 text-xs text-[var(--text-soft)] font-sans italic text-center">
          Retirada no local · {SITE.address}
        </div>
      )}

      <div className="flex justify-between font-display tracking-wider text-sm pt-2 border-t border-[var(--gold)]/15">
        <span>Subtotal</span><span className="text-base md:text-lg">{fmtPrice(subtotal)}</span>
      </div>

      <div className="p-3 border border-[var(--gold)]/20 rounded-sm bg-[var(--surface)]/40 space-y-2">
        <div className="font-display tracking-widest uppercase text-xs md:text-sm text-[var(--gold)]">Indicação (opcional)</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input
            value={indicadorNome}
            onChange={(e) => setIndicadorNome(e.target.value)}
            placeholder="Nome de quem indicou"
            className="bg-[var(--background)] border border-[var(--gold)]/30 px-3 py-2 text-sm rounded-sm focus:border-[var(--gold)] outline-none text-[var(--cream)]"
          />
          <input
            value={indicadorWhats}
            onChange={(e) => setIndicadorWhats(e.target.value)}
            placeholder="WhatsApp de quem indicou"
            className="bg-[var(--background)] border border-[var(--gold)]/30 px-3 py-2 text-sm rounded-sm focus:border-[var(--gold)] outline-none text-[var(--cream)]"
          />
        </div>
      </div>

      <div className="flex justify-between font-display tracking-wider text-sm">
        <span>Frete</span><span className="text-base md:text-lg">{fmtPrice(freteValor)}</span>
      </div>
      <div className="flex justify-between font-display tracking-wider text-lg md:text-xl">
        <span>Total</span><span className="text-[var(--gold)] text-2xl md:text-3xl">{fmtPrice(total)}</span>
      </div>

      <button
        onClick={enviar}
        disabled={loading}
        className="w-full py-3 bg-[var(--gold)] text-[var(--background)] font-body tracking-widest uppercase text-sm hover:bg-[var(--gold-hover)] transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processando..." : "Finalizar pedido no WhatsApp"}
      </button>
    </div>
  );
}
