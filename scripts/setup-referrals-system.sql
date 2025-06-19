-- Add referral columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by TEXT;

-- Create referrals table for tracking referral relationships
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  commission_earned DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- Enable RLS on referrals table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Create policies for referrals table
CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (
    auth.uid() = referrer_id OR 
    auth.uid() = referred_id
  );

CREATE POLICY "Users can insert own referrals" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update own referrals" ON public.referrals
  FOR UPDATE USING (auth.uid() = referrer_id);

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(first_name TEXT, last_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base code from first and last name
  base_code := LOWER(COALESCE(first_name, '')) || LOWER(COALESCE(last_name, ''));
  
  -- Remove special characters and spaces
  base_code := REGEXP_REPLACE(base_code, '[^a-z0-9]', '', 'g');
  
  -- Ensure minimum length
  IF LENGTH(base_code) < 3 THEN
    base_code := base_code || 'user';
  END IF;
  
  -- Try to find unique code
  LOOP
    IF counter = 0 THEN
      final_code := base_code || FLOOR(RANDOM() * 1000)::TEXT;
    ELSE
      final_code := base_code || FLOOR(RANDOM() * 9999)::TEXT;
    END IF;
    
    -- Check if code exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = final_code) THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    
    -- Prevent infinite loop
    IF counter > 100 THEN
      final_code := base_code || EXTRACT(EPOCH FROM NOW())::TEXT;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- Update the handle_new_user function to include referral logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  ref_code TEXT;
  referrer_profile_id UUID;
BEGIN
  -- Generate referral code for new user
  ref_code := generate_referral_code(
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  
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
    NEW.raw_user_meta_data->>'  'client'),
    ref_code,
    NEW.raw_user_meta_data->>'referral_code'
  );
  
  -- If user was referred by someone, create referral relationship
  IF NEW.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
    -- Find the referrer by their referral code
    SELECT id INTO referrer_profile_id 
    FROM public.profiles 
    WHERE referral_code = NEW.raw_user_meta_data->>'referral_code';
    
    -- Create referral record if referrer exists
    IF referrer_profile_id IS NOT NULL THEN
      INSERT INTO public.referrals (
        referrer_id,
        referred_id,
        referral_code,
        status,
        commission_earned
      ) VALUES (
        referrer_profile_id,
        NEW.id,
        NEW.raw_user_meta_data->>'referral_code',
        'active',
        25.00
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get referral stats for a user
CREATE OR REPLACE FUNCTION get_referral_stats(user_id UUID)
RETURNS TABLE (
  total_referrals INTEGER,
  active_referrals INTEGER,
  total_earnings DECIMAL,
  monthly_earnings DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_referrals,
    COUNT(CASE WHEN r.status = 'active' THEN 1 END)::INTEGER as active_referrals,
    COALESCE(SUM(r.commission_earned), 0)::DECIMAL as total_earnings,
    COALESCE(SUM(CASE 
      WHEN r.created_at >= DATE_TRUNC('month', CURRENT_DATE) 
      THEN r.commission_earned 
      ELSE 0 
    END), 0)::DECIMAL as monthly_earnings
  FROM public.referrals r
  WHERE r.referrer_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at on referrals
CREATE TRIGGER handle_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON public.referrals(created_at);

-- Insert sample referral data (optional)
-- This is just for testing purposes
INSERT INTO public.referrals (referrer_id, referred_id, referral_code, status, commission_earned)
SELECT 
  p1.id as referrer_id,
  p2.id as referred_id,
  p1.referral_code,
  'active',
  25.00
FROM public.profiles p1
CROSS JOIN public.profiles p2
WHERE p1.id != p2.id 
  AND p1.account_type = 'client'
  AND p2.account_type = 'client'
  AND NOT EXISTS (
    SELECT 1 FROM public.referrals r 
    WHERE r.referrer_id = p1.id AND r.referred_id = p2.id
  )
LIMIT 5;
