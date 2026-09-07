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

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "9e6a58a9-8d88-4613-9ce7-2dfb8afca29e",
    nome: "Poção Tropical",
    sabor: "Abacaxi",
    categoria: "fino",
    preco: 35,
    volume_ml: 500,
    estoque: 6,
    notas_aromaticas: "Frutado e vibrante, com a acidez natural do abacaxi fresco.",
    descricao: "Licor fino de abacaxi macerado lentamente. O frescor da fruta tropical em perfeita harmonia com o álcool artesanal.",
    sugestoes: "Servir bem gelado ou com gelo e raspas de limão.",
    foto_url: "/storage/product-images/1786466111214-ldr0bl/card.webp",
    ativo: true,
    graduacao_gl: 22,
    brix: 28,
    pedidos_count: 12,
    ordem: 1,
    ingredientes: "Álcool de cereais, abacaxi in natura, açúcar cristal e água mineral.",
    codigo_integracao: "LICOR-ABACAXI-500ML"
  },
  {
    id: "b0d77291-b5ed-4548-8837-887f674c1b4c",
    nome: "Poção da Alegria",
    sabor: "Banana",
    categoria: "fino",
    preco: 38,
    volume_ml: 500,
    estoque: 4,
    notas_aromaticas: "Doce aroma de banana caramelizada com sutis toques de especiarias.",
    descricao: "Elaborado com bananas selecionadas no ponto ideal de maturação, proporcionando um sabor macio e envolvente.",
    sugestoes: "Excelente puro após as refeições ou sobre sorvete de baunilha.",
    foto_url: "/storage/product-images/1786466211910-2f3x4n/card.webp",
    ativo: true,
    graduacao_gl: 24,
    brix: 30,
    pedidos_count: 18,
    ordem: 2,
    ingredientes: "Álcool de cereais, banana nanica madura, açúcar e especiarias naturais.",
    codigo_integracao: "LICOR-BANANA-500ML"
  },
  {
    id: "6fe04098-9cd1-4cb7-a903-1e3ae1147671",
    nome: "Poção Néctar Místico",
    sabor: "Butiá",
    categoria: "fino",
    preco: 38,
    volume_ml: 500,
    estoque: 0,
    notas_aromaticas: "Aroma singular do butiá sulista com notas cítricas e resinosas.",
    descricao: "Um clássico da nossa terra. Butiás nativos em infusão paciente, resultando em um licor dourado inesquecível.",
    sugestoes: "Apreciar puro em cálice gelado.",
    foto_url: "/storage/product-images/1786466237265-amfdmc/card.webp",
    ativo: true,
    graduacao_gl: 25,
    brix: 26,
    pedidos_count: 9,
    ordem: 3,
    ingredientes: "Álcool de cereais, butiá nativo, açúcar e água.",
    codigo_integracao: "LICOR-BUTIA-500ML"
  },
  {
    id: "c1245fd9-cb5b-43e8-bf20-1495ff5c1aee",
    nome: "Poção da Inspiração",
    sabor: "Café & Laranja",
    categoria: "fino",
    preco: 40,
    volume_ml: 500,
    estoque: 2,
    notas_aromaticas: "Grãos de café arábica torrados e o frescor cítrico da laranja da terra.",
    descricao: "Casamento perfeito entre a intensidade do café especial e os óleos essenciais da casca de laranja.",
    sugestoes: "Ideal para acompanhar sobremesas à base de chocolate amargo.",
    foto_url: "/storage/product-images/1786466281130-kvnx5l/card.webp",
    ativo: true,
    graduacao_gl: 26,
    brix: 27,
    pedidos_count: 14,
    ordem: 4,
    ingredientes: "Álcool de cereais, café especial 100% arábica, raspas de laranja e açúcar.",
    codigo_integracao: "LICOR-CAFE-LARANJA-500ML"
  },
  {
    id: "631512a9-16dc-4e4f-8f07-98278a207c0a",
    nome: "Poção do Aconchego",
    sabor: "Canela",
    categoria: "fino",
    preco: 38,
    volume_ml: 500,
    estoque: 5,
    notas_aromaticas: "Calor aromático envolvente de canela em pau do Ceilão.",
    descricao: "Infusão vigorosa de canela pura. Cada gole aquece a alma e evoca memórias afetivas.",
    sugestoes: "Puro em dias frios ou compondo coquetéis clássicos.",
    foto_url: "/storage/product-images/1786466298321-gico88/card.webp",
    ativo: true,
    graduacao_gl: 28,
    brix: 25,
    pedidos_count: 22,
    ordem: 5,
    ingredientes: "Álcool de cereais, canela em pau pura, açúcar e água.",
    codigo_integracao: "LICOR-CANELA-500ML"
  },
  {
    id: "f57e85ca-3e25-4885-a9b8-8febeac0421a",
    nome: "Poção da Conexão",
    sabor: "Figo",
    categoria: "fino",
    preco: 35,
    volume_ml: 500,
    estoque: 11,
    notas_aromaticas: "Figos roxos frescos com notas amendoadas sutis.",
    descricao: "Licor fino e elegante, elaborado a partir de figos colhidos no ponto doce da safra.",
    sugestoes: "Acompanha tábua de queijos curados e nozes.",
    foto_url: "/storage/product-images/1786466315741-2c4axn/card.webp",
    ativo: true,
    graduacao_gl: 23,
    brix: 28,
    pedidos_count: 7,
    ordem: 6,
    ingredientes: "Álcool de cereais, figo fresco, açúcar e água.",
    codigo_integracao: "LICOR-FIGO-500ML"
  },
  {
    id: "37758861-8dc5-4a9d-8995-b341c91ba200",
    nome: "Poção Silvestre",
    sabor: "Jabuticaba",
    categoria: "fino",
    preco: 38,
    volume_ml: 500,
    estoque: 0,
    notas_aromaticas: "Taninos nobres e o sabor inconfundível da casca de jabuticaba.",
    descricao: "Colhidas frescas do pé, as jabuticabas passam por fermentação e maceração cuidadosa.",
    sugestoes: "Servir geladíssimo em taça pequena.",
    foto_url: "/storage/product-images/1786466361965-9ey0h6/card.webp",
    ativo: true,
    graduacao_gl: 22,
    brix: 29,
    pedidos_count: 15,
    ordem: 7,
    ingredientes: "Álcool de cereais, jabuticaba in natura, açúcar e água.",
    codigo_integracao: "LICOR-JABUTICABA-500ML"
  },
  {
    id: "b679b884-73a2-48cc-81af-2bc99abecee1",
    nome: "Poção da Serenidade",
    sabor: "Maracujá",
    categoria: "fino",
    preco: 35,
    volume_ml: 500,
    estoque: 0,
    notas_aromaticas: "Acidez marcante e perfume inebriante de maracujá azedo.",
    descricao: "Equilíbrio refinado entre o azedinho da polpa pura e o dulçor aveludado do licor.",
    sugestoes: "Harmoniza perfeitamente com sobremesas cítricas e drinks.",
    foto_url: "/storage/product-images/1786466383948-e9bzfg/card.webp",
    ativo: true,
    graduacao_gl: 22,
    brix: 28,
    pedidos_count: 19,
    ordem: 8,
    ingredientes: "Álcool de cereais, maracujá fresco com sementes, açúcar e água.",
    codigo_integracao: "LICOR-MARACUJA-500ML"
  },
  {
    id: "d5941952-c8de-4cfa-a2d5-9ca89b0cf19a",
    nome: "Poção do Desejo",
    sabor: "Chocolate Cremoso",
    categoria: "cremoso",
    preco: 45,
    volume_ml: 500,
    estoque: 5,
    notas_aromaticas: "Cacau nobre, notas de baunilha e textura aveludada intensa.",
    descricao: "Elixir cremoso de puro chocolate meio amargo. Densidade e sofisticação a cada gole.",
    sugestoes: "Servir frio. Agite antes de servir.",
    foto_url: "/storage/product-images/1786466401507-ibzz7o/card.webp",
    ativo: true,
    graduacao_gl: 18,
    brix: 38,
    pedidos_count: 31,
    ordem: 9,
    ingredientes: "Base láctea artesanal, cacau em pó 70%, álcool neutro, açúcar e baunilha natural.",
    codigo_integracao: "LICOR-CHOCOLATE-CREMOSO-500ML"
  },
  {
    id: "4a8abdb5-e5d4-4ab6-9fd8-4db419c17ed9",
    nome: "Poção do Doce Sossego",
    sabor: "Maracujá Cremoso",
    categoria: "cremoso",
    preco: 45,
    volume_ml: 500,
    estoque: 0,
    notas_aromaticas: "Creme aveludado com o contraste refrescante da polpa de maracujá.",
    descricao: "Uma sobremesa líquida. A cremosidade envolvente combinada com o frescor do maracujá.",
    sugestoes: "Manter refrigerado após aberto.",
    foto_url: "/storage/product-images/1786466419519-mhjt7u/card.webp",
    ativo: true,
    graduacao_gl: 17,
    brix: 37,
    pedidos_count: 24,
    ordem: 10,
    ingredientes: "Base láctea artesanal, polpa de maracujá puro, álcool e açúcar.",
    codigo_integracao: "LICOR-MARACUJA-CREMOSO-500ML"
  },
  {
    id: "03b9242c-50a5-4c7d-bb5e-0211b266b421",
    nome: "Poção do Doce Deleite",
    sabor: "Doce de Leite",
    categoria: "cremoso",
    preco: 45,
    volume_ml: 500,
    estoque: 0,
    notas_aromaticas: "Doce de leite cozido lentamente, caramelo e notas de flor de sal.",
    descricao: "Inspirado no tradicional doce de leite da fazenda. Textura encorpada e final sedoso.",
    sugestoes: "Delicioso como digestivo ou cobertura de pudins e tortas.",
    foto_url: "/storage/product-images/1786466440655-rs4xq5/card.webp",
    ativo: true,
    graduacao_gl: 18,
    brix: 40,
    pedidos_count: 28,
    ordem: 11,
    ingredientes: "Doce de leite artesanal, base láctea, álcool de cereais e açúcar.",
    codigo_integracao: "LICOR-DOCE-LEITE-500ML"
  },
  {
    id: "af94b5a9-33d4-4a6b-abb1-0e59a49d3ec7",
    nome: "Poção da Prosperidade",
    sabor: "Ouro Especial",
    categoria: "especial",
    preco: 50,
    volume_ml: 500,
    estoque: 5,
    notas_aromaticas: "Blend botânico secreto com flocos cintilantes de ouro comestível.",
    descricao: "A obra-prima do Alquimista. Criada para celebrações e rituais especiais.",
    sugestoes: "Agite para criar o vórtice dourado e sirva em taça de cristal.",
    foto_url: "/storage/product-images/1786466461895-nxr6jl/card.webp",
    ativo: true,
    graduacao_gl: 30,
    brix: 32,
    pedidos_count: 35,
    ordem: 12,
    ingredientes: "Destilado botânico especial, ouro comestível 24k, especiarias raras e açúcar.",
    codigo_integracao: "LICOR-OURO-ESPECIAL-500ML"
  }
];

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  { id: "1", nome: "Carlos T.", texto: "Presenteei minha mãe com o Kit Presenteável e ela amou. Embalagem impecável." },
  { id: "2", nome: "Anice Cardoso", texto: "Licores saborosos e alcoólicos na medida certa. É sempre uma boa opção para presentear. Adoro!" },
  { id: "3", nome: "Fernanda Mangilli", texto: "Os licores são deliciosos, gostei muito do licor de maracujá inclusive comprei mais." },
  { id: "4", nome: "Pvianab4", texto: "Licores super deliciosos, atendimento excelente!" },
  { id: "5", nome: "Luiz Felipe K.", texto: "Licores excelentes, um melhor que o outro..." },
  { id: "6", nome: "Carine Rego", texto: "Um dos melhores licores de maracujá que já provei! Top" },
  { id: "7", nome: "Valdinei Matias", texto: "Excelente licor, sabor marcante e uma experiência inesquecível" },
  { id: "8", nome: "Vera Lúcia Manoel", texto: "São muito bons e saborosos, ótima qualidade, adorei" },
  { id: "9", nome: "Robert Nogueira", texto: "Licor de extrema qualidade!!" },
  { id: "10", nome: "Mikael Silva", texto: "Muito bom, o cara é bom, bom demais!" }
];

const FALLBACK_KIT_PRICES: KitPrice[] = [
  { id: "1", kit_type: "presenteavel", licor_categoria: "fino", embalagem: "mdf", preco: 110 },
  { id: "2", kit_type: "presenteavel", licor_categoria: "fino", embalagem: "acrilico", preco: 130 },
  { id: "3", kit_type: "presenteavel", licor_categoria: "cremoso", embalagem: "mdf", preco: 120 },
  { id: "4", kit_type: "presenteavel", licor_categoria: "cremoso", embalagem: "acrilico", preco: 140 },
  { id: "5", kit_type: "presenteavel", licor_categoria: "especial", embalagem: "mdf", preco: 130 },
  { id: "6", kit_type: "presenteavel", licor_categoria: "especial", embalagem: "acrilico", preco: 150 },
  { id: "7", kit_type: "degustacao", licor_categoria: null, embalagem: null, preco: 20 },
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
