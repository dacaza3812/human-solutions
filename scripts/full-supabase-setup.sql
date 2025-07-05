-- Eliminar tablas si existen para una configuración limpia
DROP TABLE IF EXISTS public.inquiries;
DROP TABLE IF EXISTS public.referrals;
DROP TABLE IF EXISTS public.subscriptions;
DROP TABLE IF EXISTS public.prices;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.customers;
DROP TABLE IF EXISTS public.profiles;

-- Crear la tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username text UNIQUE,
  avatar_url text,
  website text,
  role text DEFAULT 'client'::text NOT NULL, -- 'client' o 'advisor'
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS para la tabla de perfiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para la tabla de perfiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Crear la tabla de clientes (para Stripe)
CREATE TABLE public.customers (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  stripe_customer_id text UNIQUE
);

-- Habilitar RLS para la tabla de clientes
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para la tabla de clientes
CREATE POLICY "Customers can view their own data." ON public.customers FOR SELECT USING (auth.uid() = id);

-- Crear la tabla de productos (para Stripe)
CREATE TABLE public.products (
  id text NOT NULL PRIMARY KEY,
  active boolean,
  name text,
  description text,
  image text,
  metadata jsonb
);

-- Habilitar RLS para la tabla de productos
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para la tabla de productos
CREATE POLICY "Products are readable by everyone." ON public.products FOR SELECT USING (true);

-- Crear la tabla de precios (para Stripe)
CREATE TABLE public.prices (
  id text NOT NULL PRIMARY KEY,
  product_id text REFERENCES public.products ON DELETE CASCADE,
  active boolean,
  currency text,
  unit_amount bigint,
  type text,
  interval text,
  interval_count integer,
  trial_period_days integer,
  metadata jsonb
);

-- Habilitar RLS para la tabla de precios
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para la tabla de precios
CREATE POLICY "Prices are readable by everyone." ON public.prices FOR SELECT USING (true);

-- Crear la tabla de suscripciones (para Stripe)
CREATE TABLE public.subscriptions (
  id text NOT NULL PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  status text,
  metadata jsonb,
  price_id text REFERENCES public.prices ON DELETE CASCADE,
  quantity integer,
  cancel_at_period_end boolean,
  created timestamp with time zone DEFAULT now() NOT NULL,
  current_period_start timestamp with time zone DEFAULT now() NOT NULL,
  current_period_end timestamp with time zone DEFAULT now() NOT NULL,
  ended_at timestamp with time zone,
  cancel_at timestamp with time zone,
  canceled_at timestamp with time zone,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone
);

-- Habilitar RLS para la tabla de suscripciones
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para la tabla de suscripciones
CREATE POLICY "Subscriptions are readable by everyone." ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Crear la tabla de referidos
CREATE TABLE public.referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  referred_user_id uuid REFERENCES auth.users ON DELETE CASCADE UNIQUE,
  referral_code text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  status text DEFAULT 'pending'::text NOT NULL -- 'pending', 'completed', 'cancelled'
);

-- Habilitar RLS para la tabla de referidos
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para la tabla de referidos
CREATE POLICY "Referrals are viewable by referrer." ON public.referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Referrals can be inserted by anyone." ON public.referrals FOR INSERT WITH CHECK (true); -- Anyone can create a referral link
CREATE POLICY "Referrals can be updated by referrer." ON public.referrals FOR UPDATE USING (auth.uid() = referrer_id);

-- Crear la tabla de consultas (contact form submissions)
CREATE TABLE public.inquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  file_url text, -- URL to the uploaded file in Supabase Storage
  status text DEFAULT 'new'::text NOT NULL, -- 'new', 'in_progress', 'resolved', 'archived'
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS para la tabla de consultas
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para la tabla de consultas
-- Advisors can view all inquiries
CREATE POLICY "Advisors can view all inquiries." ON public.inquiries FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'advisor'));
-- Users can insert inquiries
CREATE POLICY "Users can insert inquiries." ON public.inquiries FOR INSERT WITH CHECK (true);
-- Advisors can update inquiry status
CREATE POLICY "Advisors can update inquiry status." ON public.inquiries FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'advisor'));

-- Función para crear un nuevo perfil cuando un usuario se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.email); -- Usar email como username inicial
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función handle_new_user después de la inserción en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Función para crear un nuevo cliente en la tabla de clientes cuando un usuario se registra
CREATE OR REPLACE FUNCTION public.create_public_customer()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customers (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función create_public_customer después de la inserción en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_create_customer ON auth.users;
CREATE TRIGGER on_auth_user_created_create_customer
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.create_public_customer();
