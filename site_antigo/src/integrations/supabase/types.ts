export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      app_config: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      bolsa: {
        Row: {
          cliente_id: string
          ingrediente: string
          quantidade: number
        }
        Insert: {
          cliente_id: string
          ingrediente: string
          quantidade?: number
        }
        Update: {
          cliente_id?: string
          ingrediente?: string
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "bolsa_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          aceite_termos_at: string | null
          aceite_termos_em: string
          apelido: string | null
          cidade: string | null
          como_conheceu: string | null
          criado_em: string
          data_aniversario: string | null
          id: string
          instagram: string | null
          nome: string
          telefone: string
          xp: number
        }
        Insert: {
          aceite_termos_at?: string | null
          aceite_termos_em?: string
          apelido?: string | null
          cidade?: string | null
          como_conheceu?: string | null
          criado_em?: string
          data_aniversario?: string | null
          id?: string
          instagram?: string | null
          nome: string
          telefone: string
          xp?: number
        }
        Update: {
          aceite_termos_at?: string | null
          aceite_termos_em?: string
          apelido?: string | null
          cidade?: string | null
          como_conheceu?: string | null
          criado_em?: string
          data_aniversario?: string | null
          id?: string
          instagram?: string | null
          nome?: string
          telefone?: string
          xp?: number
        }
        Relationships: []
      }
      conquistas_desbloqueadas: {
        Row: {
          cliente_id: string
          conquista: string
          desbloqueada_em: string
          id: string
          xp_recompensa: number
        }
        Insert: {
          cliente_id: string
          conquista: string
          desbloqueada_em?: string
          id?: string
          xp_recompensa?: number
        }
        Update: {
          cliente_id?: string
          conquista?: string
          desbloqueada_em?: string
          id?: string
          xp_recompensa?: number
        }
        Relationships: [
          {
            foreignKeyName: "conquistas_desbloqueadas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          cliente_id: string
          criado_em: string
          id: string
          payload: Json
          tipo: string
        }
        Insert: {
          cliente_id: string
          criado_em?: string
          id?: string
          payload?: Json
          tipo: string
        }
        Update: {
          cliente_id?: string
          criado_em?: string
          id?: string
          payload?: Json
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_config: {
        Row: {
          id: number
          modo: string
          produto_ids: string[]
        }
        Insert: {
          id?: number
          modo?: string
          produto_ids?: string[]
        }
        Update: {
          id?: number
          modo?: string
          produto_ids?: string[]
        }
        Relationships: []
      }
      jornada_conquistas: {
        Row: {
          categoria: string
          codigo_validacao: string | null
          created_at: string
          descricao: string
          id: string
          meta_objetivo: number
          nome: string
          recomendada_sem_compra: boolean
          requer_upload: boolean
          slug: string
          updated_at: string
          validacao_automatica: boolean
          xp_recompensa: number
        }
        Insert: {
          categoria: string
          codigo_validacao?: string | null
          created_at?: string
          descricao: string
          id?: string
          meta_objetivo?: number
          nome: string
          recomendada_sem_compra?: boolean
          requer_upload?: boolean
          slug: string
          updated_at?: string
          validacao_automatica?: boolean
          xp_recompensa?: number
        }
        Update: {
          categoria?: string
          codigo_validacao?: string | null
          created_at?: string
          descricao?: string
          id?: string
          meta_objetivo?: number
          nome?: string
          recomendada_sem_compra?: boolean
          requer_upload?: boolean
          slug?: string
          updated_at?: string
          validacao_automatica?: boolean
          xp_recompensa?: number
        }
        Relationships: []
      }
      jornada_indicacoes: {
        Row: {
          created_at: string
          id: string
          indicador_id: string
          order_id: string
          qualificada_at: string
          telefone_indicado: string
          xp_creditado: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          indicador_id: string
          order_id: string
          qualificada_at?: string
          telefone_indicado: string
          xp_creditado?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          indicador_id?: string
          order_id?: string
          qualificada_at?: string
          telefone_indicado?: string
          xp_creditado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "jornada_indicacoes_indicador_id_fkey"
            columns: ["indicador_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jornada_indicacoes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "site_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      jornada_pedidos_processados: {
        Row: {
          cliente_id: string
          order_id: string
          passos_concedidos: number
          processado_em: string
          solicitacao_id: string | null
          xp_concedido: number
        }
        Insert: {
          cliente_id: string
          order_id: string
          passos_concedidos: number
          processado_em?: string
          solicitacao_id?: string | null
          xp_concedido: number
        }
        Update: {
          cliente_id?: string
          order_id?: string
          passos_concedidos?: number
          processado_em?: string
          solicitacao_id?: string | null
          xp_concedido?: number
        }
        Relationships: [
          {
            foreignKeyName: "jornada_pedidos_processados_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jornada_pedidos_processados_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "site_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jornada_pedidos_processados_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      jornada_solicitacoes: {
        Row: {
          cliente_id: string
          conquista_slug: string
          created_at: string
          data_evidencia: string
          foto_url: string | null
          id: string
          motivo_rejeicao: string | null
          processado_em: string | null
          processado_por: string | null
          status: string
          texto_evidencia: string | null
        }
        Insert: {
          cliente_id: string
          conquista_slug: string
          created_at?: string
          data_evidencia?: string
          foto_url?: string | null
          id?: string
          motivo_rejeicao?: string | null
          processado_em?: string | null
          processado_por?: string | null
          status?: string
          texto_evidencia?: string | null
        }
        Update: {
          cliente_id?: string
          conquista_slug?: string
          created_at?: string
          data_evidencia?: string
          foto_url?: string | null
          id?: string
          motivo_rejeicao?: string | null
          processado_em?: string | null
          processado_por?: string | null
          status?: string
          texto_evidencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jornada_solicitacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jornada_solicitacoes_conquista_slug_fkey"
            columns: ["conquista_slug"]
            isOneToOne: false
            referencedRelation: "jornada_conquistas"
            referencedColumns: ["slug"]
          },
        ]
      }
      kit_prices: {
        Row: {
          embalagem: string | null
          id: string
          kit_type: string
          licor_categoria:
            | Database["public"]["Enums"]["product_category"]
            | null
          preco: number
        }
        Insert: {
          embalagem?: string | null
          id?: string
          kit_type: string
          licor_categoria?:
            | Database["public"]["Enums"]["product_category"]
            | null
          preco: number
        }
        Update: {
          embalagem?: string | null
          id?: string
          kit_type?: string
          licor_categoria?:
            | Database["public"]["Enums"]["product_category"]
            | null
          preco?: number
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          aprovado_em: string | null
          cliente_id: string | null
          concluido_em: string | null
          criado_em: string
          id: string
          numero_pedido: string
          quantidade_licores: number
          sabores: Json
          status: string
          telefone_cliente: string | null
        }
        Insert: {
          aprovado_em?: string | null
          cliente_id?: string | null
          concluido_em?: string | null
          criado_em?: string
          id?: string
          numero_pedido: string
          quantidade_licores: number
          sabores?: Json
          status?: string
          telefone_cliente?: string | null
        }
        Update: {
          aprovado_em?: string | null
          cliente_id?: string | null
          concluido_em?: string | null
          criado_em?: string
          id?: string
          numero_pedido?: string
          quantidade_licores?: number
          sabores?: Json
          status?: string
          telefone_cliente?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          ativo: boolean
          brix: number
          categoria: Database["public"]["Enums"]["product_category"]
          codigo_integracao: string | null
          created_at: string
          descricao: string | null
          estoque: number
          foto_url: string | null
          fotos: Json
          fotos_urls: string[]
          graduacao_gl: number
          id: string
          ingredientes: string | null
          nome: string
          notas_aromaticas: string | null
          ordem: number
          pedidos_count: number
          preco: number
          sabor: string
          stock_control_type: string
          sugestoes: string | null
          updated_at: string
          volume_ml: number
        }
        Insert: {
          ativo?: boolean
          brix?: number
          categoria: Database["public"]["Enums"]["product_category"]
          codigo_integracao?: string | null
          created_at?: string
          descricao?: string | null
          estoque?: number
          foto_url?: string | null
          fotos?: Json
          fotos_urls?: string[]
          graduacao_gl?: number
          id?: string
          ingredientes?: string | null
          nome: string
          notas_aromaticas?: string | null
          ordem?: number
          pedidos_count?: number
          preco: number
          sabor: string
          stock_control_type?: string
          sugestoes?: string | null
          updated_at?: string
          volume_ml?: number
        }
        Update: {
          ativo?: boolean
          brix?: number
          categoria?: Database["public"]["Enums"]["product_category"]
          codigo_integracao?: string | null
          created_at?: string
          descricao?: string | null
          estoque?: number
          foto_url?: string | null
          fotos?: Json
          fotos_urls?: string[]
          graduacao_gl?: number
          id?: string
          ingredientes?: string | null
          nome?: string
          notas_aromaticas?: string | null
          ordem?: number
          pedidos_count?: number
          preco?: number
          sabor?: string
          stock_control_type?: string
          sugestoes?: string | null
          updated_at?: string
          volume_ml?: number
        }
        Relationships: []
      }
      progresso: {
        Row: {
          atualizado_em: string
          cenario_atual: string
          cliente_id: string
          passo_atual: number
        }
        Insert: {
          atualizado_em?: string
          cenario_atual?: string
          cliente_id: string
          passo_atual?: number
        }
        Update: {
          atualizado_em?: string
          cenario_atual?: string
          cliente_id?: string
          passo_atual?: number
        }
        Relationships: [
          {
            foreignKeyName: "progresso_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: true
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      receitas_fabricadas: {
        Row: {
          cliente_id: string
          fabricada_em: string
          id: string
          receita: string
        }
        Insert: {
          cliente_id: string
          fabricada_em?: string
          id?: string
          receita: string
        }
        Update: {
          cliente_id?: string
          fabricada_em?: string
          id?: string
          receita?: string
        }
        Relationships: [
          {
            foreignKeyName: "receitas_fabricadas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      recompensas_liberadas: {
        Row: {
          cliente_id: string
          id: string
          liberada_em: string
          passo: number
          recompensa: string
          retirado_em: string | null
          status: string
        }
        Insert: {
          cliente_id: string
          id?: string
          liberada_em?: string
          passo: number
          recompensa: string
          retirado_em?: string | null
          status?: string
        }
        Update: {
          cliente_id?: string
          id?: string
          liberada_em?: string
          passo?: number
          recompensa?: string
          retirado_em?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "recompensas_liberadas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      site_orders: {
        Row: {
          arquivado_at: string | null
          cancelado_at: string | null
          cliente_nome: string
          cliente_telefone: string
          codigo_pedido: string
          created_at: string
          endereco_completo: string | null
          frete_valor: number
          gerenciapp_order_id: string | null
          id: string
          indicador_nome: string | null
          indicador_whatsapp: string | null
          items_snapshot: Json
          pago_at: string | null
          request_id: string
          sincronizado_gerenciapp_at: string | null
          status: string
          status_alterado_por: string | null
          status_gerenciapp: string
          subtotal: number
          tipo_entrega: string
          total: number
          updated_at: string
        }
        Insert: {
          arquivado_at?: string | null
          cancelado_at?: string | null
          cliente_nome: string
          cliente_telefone: string
          codigo_pedido: string
          created_at?: string
          endereco_completo?: string | null
          frete_valor?: number
          gerenciapp_order_id?: string | null
          id?: string
          indicador_nome?: string | null
          indicador_whatsapp?: string | null
          items_snapshot: Json
          pago_at?: string | null
          request_id: string
          sincronizado_gerenciapp_at?: string | null
          status?: string
          status_alterado_por?: string | null
          status_gerenciapp?: string
          subtotal: number
          tipo_entrega: string
          total: number
          updated_at?: string
        }
        Update: {
          arquivado_at?: string | null
          cancelado_at?: string | null
          cliente_nome?: string
          cliente_telefone?: string
          codigo_pedido?: string
          created_at?: string
          endereco_completo?: string | null
          frete_valor?: number
          gerenciapp_order_id?: string | null
          id?: string
          indicador_nome?: string | null
          indicador_whatsapp?: string | null
          items_snapshot?: Json
          pago_at?: string | null
          request_id?: string
          sincronizado_gerenciapp_at?: string | null
          status?: string
          status_alterado_por?: string | null
          status_gerenciapp?: string
          subtotal?: number
          tipo_entrega?: string
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      solicitacoes: {
        Row: {
          bilhete: string | null
          cliente_id: string
          criado_em: string
          expira_em: string
          id: string
          numero_pedido_digitado: string
          pedido_id: string | null
          resolvida_em: string | null
          status: string
        }
        Insert: {
          bilhete?: string | null
          cliente_id: string
          criado_em?: string
          expira_em?: string
          id?: string
          numero_pedido_digitado: string
          pedido_id?: string | null
          resolvida_em?: string | null
          status?: string
        }
        Update: {
          bilhete?: string | null
          cliente_id?: string
          criado_em?: string
          expira_em?: string
          id?: string
          numero_pedido_digitado?: string
          pedido_id?: string | null
          resolvida_em?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          texto: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          texto: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          texto?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      avaliar_conquistas_automaticas_cliente: {
        Args: { p_cliente: string; p_order?: string }
        Returns: undefined
      }
      create_site_order_transactional: {
        Args: {
          p_cliente_nome: string
          p_cliente_telefone: string
          p_endereco_completo: string
          p_frete_valor: number
          p_indicador_nome: string
          p_indicador_whatsapp: string
          p_items_snapshot: Json
          p_request_id: string
          p_status_inicial?: string
          p_subtotal: number
          p_tipo_entrega: string
          p_total: number
        }
        Returns: {
          codigo_pedido: string
          created_at: string
          id: string
          status: string
        }[]
      }
      decrement_estoque: {
        Args: { _product_id: string; _qty: number }
        Returns: undefined
      }
      desbloquear_conquista_unica: {
        Args: { p_cliente: string; p_slug: string; p_xp: number }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_pedidos: {
        Args: { _product_id: string; _qty: number }
        Returns: undefined
      }
      increment_xp: {
        Args: { p_amount: number; p_cliente_id: string }
        Returns: undefined
      }
      jornada_conceder_catalogo: {
        Args: { p_cliente: string; p_slug: string }
        Returns: boolean
      }
      jornada_itens_pagos: {
        Args: { p_cliente: string }
        Returns: {
          categoria: string
          nome: string
          order_date: string
          order_id: string
          product_id: string
          sabor: string
          tipo: string
          tipo_entrega: string
        }[]
      }
      normalizar_telefone: { Args: { p_text: string }; Returns: string }
      processar_avanco_pedido_v3: {
        Args: { p_codigo_pedido: string }
        Returns: undefined
      }
      validar_codigo_runa: {
        Args: { p_cliente_id: string; p_codigo: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin"
      product_category: "fino" | "cremoso" | "especial"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin"],
      product_category: ["fino", "cremoso", "especial"],
    },
  },
} as const
