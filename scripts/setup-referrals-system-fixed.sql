-- Create referrals table for tracking referral relationships
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  referred_email TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'signed_up', 'converted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on referrals table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Create policies for referrals table
DROP POLICY IF EXISTS "Users can view their own referrals." ON public.referrals;
DROP POLICY IF EXISTS "Users can insert new referrals." ON public.referrals;

CREATE POLICY "Users can view their own referrals." ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can insert new referrals." ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Create function to get referral stats for a user
CREATE OR REPLACE FUNCTION get_referral_stats(user_referral_code TEXT)
RETURNS TABLE (
  total_referrals INTEGER,
  active_referrals INTEGER,
  total_earnings DECIMAL,
  monthly_earnings DECIMAL
) AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get user ID from referral code
  SELECT id INTO user_id 
  FROM public.profiles 
  WHERE referral_code = user_referral_code;
  
  -- If user not found, return zeros
  IF user_id IS NULL THEN
    RETURN QUERY SELECT 0, 0, 0.00::DECIMAL, 0.00::DECIMAL;
    RETURN;
  END IF;
  
  -- Return stats
  RETURN QUERY
  SELECT 
    COALESCE(COUNT(*)::INTEGER, 0) as total_referrals,
    COALESCE(COUNT(CASE WHEN r.status = 'active' THEN 1 END)::INTEGER, 0) as active_referrals,
    COALESCE(SUM(r.commission_earned), 0.00)::DECIMAL as total_earnings,
    COALESCE(SUM(CASE 
      WHEN r.created_at >= DATE_TRUNC('month', CURRENT_DATE) 
      THEN r.commission_earned 
      ELSE 0 
    END), 0.00)::DECIMAL as monthly_earnings
  FROM public.referrals r
  WHERE r.referrer_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get referral count by referral code
CREATE OR REPLACE FUNCTION get_referral_count_by_code(user_referral_code TEXT)
RETURNS INTEGER AS $$
DECLARE
  referral_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO referral_count
  FROM public.profiles 
  WHERE referred_by = user_referral_code;
  
  RETURN COALESCE(referral_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at on referrals
DROP TRIGGER IF EXISTS handle_referrals_updated_at ON public.referrals;
CREATE TRIGGER handle_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_email ON public.referrals(referred_email);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON public.referrals(created_at);

-- Create function to safely create referral relationship
CREATE OR REPLACE FUNCTION create_referral_relationship(
  referrer_code TEXT,
  referred_email TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  referrer_id UUID;
  existing_referral UUID;
BEGIN
  -- Find referrer by code
  SELECT id INTO referrer_id 
  FROM public.profiles 
  WHERE referral_code = referrer_code;
  
  -- If referrer not found, return false
  IF referrer_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if referral relationship already exists
  SELECT id INTO existing_referral
  FROM public.referrals
  WHERE referrer_id = referrer_id AND referred_email = referred_email;
  
  -- If relationship already exists, return true
  IF existing_referral IS NOT NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Create new referral relationship
  INSERT INTO public.referrals (
    referrer_id,
    referred_email,
    status
  ) VALUES (
    referrer_id,
    referred_email,
    'pending'
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating referral relationship: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
