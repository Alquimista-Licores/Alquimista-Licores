
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS ingredientes text;

UPDATE public.products SET ingredientes = CASE lower(sabor)
  WHEN 'canela' THEN 'Açúcar, Álcool de Cereais, Canela em pau e Anis estrelado.'
  WHEN 'abacaxi' THEN 'Açúcar, Álcool de Cereais, Polpa de abacaxi e Cravo-da-Índia.'
  WHEN 'banana' THEN 'Açúcar, Álcool de Cereais, Banana caturra, Açúcar mascavo, Canela em pau, Essência de baunilha e Cravo-da-Índia.'
  WHEN 'butiá' THEN 'Açúcar, Álcool de Cereais e Polpa de butiá.'
  WHEN 'café & laranja' THEN 'Açúcar, Álcool de Cereais, Grãos de café, Laranja, Canela em pau e Essência de baunilha.'
  WHEN 'figo' THEN 'Açúcar, Álcool de Cereais e Folhas de figueira.'
  WHEN 'jabuticaba' THEN 'Açúcar, Álcool de Cereais e Jabuticaba.'
  WHEN 'maracujá' THEN 'Açúcar, Álcool de Cereais e Polpa de maracujá.'
  WHEN 'chocolate cremoso' THEN 'Açúcar, Álcool de Cereais, Leite condensado, Cacau 50% e Chocolate nobre meio amargo.'
  WHEN 'maracujá cremoso' THEN 'Açúcar, Álcool de Cereais, Leite condensado e Polpa de maracujá.'
  WHEN 'doce de leite' THEN 'Doce de leite, Açúcar, Álcool de Cereais, Canela em pó e Essência de baunilha.'
  WHEN 'ouro especial' THEN 'Açúcar, Leite Integral, Álcool de Cereais, Limão siciliano, Café, Cacau 100%, Noz-moscada e Essência de baunilha.'
  ELSE ingredientes
END;
