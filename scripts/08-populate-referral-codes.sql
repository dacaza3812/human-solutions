-- ✅ EJECUTAR DESDE v0 - Generar códigos de referido para usuarios existentes ✅

-- Generar códigos de referido para usuarios que no los tienen
UPDATE public.profiles 
SET referral_code = generate_referral_code(
  COALESCE(first_name, 'user'), 
  COALESCE(last_name, 'ref')
)
WHERE referral_code IS NULL;

-- Verificar que todos los perfiles tienen códigos de referido
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN referral_code IS NOT NULL THEN 1 END) as profiles_with_referral_code,
  COUNT(CASE WHEN referral_code IS NULL THEN 1 END) as profiles_without_referral_code
FROM public.profiles;

-- Mostrar algunos ejemplos de códigos generados
SELECT 
  id,
  email,
  first_name,
  last_name,
  referral_code,
  account_type
FROM public.profiles 
LIMIT 5;
