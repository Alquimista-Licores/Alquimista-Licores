export interface Product {
  id: string;
  nome: string;
  sabor: string;
  categoria: 'fino' | 'cremoso' | 'especial';
  preco: number;
  volume_ml: number;
  estoque: number;
  notas_aromaticas: string | null;
  descricao: string | null;
  sugestoes: string | null;
  foto_url: string | null;
  fotos_urls?: string[] | null;
  fotos?: { thumb?: string; card?: string; full?: string }[] | null;
  ativo: boolean;
  graduacao_gl: number;
  brix: number;
  pedidos_count: number;
  ordem: number;
  ingredientes: string | null;
  codigo_integracao: string | null;
  stock_control_type?: 'manual' | 'gerenciapp';
}

export interface Testimonial {
  id: string;
  nome: string;
  texto: string;
  ativo?: boolean;
}

export interface KitPrice {
  id: string;
  kit_type: string;
  licor_categoria: string | null;
  embalagem: string | null;
  preco: number;
}

export const SITE = {
  name: "Alquimista Licores",
  title: "Alquimista - Licores Artesanais",
  description: "Licores artesanais feitos à mão em Criciúma/SC. Pequenos lotes, ingredientes naturais, alma e propósito.",
  whatsapp: "5548991737692",
  whatsappMsg: "Olá! Tenho interesse nos licores do Alquimista. Pode me ajudar?",
  address: "Rod. Antonio Darós, 1105 - São João, Criciúma - SC, 88816-195",
  mapsUrl: "https://maps.app.goo.gl/aytmRg4bwkG1ZK528",
  reviewUrl: "https://g.page/r/CWzwaZr9lnaDEAE/review",
  instagram: "https://instagram.com/alquimistalicores",
  origin: { lat: -28.7184, lng: -49.3523 },
};

const SUPABASE_URL = "https://crsjmyrkbpawxqgvfmrv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyc2pteXJrYnBhd3hxZ3ZmbXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5ODA5MzEsImV4cCI6MjEwMTU1NjkzMX0.sSZYBvyoPiQgVSBSKThee6_Pvhp41NJ_ioZf2JF_ado";

export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "9e6a58a9-8d88-4613-9ce7-2dfb8afca29e",
    nome: "Poção Tropical",
    sabor: "Abacaxi",
    categoria: "fino",
    preco: 35,
    volume_ml: 750,
    estoque: 6,
    notas_aromaticas: "Tropical • Doce • Cítrica",
    descricao: "Fruta tropical que se revela a cada gole, com doçura natural e frescor cítrico.",
    sugestoes: "Servir gelado, puro ou on the rocks. \nEm coquetéis tropicais (ex: Piña Colada, Margarita).\nAcompanha pratos leves (frutos do mar grelhados, saladas) e sobremesas tropicais (coco, manga).",
    foto_url: "https://crsjmyrkbpawxqgvfmrv.supabase.co/storage/v1/object/public/product-images/1786466111214-ldr0bl/card.webp",
    ativo: true,
    graduacao_gl: 16.5,
    brix: 20,
    pedidos_count: 3,
    ordem: 1,
    ingredientes: "Açúcar, Álcool de Cereais, Polpa de abacaxi e Cravo-da-Índia.",
    codigo_integracao: "LICOR-ABACAXI-500ML",
    stock_control_type: "manual"
  },
  {
    id: "b0d77291-b5ed-4548-8837-887f674c1b4c",
    nome: "Poção da Alegria",
    sabor: "Banana",
    categoria: "fino",
    preco: 38,
    volume_ml: 750,
    estoque: 4,
    notas_aromaticas: "Doce • Aveludada • Baunilha",
    descricao: "Bebida com bastante perfume da fruta e com doçura suave",
    sugestoes: "Degustar gelado, puro.\nEm coquetéis com gin ou rum (ex: Banana Daiquiri).\nHarmoniza com sobremesas cremosas (chocolate, doce de leite) e café.",
    foto_url: "https://crsjmyrkbpawxqgvfmrv.supabase.co/storage/v1/object/public/product-images/1786466211910-2f3x4n/card.webp",
    ativo: true,
    graduacao_gl: 22.5,
    brix: 25,
    pedidos_count: 5,
    ordem: 2,
    ingredientes: "Açúcar, Álcool de Cereais, Banana caturra, Açúcar mascavo, Canela em pau, Essência de baunilha e Cravo-da-Índia.",
    codigo_integracao: "LICOR-BANANA-500ML",
    stock_control_type: "gerenciapp"
  },
  {
    id: "6fe04098-9cd1-4cb7-a903-1e3ae1147671",
    nome: "Poção Néctar Místico",
    sabor: "Butiá",
    categoria: "fino",
    preco: 38,
    volume_ml: 750,
    estoque: 0,
    notas_aromaticas: "Cítrica • Frutada • Leve",
    descricao: "Sabor exótico, com doçura suave e com notas citricas.",
    sugestoes: "Servir gelado, puro ou on the rocks.\nEm drinks sour cítricos (ex: butiá sour com cachaça e limão).\nAcompanha pratos leves (saladas tropicais, peixes) ou queijos suaves.",
    foto_url: "https://crsjmyrkbpawxqgvfmrv.supabase.co/storage/v1/object/public/product-images/1786466237265-amfdmc/card.webp",
    ativo: true,
    graduacao_gl: 16,
    brix: 35,
    pedidos_count: 4,
    ordem: 3,
    ingredientes: "Açúcar, Álcool de Cereais e Polpa de butiá.",
    codigo_integracao: "LICOR-BUTIA-500ML",
    stock_control_type: "gerenciapp"
  },
  {
    id: "c1245fd9-cb5b-43e8-bf20-1495ff5c1aee",
    nome: "Poção da Inspiração",
    sabor: "Café & Laranja",
    categoria: "fino",
    preco: 40,
    volume_ml: 750,
    estoque: 2,
    notas_aromaticas: "Torrefação • Cítrica • Amarga",
    descricao: "Intenso e marcante, mistura o amargor do café com o frescor cítrico da laranja.",
    sugestoes: "Servir gelado como digestivo.\nEm coquetéis de café (Espresso Martini, Irish Coffee).\nAcompanha sobremesas com café ou chocolate (tiramisu, brownies) e drinks cremosos.",
    foto_url: "https://crsjmyrkbpawxqgvfmrv.supabase.co/storage/v1/object/public/product-images/1786466281130-kvnx5l/card.webp",
    ativo: true,
    graduacao_gl: 16,
    brix: 36,
    pedidos_count: 5,
    ordem: 4,
    ingredientes: "Açúcar, Álcool de Cereais, Grãos de café, Laranja, Canela em pau e Essência de baunilha.",
    codigo_integracao: "LICOR-CAFE-LARANJA-500ML",
    stock_control_type: "gerenciapp"
  },
  {
    id: "631512a9-16dc-4e4f-8f07-98278a207c0a",
    nome: "Poção do Aconchego",
    sabor: "Canela",
    categoria: "fino",
    preco: 38,
    volume_ml: 750,
    estoque: 5,
    notas_aromaticas: "Especiado • Quente • Amadeirado",
    descricao: "Aroma quente e envolvente, especiaria suave que aquece o paladar.",
    sugestoes: "Servir gelado, puro, após refeições (digestivo).\nEm coquetéis autorais (ex: Canela Sour) ou para aromatizar vinho quente (quentão).\nCombina com sobremesas de canela, chocolate e frutas assadas (maçã, pera).",
    foto_url: "https://crsjmyrkbpawxqgvfmrv.supabase.co/storage/v1/object/public/product-images/1786466298321-gico88/card.webp",
    ativo: true,
    graduacao_gl: 18,
    brix: 41,
    pedidos_count: 0,
    ordem: 5,
    ingredientes: "Açúcar, Álcool de Cereais, Canela em pau e Anis estrelado.",
    codigo_integracao: "LICOR-CANELA-500ML",
    stock_control_type: "gerenciapp"
  },
  {
    id: "f57e85ca-3e25-4885-a9b8-8febeac0421a",
    nome: "Poção da Conexão",
    sabor: "Figo",
    categoria: "fino",
    preco: 35,
    volume_ml: 750,
    estoque: 11,
    notas_aromaticas: "Herbácea • Frutada Suave • Leve",
    descricao: "Notas verdes e amadeiradas com doçura sutil, lembra tardes de verão. ",
    sugestoes: "Servir gelado, puro ou com gelo.\nPode ser usado em coquetéis com gin ou vodka para realçar o aroma herbal.\nHarmoniza com queijos frescos (cabra, ricota), frutas secas e saladas delicadas.",
    foto_url: "https://crsjmyrkbpawxqgvfmrv.supabase.co/storage/v1/object/public/product-images/1786466315741-2c4axn/card.webp",
    ativo: true,
    graduacao_gl: 21,
    brix: 31,
    pedidos_count: 0,
    ordem: 6,
    ingredientes: "Açúcar, Álcool de Cereais e Folhas de figueira.",
    codigo_integracao: "LICOR-FIGO-500ML",
    stock_control_type: "gerenciapp"
  },
  {
    id: "37758861-8dc5-4a9d-8995-b341c91ba200",
    nome: "Poção Silvestre",
    sabor: "Jabuticaba",
    categoria: "fino",
    preco: 38,
    volume_ml: 750,
    estoque: 0,
    notas_aromaticas: "Frutada • Adocicada • Leve Acidez",
    descricao: "Sabores intensos de jabuticaba madura, frutado e aveludado.",
    sugestoes: "Servir gelado, puro ou on the rocks.\nEm coquetéis vermelhos (caipirinha de jabuticaba) ou misturado a espumantes suaves.\nCombina com sobremesas de frutas vermelhas, chocolates finos e queijos de pasta mole.",
    foto_url: "https://crsjmyrkbpawxqgvfmrv.supabase.co/storage/v1/object/public/product-images/1786466361965-9ey0h6/card.webp",
    ativo: true,
    graduacao_gl: 15,
    brix: 31,
    pedidos_count: 0,
    ordem: 7,
    ingredientes: "Açúcar, Álcool de Cereais e Jabuticaba.",
    codigo_integracao: "LICOR-JABUTICABA-500ML",
    stock_control_type: "gerenciapp"
  },
  {
    id: "b679b884-73a2-48cc-81af-2bc99abecee1",
    nome: "Poção da Serenidade",
    sabor: "Maracujá",
    categoria: "fino",
    preco: 35,
    volume_ml: 750,
    estoque: 0,
    notas_aromaticas: "Tropical • Cítrica • Refrescante",
    descricao: "Notas tropicais vibrantes, equilibranco acidez marcante com doçura.",
    sugestoes: "Em coquetéis tropicais (caipirinha de maracujá, mojito).\nServir gelado, puro ou com gelo como refresco.\nHarmoniza com frutas frescas, sobremesas geladas (sorbete, panna cotta) e pratos exóticos.",
    foto_url: "https://crsjmyrkbpawxqgvfmrv.supabase.co/storage/v1/object/public/product-images/1786466383948-e9bzfg/card.webp",
    ativo: true,
    graduacao_gl: 15,
    brix: 44,
    pedidos_count: 0,
    ordem: 8,
    ingredientes: "Açúcar, Álcool de Cereais e Polpa de maracujá.",
    codigo_integracao: "LICOR-MARACUJA-FINO-500ML",
    stock_control_type: "gerenciapp"
  },
  {
    id: "d5941952-c8de-4cfa-a2d5-9ca89b0cf19a",
    nome: "Poção do Desejo",
    sabor: "Chocolate Cremoso",
    categoria: "cremoso",
    preco: 45,
    volume_ml: 750,
    estoque: 5,
    notas_aromaticas: "Intenso • Cacau • Aveludado",
    descricao: "Licor cremoso com cacau e chocolate nobre meio amargo, textura aveludada e final intenso e marcante.",
    sugestoes: "Puro e gelado em taça pequena, como digestivo. Serve para encerrar uma refeição com aveludado sabor de cacau.\nSobre sobremesas: como pudim de leite, sorvetes e bolos de chocolate. \nBebidas quentes como café expresso ou cappuccino, realçando notas torradas.\nCoquetelaria: base para drinks cremosos (White Russian, Alexander) substituindo licor de café. Garante cor e sabor chocolate intenso.",
    foto_url: "https://crsjmyrkbpawxqgvfmrv.supabase.co/storage/v1/object/public/product-images/1786466401507-ibzz7o/card.webp",
    ativo: true,
    graduacao_gl: 11.5,
    brix: 37,
    pedidos_count: 3,
    ordem: 9,
    ingredientes: "Açúcar, Álcool de Cereais, Leite condensado, Cacau 50% e Chocolate nobre meio amargo.",
    codigo_integracao: "LICOR-CHOCOLATE-CREMOSO-500ML",
    stock_control_type: "gerenciapp"
  },
  {
    id: "4a8abdb5-e5d4-4ab6-9fd8-4db419c17ed9",
    nome: "Poção do Doce Sossego",
    sabor: "Maracujá Cremoso",
    categoria: "cremoso",
    preco: 45,
    volume_ml: 750,
    estoque: 0,
    notas_aromaticas: "Tropical • Cítrico • Doce",
    descricao: "Licor cremoso artesanal de maracujá, doce e levemente cítrico. Textura aveludada e sabor tropical, equilibrado e fresco.",
    sugestoes: "Bem gelado, realçando frescor e acidez característica.\nDrinques tropicais: em batidas ou coquetéis (ex. caipirinha de maracujá ou com vodka) para um toque frutado.\nCom frutas: acompanha saladas de frutas frescas ou torta de maracujá. A combinação reforça o caráter tropical.",
    foto_url: "https://crsjmyrkbpawxqgvfmrv.supabase.co/storage/v1/object/public/product-images/1786466419519-mhjt7u/card.webp",
    ativo: true,
    graduacao_gl: 12.5,
    brix: 37,
    pedidos_count: 0,
    ordem: 10,
    ingredientes: "Açúcar, Álcool de Cereais, Leite condensado e Polpa de maracujá.",
    codigo_integracao: "LICOR-MARACUJA-CREMOSO-500ML",
    stock_control_type: "gerenciapp"
  },
  {
    id: "03b9242c-50a5-4c7d-bb5e-0211b266b421",
    nome: "Poção do Doce Deleite",
    sabor: "Doce de Leite",
    categoria: "cremoso",
    preco: 45,
    volume_ml: 750,
    estoque: 0,
    notas_aromaticas: "Cremoso • Caramelo • Canela",
    descricao: "Licor cremoso artesanal de doce de leite com baunilha e canela. Doce e aconchegante, com textura aveludada e aroma caramelizado.",
    sugestoes: "Dose gelada: servir como digestivo em copo pequeno. Gelar intensifica a cremosidade.\nSobremesas intensas: ideal com doces de café ou chocolate amargo (ex., brigadeiro gourmet, pudim ou mousse de café). O licor adoça e complementa sabores caramelizados.\nDrinks cremosos: experimente em coquetéis como versão doce do Espress Martini (café + licor de doce de leite). Confere textura aveludada e aroma de caramelo.\nCoberturas: pode ser usado como calda sobre sorvetes, cheesecakes ou panquecas, ampliando camadas de sabor.",
    foto_url: "https://crsjmyrkbpawxqgvfmrv.supabase.co/storage/v1/object/public/product-images/1786466440655-rs4xq5/card.webp",
    ativo: true,
    graduacao_gl: 12.5,
    brix: 28,
    pedidos_count: 1,
    ordem: 11,
    ingredientes: "Doce de leite, Açúcar, Álcool de Cereais, Canela em pó e Essência de baunilha.",
    codigo_integracao: "LICOR-DOCE-LEITE-500ML",
    stock_control_type: "gerenciapp"
  },
  {
    id: "af94b5a9-33d4-4a6b-abb1-0e59a49d3ec7",
    nome: "Poção da Prosperidade",
    sabor: "Ouro Especial",
    categoria: "especial",
    preco: 50,
    volume_ml: 750,
    estoque: 5,
    notas_aromaticas: "Mística • Especiado • Aromático",
    descricao: "Licor sedoso à base de leite, com infusão de café e especiarias. Notas de baunilha, cacau e noz-moscada, com leve toque cítrico, final suave e aveludado.",
    sugestoes: "Temperatura levemente fria: servir em taça pequena a cerca de 10–15 °C. \nPuro ou com gelo: degustar solo, como digestivo aromático após refeição. Não exagerar em gelo para não ofuscar as especiarias.\nDrinks criativos: substituir aguardente ou vodka em coquetéis de café (ex., martini de baunilha) para obter cremosidade extra.",
    foto_url: "https://crsjmyrkbpawxqgvfmrv.supabase.co/storage/v1/object/public/product-images/1786466461895-nxr6jl/card.webp",
    ativo: true,
    graduacao_gl: 12.5,
    brix: 31,
    pedidos_count: 8,
    ordem: 12,
    ingredientes: "Açúcar, Leite Integral, Álcool de Cereais, Limão siciliano, Café, Cacau 100%, Noz-moscada e Essência de baunilha.",
    codigo_integracao: "LICOR-OURO-500ML",
    stock_control_type: "gerenciapp"
  }
];

export const FALLBACK_TESTIMONIALS: Testimonial[] = [
  { id: "eb69c03d-dd42-4fb0-895b-1f1a5f68d342", nome: "Carlos T.", texto: "Presenteei minha mãe com o Kit Presenteável e ela amou. Embalagem impecável.", ativo: true },
  { id: "e926955c-d78e-4d6b-85f4-7ec281d15c98", nome: "Anice Cardoso", texto: "Licores saborosos e alcoólicos na medida certa. E é sempre uma boa opção para presentear. Adoro 🤌🏼🤌🏼🥰", ativo: true },
  { id: "10663f84-2502-43f1-a277-af8e93686a78", nome: "Fernanda Mangilli", texto: "Os licores são deliciosos, gostei muito do licor de maracujá inclusive comprei mais.", ativo: true },
  { id: "080b042b-8933-4446-b1f6-64405c3ff030", nome: "Pvianab4", texto: "Licores super deliciosos, atendimento excelente!", ativo: true },
  { id: "7992dad6-da61-4b2a-8449-b345a34ccaad", nome: "Luiz Felipe K.", texto: "Licores excelentes, um melhor que o outro..\nO meu preferido é o de jaboticaba", ativo: true },
  { id: "3edeb4b7-6b6d-4bc2-9bd7-417f7a10d405", nome: "Carine Rego", texto: "Um dos melhores licores de maracujá que já provei! Top", ativo: true },
  { id: "69cb7f34-71e7-44c9-95fc-5ae16abf4b6d", nome: "Valdinei Matias", texto: "Excelente licor, sabor marcante e uma experiência inesquecível", ativo: true },
  { id: "659a6a40-da93-4ce0-8de4-5e82d319e2a8", nome: "Vera Lúcia Manoel", texto: "São muito bons saborosos ,ótima qualidade,adorei", ativo: true },
  { id: "818d0d10-85a8-4091-8669-1c06c2221d75", nome: "Robert Nogueira", texto: "Licor de qualidade!!", ativo: true },
  { id: "4bd80e4a-e966-4f65-9f73-ecd30f268b22", nome: "Mikael Silva", texto: "Muito bom, o cara é bom, bom demais", ativo: true }
];

export const FALLBACK_KIT_PRICES: KitPrice[] = [
  { id: "a96a3098-45bc-451f-ac5d-89a8a5fb1860", kit_type: "presenteavel", licor_categoria: "fino", embalagem: "mdf", preco: 110 },
  { id: "079de590-5785-409a-824a-8a7214f63a59", kit_type: "presenteavel", licor_categoria: "fino", embalagem: "acrilico", preco: 130 },
  { id: "71125a4d-a34e-4c4e-81fc-5fff0ac4b1de", kit_type: "presenteavel", licor_categoria: "cremoso", embalagem: "mdf", preco: 120 },
  { id: "5b4193ac-8404-4421-a722-7c6e3ffb21e9", kit_type: "presenteavel", licor_categoria: "cremoso", embalagem: "acrilico", preco: 140 },
  { id: "30da97ea-795b-4d2f-b1fe-4aae200a111d", kit_type: "presenteavel", licor_categoria: "especial", embalagem: "mdf", preco: 130 },
  { id: "2f936983-e36d-4631-8959-2f3fd053e2e7", kit_type: "presenteavel", licor_categoria: "especial", embalagem: "acrilico", preco: 150 },
  { id: "70983a81-ef05-44ba-b87b-f0cdb078aec0", kit_type: "degustacao", licor_categoria: null, embalagem: null, preco: 20 },
];

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&ativo=eq.true&order=ordem`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });
    if (!res.ok) throw new Error("Failed to fetch products");
    const data = await res.json();
    return data.length > 0 ? data : FALLBACK_PRODUCTS;
  } catch {
    return FALLBACK_PRODUCTS;
  }
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/testimonials?select=*&ativo=eq.true`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });
    if (!res.ok) throw new Error("Failed to fetch testimonials");
    const data = await res.json();
    return data.length > 0 ? data : FALLBACK_TESTIMONIALS;
  } catch {
    return FALLBACK_TESTIMONIALS;
  }
}

export async function fetchKitPrices(): Promise<KitPrice[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/kit_prices?select=*`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });
    if (!res.ok) throw new Error("Failed to fetch kit prices");
    const data = await res.json();
    return data.length > 0 ? data : FALLBACK_KIT_PRICES;
  } catch {
    return FALLBACK_KIT_PRICES;
  }
}

export function fmtPrice(n: number): string {
  if (Number.isInteger(n)) return `R$ ${n}`;
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

export function brixClassification(brix: number): { label: string; tooltip: string } {
  if (brix <= 9) return { label: "Seco", tooltip: "Equivale a 30g–100g de açúcar por litro." };
  if (brix <= 30) return { label: "Fino ou Doce", tooltip: "Equivale a 101g–350g de açúcar por litro." };
  if (brix <= 45) return { label: "Creme", tooltip: "Equivale a mais de 350g de açúcar por litro." };
  return { label: "Escarchado", tooltip: "Ponto de saturação onde começam a se formar cristais de açúcar." };
}

export function categoriaLabel(c: "fino" | "cremoso" | "especial" | string) {
  return c === "fino" ? "Fino" : c === "cremoso" ? "Cremoso" : c === "especial" ? "Especial" : c;
}

export function needsPrep(p: { categoria: string; sabor?: string | null }): boolean {
  if (p.categoria !== "cremoso") return false;
  const s = (p.sabor ?? "").toLowerCase();
  if (s.includes("doce de leite")) return false;
  return true;
}

export function waUrl(text: string) {
  const params = new URLSearchParams({
    phone: SITE.whatsapp,
    text,
  });
  return `https://api.whatsapp.com/send?${params.toString()}`;
}
