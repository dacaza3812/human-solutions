-- ✅ ESTE SCRIPT SE PUEDE EJECUTAR DESDE v0 PARA VERIFICAR ✅

-- Verify tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'referrals');

-- Verify functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'handle_new_user', 
    'generate_referral_code', 
    'get_referral_stats',
    'get_referral_stats_by_id',
    'create_referral_relationship',
    'get_referral_count_by_code',
    'mark_commission_paid',
    'get_unpaid_commissions'
  );

-- Verify triggers exist
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  OR (trigger_schema = 'auth' AND trigger_name = 'on_auth_user_created');

-- Test referral code generation
SELECT generate_referral_code('Test', 'User') as sample_referral_code;

-- Check profiles table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check referrals table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'referrals'
ORDER BY ordinal_position;
