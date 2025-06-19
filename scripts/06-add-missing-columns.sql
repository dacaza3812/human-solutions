-- ✅ EJECUTAR DESDE v0 - Agregar columnas faltantes ✅

-- Agregar columnas faltantes a la tabla profiles si no existen
DO $$ 
BEGIN
  -- Agregar referral_code si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN referral_code TEXT UNIQUE;
    RAISE NOTICE 'Columna referral_code agregada';
  ELSE
    RAISE NOTICE 'Columna referral_code ya existe';
  END IF;

  -- Agregar referred_by si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'referred_by'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN referred_by TEXT;
    RAISE NOTICE 'Columna referred_by agregada';
  ELSE
    RAISE NOTICE 'Columna referred_by ya existe';
  END IF;

  -- Verificar y agregar otras columnas si faltan
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'first_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
    RAISE NOTICE 'Columna first_name agregada';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'last_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN last_name TEXT;
    RAISE NOTICE 'Columna last_name agregada';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    RAISE NOTICE 'Columna phone agregada';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'account_type'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN account_type TEXT CHECK (account_type IN ('client', 'advisor')) DEFAULT 'client';
    RAISE NOTICE 'Columna account_type agregada';
  END IF;

END $$;

-- Crear índices para las nuevas columnas
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles(account_type);
