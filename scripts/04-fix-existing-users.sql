-- ✅ EJECUTAR DESDE v0 - Crear perfiles para usuarios existentes ✅

-- Create profiles for existing users who don't have them
INSERT INTO public.profiles (
  id,
  email,
  first_name,
  last_name,
  phone,
  account_type,
  referral_code,
  referred_by,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', 'Usuario'),
  COALESCE(au.raw_user_meta_data->>'last_name', 'Nuevo'),
  au.raw_user_meta_data->>'phone',
  COALESCE(au.raw_user_meta_data->>'account_type', 'client'),
  generate_referral_code(
    COALESCE(au.raw_user_meta_data->>'first_name', 'Usuario'),
    COALESCE(au.raw_user_meta_data->>'last_name', 'Nuevo')
  ),
  au.raw_user_meta_data->>'referral_code',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
  last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
  phone = COALESCE(EXCLUDED.phone, profiles.phone),
  account_type = COALESCE(EXCLUDED.account_type, profiles.account_type),
  referral_code = COALESCE(profiles.referral_code, EXCLUDED.referral_code),
  updated_at = NOW();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_referral_stats(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_referral_stats_by_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_referral_count_by_code(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_referral_relationship(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_commission_paid(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unpaid_commissions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_referral_code(TEXT, TEXT) TO authenticated;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE ON public.referrals TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verify profiles were created
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN referral_code IS NOT NULL THEN 1 END) as profiles_with_referral_code,
  COUNT(CASE WHEN account_type = 'client' THEN 1 END) as client_profiles,
  COUNT(CASE WHEN account_type = 'advisor' THEN 1 END) as advisor_profiles
FROM public.profiles;
