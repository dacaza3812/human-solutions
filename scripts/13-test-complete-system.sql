-- Script de prueba para verificar el sistema completo
-- ⚠️ EJECUTAR DESPUÉS DEL SCRIPT PRINCIPAL ⚠️

-- 1. Verificar que las tablas existen
SELECT 'Checking tables...' as status;

SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'referrals')
ORDER BY table_name, ordinal_position;

-- 2. Verificar que las funciones existen
SELECT 'Checking functions...' as status;

SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'handle_new_user', 
    'generate_referral_code', 
    'get_referral_stats_by_id', 
    'get_referral_stats',
    'get_user_referrals'
);

-- 3. Verificar que los triggers existen
SELECT 'Checking triggers...' as status;

SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN ('on_auth_user_created', 'handle_profiles_updated_at', 'handle_referrals_updated_at');

-- 4. Verificar que los índices existen
SELECT 'Checking indexes...' as status;

SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'referrals')
ORDER BY tablename, indexname;

-- 5. Probar la función de generación de códigos
SELECT 'Testing referral code generation...' as status;

SELECT generate_referral_code('Juan', 'Pérez') as sample_code_1;
SELECT generate_referral_code('María', 'González') as sample_code_2;
SELECT generate_referral_code('', '') as sample_code_empty;

-- 6. Verificar políticas RLS
SELECT 'Checking RLS policies...' as status;

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'referrals')
ORDER BY tablename, policyname;

-- 7. Mensaje final
SELECT '=== SYSTEM VERIFICATION COMPLETED ===' as status;
SELECT 'All components should be listed above.' as note;
SELECT 'If any component is missing, re-run the main setup script.' as instruction;
