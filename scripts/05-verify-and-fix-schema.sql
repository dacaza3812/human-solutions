-- ✅ EJECUTAR DESDE v0 - Verificar y corregir esquema ✅

-- Verificar estructura actual de la tabla profiles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Verificar si las funciones existen
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'generate_referral_code',
    'handle_new_user',
    'get_referral_stats_by_id'
  );

-- Verificar si los triggers existen
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_schema IN ('public', 'auth')
  AND trigger_name IN ('on_auth_user_created', 'handle_profiles_updated_at');
