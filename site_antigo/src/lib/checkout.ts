import { useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/site";
import type { CartItem } from "@/store/cart";

export type TipoEntrega = "delivery" | "retirada";

type AddressSuggestion = {
  label: string;
  endereco: string;
  lat: number;
  lon: number;
};

function buildLabel(a: any): { label: string; endereco: string } {
  const ad = a.address || {};
  const rua = ad.road || ad.pedestrian || ad.cycleway || ad.footway || ad.path || a.name || "";
  const bairro = ad.suburb || ad.neighbourhood || ad.village || ad.hamlet || ad.city_district || "";
  const cidade = ad.city || ad.town || ad.municipality || ad.village || "";
  const uf = ad.state_code || ad.state || "";
  const parts = [rua, bairro, cidade && uf ? `${cidade} - ${uf}` : cidade || uf].filter(Boolean);
  const label = parts.join(", ") || a.display_name;
  const endereco = [rua, bairro, cidade, uf, "Brasil"].filter(Boolean).join(", ");
  return { label, endereco };
}

const PRIORITY_CITIES = [
  "Criciúma", "Içara", "Cocal do Sul", "Siderópolis", "Forquilhinha",
  "Nova Veneza", "Morro da Fumaça", "Urussanga", "Treviso", "Maracajá",
  "Balneário Rincão", "Sangão", "Treze de Maio", "Morro Grande", "Araranguá",
  "Meleiro", "Lauro Müller", "Pedras Grandes", "Balneário Arroio do Silva",
  "Jaguaruna", "Orleans",
];

function norm(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

const PRIORITY_INDEX = new Map(PRIORITY_CITIES.map((c, i) => [norm(c), i]));

function rankSuggestion(a: any): number {
  const ad = a.address || {};
  const cidade = norm(ad.city || ad.town || ad.municipality || ad.village || "");
  const uf = (ad.state_code || ad.state || "").toString().toLowerCase();
  const pIdx = PRIORITY_INDEX.get(cidade);
  if (pIdx !== undefined) return pIdx; // 0..N-1
  if (uf === "sc" || uf.includes("santa catarina")) return 1000;
  return 2000;
}

export function useFrete() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [endereco, setEndereco] = useState("");
  const [valor, setValor] = useState<number | null>(null);
  const [km, setKm] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [lat, setLat] = useState<number | undefined>();
  const [lon, setLon] = useState<number | undefined>();
  const reqIdRef = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3 || endereco) {
      setSuggestions([]);
      return;
    }
    const myId = ++reqIdRef.current;
    setLoadingSuggestions(true);
    const t = setTimeout(async () => {
      try {
        const viewbox = "-49.95,-28.30,-48.55,-29.20";
        const regionalUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&countrycodes=br&viewbox=${viewbox}&bounded=1&q=${encodeURIComponent(q)}`;
        const nationalUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&countrycodes=br&q=${encodeURIComponent(q)}`;
        const [reg, nat] = await Promise.all([
          fetch(regionalUrl, { headers: { "Accept-Language": "pt-BR" } }).then(r => r.json()).catch(() => []),
          fetch(nationalUrl, { headers: { "Accept-Language": "pt-BR" } }).then(r => r.json()).catch(() => []),
        ]);
        if (myId !== reqIdRef.current) return;
        const merged: any[] = [];
        const seen = new Set<string>();
        for (const a of [...(Array.isArray(reg) ? reg : []), ...(Array.isArray(nat) ? nat : [])]) {
          const key = String(a.place_id ?? `${a.lat},${a.lon}`);
          if (seen.has(key)) continue;
          seen.add(key);
          merged.push(a);
        }
        const raw = merged.map((a, i) => ({ a, i }));
        raw.sort((x, y) => {
          const rx = rankSuggestion(x.a);
          const ry = rankSuggestion(y.a);
          if (rx !== ry) return rx - ry;
          return x.i - y.i;
        });
        const list: AddressSuggestion[] = raw.slice(0, 8).map(({ a }) => {
          const { label, endereco } = buildLabel(a);
          return { label, endereco, lat: Number(a.lat), lon: Number(a.lon) };
        });
        setSuggestions(list);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        if (myId === reqIdRef.current) setLoadingSuggestions(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query, endereco]);

  async function selecionar(s: AddressSuggestion) {
    setShowSuggestions(false);
    setSuggestions([]);
    setQuery(s.label);
    setEndereco(s.endereco);
    setLat(s.lat);
    setLon(s.lon);
    setErro(null);
    setValor(null);
    setKm(null);
    setLoading(true);
    try {
      const o = SITE.origin;
      const route = await fetch(`https://router.project-osrm.org/route/v1/driving/${o.lng},${o.lat};${s.lon},${s.lat}?overview=false`).then(r => r.json());
      if (!route.routes?.[0]) throw new Error("Rota não encontrada");
      const d = route.routes[0].distance / 1000;
      setKm(d);
      setValor(Math.max(8, Math.round(d * 2)));
    } catch (e: any) {
      setErro(e.message || "Erro ao calcular frete");
    } finally {
      setLoading(false);
    }
  }

  function limpar() {
    setEndereco("");
    setValor(null);
    setKm(null);
    setErro(null);
    setLat(undefined);
    setLon(undefined);
  }

  return { query, setQuery, suggestions, loadingSuggestions, showSuggestions, setShowSuggestions, selecionar, endereco, valor, km, loading, erro, limpar, lat, lon };
}

export function fmtBR(n: number) {
  return n.toFixed(2).replace(".", ",");
}

export function buildPedidoMsg(opts: {
  codigo?: string;
  nome: string;
  tipo: TipoEntrega;
  enderecoCompleto: string;
  subtotal: number;
  frete: number;
  items: CartItem[];
  indicador?: { nome: string; whatsapp: string };
}) {
  const now = new Date();
  const data = now.toLocaleDateString("pt-BR");
  const hora = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const total = opts.subtotal + opts.frete;
  const tipoLabel = opts.tipo === "delivery" ? "Delivery" : "Retirada";
  const isDelivery = opts.tipo === "delivery";

  const E = {
    cal: "🗓️",
    clock: "⏰",
    pin: "📍",
    money: "💲",
    scroll: "📜",
    star: "🌟",
  };

  const blocks: string[] = opts.items.map((i) => {
    if (i.tipo === "avulso") {
      return `- *x${i.qty} ${i.nome} (${i.sabor})*\n     R$ ${fmtBR(i.preco * i.qty)}`;
    }
    if (i.tipo === "kit-degustacao") {
      const gar = i.saboresLabels.map((s, idx) => `> Garrafinha ${idx + 1}: ${s.nome} (${s.sabor})`).join("\n");
      return `- *x${i.qty} Kit Degustação* — R$ ${fmtBR(i.preco * i.qty)}\n${gar}`;
    }
    // kit-presenteavel
    const lines = [
      `- *x${i.qty} Kit Presenteável* — R$ ${fmtBR(i.preco * i.qty)}`,
      `> Licor: ${i.licor.nome} (${i.licor.sabor}) — 500ml`,
      `> Acompanhamento: ${i.acompanhamento}`,
      `> Embalagem: ${i.embalagem}`,
    ];
    if (i.dedicatoria) lines.push(`> Dedicatória: "${i.dedicatoria}"`);
    return lines.join("\n");
  });

  const lines: string[] = [
    opts.codigo ? `*Pedido [${opts.codigo}]*\n` : "",
    `Resumo do pedido de *${opts.nome}*`,
    `${E.cal} Data: ${data} ${E.clock} Hora: ${hora}`,
    ``,
    `*Tipo de serviço:* ${tipoLabel}`,
    ``,
  ];

  if (isDelivery) {
    lines.push(`${E.pin} *Endereço:*`, opts.enderecoCompleto, ``);
  }

  lines.push(
    `${E.money} *Custos*`,
    `Produtos: R$ ${fmtBR(opts.subtotal)}`,
  );
  if (isDelivery) {
    lines.push(`Entrega _estimada_: R$ ${fmtBR(opts.frete)}`);
  }
  lines.push(
    `*Total: R$ ${fmtBR(total)}*`,
    ``,
    (opts.indicador && (opts.indicador.nome || opts.indicador.whatsapp))
      ? `${E.star} Indicação: ${opts.indicador.nome}${opts.indicador.whatsapp ? ` - ${opts.indicador.whatsapp}` : ""}`
      : `Indicação: - `,
    ``,
    `${E.scroll} *Composição do Pedido*`,
    ``,
    blocks.join("\n\n"),
    ``,
    `Fico no aguardo da confirmação do pedido. Obrigado!`,
  );

  return lines.join("\n");
}
