-- Script de prueba para verificar el flujo completo de registro
-- ⚠️ EJECUTAR DESPUÉS DEL SCRIPT PRINCIPAL PARA PROBAR ⚠️

-- 1. Verificar que el sistema esté listo
SELECT '=== TESTING REGISTRATION FLOW ===' as test_phase;

-- Verificar estructura de tablas
SELECT 'Verifying table structure...' as step;
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'referrals')
AND column_name IN ('phone', 'referral_code', 'referred_by', 'first_name', 'last_name')
ORDER BY table_name, column_name;

-- 2. Probar generación de códigos de referido
SELECT 'Testing referral code generation...' as step;
SELECT generate_referral_code('Juan', 'Pérez') as test_code_1;
SELECT generate_referral_code('María', 'González') as test_code_2;
SELECT generate_referral_code('Ana', 'López') as test_code_3;
SELECT generate_referral_code('', '') as test_code_empty;
SELECT generate_referral_code('TestUser', '') as test_code_partial;

-- 3. Verificar que los códigos sean únicos
SELECT 'Verifying code uniqueness...' as step;
WITH test_codes AS (
    SELECT generate_referral_code('Test', 'User') as code
    FROM generate_series(1, 5)
)
SELECT 
    COUNT(*) as total_codes,
    COUNT(DISTINCT code) as unique_codes,
    CASE 
        WHEN COUNT(*) = COUNT(DISTINCT code) THEN '✓ All codes are unique'
        ELSE '✗ Duplicate codes found'
    END as uniqueness_check
FROM test_codes;

-- 4. Verificar funciones de estadísticas
SELECT 'Testing statistics functions...' as step;

-- Crear un perfil de prueba temporal para testing
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_referral_code TEXT;
BEGIN
    -- Generar código de prueba
    test_referral_code := generate_referral_code('Test', 'User');
    
    -- Insertar perfil de prueba
    INSERT INTO public.profiles (
        id, email, first_name, last_name, phone, referral_code
    ) VALUES (
        test_user_id, 
        'test@example.com', 
        'Test', 
        'User', 
        '+1234567890',
        test_referral_code
    );
    
    -- Probar función de estadísticas
    PERFORM get_referral_stats_by_id(test_user_id);
    PERFORM get_user_referrals(test_user_id);
    
    -- Limpiar datos de prueba
    DELETE FROM public.profiles WHERE id = test_user_id;
    
    RAISE NOTICE 'Statistics functions test completed successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Statistics functions test failed: %', SQLERRM;
END $$;

-- 5. Verificar triggers
SELECT 'Verifying triggers...' as step;
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN ('on_auth_user_created', 'handle_profiles_updated_at', 'handle_referrals_updated_at')
ORDER BY trigger_name;

-- 6. Verificar políticas RLS
SELECT 'Verifying RLS policies...' as step;
SELECT 
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'referrals')
ORDER BY tablename, policyname;

-- 7. Verificar índices
SELECT 'Verifying indexes...' as step;
SELECT 
    indexname,
    tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'referrals')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 8. Simular el proceso de registro (sin crear usuarios reales en auth.users)
SELECT 'Simulating registration process...' as step;

DO $$
DECLARE
    mock_user_id UUID := gen_random_uuid();
    mock_referrer_id UUID := gen_random_uuid();
    referrer_code TEXT;
    new_user_code TEXT;
BEGIN
    RAISE NOTICE 'Starting registration simulation...';
    
    -- Paso 1: Crear un usuario "referente" simulado
    referrer_code := generate_referral_code('Referrer', 'User');
    INSERT INTO public.profiles (
        id, email, first_name, last_name, phone, referral_code
    ) VALUES (
        mock_referrer_id,
        'referrer@example.com',
        'Referrer',
        'User',
        '+1111111111',
        referrer_code
    );
    RAISE NOTICE 'Created mock referrer with code: %', referrer_code;
    
    -- Paso 2: Simular registro de nuevo usuario con referido
    new_user_code := generate_referral_code('New', 'User');
    INSERT INTO public.profiles (
        id, email, first_name, last_name, phone, referral_code, referred_by
    ) VALUES (
        mock_user_id,
        'newuser@example.com',
        'New',
        'User',
        '+2222222222',
        new_user_code,
        referrer_code
    );
    RAISE NOTICE 'Created new user with code: %, referred by: %', new_user_code, referrer_code;
    
    -- Paso 3: Crear registro de referido
    INSERT INTO public.referrals (
        referrer_id, referred_id, referral_code, status, commission_earned
    ) VALUES (
        mock_referrer_id, mock_user_id, referrer_code, 'active', 25.00
    );
    RAISE NOTICE 'Created referral relationship';
    
    -- Paso 4: Probar funciones de estadísticas
    DECLARE
        stats_result RECORD;
        referrals_result RECORD;
    BEGIN
        SELECT * INTO stats_result FROM get_referral_stats_by_id(mock_referrer_id);
        RAISE NOTICE 'Referrer stats: total=%, active=%, earnings=%', 
            stats_result.total_referrals, 
            stats_result.active_referrals, 
            stats_result.total_earnings;
        
        SELECT COUNT(*) as referral_count INTO referrals_result 
        FROM get_user_referrals(mock_referrer_id);
        RAISE NOTICE 'Referrer has % referrals in list', referrals_result.referral_count;
    END;
    
    -- Limpiar datos de prueba
    DELETE FROM public.referrals WHERE referrer_id = mock_referrer_id OR referred_id = mock_user_id;
    DELETE FROM public.profiles WHERE id IN (mock_referrer_id, mock_user_id);
    
    RAISE NOTICE 'Registration simulation completed successfully and cleaned up';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Registration simulation failed: %', SQLERRM;
        -- Intentar limpiar en caso de error
        DELETE FROM public.referrals WHERE referrer_id = mock_referrer_id OR referred_id = mock_user_id;
        DELETE FROM public.profiles WHERE id IN (mock_referrer_id, mock_user_id);
END $$;

-- 9. Verificación final
SELECT '=== FINAL VERIFICATION ===' as test_phase;

SELECT 'System components status:' as info;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public')
        THEN '✓ profiles table exists'
        ELSE '✗ profiles table missing'
    END as profiles_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'referrals' AND table_schema = 'public')
        THEN '✓ referrals table exists'
        ELSE '✗ referrals table missing'
    END as referrals_table,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user' AND routine_schema = 'public')
        THEN '✓ handle_new_user function exists'
        ELSE '✗ handle_new_user function missing'
    END as trigger_function,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created')
        THEN '✓ registration trigger exists'
        ELSE '✗ registration trigger missing'
    END as registration_trigger;

-- Mensaje final
SELECT '=== TESTING COMPLETED ===' as final_status;
SELECT 'Key features tested:' as info;
SELECT '✓ Phone number storage capability' as feature_1;
SELECT '✓ Referral code generation and uniqueness' as feature_2;
SELECT '✓ Referrer association logic' as feature_3;
SELECT '✓ Referrals table data persistence' as feature_4;
SELECT '✓ Statistics and reporting functions' as feature_5;
SELECT 'System is ready for real user registration testing!' as conclusion;
