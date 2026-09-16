# Relatório de Conexões com o Banco de Dados
## Projeto: A Jornada do Alquimista (Alquimista Licores)
Data: 16/09/2026

Este documento explica **todos os pontos onde o aplicativo se conecta ao banco de dados**, o que cada ponto faz e por que ele existe. Serve como guia para quem for recriar o projeto do zero.

---

## 1. Visão geral em uma frase

O aplicativo é um site que guarda tudo (clientes, progresso, itens, conquistas, pedidos) em um banco de dados **Supabase**. Existem **três formas diferentes** de o site falar com esse banco, cada uma com uma finalidade e um nível de permissão distinto.

---

## 2. As três formas de conexão

| # | Nome | Onde roda | Chave usada | Para que serve |
|---|------|-----------|-------------|----------------|
| 1 | Conexão pública (navegador) | No celular/computador do cliente | Chave pública (publishable/anon) | Apenas para ouvir avisos em tempo real de pedidos pagos |
| 2 | Conexão administrativa (servidor) | Nos servidores do site | Chave secreta de serviço (service role) | 95% do sistema: ler e gravar clientes, progresso, itens, conquistas |
| 3 | Conexão autenticada por usuário | Nos servidores do site | Chave pública + token do usuário | Preparada pelo modelo padrão, **não utilizada** neste projeto (o login é por telefone, não pelo login do Supabase) |

**Por que a maior parte usa a chave secreta:** o login aqui é só por telefone, sem senha. Como não existe um "usuário do Supabase" logado, as regras de segurança por linha (RLS) não conseguem identificar o cliente. Por isso todas as leituras e gravações passam pelo servidor, que confere quem é o cliente pelo cookie de sessão antes de tocar no banco.

---

## 3. Configurações que precisam existir (variáveis e segredos)

Sem estas informações preenchidas, o site não conecta:

| Nome | Tipo | Onde é usada | Por que existe |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Pública | Navegador | Endereço do banco |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Pública | Navegador | Chave de leitura pública (tempo real) |
| `VITE_SUPABASE_PROJECT_ID` | Pública | Navegador | Identificação do projeto |
| `SUPABASE_URL` | Secreta | Servidor | Mesmo endereço, usado pelo servidor |
| `SUPABASE_PUBLISHABLE_KEY` | Secreta | Servidor | Usada pelo mecanismo de login padrão |
| `SUPABASE_SERVICE_ROLE_KEY` (ou `SERVICE_ROLE_KEY`) | **Secreta crítica** | Servidor | Acesso total ao banco. **Nunca pode aparecer no navegador** |
| `JORNADA_SESSION_SECRET` | Secreta | Servidor | Assina os cookies de sessão do cliente e do mestre |
| `JORNADA_ADMIN_PASSWORD` | Secreta | Servidor | Senha do painel administrativo `/mestre` |
| `JORNADA_INGEST_SECRET` | Secreta | Servidor | Senha do canal que recebe pedidos do site oficial |

Também existem no Supabase, usados por rotinas internas do banco: `STOCK_HOOK_SECRET`, `VAPID_PRIVATE_KEY`, `GERENCIAPP_INTEGRATION_URL`, `GERENCIAPP_INTEGRATION_SECRET`, `LOVABLE_API_KEY`.

---

## 4. Ponto a ponto: onde o site toca o banco

### 4.1 Cadastro e login por telefone
- **Tabelas:** `clientes`, `progresso`
- **O que acontece:** ao cadastrar, cria a ficha do cliente e a linha de progresso inicial (passo 0). Ao entrar, procura o cliente pelo telefone (comparando só os números) e grava um cookie de sessão de 60 dias.
- **Por quê:** é o que substitui usuário e senha.

### 4.2 Tela principal da jornada (carregamento do estado)
- **Tabelas lidas de uma vez:** `clientes`, `progresso`, `bolsa`, `receitas_fabricadas`, `recompensas_liberadas`, `jornada_conquistas` (catálogo), `conquistas_desbloqueadas`, `solicitacoes`, `eventos`, `jornada_solicitacoes`, `jornada_indicacoes`
- **Por quê:** o mapa, o nível, a mochila, as receitas, os brindes e as insígnias são montados todos juntos numa única carga.

### 4.3 Solicitação de avanço (o cliente digita o número do pedido)
- **Tabelas:** `site_orders` (confere se o pedido existe, é do telefone dele e está pago), `solicitacoes` (registra o pedido de avanço), `jornada_pedidos_processados` (evita processar o mesmo pedido duas vezes)
- **Por quê:** garante que cada pedido gere avanço uma única vez e apenas para o dono do telefone.

### 4.4 Motor de progressão (o que roda quando o pedido é aprovado)
- **Tabelas:** `progresso` (passo e cenário), `clientes` (XP), `bolsa` (ingredientes ganhos), `receitas_fabricadas`, `recompensas_liberadas` (brindes), `conquistas_desbloqueadas`, `eventos` (histórico)
- **Por quê:** é o coração do jogo. Tudo é gravado junto para o estado nunca ficar pela metade.

### 4.5 Rotinas automáticas dentro do próprio banco
O banco tem gatilhos que disparam sozinhos, sem o site pedir:
- Pedido marcado como **pago/concluído** → `processar_avanco_pedido_v3` avança passos, XP, itens e cenário.
- Cadastro ou atualização de cliente → avalia conquistas automáticas.
- Primeira compra de um indicado → credita a conquista de indicação para quem indicou.
- Estoque zerado ou baixo → dispara aviso externo.

**Importante para quem recriar:** essas rotinas **não estão no código do site**, estão dentro do banco. Precisam ser recriadas pelas migrações em `supabase/migrations/`.

### 4.6 Conquistas com prova (foto)
- **Tabelas:** `jornada_solicitacoes`
- **Armazenamento de arquivos:** bucket **`jornada-evidencias`** (privado)
- **Procedimento do banco:** `processar_solicitacao_conquista_v2` (aprovar/rejeitar)
- **Por quê:** conquistas como "Cronista Dourado" dependem de uma foto enviada pelo cliente e aprovada manualmente.

### 4.7 Missão "Caçador de Runas"
- **Procedimento do banco:** `validar_codigo_runa`
- **Tabela de apoio:** `app_config` (guarda o código vigente na chave `codigo_runa_ativo`)
- **Por quê:** permite trocar o código secreto sem mexer no código do site.

### 4.8 Painel administrativo `/mestre`
- **Tabelas:** `pedidos`, `solicitacoes`, `clientes`, `recompensas_liberadas`, `site_orders`
- **Proteção:** senha `JORNADA_ADMIN_PASSWORD` + cookie de 7 dias
- **Por quê:** aprovar avanços, marcar brindes como entregues e acompanhar clientes.

### 4.9 Recebimento de pedidos vindos do site oficial
- **Endereço:** `POST /api/public/pedidos/ingest`
- **Proteção:** cabeçalho `x-ingest-secret` conferido contra `JORNADA_INGEST_SECRET`
- **Tabela:** `site_orders` (grava/atualiza o pedido) e em seguida chama `processar_avanco_pedido_v3`
- **Por quê:** é a ponte entre a loja e o jogo. **Se esse segredo mudar, precisa ser atualizado também no site que envia.**

### 4.10 Atualização em tempo real
- **Onde:** no navegador do cliente, canal `site-orders-changes` escutando mudanças na tabela `site_orders`
- **Por quê:** assim que o pedido vira "pago", a tela do cliente atualiza sozinha, sem recarregar.
- **Atenção:** exige que a tabela `site_orders` esteja habilitada para tempo real no banco.

---

## 5. Mapa resumido: arquivo → o que conecta

| Arquivo | Função |
|---|---|
| `src/integrations/supabase/client.ts` | Conexão do navegador (chave pública) |
| `src/integrations/supabase/client.server.ts` | Conexão administrativa do servidor (chave secreta) |
| `src/integrations/supabase/auth-middleware.ts` | Conexão por usuário autenticado (não usada aqui) |
| `src/lib/jornada/session.server.ts` | Cookies de sessão do cliente e do mestre |
| `src/lib/jornada/cliente.functions.ts` | Cadastro, login, estado da jornada, solicitações, provas, runas |
| `src/lib/jornada/motor.server.ts` | Motor de passos, XP, itens, receitas e conquistas |
| `src/lib/jornada/mestre.functions.ts` | Painel administrativo |
| `src/routes/api/public/pedidos.ingest.ts` | Recebimento de pedidos do site oficial |
| `src/routes/index.tsx` | Tela principal e escuta em tempo real |
| `supabase/migrations/` | Estrutura do banco, gatilhos e rotinas automáticas |

---

## 6. Ordem recomendada para recriar do zero

1. Criar o projeto Supabase novo e anotar endereço e chaves.
2. Aplicar as migrações de `supabase/migrations/` na ordem das datas — isso cria tabelas, gatilhos e rotinas automáticas.
3. Criar os dois buckets de arquivos: `jornada-evidencias` (privado) e `product-images` (público).
4. Preencher as variáveis públicas e os segredos da seção 3.
5. Gerar segredos novos e fortes para `JORNADA_SESSION_SECRET`, `JORNADA_INGEST_SECRET` e `JORNADA_ADMIN_PASSWORD`.
6. Popular a tabela `jornada_conquistas` com o catálogo oficial de conquistas e `app_config` com o código de runa.
7. Habilitar tempo real na tabela `site_orders`.
8. Informar ao site oficial da loja o novo endereço do webhook e o novo `JORNADA_INGEST_SECRET`.
9. Testar: cadastrar cliente → enviar um pedido pago pelo webhook → confirmar avanço de passo, XP, itens na bolsa e brinde liberado.

---

## 7. Regras de segurança que não podem ser quebradas

- A chave de serviço (`SUPABASE_SERVICE_ROLE_KEY`) só pode existir no servidor. Se ela chegar ao navegador, qualquer pessoa pode ler e apagar o banco inteiro.
- Toda leitura de dados de um cliente precisa antes confirmar a identidade pelo cookie de sessão.
- O webhook de pedidos sempre confere o segredo antes de gravar qualquer coisa.
- Senhas, tokens e chaves nunca devem ser guardados em tabelas do banco.
