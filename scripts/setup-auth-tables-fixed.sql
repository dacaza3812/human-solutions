-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table with proper constraints
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  account_type TEXT CHECK (account_type IN ('client', 'advisor')) DEFAULT 'client',
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to generate unique referral code
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

-- Create function to handle user creation with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ref_code TEXT;
  referrer_profile_id UUID;
  user_referral_code TEXT;
BEGIN
  -- Generate referral code for new user
  ref_code := generate_referral_code(
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  
  -- Get referral code from metadata (if any)
  user_referral_code := NEW.raw_user_meta_data->>'referral_code';
  
  -- Insert profile with referral code
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    phone, 
    account_type,
    referral_code,
    referred_by
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'client'),
    ref_code,
    user_referral_code
  );
  
  -- If user was referred by someone, create referral relationship
  IF user_referral_code IS NOT NULL AND user_referral_code != '' THEN
    -- Find the referrer by their referral code
    SELECT id INTO referrer_profile_id 
    FROM public.profiles 
    WHERE referral_code = user_referral_code;
    
    -- Create referral record if referrer exists and referrals table exists
    IF referrer_profile_id IS NOT NULL THEN
      -- Check if referrals table exists before inserting
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'referrals' AND table_schema = 'public') THEN
        INSERT INTO public.referrals (
          referrer_id,
          referred_id,
          referral_code,
          status,
          commission_earned
        ) VALUES (
          referrer_profile_id,
          NEW.id,
          user_referral_code,
          'active',
          25.00
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles(account_type);
