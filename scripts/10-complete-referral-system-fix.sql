-- ⚠️ EJECUTAR ESTE SCRIPT EN EL SQL EDITOR DE SUPABASE ⚠️
-- Solución completa para el sistema de referidos

-- 1. LIMPIAR Y RECREAR TABLAS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS generate_referral_code(TEXT, TEXT) CASCADE;

-- 2. RECREAR TABLA PROFILES CON ESTRUCTURA CORRECTA
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    account_type TEXT CHECK (account_type IN ('client', 'advisor')) DEFAULT 'client',
    referral_code TEXT UNIQUE NOT NULL, -- Siempre requerido
    referred_by TEXT, -- Código del referente
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREAR TABLA REFERRALS
CREATE TABLE public.referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    referral_code TEXT NOT NULL, -- Código usado para el referido
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    commission_earned DECIMAL(10,2) DEFAULT 25.00,
    commission_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(referrer_id, referred_id) -- Evitar duplicados
);

-- 4. HABILITAR RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- 5. CREAR POLÍTICAS DE SEGURIDAD
-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para referrals
CREATE POLICY "Users can view own referrals as referrer" ON public.referrals
    FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view own referrals as referred" ON public.referrals
    FOR SELECT USING (auth.uid() = referred_id);

CREATE POLICY "System can insert referrals" ON public.referrals
    FOR INSERT WITH CHECK (true);

-- 6. FUNCIÓN PARA GENERAR CÓDIGO DE REFERIDO
CREATE OR REPLACE FUNCTION generate_referral_code(p_first_name TEXT DEFAULT '', p_last_name TEXT DEFAULT '')
RETURNS TEXT AS $$
DECLARE
    base_code TEXT;
    final_code TEXT;
    counter INTEGER := 0;
    random_suffix TEXT;
BEGIN
    -- Crear código base limpio
    base_code := LOWER(
        COALESCE(
            NULLIF(REGEXP_REPLACE(COALESCE(p_first_name, ''), '[^a-zA-Z0-9]', '', 'g'), ''), 
            'user'
        ) ||
        COALESCE(
            NULLIF(REGEXP_REPLACE(COALESCE(p_last_name, ''), '[^a-zA-Z0-9]', '', 'g'), ''), 
            'ref'
        )
    );
    
    -- Asegurar longitud mínima
    IF LENGTH(base_code) < 4 THEN
        base_code := base_code || 'code';
    END IF;
    
    -- Limitar longitud máxima
    IF LENGTH(base_code) > 8 THEN
        base_code := LEFT(base_code, 8);
    END IF;
    
    -- Generar código único
    LOOP
        random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        final_code := base_code || random_suffix;
        
        -- Verificar unicidad
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = final_code) THEN
            EXIT;
        END IF;
        
        counter := counter + 1;
        
        -- Failsafe para evitar bucle infinito
        IF counter > 100 THEN
            final_code := 'user' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
            EXIT;
        END IF;
    END LOOP;
    
    RETURN final_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNCIÓN PARA MANEJAR NUEVOS USUARIOS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_referral_code TEXT;
    referrer_profile_id UUID;
    referrer_code TEXT;
    meta_first_name TEXT;
    meta_last_name TEXT;
    meta_phone TEXT;
    meta_account_type TEXT;
BEGIN
    -- Log del inicio
    RAISE NOTICE '[REFERRAL_SYSTEM] Processing new user: % (email: %)', NEW.id, NEW.email;
    
    -- Extraer metadatos
    meta_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
    meta_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
    meta_phone := NEW.raw_user_meta_data->>'phone';
    meta_account_type := COALESCE(NEW.raw_user_meta_data->>'account_type', 'client');
    referrer_code := NEW.raw_user_meta_data->>'referral_code';
    
    RAISE NOTICE '[REFERRAL_SYSTEM] User metadata - Name: % %, Phone: %, Type: %, Referrer: %', 
        meta_first_name, meta_last_name, meta_phone, meta_account_type, referrer_code;
    
    -- Generar código único para el nuevo usuario
    new_referral_code := generate_referral_code(meta_first_name, meta_last_name);
    RAISE NOTICE '[REFERRAL_SYSTEM] Generated referral code: %', new_referral_code;
    
    -- Insertar perfil del nuevo usuario
    INSERT INTO public.profiles (
        id, email, first_name, last_name, phone, account_type, referral_code, referred_by
    ) VALUES (
        NEW.id, 
        NEW.email, 
        meta_first_name, 
        meta_last_name, 
        meta_phone, 
        meta_account_type,
        new_referral_code,
        referrer_code
    );
    
    RAISE NOTICE '[REFERRAL_SYSTEM] Profile created for user: %', NEW.id;
    
    -- Si fue referido por alguien, crear la relación
    IF referrer_code IS NOT NULL AND referrer_code != '' THEN
        RAISE NOTICE '[REFERRAL_SYSTEM] Processing referral with code: %', referrer_code;
        
        -- Buscar el referente
        SELECT id INTO referrer_profile_id 
        FROM public.profiles 
        WHERE referral_code = referrer_code;
        
        IF referrer_profile_id IS NOT NULL THEN
            RAISE NOTICE '[REFERRAL_SYSTEM] Found referrer: % for code: %', referrer_profile_id, referrer_code;
            
            -- Crear registro de referido
            INSERT INTO public.referrals (
                referrer_id, referred_id, referral_code, status, commission_earned, commission_paid
            ) VALUES (
                referrer_profile_id, NEW.id, referrer_code, 'active', 25.00, FALSE
            );
            
            RAISE NOTICE '[REFERRAL_SYSTEM] Referral relationship created: % -> %', referrer_profile_id, NEW.id;
        ELSE
            RAISE WARNING '[REFERRAL_SYSTEM] Referrer not found for code: %', referrer_code;
        END IF;
    ELSE
        RAISE NOTICE '[REFERRAL_SYSTEM] No referrer code provided for user: %', NEW.id;
    END IF;
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '[REFERRAL_SYSTEM] Error processing user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
        -- Intentar insertar perfil básico sin fallar
        INSERT INTO public.profiles (id, email, first_name, last_name, referral_code) 
        VALUES (NEW.id, NEW.email, COALESCE(meta_first_name, 'Usuario'), COALESCE(meta_last_name, 'Nuevo'), 
                'user' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT)
        ON CONFLICT (id) DO NOTHING;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. FUNCIÓN PARA ACTUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. CREAR TRIGGERS
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_referrals_updated_at
    BEFORE UPDATE ON public.referrals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 10. FUNCIONES PARA ESTADÍSTICAS DE REFERIDOS
CREATE OR REPLACE FUNCTION get_referral_stats_by_id(user_profile_id UUID)
RETURNS TABLE(
    total_referrals BIGINT,
    active_referrals BIGINT,
    total_earnings NUMERIC,
    monthly_earnings NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(r.id)::BIGINT as total_referrals,
        COUNT(CASE WHEN r.status = 'active' THEN 1 END)::BIGINT as active_referrals,
        COALESCE(SUM(r.commission_earned), 0) as total_earnings,
        COALESCE(SUM(CASE 
            WHEN r.created_at >= date_trunc('month', CURRENT_DATE) 
            THEN r.commission_earned 
            ELSE 0 
        END), 0) as monthly_earnings
    FROM public.referrals r
    WHERE r.referrer_id = user_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_referral_stats(referral_code_param TEXT)
RETURNS TABLE(
    total_referrals BIGINT,
    active_referrals BIGINT,
    total_earnings NUMERIC,
    monthly_earnings NUMERIC
) AS $$
DECLARE
    profile_id UUID;
BEGIN
    -- Obtener ID del perfil por código de referido
    SELECT id INTO profile_id FROM public.profiles WHERE referral_code = referral_code_param;
    
    IF profile_id IS NULL THEN
        RETURN QUERY SELECT 0::BIGINT, 0::BIGINT, 0::NUMERIC, 0::NUMERIC;
        RETURN;
    END IF;
    
    RETURN QUERY SELECT * FROM get_referral_stats_by_id(profile_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. CREAR ÍNDICES PARA OPTIMIZACIÓN
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON public.referrals(created_at);

-- 12. OTORGAR PERMISOS
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.referrals TO authenticated;
GRANT EXECUTE ON FUNCTION get_referral_stats_by_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_referral_stats(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_referral_code(TEXT, TEXT) TO authenticated;

-- 13. VERIFICACIÓN FINAL
DO $$
BEGIN
    RAISE NOTICE '[REFERRAL_SYSTEM] Setup completed successfully!';
    RAISE NOTICE '[REFERRAL_SYSTEM] Tables created: profiles, referrals';
    RAISE NOTICE '[REFERRAL_SYSTEM] Functions created: handle_new_user, get_referral_stats_by_id, get_referral_stats, generate_referral_code';
    RAISE NOTICE '[REFERRAL_SYSTEM] Triggers created: on_auth_user_created, handle_profiles_updated_at, handle_referrals_updated_at';
    RAISE NOTICE '[REFERRAL_SYSTEM] Indexes and permissions configured';
END $$;
