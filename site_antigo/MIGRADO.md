# Guia de Migração e Remixagem - Alquimista Licores

Este documento é um manual técnico para garantir que o projeto funcione corretamente ao ser movido, remixado ou clonado. Ele detalha os recursos que não são transferidos automaticamente pelo código-fonte.

## Visão Geral

- **Finalidade:** E-commerce de licores artesanais com foco em kits personalizáveis e experiência visual de "Alquimia".
- **Principais Funcionalidades:** Catálogo de produtos, montagem de kits (Degustação e Presenteável), cálculo de frete por distância (Criciúma e região), notificações Push de estoque baixo/zerado, área administrativa.
- **Serviços Externos:** Lovable Cloud (Supabase), VAPID (Notificações), WhatsApp (Checkout), OpenStreetMap/OSRM (Geocodificação e Rotas).
- **O que não migra automaticamente:** Configurações do banco de dados (RLS, Triggers, RPC, Extensions), Segredos (API Keys), Buckets de Storage e Subscriptions do Realtime.

## Lovable Cloud (Supabase)

- **Project ID:** `crsjmyrkbpawxqgvfmrv`
- **Configuração no Código:** `supabase/config.toml` e `src/integrations/supabase/client.ts`.
- **Variáveis Principais:** `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`.
- **Validação:** Verifique se o `project_id` em `supabase/config.toml` coincide com o projeto no painel do Lovable Cloud.

## Variáveis de Ambiente e Segredos

| Variável | Finalidade | Tipo | Local |
|---|---|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | Pública | Frontend (Vite) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave pública Anon | Pública | Frontend (Vite) |
| `SUPABASE_SERVICE_ROLE_KEY` | Acesso administrativo (bypass RLS) | Secreta | Backend (Server Functions) |
| `VAPID_PRIVATE_KEY` | Chave privada para Push Notifications | Secreta | Backend (Server Functions) |
| `STOCK_HOOK_SECRET` | Validação do Webhook de estoque (Fallback) | Secreta | Backend / `app_config` |
| `GERENCIAPP_INTEGRATION_URL` | URL publicada do GerenciApp | Interna | Server Functions |
| `GERENCIAPP_INTEGRATION_SECRET` | Segredo compartilhado da integração Site ↔ GerenciApp | Secreta | Server Functions |

## Integração com o GerenciApp

- Produtos são ligados pelo campo `products.codigo_integracao`, nunca pelo UUID interno.
- Ao criar um licor, use o mesmo código legível nos dois sistemas, por exemplo `LICOR-BANANA-500ML`.

- Site/Jornada e GerenciApp continuam em projetos Supabase separados.
- O GerenciApp é a fonte de estoque somente dos licores mapeados.
- O Site mantém `products.estoque` como cache de leitura para a vitrine e o atualiza pelo endpoint autenticado do GerenciApp.
- Todo pedido é enviado com o UUID de `site_orders.id`; o GerenciApp usa esse valor para impedir duplicação.
- Clientes são reaproveitados ou criados no GerenciApp pelo telefone normalizado.
- Recebimento integral no GerenciApp chama `/api/public/integration/gerenciapp/payment`, marcando o pedido como pago e preservando o processamento da Jornada.
- Nunca expor `GERENCIAPP_INTEGRATION_SECRET` no frontend, banco público ou GitHub.

## Banco de Dados

### Tabelas Principais
- `products`: Catálogo de licores (estoque, brix, graduação, fotos JSONB, categoria, stock_control_type).
- `site_orders`: Registro central de pedidos (idempotência, código público de 6 dígitos, snapshots).
- `kit_prices`: Preços dinâmicos baseados na categoria do licor e embalagem.
- `testimonials`: Depoimentos de clientes exibidos na home.
- `featured_config`: Define quais produtos aparecem na seção "Poções em Destaque".
- `app_config`: Configurações de sistema (URL do Webhook, Secrets de integração).
- `push_subscriptions`: Tokens de navegadores para notificações push.
- `user_roles`: Mapeamento de `user_id` para roles (ex: `admin`).

### Extensões Necessárias
- `pg_net`: **Obrigatória**. Permite que o banco faça requisições HTTP para disparar o webhook de estoque.

### Funções e Triggers (Críticos)
- `public.has_role(_user_id, _role)`: Função SECURITY DEFINER para checar permissões em RLS.
- `public.create_site_order_transactional(...)`: **Fase 1**. RPC SECURITY DEFINER para criação atômica de pedidos com geração de código único de 6 dígitos e proteção contra colisão/concorrência.
- `public.decrement_estoque(_product_id, _qty)`: RPC chamada no checkout para reduzir estoque com segurança.
- `public.increment_pedidos(_product_id, _qty)`: RPC para atualizar contador de popularidade.
- `public.notify_stock_zero()`: Função que lê `app_config` e dispara o webhook via `pg_net`.
- `trg_products_stock_zero`: Trigger `AFTER UPDATE` na tabela `products` vinculada à função de notificação.

## Migrações

- **Local:** `supabase/migrations/`
- **Execução:** Devem ser aplicadas via CLI do Supabase ou SQL Editor em ordem cronológica.
- **Destaque:** Migrações de Agosto/2026 contêm o hardening de segurança (restrição de EXECUTE em funções sensíveis).

## Autenticação e Segurança

- **Métodos:** Email/Senha (Supabase Auth).
- **URLs de Redirecionamento:** Atualizar `Site URL` e `Redirect URIs` no painel de Auth para o novo domínio (Ex: `https://...lovable.app/auth/callback`).
- **RLS (Row Level Security):** 
    - Ativa em todas as tabelas.
    - Tabelas de leitura pública: `products`, `kit_prices`, `testimonials`, `featured_config`, `app_config` (apenas chaves não sensíveis).
    - Tabelas protegidas: `push_subscriptions` (dono/admin), `user_roles` (dono/admin).
- **Grants:** Lembre-se que no Supabase moderno, cada `CREATE TABLE` exige `GRANT ALL ON TABLE ... TO authenticated, service_role`.

## Integrações

### WhatsApp (Checkout)
- **Configuração:** `src/lib/site.ts` (Telefone: `5548991737692`).
- **Fluxo:** O frontend gera uma mensagem formatada com emojis UTF-8 e redireciona via `api.whatsapp.com/send`.

### Frete e Mapas
- **Provedores:** OpenStreetMap (Nominatim) para busca de endereço e OSRM para cálculo de rota/distância.
- **Configuração:** `src/lib/site.ts` contém as coordenadas da "Origem" (Rod. Antônio Darós, 1105).
- **Lógica:** Cobrança por KM com valor mínimo (configurado em `src/lib/checkout.ts`).

### Notificações Push
- **Service Worker:** `public/sw-push.js`.
- **Configuração:** `src/lib/push-config.ts` (Chave Pública) e `VAPID_PRIVATE_KEY` (Backend).
- **Webhook:** `src/routes/api/public/hooks/stock-zero.ts`. Este endpoint recebe o sinal do banco e envia as notificações.

## Storage (Arquivos)

- **Bucket:** `product-images` (Deve ser criado manualmente se não existir).
- **Políticas:** 
    - `SELECT`: Público (anon).
    - `INSERT/UPDATE/DELETE`: Apenas usuários com role `admin`.
- **Destaque:** O Admin do Alquimista faz redimensionamento e conversão para WebP localmente antes do upload (Thumb, Card, Full).

## Realtime

- **Tabela:** `products`.
- **Comando:** `ALTER PUBLICATION supabase_realtime ADD TABLE public.products;`
- **Uso:** Sincronização instantânea da vitrine quando o estoque é alterado via Admin ou venda.

---

## Checklist Pós-Migração

1. [ ] **Supabase Link:** Vincular o código ao novo Project ID no `supabase/config.toml`.
2. [ ] **Secrets:** Adicionar `VAPID_PRIVATE_KEY` e `STOCK_HOOK_SECRET` nas Settings do Lovable (Backend Secrets).
3. [ ] **Schema:** Aplicar todas as migrações da pasta `supabase/migrations`.
4. [ ] **App Config:** Inserir na tabela `app_config` a URL final do webhook (Ex: `https://seu-app.lovable.app/api/public/hooks/stock-zero`) com a chave `stock_hook_url`.
5. [ ] **Realtime:** Habilitar Realtime para a tabela `products` via SQL Editor.
6. [ ] **Storage:** Criar o bucket `product-images` e garantir que ele é "Public".
7. [ ] **Admin:** Criar um usuário no Auth e inserir manualmente o `user_id` na tabela `user_roles` com a role `admin`.
8. [ ] **Google Maps/Auth:** Se usar Google Auth, configurar o Client ID/Secret no provedor social do Supabase.

---

## Modo Manutenção
- **Implementação:** `src/routes/__root.tsx` contém a flag `isMaintenanceActive`.
- **Rota:** `/manutencao`.
- **Comportamento:** Quando `isMaintenanceActive` é `true`, usuários (exceto admins) são redirecionados para `/manutencao`.
- **Desativação:** Basta alterar `isMaintenanceActive` para `false` em `src/routes/__root.tsx`.

---

## Histórico de Atualizações do Documento

| Data | Alteração | Ação Pós-Migração |
|---|---|---|
| 05/08/2026 | Auditoria completa e detalhamento de integrações (OSRM, Nominatim, Realtime). | Seguir checklist revisado. |
| 06/08/2026 | Adicionado sistema de Modo Manutenção na rota `/manutencao`. | Ativar/desativar via código no `__root.tsx`. |
| 06/08/2026 | **Fase 1 - Pedidos**: Criada a tabela `site_orders` e RPC `create_site_order_transactional`. O site agora registra o pedido antes de abrir o WhatsApp. | Nenhuma ação necessária. |
| 06/08/2026 | **Fase 2 - Segurança**: Ativado RLS e políticas de acesso restritas para `site_orders`. | Nenhuma ação necessária. |
| 06/08/2026 | **Fase 3 - Lógica Transacional**: Criada a função `create_site_order_transactional` com proteção contra concorrência e idempotência via `request_id`. | Nenhuma ação necessária. |
| 11/08/2026 | **Correção de Assinatura RPC**: Atualizada a função `create_site_order_transactional` para incluir o parâmetro `p_status_inicial`. | Aplicar a nova migração no Supabase. |
| 11/08/2026 | **Persistência de Pagamento**: Atualizada a RPC `create_site_order_transactional` para preencher `pago_at` automaticamente quando o status inicial for `pago`. | Aplicar a migração `20260811163000`. |
| 11/08/2026 | **Jornada V2 Hardening**: Corrigido SQL de UNIQUE parcial, metas de indicação (1/3/5) e catálogo de XP. RPC increment_xp adicionada para atomicidade.: Adicionadas categorias recolhíveis e atalho "Marcar como Pago" na página `/admin/jornada`. | Nenhuma ação necessária. |
| 23/08/2026 | **Controle de Estoque Híbrido**: Adicionada a coluna `stock_control_type` na tabela `products` para selecionar entre controle manual ou via GerenciApp. | Executar SQL para adicionar a coluna `stock_control_type` com default 'manual'. Se o erro "Could not find column" persistir, execute `NOTIFY pgrst, 'reload schema';` no SQL Editor. |
