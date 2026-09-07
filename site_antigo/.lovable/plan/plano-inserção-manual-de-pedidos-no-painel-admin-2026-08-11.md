# Plano: Inserção Manual de Pedidos no Painel Admin

Adicionar um botão e modal no painel de pedidos para permitir que o administrador registre vendas manuais. O sistema gerará o código de 6 dígitos automaticamente e o administrador preencherá os dados do cliente e itens, com cálculo automático de preços baseado no banco de dados.

## Alterações

### 1. Backend (`src/lib/admin-orders.functions.ts`)
- Criar a função de servidor `createManualOrder`.
- Esta função utilizará `supabaseAdmin` para chamar a RPC `create_site_order_transactional`.
- Irá validar os itens (avulsos, degustação, presenteáveis) buscando os preços oficiais em `products` e `kit_prices`.
- Calculará o subtotal e total (frete costuma ser 0 ou manual para vendas físicas, permitiremos informar um valor de frete manual).
- O `status` será definido como `pago` por padrão (ou selecionável).

### 2. Frontend (`src/routes/admin/pedidos.tsx`)
- Adicionar o botão "Novo Pedido Manual" no topo da página, alinhado à direita do título "Pedidos do Site".
- Implementar um modal (`ManualOrderModal`) com um formulário:
  - Dados do Cliente: Nome, Telefone.
  - Indicação: Nome, WhatsApp (opcional).
  - Itens: Lista dinâmica para adicionar produtos avulsos ou kits.
    - Seletor de produtos (avulsos) vindo de `products`.
    - Montagem de kits (degustação/presenteável).
  - Logística: Tipo (Retirada/Delivery) e Endereço.
  - Valores: Exibição do subtotal calculado e campo para Frete Manual.
- Ao salvar, chamar a `createManualOrder` e atualizar a listagem.

### 3. Utilitários (`src/lib/orders.functions.ts`)
- Exportar os schemas Zod de itens para serem reutilizados no painel admin, garantindo consistência na estrutura do `items_snapshot`.

## Detalhes Técnicos
- O `request_id` será gerado no frontend via `crypto.randomUUID()`.
- A RPC `create_site_order_transactional` já lida com a geração do código de 6 dígitos e evita colisões.
- Reutilizaremos a lógica de precificação de `validateAndPriceItems` para garantir que o admin não insira preços arbitrários que divirjam das tabelas oficiais.
