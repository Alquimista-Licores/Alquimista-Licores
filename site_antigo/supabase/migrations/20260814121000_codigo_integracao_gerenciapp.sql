-- Identificador funcional compartilhado com o GerenciApp.
-- Os UUIDs continuam independentes em cada Supabase.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS codigo_integracao text;

CREATE UNIQUE INDEX IF NOT EXISTS products_codigo_integracao_uidx
  ON public.products (codigo_integracao)
  WHERE codigo_integracao IS NOT NULL;

UPDATE public.products
SET codigo_integracao = m.codigo_integracao
FROM (
  VALUES
    ('b0d77291-b5ed-4548-8837-887f674c1b4c'::uuid, 'LICOR-BANANA-500ML'),
    ('f57e85ca-3e25-4885-a9b8-8febeac0421a'::uuid, 'LICOR-FIGO-500ML'),
    ('c1245fd9-cb5b-43e8-bf20-1495ff5c1aee'::uuid, 'LICOR-CAFE-LARANJA-500ML'),
    ('af94b5a9-33d4-4a6b-abb1-0e59a49d3ec7'::uuid, 'LICOR-OURO-500ML'),
    ('b679b884-73a2-48cc-81af-2bc99abecee1'::uuid, 'LICOR-MARACUJA-FINO-500ML'),
    ('631512a9-16dc-4e4f-8f07-98278a207c0a'::uuid, 'LICOR-CANELA-500ML'),
    ('d5941952-c8de-4cfa-a2d5-9ca89b0cf19a'::uuid, 'LICOR-CHOCOLATE-CREMOSO-500ML'),
    ('03b9242c-50a5-4c7d-bb5e-0211b266b421'::uuid, 'LICOR-DOCE-LEITE-500ML'),
    ('4a8abdb5-e5d4-4ab6-9fd8-4db419c17ed9'::uuid, 'LICOR-MARACUJA-CREMOSO-500ML'),
    ('6fe04098-9cd1-4cb7-a903-1e3ae1147671'::uuid, 'LICOR-BUTIA-500ML'),
    ('37758861-8dc5-4a9d-8995-b341c91ba200'::uuid, 'LICOR-JABUTICABA-500ML'),
    ('9e6a58a9-8d88-4613-9ce7-2dfb8afca29e'::uuid, 'LICOR-ABACAXI-500ML')
) AS m(id, codigo_integracao)
WHERE public.products.id = m.id;

COMMENT ON COLUMN public.products.codigo_integracao IS
  'Código estável compartilhado com o GerenciApp, por exemplo LICOR-BANANA-500ML.';

GRANT ALL ON public.products TO service_role;
