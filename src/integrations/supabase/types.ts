/**
 * Definições TypeScript para o Banco de Dados Supabase (Alquimista Licores & Jornada do Alquimista)
 * Projeto: https://bktegbisdaqdhpqtxqxy.supabase.co
 * Baseado nos relatórios de conexões de 16/09/2026.
 */

// ==========================================
// 1. TABELAS DA LOJA & CATÁLOGO
// ==========================================

export interface DbProduct {
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
  created_at?: string;
  updated_at?: string;
}

export interface DbKitPrice {
  id: string;
  kit_type: 'degustacao' | 'presenteavel' | string;
  licor_categoria: string | null;
  embalagem: string | null;
  preco: number;
  created_at?: string;
}

export interface DbTestimonial {
  id: string;
  nome: string;
  texto: string;
  ativo?: boolean;
  created_at?: string;
}

export interface DbSiteOrder {
  id: string;
  codigo_pedido: string; // 6 dígitos únicos (ex: "849201")
  request_id?: string;   // Idempotência para evitar pedidos duplicados
  cliente_nome: string;
  cliente_telefone: string;
  tipo: 'avulso' | 'kit-degustacao' | 'kit-presenteavel' | 'misto';
  itens: any;
  total: number;
  status: 'pendente' | 'pago' | 'cancelado' | 'arquivado';
  endereco_entrega?: any;
  observacoes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbStockAlert {
  id?: string;
  product_id: string;
  product_name: string;
  customer_name?: string | null;
  customer_contact: string;
  contact_channel: 'whatsapp' | 'email';
  status: 'pending' | 'notified' | 'cancelled';
  created_at?: string;
}

export interface DbAppConfig {
  id?: string;
  key: string;
  value: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbPushSubscription {
  id: string;
  user_id?: string | null;
  subscription: any;
  user_agent?: string | null;
  created_at?: string;
}

export interface DbUserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'mestre' | 'cliente';
  created_at?: string;
}

// ==========================================
// 2. TABELAS DA JORNADA DO ALQUIMISTA (FUTURO CRUD)
// ==========================================

export interface DbJornadaCliente {
  id: string;
  nome: string;
  telefone: string; // Chave primária de identificação / login
  email?: string | null;
  xp_total: number;
  nivel: number;
  passo_atual: number;
  cenario_atual: string;
  codigo_indicacao?: string;
  indicado_por?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbJornadaProgresso {
  id: string;
  cliente_id: string;
  passo: number;
  cenario: string;
  xp_ganho: number;
  concluido_em: string;
  detalhes?: any;
}

export interface DbJornadaBolsa {
  id: string;
  cliente_id: string;
  item_slug: string;
  item_nome: string;
  tipo: 'ingrediente' | 'artefato' | 'pergaminho' | 'pocao';
  quantidade: number;
  adquirido_em: string;
}

export interface DbJornadaConquista {
  id: string;
  slug: string;
  titulo: string;
  descricao: string;
  icone_url?: string;
  xp_recompensa: number;
  tipo: 'automatica' | 'foto_evidencia' | 'runa' | 'indicacao' | 'manual';
  ativo: boolean;
  ordem: number;
}

export interface DbJornadaConquistaDesbloqueada {
  id: string;
  cliente_id: string;
  conquista_slug: string;
  desbloqueado_em: string;
}

export interface DbJornadaReceitaFabricada {
  id: string;
  cliente_id: string;
  receita_slug: string;
  fabricada_em: string;
}

export interface DbJornadaRecompensaLiberada {
  id: string;
  cliente_id: string;
  recompensa_nome: string;
  tipo: 'brinde_fisico' | 'cupom' | 'acesso_vip';
  status: 'disponivel' | 'solicitada' | 'entregue';
  codigo_resgate?: string;
  liberada_em: string;
  entregue_em?: string | null;
}

export interface DbJornadaSolicitacao {
  id: string;
  cliente_id: string;
  tipo: 'avanco_pedido' | 'prova_conquista' | 'resgate_brinde';
  codigo_pedido?: string;
  conquista_slug?: string;
  foto_evidencia_url?: string; // Bucket 'jornada-evidencias'
  status: 'pendente' | 'aprovada' | 'rejeitada';
  motivo_rejeicao?: string | null;
  avaliado_por?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface DbJornadaEvento {
  id: string;
  cliente_id: string;
  tipo_evento: string;
  descricao: string;
  dados?: any;
  created_at: string;
}
