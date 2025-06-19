-- ⚠️ EJECUTAR ESTE SCRIPT EN EL SQL EDITOR DE SUPABASE ⚠️
-- Solución final y completa para el sistema de registro y referidos

-- 1. LIMPIAR COMPLETAMENTE EL ESQUEMA EXISTENTE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS handle_referrals_updated_at ON public.referrals;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS generate_referral_code(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_referral_stats_by_id(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_referral_stats(TEXT) CASCADE;

-- Eliminar tablas existentes
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. CREAR TABLA PROFILES CON ESQUEMA FINAL
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT, -- Campo para teléfono (opcional)
    account_type TEXT CHECK (account_type IN ('client', 'advisor')) DEFAULT 'client',
    referral_code TEXT UNIQUE NOT NULL, -- Código único para cada usuario
    referred_by TEXT, -- OPCIONAL: código del referente (puede ser NULL)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREAR TABLA REFERRALS PARA RASTREAR RELACIONES
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

-- 4. HABILITAR RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- 5. CREAR POLÍTICAS DE SEGURIDAD
-- Políticas para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para referrals
DROP POLICY IF EXISTS "Users can view own referrals as referrer" ON public.referrals;
DROP POLICY IF EXISTS "Users can view own referrals as referred" ON public.referrals;
DROP POLICY IF EXISTS "System can insert referrals" ON public.referrals;

CREATE POLICY "Users can view own referrals as referrer" ON public.referrals
    FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view own referrals as referred" ON public.referrals
    FOR SELECT USING (auth.uid() = referred_id);

CREATE POLICY "System can insert referrals" ON public.referrals
    FOR INSERT WITH CHECK (true);

-- 6. FUNCIÓN MEJORADA PARA GENERAR CÓDIGOS DE REFERIDO
CREATE OR REPLACE FUNCTION generate_referral_code(p_first_name TEXT DEFAULT '', p_last_name TEXT DEFAULT '')
RETURNS TEXT AS $$
DECLARE
    base_code TEXT;
    final_code TEXT;
    counter INTEGER := 0;
    random_suffix TEXT;
BEGIN
    -- Crear código base limpio usando nombre y apellido
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
    
    -- Generar código único con sufijo aleatorio
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

-- 7. FUNCIÓN PRINCIPAL PARA MANEJAR NUEVOS USUARIOS
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
    -- Log del inicio del proceso
    RAISE NOTICE '[USER_REGISTRATION] Processing new user: % (email: %)', NEW.id, NEW.email;
    
    -- Extraer metadatos del usuario
    meta_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
    meta_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
    meta_phone := NEW.raw_user_meta_data->>'phone'; -- Puede ser NULL
    meta_account_type := COALESCE(NEW.raw_user_meta_data->>'account_type', 'client');
    referrer_code := NEW.raw_user_meta_data->>'referral_code'; -- OPCIONAL
    
    RAISE NOTICE '[USER_REGISTRATION] User data - Name: % %, Phone: %, Type: %, Referrer: %', 
        meta_first_name, meta_last_name, 
        COALESCE(meta_phone, 'Not provided'), 
        meta_account_type, 
        COALESCE(referrer_code, 'None');
    
    -- Generar código único para el nuevo usuario
    new_referral_code := generate_referral_code(meta_first_name, meta_last_name);
    RAISE NOTICE '[USER_REGISTRATION] Generated referral code: %', new_referral_code;
    
    -- Insertar perfil del nuevo usuario
    INSERT INTO public.profiles (
        id, 
        email, 
        first_name, 
        last_name, 
        phone, 
        account_type, 
        referral_code, 
        referred_by
    ) VALUES (
        NEW.id, 
        NEW.email, 
        NULLIF(meta_first_name, ''), -- NULL si está vacío
        NULLIF(meta_last_name, ''), -- NULL si está vacío
        NULLIF(meta_phone, ''), -- NULL si está vacío
        meta_account_type,
        new_referral_code,
        NULLIF(referrer_code, '') -- NULL si está vacío (OPCIONAL)
    );
    
    RAISE NOTICE '[USER_REGISTRATION] Profile created successfully for user: %', NEW.id;
    
    -- Procesar referido SOLO si se proporcionó un código
    IF referrer_code IS NOT NULL AND referrer_code != '' THEN
        RAISE NOTICE '[USER_REGISTRATION] Processing referral with code: %', referrer_code;
        
        -- Buscar el perfil del referente
        SELECT id INTO referrer_profile_id 
        FROM public.profiles 
        WHERE referral_code = referrer_code;
        
        IF referrer_profile_id IS NOT NULL THEN
            RAISE NOTICE '[USER_REGISTRATION] Found referrer: % for code: %', referrer_profile_id, referrer_code;
            
            -- Crear registro de referido
            INSERT INTO public.referrals (
                referrer_id, 
                referred_id, 
                referral_code, 
                status, 
                commission_earned, 
                commission_paid
            ) VALUES (
                referrer_profile_id, 
                NEW.id, 
                referrer_code, 
                'active', 
                25.00, 
                FALSE
            );
            
            RAISE NOTICE '[USER_REGISTRATION] Referral relationship created: % -> %', referrer_profile_id, NEW.id;
        ELSE
            RAISE WARNING '[USER_REGISTRATION] Referrer not found for code: %', referrer_code;
            -- No fallar el registro si el código de referido no existe
        END IF;
    ELSE
        RAISE NOTICE '[USER_REGISTRATION] No referrer code provided - direct registration';
    END IF;
    
    RAISE NOTICE '[USER_REGISTRATION] User registration completed successfully: %', NEW.id;
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '[USER_REGISTRATION] Error processing user %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
        
        -- Intentar insertar perfil básico para no fallar completamente
        BEGIN
            INSERT INTO public.profiles (id, email, first_name, last_name, referral_code) 
            VALUES (
                NEW.id, 
                NEW.email, 
                COALESCE(NULLIF(meta_first_name, ''), 'Usuario'), 
                COALESCE(NULLIF(meta_last_name, ''), 'Nuevo'), 
                'user' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT
            )
            ON CONFLICT (id) DO NOTHING;
            
            RAISE NOTICE '[USER_REGISTRATION] Fallback profile created for user: %', NEW.id;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING '[USER_REGISTRATION] Failed to create fallback profile: %', SQLERRM;
        END;
        
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

-- 11. FUNCIÓN PARA OBTENER LISTA DE REFERIDOS
CREATE OR REPLACE FUNCTION get_user_referrals(user_profile_id UUID)
RETURNS TABLE(
    referred_user_id UUID,
    referred_email TEXT,
    referred_first_name TEXT,
    referred_last_name TEXT,
    referred_phone TEXT,
    referral_date TIMESTAMP WITH TIME ZONE,
    commission_earned NUMERIC,
    commission_paid BOOLEAN,
    status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.first_name,
        p.last_name,
        p.phone,
        r.created_at,
        r.commission_earned,
        r.commission_paid,
        r.status
    FROM public.referrals r
    JOIN public.profiles p ON r.referred_id = p.id
    WHERE r.referrer_id = user_profile_id
    ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. CREAR ÍNDICES PARA OPTIMIZACIÓN
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON public.referrals(created_at);

-- 13. OTORGAR PERMISOS
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.referrals TO authenticated;
GRANT EXECUTE ON FUNCTION get_referral_stats_by_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_referral_stats(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_referrals(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_referral_code(TEXT, TEXT) TO authenticated;

-- 14. VERIFICACIÓN FINAL
DO $$
BEGIN
    RAISE NOTICE '=== FINAL SCHEMA SETUP COMPLETED ===';
    RAISE NOTICE 'Tables created: profiles (with optional phone and referred_by), referrals';
    RAISE NOTICE 'Functions created: handle_new_user, get_referral_stats_by_id, get_referral_stats, get_user_referrals, generate_referral_code';
    RAISE NOTICE 'Triggers created: on_auth_user_created, handle_profiles_updated_at, handle_referrals_updated_at';
    RAISE NOTICE 'Indexes and permissions configured';
    RAISE NOTICE 'Key features:';
    RAISE NOTICE '- Phone number storage (optional)';
    RAISE NOTICE '- Referral system (optional)';
    RAISE NOTICE '- Automatic referral code generation';
    RAISE NOTICE '- Complete referral tracking';
    RAISE NOTICE '- Robust error handling';
END $$;
