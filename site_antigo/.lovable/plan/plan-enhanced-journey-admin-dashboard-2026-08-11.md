# Plan: Enhanced Journey Admin Dashboard

Implement improvements to the `/admin/jornada` dashboard to handle customer data more efficiently and reveal detailed information.

## User Requirements
- Make the "CLIENTES ATIVOS" section collapsible (collapsed by default).
- Add a search field at the top to filter by customer name or order number.
- Display all customer columns (newly added to the `clientes` table) when a customer card is clicked.

## Proposed Changes

### Frontend
- **src/routes/admin/jornada.tsx**
  - Update `collapsedCategories` state to include `clientes: true` by default.
  - Implement a search bar at the top of the dashboard.
  - Create a new `searchTerm` state to filter `solicitacoes` and `clientes` lists.
  - Wrap the "CLIENTES ATIVOS" section in a collapsible container similar to "SOLICITAÇÕES".
  - Enhance the customer card to be clickable, revealing a detailed view (accordion or modal) with all fields from the `clientes` table:
    - `nome`, `telefone`, `xp`, `criado_em` (existing)
    - `apelido`, `instagram`, `cidade`, `como_conheceu`, `data_aniversario`, `aceite_termos_em` (newly discovered)

### Backend (Functions)
- **src/lib/admin-jornada.functions.ts**
  - Ensure `getJornadaAdminData` continues to fetch all relevant columns from `clientes`. (Current selection `*` already covers this).

## Technical Details
- Use `lucide-react` for icons (Search, Chevron, etc.).
- Use Tailwind CSS for the collapsible animations and layout.
- Search logic will be client-side on the data already fetched by `useQuery`.
- Filter customers by `nome` or `telefone`.
- Filter solicitations by `cliente.nome` or `numero_pedido_digitado`.
