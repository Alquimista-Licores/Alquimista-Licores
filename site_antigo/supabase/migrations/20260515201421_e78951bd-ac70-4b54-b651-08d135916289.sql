
-- Enums
CREATE TYPE product_category AS ENUM ('fino','cremoso','especial');
CREATE TYPE app_role AS ENUM ('admin');

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  sabor TEXT NOT NULL,
  categoria product_category NOT NULL,
  preco NUMERIC(10,2) NOT NULL,
  volume_ml INTEGER NOT NULL DEFAULT 750,
  estoque INTEGER NOT NULL DEFAULT 0,
  notas_aromaticas TEXT,
  descricao TEXT,
  sugestoes TEXT,
  foto_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  graduacao_gl NUMERIC(5,2) NOT NULL DEFAULT 22,
  brix NUMERIC(5,2) NOT NULL DEFAULT 20,
  pedidos_count INTEGER NOT NULL DEFAULT 0,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Kit prices: kit_type 'degustacao' uses single row; 'presenteavel' uses 6 rows
CREATE TABLE public.kit_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_type TEXT NOT NULL,
  licor_categoria product_category,
  embalagem TEXT,
  preco NUMERIC(10,2) NOT NULL,
  UNIQUE(kit_type, licor_categoria, embalagem)
);

-- Testimonials
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  texto TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Featured config (single row)
CREATE TABLE public.featured_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  modo TEXT NOT NULL DEFAULT 'auto',
  produto_ids UUID[] NOT NULL DEFAULT '{}',
  CONSTRAINT single_row CHECK (id = 1)
);
INSERT INTO public.featured_config (id, modo) VALUES (1, 'auto');

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'admin',
  UNIQUE(user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Trigger: any authenticated user becomes admin (single-admin setup per spec)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER products_touch BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kit_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY products_read ON public.products FOR SELECT USING (true);
CREATE POLICY kits_read ON public.kit_prices FOR SELECT USING (true);
CREATE POLICY testi_read ON public.testimonials FOR SELECT USING (true);
CREATE POLICY featured_read ON public.featured_config FOR SELECT USING (true);
CREATE POLICY roles_read_own ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Admin write
CREATE POLICY products_admin_all ON public.products FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY kits_admin_all ON public.kit_prices FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY testi_admin_all ON public.testimonials FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY featured_admin_all ON public.featured_config FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Increment pedidos_count (callable by anyone — public ordering flow)
CREATE OR REPLACE FUNCTION public.increment_pedidos(_product_id UUID, _qty INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.products SET pedidos_count = pedidos_count + _qty WHERE id = _product_id;
END;
$$;

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images','product-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "product images public read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "product images admin write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "product images admin update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "product images admin delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
