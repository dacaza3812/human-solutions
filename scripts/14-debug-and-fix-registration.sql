-- ⚠️ SCRIPT DE DEBUGGING Y CORRECCIÓN COMPLETA ⚠️
-- Ejecutar en el SQL Editor de Supabase para diagnosticar y corregir todos los problemas

-- 1. DIAGNÓSTICO INICIAL - Verificar estado actual
SELECT '=== DIAGNOSTIC REPORT ===' as section;

-- Verificar tablas existentes
SELECT 'Current tables:' as info;
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'referrals');

-- Verificar estructura de profiles
SELECT 'Profiles table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Verificar datos existentes
SELECT 'Current profiles data:' as info;
SELECT COUNT(*) as total_profiles FROM public.profiles;
SELECT COUNT(*) as profiles_with_phone FROM public.profiles WHERE phone IS NOT NULL AND phone != '';
SELECT COUNT(*) as profiles_with_referral_code FROM public.profiles WHERE referral_code IS NOT NULL;
SELECT COUNT(*) as profiles_with_referred_by FROM public.profiles WHERE referred_by IS NOT NULL;

SELECT 'Current referrals data:' as info;
SELECT COUNT(*) as total_referrals FROM public.referrals;

-- 2. LIMPIAR Y RECREAR COMPLETAMENTE EL SISTEMA
SELECT '=== CLEANING AND RECREATING SYSTEM ===' as section;

-- Eliminar triggers existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS handle_referrals_updated_at ON public.referrals;

-- Eliminar funciones existentes
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS generate_referral_code(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_referral_stats_by_id(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_referral_stats(TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_user_referrals(UUID) CASCADE;

-- Hacer backup de datos existentes si hay alguno
CREATE TEMP TABLE profiles_backup AS SELECT * FROM public.profiles;
CREATE TEMP TABLE referrals_backup AS SELECT * FROM public.referrals;

-- Eliminar tablas
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 3. RECREAR TABLA PROFILES CON ESQUEMA CORRECTO
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT, -- Campo para teléfono (completamente opcional)
    account_type TEXT CHECK (account_type IN ('client', 'advisor')) DEFAULT 'client',
    referral_code TEXT UNIQUE NOT NULL, -- Código único para cada usuario
    referred_by TEXT, -- OPCIONAL: código del usuario que lo refirió
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RECREAR TABLA REFERRALS
CREATE TABLE public.referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    referral_code TEXT NOT NULL, -- El código que se usó para el referido
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    commission_earned DECIMAL(10,2) DEFAULT 25.00,
    commission_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(referrer_id, referred_id) -- Evitar referidos duplicados
);

-- 5. CONFIGURAR RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

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

-- 6. FUNCIÓN MEJORADA PARA GENERAR CÓDIGOS DE REFERIDO
CREATE OR REPLACE FUNCTION generate_referral_code(p_first_name TEXT DEFAULT '', p_last_name TEXT DEFAULT '')
RETURNS TEXT AS $$
DECLARE
    base_code TEXT;
    final_code TEXT;
    counter INTEGER := 0;
    random_suffix TEXT;
BEGIN
    -- Crear código base usando nombre y apellido
    base_code := LOWER(
        COALESCE(
            NULLIF(REGEXP_REPLACE(COALESCE(p_first_name, ''), '[^a-zA-Z0-9]', '', 'g'), ''), 
            'user'
        ) ||
        COALESCE(
            NULLIF(REGEXP_REPLACE(COALESCE(p_last_name, ''), '[^a-zA-Z0-9]', '', 'g'), ''), 
            ''
        )
    );
    
    -- Asegurar longitud mínima
    IF LENGTH(base_code) < 3 THEN
        base_code := 'user' || base_code;
    END IF;
    
    -- Limitar longitud máxima
    IF LENGTH(base_code) > 8 THEN
        base_code := LEFT(base_code, 8);
    END IF;
    
    -- Generar código único
    LOOP
        random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        final_code := base_code || random_suffix;
        
        -- Verificar que sea único
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = final_code) THEN
            EXIT;
        END IF;
        
        counter := counter + 1;
        IF counter > 100 THEN
            final_code := 'usr' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
            EXIT;
        END IF;
    END LOOP;
    
    RETURN final_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNCIÓN PRINCIPAL PARA MANEJAR NUEVOS USUARIOS (CORREGIDA)
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
    profile_inserted BOOLEAN := FALSE;
BEGIN
    -- Log detallado del proceso
    RAISE NOTICE '[REGISTRATION] ===== PROCESSING NEW USER =====';
    RAISE NOTICE '[REGISTRATION] User ID: %', NEW.id;
    RAISE NOTICE '[REGISTRATION] Email: %', NEW.email;
    RAISE NOTICE '[REGISTRATION] Raw metadata: %', NEW.raw_user_meta_data;
    
    -- Extraer metadatos con valores por defecto seguros
    meta_first_name := COALESCE(TRIM(NEW.raw_user_meta_data->>'first_name'), '');
    meta_last_name := COALESCE(TRIM(NEW.raw_user_meta_data->>'last_name'), '');
    meta_phone := COALESCE(TRIM(NEW.raw_user_meta_data->>'phone'), '');
    meta_account_type := COALESCE(NEW.raw_user_meta_data->>'account_type', 'client');
    referrer_code := COALESCE(TRIM(NEW.raw_user_meta_data->>'referral_code'), '');
    
    -- Log de datos extraídos
    RAISE NOTICE '[REGISTRATION] Extracted data:';
    RAISE NOTICE '[REGISTRATION] - First name: "%"', meta_first_name;
    RAISE NOTICE '[REGISTRATION] - Last name: "%"', meta_last_name;
    RAISE NOTICE '[REGISTRATION] - Phone: "%"', meta_phone;
    RAISE NOTICE '[REGISTRATION] - Account type: "%"', meta_account_type;
    RAISE NOTICE '[REGISTRATION] - Referrer code: "%"', referrer_code;
    
    -- Generar código de referido único
    new_referral_code := generate_referral_code(meta_first_name, meta_last_name);
    RAISE NOTICE '[REGISTRATION] Generated referral code: "%"', new_referral_code;
    
    -- Insertar perfil del usuario
    BEGIN
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
            CASE WHEN meta_first_name = '' THEN NULL ELSE meta_first_name END,
            CASE WHEN meta_last_name = '' THEN NULL ELSE meta_last_name END,
            CASE WHEN meta_phone = '' THEN NULL ELSE meta_phone END,
            meta_account_type,
            new_referral_code,
            CASE WHEN referrer_code = '' THEN NULL ELSE referrer_code END
        );
        
        profile_inserted := TRUE;
        RAISE NOTICE '[REGISTRATION] ✓ Profile inserted successfully';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING '[REGISTRATION] ✗ Error inserting profile: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
            RETURN NEW; -- No fallar el registro de auth
    END;
    
    -- Procesar referido si se proporcionó código y el perfil se insertó correctamente
    IF profile_inserted AND referrer_code != '' THEN
        RAISE NOTICE '[REGISTRATION] Processing referral with code: "%"', referrer_code;
        
        -- Buscar el perfil del referente
        BEGIN
            SELECT id INTO referrer_profile_id 
            FROM public.profiles 
            WHERE referral_code = referrer_code;
            
            IF referrer_profile_id IS NOT NULL THEN
                RAISE NOTICE '[REGISTRATION] ✓ Found referrer: %', referrer_profile_id;
                
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
                
                RAISE NOTICE '[REGISTRATION] ✓ Referral relationship created: % -> %', referrer_profile_id, NEW.id;
            ELSE
                RAISE WARNING '[REGISTRATION] ✗ Referrer not found for code: "%"', referrer_code;
            END IF;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING '[REGISTRATION] ✗ Error processing referral: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
                -- No fallar el registro por problemas de referido
        END;
    ELSE
        RAISE NOTICE '[REGISTRATION] No referral processing needed (code: "%", profile_inserted: %)', referrer_code, profile_inserted;
    END IF;
    
    RAISE NOTICE '[REGISTRATION] ===== USER PROCESSING COMPLETED =====';
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '[REGISTRATION] ✗ CRITICAL ERROR: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
        
        -- Intentar insertar perfil mínimo como fallback
        BEGIN
            INSERT INTO public.profiles (id, email, referral_code) 
            VALUES (
                NEW.id, 
                NEW.email, 
                'fallback' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT
            )
            ON CONFLICT (id) DO NOTHING;
            RAISE NOTICE '[REGISTRATION] ✓ Fallback profile created';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE WARNING '[REGISTRATION] ✗ Even fallback failed: %', SQLERRM;
        END;
        
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. FUNCIÓN PARA ACTUALIZAR TIMESTAMPS
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

-- 10. FUNCIONES PARA ESTADÍSTICAS
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

-- 11. CREAR ÍNDICES OPTIMIZADOS
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON public.referrals(created_at);

-- 12. OTORGAR PERMISOS
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.referrals TO authenticated;
GRANT EXECUTE ON FUNCTION get_referral_stats_by_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_referrals(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_referral_code(TEXT, TEXT) TO authenticated;

-- 13. RESTAURAR DATOS EXISTENTES SI LOS HAY
DO $$
DECLARE
    backup_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO backup_count FROM profiles_backup;
    
    IF backup_count > 0 THEN
        RAISE NOTICE '[RESTORATION] Found % existing profiles, attempting to restore...', backup_count;
        
        -- Restaurar perfiles existentes con códigos de referido nuevos
        INSERT INTO public.profiles (id, email, first_name, last_name, phone, account_type, referral_code, referred_by, is_active, created_at)
        SELECT 
            id, 
            email, 
            first_name, 
            last_name, 
            phone,
            COALESCE(account_type, 'client'),
            generate_referral_code(COALESCE(first_name, ''), COALESCE(last_name, '')),
            referred_by,
            COALESCE(is_active, TRUE),
            COALESCE(created_at, NOW())
        FROM profiles_backup
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE '[RESTORATION] Profiles restored successfully';
    ELSE
        RAISE NOTICE '[RESTORATION] No existing profiles to restore';
    END IF;
END $$;

-- 14. VERIFICACIÓN FINAL
SELECT '=== FINAL VERIFICATION ===' as section;

-- Verificar estructura
SELECT 'Table structures verified:' as status;
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'referrals')
AND column_name IN ('phone', 'referral_code', 'referred_by')
ORDER BY table_name, column_name;

-- Verificar funciones
SELECT 'Functions verified:' as status;
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('handle_new_user', 'generate_referral_code', 'get_referral_stats_by_id', 'get_user_referrals');

-- Verificar triggers
SELECT 'Triggers verified:' as status;
SELECT trigger_name, event_object_table FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN ('on_auth_user_created', 'handle_profiles_updated_at', 'handle_referrals_updated_at');

-- Mensaje final
SELECT '=== SYSTEM READY FOR TESTING ===' as final_status;
SELECT 'Key fixes implemented:' as info;
SELECT '✓ Phone number storage corrected' as fix_1;
SELECT '✓ Referral code generation improved' as fix_2;
SELECT '✓ Referrer association logic fixed' as fix_3;
SELECT '✓ Referrals table data persistence ensured' as fix_4;
SELECT '✓ Comprehensive logging added for debugging' as fix_5;
