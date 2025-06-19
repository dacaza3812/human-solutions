-- ⚠️ EJECUTAR ESTE SCRIPT EN EL SQL EDITOR DE SUPABASE ⚠️
-- Este script requiere permisos de superusuario

-- Create profiles table with proper constraints (si no existe)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  account_type TEXT CHECK (account_type IN ('client', 'advisor')) DEFAULT 'client',
  referral_code TEXT UNIQUE,
  referred_by TEXT, -- Este es el código de la persona que REFIRIÓ a ESTE usuario
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table (si no existen)
DO $$ BEGIN
  CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN RAISE NOTICE 'Policy "Users can view own profile" already exists.'; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN RAISE NOTICE 'Policy "Users can update own profile" already exists.'; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN RAISE NOTICE 'Policy "Users can insert own profile" already exists.'; END $$;


-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(p_first_name TEXT DEFAULT '', p_last_name TEXT DEFAULT '')
RETURNS TEXT AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 0;
  random_suffix TEXT;
BEGIN
  base_code := LOWER(COALESCE(NULLIF(REGEXP_REPLACE(p_first_name, '[^a-zA-Z0-9]', '', 'g'), ''), 'user')) ||
               LOWER(COALESCE(NULLIF(REGEXP_REPLACE(p_last_name, '[^a-zA-Z0-9]', '', 'g'), ''), 'ref'));

  IF LENGTH(base_code) < 4 THEN
    base_code := base_code || 'code';
  END IF;
  
  IF LENGTH(base_code) > 12 THEN
    base_code := LEFT(base_code, 12);
  END IF;
  
  LOOP
    random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    final_code := base_code || random_suffix;
    
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = final_code) THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    IF counter > 100 THEN -- Failsafe
      final_code := 'user' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT || random_suffix;
      IF EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = final_code) THEN
         final_code := 'user' || gen_random_uuid()::TEXT; -- Ultimate failsafe
      END IF;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle user creation with detailed logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_user_generated_code TEXT; -- Código generado para el NUEVO usuario
  referrer_profile_id UUID;     -- ID del perfil del referente
  referrer_code_from_signup TEXT; -- Código del referente (pasado desde el frontend)
  meta_first_name TEXT;
  meta_last_name TEXT;
  meta_phone TEXT;
  meta_account_type TEXT;
BEGIN
  RAISE NOTICE '[handle_new_user] Triggered for new user ID: %, email: %', NEW.id, NEW.email;
  RAISE NOTICE '[handle_new_user] Raw user metadata: %', NEW.raw_user_meta_data;

  meta_first_name := NEW.raw_user_meta_data->>'first_name';
  meta_last_name := NEW.raw_user_meta_data->>'last_name';
  meta_phone := NEW.raw_user_meta_data->>'phone';
  meta_account_type := COALESCE(NEW.raw_user_meta_data->>'account_type', 'client');
  
  -- Generar código de referido para el NUEVO usuario
  new_user_generated_code := generate_referral_code(meta_first_name, meta_last_name);
  RAISE NOTICE '[handle_new_user] Generated referral code for new user (%): %', NEW.id, new_user_generated_code;

  -- Obtener el código del referente desde los metadatos del nuevo usuario
  referrer_code_from_signup := NEW.raw_user_meta_data->>'referral_code';
  RAISE NOTICE '[handle_new_user] Referrer code from signup metadata for user (%): %', NEW.id, referrer_code_from_signup;

  -- Insertar perfil para el NUEVO usuario
  INSERT INTO public.profiles (
    id, email, first_name, last_name, phone, account_type,
    referral_code,    -- Código propio del nuevo usuario
    referred_by       -- Código del referente (si lo hay)
  )
  VALUES (
    NEW.id, NEW.email, meta_first_name, meta_last_name, meta_phone, meta_account_type,
    new_user_generated_code, 
    referrer_code_from_signup 
  );
  RAISE NOTICE '[handle_new_user] Profile inserted for new user ID: %', NEW.id;

  -- Si el nuevo usuario fue referido por alguien (referrer_code_from_signup no es nulo ni vacío)
  IF referrer_code_from_signup IS NOT NULL AND referrer_code_from_signup != '' THEN
    RAISE NOTICE '[handle_new_user] Attempting to find referrer with code: %', referrer_code_from_signup;
    
    SELECT p.id INTO referrer_profile_id
    FROM public.profiles p
    WHERE p.referral_code = referrer_code_from_signup;

    IF referrer_profile_id IS NOT NULL THEN
      RAISE NOTICE '[handle_new_user] Referrer found. ID: %, Code: %. Creating referral link for new user: %', referrer_profile_id, referrer_code_from_signup, NEW.id;
      
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'referrals' AND table_schema = 'public') THEN
        INSERT INTO public.referrals (
          referrer_id, referred_id, referral_code, status, commission_earned, commission_paid
        ) VALUES (
          referrer_profile_id, NEW.id, referrer_code_from_signup, 'active', 25.00, FALSE
        );
        RAISE NOTICE '[handle_new_user] Referral record created: ReferrerID=%, ReferredID=%, ReferrerCode=%', referrer_profile_id, NEW.id, referrer_code_from_signup;
      ELSE
        RAISE WARNING '[handle_new_user] Referrals table does not exist. Cannot create referral link.';
      END IF;
    ELSE
      RAISE WARNING '[handle_new_user] Referrer profile not found for referral_code: % (New user ID: %)', referrer_code_from_signup, NEW.id;
    END IF;
  ELSE
    RAISE NOTICE '[handle_new_user] New user ID: % was not referred or no referral code provided.', NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RAISE WARNING '[handle_new_user] Unique violation for user ID % (Email: %): %. SQLSTATE: %', NEW.id, NEW.email, SQLERRM, SQLSTATE;
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE WARNING '[handle_new_user] Error for user ID % (Email: %): %. SQLSTATE: %', NEW.id, NEW.email, SQLERRM, SQLSTATE;
    RETURN NEW; 
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update updated_at timestamp (si no existe)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user creation (asegúrate que sea el único)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
RAISE NOTICE 'Trigger on_auth_user_created created/updated.';

-- Create trigger for updated_at on profiles (si no existe)
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
RAISE NOTICE 'Trigger handle_profiles_updated_at created/updated.';

-- Create indexes for better performance (si no existen)
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles(account_type);
RAISE NOTICE 'Indexes on profiles table ensured.';
