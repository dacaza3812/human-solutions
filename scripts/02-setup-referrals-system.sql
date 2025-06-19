-- ✅ ESTE SCRIPT SE PUEDE EJECUTAR DESDE v0 ✅

-- Create referrals table for tracking referral relationships
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive')),
  commission_earned DECIMAL(10,2) DEFAULT 25.00,
  commission_paid BOOLEAN DEFAULT FALSE,
  payment_date TIMESTAMP WITH TIME ZONE,
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

CREATE POLICY "System can insert referrals" ON public.referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own referrals" ON public.referrals
  FOR UPDATE USING (auth.uid() = referrer_id);

-- Create function to get referral stats for a user by their profile ID
CREATE OR REPLACE FUNCTION get_referral_stats_by_id(user_profile_id UUID)
RETURNS TABLE (
  total_referrals INTEGER,
  active_referrals INTEGER,
  total_earnings DECIMAL,
  monthly_earnings DECIMAL
) AS $$
BEGIN
  -- Return stats for the given user ID
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
  WHERE r.referrer_id = user_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get referral stats for a user by referral code
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
  
  -- Return stats using the ID-based function
  RETURN QUERY SELECT * FROM get_referral_stats_by_id(user_id);
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

-- Create function to safely create referral relationship
CREATE OR REPLACE FUNCTION create_referral_relationship(
  referrer_code TEXT,
  referred_user_id UUID
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
  WHERE referrer_id = referrer_id AND referred_id = referred_user_id;
  
  -- If relationship already exists, return true
  IF existing_referral IS NOT NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Create new referral relationship
  INSERT INTO public.referrals (
    referrer_id,
    referred_id,
    referral_code,
    status,
    commission_earned,
    commission_paid
  ) VALUES (
    referrer_id,
    referred_user_id,
    referrer_code,
    'active',
    25.00,
    FALSE
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating referral relationship: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark commission as paid
CREATE OR REPLACE FUNCTION mark_commission_paid(referral_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.referrals 
  SET 
    commission_paid = TRUE,
    payment_date = NOW(),
    updated_at = NOW()
  WHERE id = referral_id;
  
  RETURN FOUND;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error marking commission as paid: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unpaid commissions for a user
CREATE OR REPLACE FUNCTION get_unpaid_commissions(user_profile_id UUID)
RETURNS TABLE (
  referral_id UUID,
  referred_user_email TEXT,
  commission_amount DECIMAL,
  created_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id as referral_id,
    p.email as referred_user_email,
    r.commission_earned as commission_amount,
    r.created_at as created_date
  FROM public.referrals r
  JOIN public.profiles p ON r.referred_id = p.id
  WHERE r.referrer_id = user_profile_id 
    AND r.commission_paid = FALSE
    AND r.status = 'active'
  ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at on referrals
DROP TRIGGER IF EXISTS handle_referrals_updated_at ON public.referrals;
CREATE TRIGGER handle_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON public.referrals(created_at);
CREATE INDEX IF NOT EXISTS idx_referrals_commission_paid ON public.referrals(commission_paid);
CREATE INDEX IF NOT EXISTS idx_referrals_payment_date ON public.referrals(payment_date);
