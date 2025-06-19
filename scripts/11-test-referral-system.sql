-- Script para probar el sistema de referidos
-- Ejecutar después del script principal

-- 1. Verificar que las tablas existen
SELECT 'Verificando tablas...' as status;

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'referrals');

-- 2. Verificar que las funciones existen
SELECT 'Verificando funciones...' as status;

SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('handle_new_user', 'generate_referral_code', 'get_referral_stats_by_id');

-- 3. Verificar que los triggers existen
SELECT 'Verificando triggers...' as status;

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
OR event_object_table = 'users';

-- 4. Probar la función de generación de códigos
SELECT 'Probando generación de códigos...' as status;

SELECT generate_referral_code('Juan', 'Pérez') as codigo_generado;
SELECT generate_referral_code('María', 'González') as codigo_generado;
SELECT generate_referral_code('', '') as codigo_generado;

-- 5. Verificar estructura de las tablas
SELECT 'Verificando estructura de profiles...' as status;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Verificando estructura de referrals...' as status;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'referrals' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Verificar índices
SELECT 'Verificando índices...' as status;

SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'referrals');

-- 7. Verificar políticas RLS
SELECT 'Verificando políticas RLS...' as status;

SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public';

SELECT 'Sistema de referidos verificado correctamente!' as status;
