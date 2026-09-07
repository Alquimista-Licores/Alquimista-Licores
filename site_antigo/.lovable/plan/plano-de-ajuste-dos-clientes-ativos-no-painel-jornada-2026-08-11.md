# Plano de Ajuste dos Clientes Ativos no Painel Jornada

Ajustar a interface de **CLIENTES ATIVOS** no painel `/admin/jornada` para melhorar a visualização e gestão dos dados, transformando cada cliente em um card/accordion clicável com informações resumidas e detalhadas, além de um validador de "Identidade do Aprendiz".

## Alterações

### Frontend

- **Ajuste do Card de Cliente (`src/routes/admin/jornada.tsx`)**:
    - Transformar o card em um elemento interativo que alterna entre visualização resumida (fechado) e completa (aberto).
    - **Visualização Fechada**: Nome, telefone, XP total, passo atual (cenário) e quantidade de conquistas desbloqueadas.
    - **Visualização Aberta**:
        - Listar todos os campos do banco: ID, Nome, Telefone, Apelido, Cidade, Como Conheceu, Data Aniversário, Instagram, Aceite Termos (Data e IP), Criado Em e XP.
        - Exibir o status "Identidade do Aprendiz": **Completa** ou **Incompleta**.
        - Listar campos obrigatórios ausentes: Nome, Telefone, Apelido, Cidade, Data Aniversário, Instagram, Como Conheceu, e Aceite.
        - Exibir lista detalhada de conquistas desbloqueadas do cliente.
    - **Preservar**: Busca global e o estado recolhido da seção por padrão.

### Backend & Tipagem

- **Ajuste no Loader (`src/lib/admin-jornada.functions.ts`)**:
    - Garantir que a query de `clientes` traga todos os campos necessários da tabela `clientes` e os relacionamentos de `conquistas_desbloqueadas` e `progresso`.

## Detalhes Técnicos

- **Regra de Identidade Completa**:
    - Um perfil é considerado "Completo" se os campos `nome`, `telefone`, `apelido`, `cidade`, `data_aniversario`, `instagram`, `como_conheceu` e `aceite_termos_em` estiverem preenchidos.
- **Componentização**:
    - Utilizar classes Tailwind para animação de expansão (accordion).
    - Manter o padrão visual "Alquimista" (preto, dourado e creme).

## Verificação

- Executar `bun run build` para garantir a integridade dos tipos e imports.
- Validar visualmente a expansão dos cards e a lógica de "campos ausentes".
