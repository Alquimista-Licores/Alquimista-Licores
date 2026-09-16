# Relatório de Conexões com o Banco de Dados — Alquimista Licores

Documento para quem for **recriar o banco do zero**. Explica cada ponto de conexão,
o que ele faz, por que existe e o que precisa estar configurado para funcionar.

Projeto atual: Supabase `crsjmyrkbpawxqgvfmrv`.

---

## 1. As três formas de conexão (entenda antes de tudo)

| Forma | Chave usada | Quem usa | Regras de acesso |
|---|---|---|---|
| **Navegador (site e painel)** | chave pública (anon) | páginas do site e telas do admin | obedece RLS; só vê o que a política permitir |
| **Servidor com privilégio** | chave secreta (service role) | funções de servidor e endpoints de integração | ignora RLS; é o "gerente" do banco |
| **Banco chamando o site** | segredo do webhook | trigger de estoque no banco | dispara HTTP para o site via extensão `pg_net` |

Arquivos correspondentes:
- `src/integrations/supabase/client.ts` → conexão pública do navegador.
- `src/integrations/supabase/client.server.ts` → conexão privilegiada (nunca vai para o navegador).
- `src/integrations/supabase/auth-middleware.ts` → valida o administrador logado nas funções de servidor.

---

## 2. Variáveis e segredos que precisam existir

| Nome | Onde | Para que serve | Se faltar |
|---|---|---|---|
| `VITE_SUPABASE_URL` | frontend | endereço do banco | site não carrega dados |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | frontend | chave pública | site não carrega dados |
| `VITE_SUPABASE_PROJECT_ID` | frontend | identificação do projeto | referências quebram |
| `SUPABASE_URL` | servidor | endereço do banco | funções de servidor falham |
| `SUPABASE_PUBLISHABLE_KEY` | servidor | leituras públicas no servidor | leituras públicas falham |
| `SUPABASE_SERVICE_ROLE_KEY` | servidor (secreto) | criar pedidos, admin, integrações | checkout e painel param |
| `VAPID_PRIVATE_KEY` | servidor (secreto) | envio das notificações push | avisos de estoque não chegam |
| `STOCK_HOOK_SECRET` | servidor (secreto) | valida o aviso vindo do banco | webhook rejeitado |
| `GERENCIAPP_INTEGRATION_URL` | servidor | endereço do GerenciApp | sincronização de estoque falha |
| `GERENCIAPP_INTEGRATION_SECRET` | servidor (secreto) | autentica site ↔ GerenciApp | integração rejeitada |
| `JORNADA_*` (admin/ingest/session) | servidor (secretos) | acesso e sessões da Jornada | telas da Jornada falham |

Nunca colocar as chaves secretas no frontend nem em tabelas.

---

## 3. Mapa: cada tabela, quem a usa e por quê

### `products` — catálogo de licores
- **Site (navegador, leitura):** `src/routes/pocoes.tsx`, `src/routes/monte-seu-kit.tsx`, `src/components/FeaturedSection.tsx`, `src/components/CartDrawer.tsx` (checa estoque no carrinho).
- **Painel (navegador, escrita):** `src/routes/admin/produtos.tsx` (cria, edita, apaga, ajusta estoque manual), `src/routes/admin/destaques.tsx`, `src/routes/admin/index.tsx` (indicadores), `src/routes/admin/backup.tsx`.
- **Servidor (privilegiado):** `src/lib/orders.functions.ts` (confere preço e estoque oficiais no fechamento do pedido), `src/lib/gerenciapp-integration.server.ts` (grava estoque vindo do GerenciApp).
- **Por que:** é a fonte de preço. O servidor **recalcula tudo** para o cliente não conseguir alterar valores no navegador.
- **Precisa:** leitura pública liberada; escrita apenas para administrador; coluna `stock_control_type` (`manual` ou `gerenciapp`); coluna `codigo_integracao` para casar com o GerenciApp; Realtime ligado para a vitrine atualizar sozinha.

### `kit_prices` — preços dos kits
- **Site:** `src/routes/monte-seu-kit.tsx`. **Painel:** `src/routes/admin/kits.tsx`, backup.
- **Servidor:** `src/lib/orders.functions.ts` monta o preço do kit no fechamento.
- **Precisa:** leitura pública; escrita só admin.

### `site_orders` — registro central de pedidos
- **Servidor:** `src/lib/orders.functions.ts` (cria o pedido pendente antes de abrir o WhatsApp), `src/lib/admin-orders.functions.ts` (confirmar pago, cancelar, arquivar, pedido manual), `src/routes/api/public/integration/gerenciapp/payment.ts` (marca como pago quando o GerenciApp recebe).
- **Painel:** `src/routes/admin/pedidos.tsx` (lista e exporta CSV).
- **Precisa:** leitura só para admin; escrita só via servidor; `request_id` único (evita pedido duplicado); `codigo_pedido` único de 6 dígitos; gatilho de `updated_at`.

### `clientes`, `progresso`, `solicitacoes`, `eventos`, `bolsa`, `conquistas_desbloqueadas`, `receitas_fabricadas`, `recompensas_liberadas`, `jornada_*` — Jornada do Alquimista
- **Servidor:** `src/lib/jornada.functions.ts` e `src/lib/admin-jornada.functions.ts`.
- **Painel:** `src/routes/admin/jornada.tsx` (validação de pedidos, XP, passos, conquistas, exportação CSV).
- **Precisa:** tudo fechado ao público (só servidor privilegiado lê e escreve). Exceção: `jornada_conquistas` tem leitura liberada, pois é apenas o catálogo mostrado ao cliente.

### `app_config` — configurações do sistema
- **Servidor:** `src/routes/api/public/hooks/stock-zero.ts` (lê o segredo do webhook), `src/lib/admin-jornada.functions.ts` (código secreto do Caçador de Runas).
- **Chaves esperadas:** `stock_hook_url`, `stock_hook_secret`, `codigo_runa_ativo`.
- **Precisa:** nenhum acesso público — só servidor.

### `push_subscriptions` — dispositivos que recebem avisos
- **Servidor/cliente:** `src/lib/push.functions.ts` (cadastra e remove), `src/routes/api/public/hooks/stock-zero.ts` (envia e limpa inscrições mortas).
- **Precisa:** cada pessoa só vê e edita as próprias inscrições.

### `testimonials` e `featured_config` — conteúdo da home
- **Site:** `src/components/TestimonialsCarousel.tsx`, `src/components/FeaturedSection.tsx`.
- **Painel:** `src/routes/admin/depoimentos.tsx`, `src/routes/admin/destaques.tsx`, backup.
- **Precisa:** leitura pública; escrita só admin.

### `user_roles` — quem é administrador
- **Painel:** `src/components/AdminShell.tsx` verifica se o usuário logado é admin.
- **Precisa:** cada pessoa lê apenas a própria linha; função `has_role` usada por todas as políticas de admin; nunca guardar o papel na tabela de perfil.

---

## 4. Funções do banco chamadas pelo código

| Função | Chamada em | Para que |
|---|---|---|
| `create_site_order_transactional` | `orders.functions.ts`, `admin-orders.functions.ts` | cria o pedido com código único de 6 dígitos, sem duplicar |
| `increment_pedidos` / `decrement_estoque` | `src/lib/orders.ts` | contador de popularidade e baixa de estoque |
| `increment_xp` | `jornada.functions.ts` | soma XP com segurança |
| `processar_solicitacao_conquista_v2` | `admin-jornada.functions.ts` | aprovar/reprovar conquista com upload |
| `has_role` | políticas de acesso | decide quem é administrador |
| `notify_stock_zero` (gatilho) | tabela `products` | dispara o aviso de estoque 0 e 3 garrafas |
| `processar_avanco_pedido_v3` + gatilhos | `site_orders`, `solicitacoes` | avança passos da Jornada quando o pedido é pago |
| `validar_codigo_runa` | Jornada | valida o código secreto |

Todas as funções da Jornada e de pedidos são "security definer": rodam com permissão elevada e por isso **não** devem ter execução liberada a qualquer visitante.

---

## 5. Arquivos (Storage)

| Bucket | Público? | Usado em | Regras |
|---|---|---|---|
| `product-images` | sim | `src/routes/admin/produtos.tsx` | qualquer um vê; só admin envia/apaga |
| `jornada-evidencias` | não | `src/lib/admin-jornada.functions.ts` (link temporário) | nada público; acesso só pelo servidor |

O painel converte as fotos para WebP em três tamanhos antes de enviar.

---

## 6. Conexões que saem ou entram no banco

1. **Banco → site (avisos de estoque):** gatilho em `products` chama `POST /api/public/hooks/stock-zero` usando `app_config.stock_hook_url` + `stock_hook_secret`. Exige a extensão `pg_net` ativa.
2. **Site → GerenciApp (estoque):** `src/lib/gerenciapp-integration.server.ts` busca o estoque e grava só nos produtos marcados como `gerenciapp`.
3. **GerenciApp → site (pagamento):** `POST /api/public/integration/gerenciapp/payment` marca o pedido como pago; a Jornada avança em seguida.
4. **WhatsApp:** apenas montagem de mensagem no navegador; não toca no banco.
5. **Mapas (OpenStreetMap/OSRM):** cálculo de frete; o valor final é recalculado no servidor.

---

## 7. Ordem recomendada para recriar do zero

1. Criar o projeto Supabase e anotar URL, chave pública e chave secreta.
2. Ativar a extensão `pg_net`.
3. Aplicar as migrações de `supabase/migrations` em ordem de data (cria tabelas, permissões, políticas, funções e gatilhos).
4. Conferir que cada tabela nova recebeu as permissões de acesso (sem isso a API devolve erro de permissão, mesmo com as políticas certas).
5. Criar os buckets `product-images` (público) e `jornada-evidencias` (privado) com as regras da seção 5.
6. Ligar o Realtime na tabela `products`.
7. Preencher as variáveis e segredos da seção 2.
8. Criar o usuário administrador no Auth e registrar o papel `admin` em `user_roles`.
9. Inserir em `app_config`: `stock_hook_url` (endereço final do site) e `stock_hook_secret`.
10. Ajustar no Auth a URL do site e as URLs de retorno para o domínio novo.
11. Restaurar os dados de catálogo pelo painel de Backup.
12. Testar nesta ordem: vitrine carrega → montar kit → finalizar pedido (gera código de 6 dígitos) → painel confirma pagamento → Jornada avança → aviso de estoque chega.

---

## 8. Sintomas comuns e o ponto a revisar

| Sintoma | Onde olhar |
|---|---|
| "coluna não encontrada" ao salvar produto | migração não aplicada; rodar `NOTIFY pgrst, 'reload schema';` |
| erro de permissão em tabela nova | faltam as permissões de acesso da tabela |
| checkout falha ao finalizar | chave secreta do servidor ausente ou inválida |
| painel diz "sem acesso" | usuário sem papel `admin` em `user_roles` |
| aviso de estoque não chega | `pg_net` desativado, `app_config` incompleto ou chave de push antiga |
| pedido pago não avança a Jornada | gatilhos da Jornada não recriados |
