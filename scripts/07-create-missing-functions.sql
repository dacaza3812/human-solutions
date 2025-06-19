-- ✅ EJECUTAR DESDE v0 - Crear funciones faltantes ✅

-- Crear función para generar códigos de referido
CREATE OR REPLACE FUNCTION generate_referral_code(first_name TEXT DEFAULT '', last_name TEXT DEFAULT '')
RETURNS TEXT AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base code from first and last name, with fallbacks
  base_code := LOWER(COALESCE(NULLIF(first_name, ''), 'user')) || 
               LOWER(COALESCE(NULLIF(last_name, ''), 'ref'));
  
  -- Remove special characters and spaces
  base_code := REGEXP_REPLACE(base_code, '[^a-z0-9]', '', 'g');
  
  -- Ensure minimum length
  IF LENGTH(base_code) < 3 THEN
    base_code := 'user' || base_code;
  END IF;
  
  -- Limit length to prevent overly long codes
  IF LENGTH(base_code) > 10 THEN
    base_code := LEFT(base_code, 10);
  END IF;
  
  -- Try to find unique code
  LOOP
    final_code := base_code || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
    
    -- Check if code exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = final_code) THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    
    -- Prevent infinite loop
    IF counter > 100 THEN
      final_code := 'user' || EXTRACT(EPOCH FROM NOW())::TEXT;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear función para manejar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para updated_at si no existe
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION generate_referral_code(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO authenticated;
