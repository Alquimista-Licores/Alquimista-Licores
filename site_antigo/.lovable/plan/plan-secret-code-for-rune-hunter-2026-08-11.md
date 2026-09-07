# Plan: Secret Code for Rune Hunter

Add a secure administrative interface to manage the "Rune Hunter" secret code (used for automatic achievement validation).

## User Review Required

> [!IMPORTANT]
> The secret code is stored in the existing `app_config` table. Access is restricted to administrators via server functions.

- No database migrations: using existing `app_config` table.
- Accessible only at `/admin/jornada`.

## Proposed Changes

### Backend (Server Functions)
- Add `getRuneSecretCode` in `src/lib/admin-jornada.functions.ts` (protected by auth).
- Add `updateRuneSecretCode` in `src/lib/admin-jornada.functions.ts` (protected by auth).
- Use `supabaseAdmin` to bypass RLS for internal system config.

### Frontend (Admin UI)
- Add "Código secreto — Caçador de Runas" section in `src/routes/admin/jornada.tsx`.
- Implement a simple form to view and update the code.
- Ensure the code is not leaked to public pages.

## Technical Details

- **Table**: `public.app_config` (key primary key, value text).
- **Server Function Protection**: Both functions will use `.middleware([requireSupabaseAuth])` and internal admin checks (implicit via `supabaseAdmin` usage in admin-only routes).
- **Validation**: Strict Zod validation for inputs.
- **UI Component**: Collapsible section with a lock icon, consistent with the existing admin layout.

