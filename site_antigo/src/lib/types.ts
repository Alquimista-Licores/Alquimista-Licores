export type PhotoVariants = {
  thumb: string;
  card: string;
  full: string;
};

export type Product = {
  stock_control_type: "manual" | "gerenciapp";
  id: string;
  nome: string;
  sabor: string;
  categoria: "fino" | "cremoso" | "especial";
  preco: number;
  volume_ml: number;
  estoque: number;
  notas_aromaticas: string | null;
  descricao: string | null;
  sugestoes: string | null;
  foto_url: string | null;
  fotos_urls?: string[] | null;
  fotos?: PhotoVariants[] | null;
  ativo: boolean;
  graduacao_gl: number;
  brix: number;
  pedidos_count: number;
  ordem: number;
  ingredientes: string | null;
  codigo_integracao: string | null;
};
