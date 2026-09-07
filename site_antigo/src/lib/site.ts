export const SITE = {
  whatsapp: "5548991737692",
  whatsappMsg: "Olá! Tenho interesse nos licores do Alquimista. Pode me ajudar?",
  address: "Rod. Antonio Darós, 1105 - São João, Criciúma - SC, 88816-195",
  mapsUrl: "https://maps.app.goo.gl/aytmRg4bwkG1ZK528",
  reviewUrl: "https://g.page/r/CWzwaZr9lnaDEAE/review",
  instagram: "https://instagram.com/alquimistalicores",
  origin: { lat: -28.7184, lng: -49.3523 }, // Rod. Antônio Darós, 1105 - São João, Criciúma SC
};

export function waUrl(text: string) {
  const params = new URLSearchParams({
    phone: SITE.whatsapp,
    text,
  });
  return `https://api.whatsapp.com/send?${params.toString()}`;
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

export function categoriaLabel(c: "fino" | "cremoso" | "especial") {
  return c === "fino" ? "Fino" : c === "cremoso" ? "Cremoso" : "Especial";
}

// "Doce de Leite" não exige tempo extra de preparo, apesar de cremoso.
export function needsPrep(p: { categoria: string; sabor?: string | null }): boolean {
  if (p.categoria !== "cremoso") return false;
  const s = (p.sabor ?? "").toLowerCase();
  if (s.includes("doce de leite")) return false;
  return true;
}