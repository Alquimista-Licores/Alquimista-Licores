-- 1. Tabela de Conquistas (Definição dos requisitos e recompensas)
CREATE TABLE public.jornada_conquistas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL, -- 'selo-instagram', 'cronista', 'caçador-runas', etc.
    nome text NOT NULL,
    descricao text,
    xp_recompensa integer NOT NULL DEFAULT 0,
    requer_upload boolean DEFAULT false,
    validacao_automatica boolean DEFAULT false,
    codigo_validacao text, -- Para 'caçador-runas'
    created_at timestamptz DEFAULT now()
);

-- 2. Tabela de Solicitações de Validação de Conquistas
CREATE TABLE public.jornada_solicitacoes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
    conquista_slug text REFERENCES public.jornada_conquistas(slug) ON DELETE CASCADE NOT NULL,
    texto_evidencia text, -- Código digitado ou texto do cronista
    foto_url text, -- URL da imagem no storage privado
    status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    motivo_rejeicao text,
    processado_em timestamptz,
    processado_por uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    -- Idempotência: um cliente só pode ter uma solicitação pendente para a mesma conquista
    UNIQUE(cliente_id, conquista_slug, status) WHERE (status = 'pendente')
);

-- 3. Tabela de Indicações (Controle de referências)
CREATE TABLE public.jornada_indicacoes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    indicador_id uuid REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
    telefone_indicado text NOT NULL, -- Telefone normalizado
    order_id uuid REFERENCES public.site_orders(id), -- Vinculado quando o indicado compra
    xp_creditado boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(telefone_indicado) -- Evitar múltiplas indicações para a mesma pessoa
);

-- 4. Inserção das Conquistas Iniciais
INSERT INTO public.jornada_conquistas (slug, nome, descricao, xp_recompensa, requer_upload, validacao_automatica) VALUES
('selo-instagram', 'Selo Real', 'Seguir no Instagram (perfil deve estar público)', 50, true, false),
('memoria-alquimista', 'Memória do Alquimista', 'Postar um Story marcando o Alquimista (perfil deve estar público)', 100, true, false),
('cronista', 'O Cronista', 'Escrever um relato sobre sua experiência', 150, false, false),
('seguidor-fiel', 'Seguidor Fiel', 'Interagir com posts recentes', 50, false, false),
('presenca-real', 'Presença Real', 'Foto em um de nossos pontos ou eventos', 200, true, false),
('cacador-runas', 'Caçador de Runas', 'Encontrar e validar o código secreto', 300, false, true),
('mestre-indicacao', 'Mestre da Indicação', 'Indicar um novo amigo (XP após primeira compra paga)', 100, false, false);

-- 5. Configuração de RLS
ALTER TABLE public.jornada_conquistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jornada_solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jornada_indicacoes ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT ON public.jornada_conquistas TO authenticated, anon;
GRANT SELECT, INSERT ON public.jornada_solicitacoes TO authenticated;
GRANT SELECT, INSERT ON public.jornada_indicacoes TO authenticated;
GRANT ALL ON public.jornada_conquistas TO service_role;
GRANT ALL ON public.jornada_solicitacoes TO service_role;
GRANT ALL ON public.jornada_indicacoes TO service_role;

-- Políticas Básicas (Leitura para o próprio cliente)
CREATE POLICY "Clientes veem suas solicitações" ON public.jornada_solicitacoes
    FOR SELECT TO authenticated USING (cliente_id = auth.uid() OR (SELECT auth.uid()) IS NULL); -- Fallback se auth.uid() não estiver mapeado direto no clientes.id

CREATE POLICY "Clientes criam suas solicitações" ON public.jornada_solicitacoes
    FOR INSERT TO authenticated WITH CHECK (cliente_id = auth.uid() OR (SELECT auth.uid()) IS NULL);

-- Nota: Para simplificar no server function (onde usamos supabaseAdmin), o RLS será complementado conforme necessário.

-- RPC para incremento seguro de XP
CREATE OR REPLACE FUNCTION public.increment_xp(p_cliente_id uuid, p_amount integer)
RETURNS void AS $$
BEGIN
    UPDATE public.clientes 
    SET xp = COALESCE(xp, 0) + p_amount
    WHERE id = p_cliente_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_xp(uuid, integer) TO service_role;
