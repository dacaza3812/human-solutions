-- =================================================================================================
-- Supabase Project Setup Script
-- This script sets up a comprehensive Supabase project from scratch, including:
-- 1. Authentication and User Profiles
-- 2. Referral System
-- 3. Subscription Management (Plans and Payments)
-- 4. Data Integrity (Triggers, Indexes, Constraints)
-- 5. Security (Row Level Security - RLS)
--
-- Designed to be executed in a clean Supabase project environment.
-- =================================================================================================

-- Set search path for convenience
SET search_path TO public, auth;

-- =================================================================================================
-- 1. Utility Functions
-- =================================================================================================

-- Function to update 'updated_at' timestamp automatically
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =================================================================================================
-- 2. Authentication and User Profiles
--    - Extends auth.users with a public.profiles table
--    - Handles new user creation and assigns a referral code
-- =================================================================================================

-- Enable Row Level Security on auth.users (already enabled by default in new projects, but good to ensure)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  account_type TEXT CHECK (account_type IN ('client', 'advisor')) DEFAULT 'client',
  referral_code TEXT UNIQUE, -- Unique code for this user to refer others
  referred_by TEXT,          -- Referral code of the user who referred this user
  stripe_customer_id TEXT UNIQUE, -- Stripe Customer ID for subscription management
  stripe_subscription_id TEXT UNIQUE, -- Current active Stripe Subscription ID
  plan_id INTEGER,           -- Foreign key to public.plans
  subscription_status TEXT CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing')),
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  subscription_cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to generate a unique referral code based on name
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
      final_code := 'user' || EXTRACT(EPOCH FROM NOW())::TEXT; -- Fallback to timestamp if many collisions
      EXIT;
    END IF;
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user creation in profiles table
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
      -- Check if referrals table exists before inserting (redundant if script runs sequentially, but safe)
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
          'active', -- Default status, can be 'pending' until first payment
          25.00     -- Default commission, adjust as needed
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

-- Trigger for new user creation (after auth.users insert)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updating 'updated_at' on profiles table
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for profiles table for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);

-- =================================================================================================
-- 3. Referral System
--    - Table to track referral relationships
--    - Functions to get referral statistics and create relationships
-- =================================================================================================

-- Create referrals table for tracking referral relationships
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL, -- The code used by the referrer
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive')),
  commission_earned DECIMAL(10,2) DEFAULT 25.00,
  commission_paid BOOLEAN DEFAULT FALSE,
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id) -- Ensure a referrer can only refer a user once
);

-- Enable RLS on referrals table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Policies for referrals table
DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;
DROP POLICY IF EXISTS "System can insert referrals" ON public.referrals;
DROP POLICY IF EXISTS "Users can update own referrals" ON public.referrals;

CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (
    auth.uid() = referrer_id OR 
    auth.uid() = referred_id
  );

-- Allow system (e.g., handle_new_user trigger) to insert referrals
CREATE POLICY "System can insert referrals" ON public.referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own referrals" ON public.referrals
  FOR UPDATE USING (auth.uid() = referrer_id);

-- Function to get referral stats for a user by their referral code
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

-- Function to get referral count by a specific referral code (how many users used this code)
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

-- Function to safely create a referral relationship (callable from backend)
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
  
  -- If relationship already exists, return true (idempotent)
  IF existing_referral IS NOT NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Create new referral relationship
  INSERT INTO public.referrals (
    referrer_id,
    referred_id,
    referral_code,
    status,
    commission_earned
  ) VALUES (
    referrer_id,
    referred_user_id,
    referrer_code,
    'active', -- Default status
    25.00     -- Default commission
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating referral relationship: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updating 'updated_at' on referrals table
DROP TRIGGER IF EXISTS handle_referrals_updated_at ON public.referrals;
CREATE TRIGGER handle_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for referrals table for better performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON public.referrals(created_at);
CREATE INDEX IF NOT EXISTS idx_referrals_commission_paid ON public.referrals(commission_paid);

-- =================================================================================================
-- 4. Subscription Management
--    - Tables for plans and payments
--    - Functions for subscription statistics and user payment history
-- =================================================================================================

-- Create plans table
CREATE TABLE IF NOT EXISTS public.plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_interval TEXT NOT NULL DEFAULT 'month', -- e.g., 'month', 'year'
  features JSONB, -- Store plan features as JSON (e.g., {"consultations": 3, "support": "email"})
  stripe_price_id TEXT UNIQUE, -- Stripe Price ID for this plan
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on plans table
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Policies for plans table (typically public read)
DROP POLICY IF EXISTS "Allow public read access to plans" ON public.plans;
CREATE POLICY "Allow public read access to plans" ON public.plans
  FOR SELECT USING (true);

-- Insert predefined plans (example data)
INSERT INTO public.plans (name, description, price, features, is_active, stripe_price_id) VALUES
('Standard', 'Basic plan with individual consultations', 49.99, '{"consultations": 3, "duration": "1 hour each", "support": "email", "priority": "standard"}', true, 'price_12345_standard') ON CONFLICT (name) DO NOTHING,
('Premium', 'Premium plan with multiple consultations and priority support', 149.99, '{"consultations": 10, "duration": "1 hour each", "support": "priority", "follow_up": true, "priority": "high"}', true, 'price_67890_premium') ON CONFLICT (name) DO NOTHING,
('Collaborative', 'Collaborative plan for teams and enterprises', 299.99, '{"consultations": "unlimited", "duration": "flexible", "support": "dedicated", "team_access": true, "custom_reports": true, "priority": "enterprise"}', true, 'price_abcde_collaborative') ON CONFLICT (name) DO NOTHING;

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES public.plans(id),
  stripe_payment_intent_id TEXT UNIQUE, -- Stripe Payment Intent ID
  stripe_invoice_id TEXT,             -- Stripe Invoice ID
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')),
  payment_method TEXT, -- e.g., 'card', 'bank_transfer'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies for payments table
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "System can insert payments" ON public.payments;

CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- Allow system (e.g., webhooks) to insert payments
CREATE POLICY "System can insert payments" ON public.payments
  FOR INSERT WITH CHECK (true);

-- Trigger for updating 'updated_at' on plans table
CREATE TRIGGER handle_plans_updated_at 
  BEFORE UPDATE ON public.plans 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

-- Trigger for updating 'updated_at' on payments table
CREATE TRIGGER handle_payments_updated_at 
  BEFORE UPDATE ON public.payments 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

-- Function to get subscription statistics (useful for advisors/admins)
CREATE OR REPLACE FUNCTION get_subscription_stats()
RETURNS TABLE (
  plan_name TEXT,
  plan_id INTEGER,
  plan_price DECIMAL,
  subscriber_count BIGINT,
  total_revenue DECIMAL,
  active_subscriptions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.name,
    p.id,
    p.price,
    COUNT(pr.id) as subscriber_count,
    COALESCE(SUM(pay.amount), 0) as total_revenue,
    COUNT(CASE WHEN pr.subscription_status = 'active' THEN 1 END) as active_subscriptions
  FROM public.plans p
  LEFT JOIN public.profiles pr ON p.id = pr.plan_id
  LEFT JOIN public.payments pay ON p.id = pay.plan_id AND pay.status = 'succeeded'
  WHERE p.is_active = true
  GROUP BY p.id, p.name, p.price
  ORDER BY p.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user payment history
CREATE OR REPLACE FUNCTION get_user_payment_history(user_uuid UUID)
RETURNS TABLE (
  payment_id INTEGER,
  plan_name TEXT,
  amount DECIMAL,
  currency TEXT,
  status TEXT,
  payment_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pay.id,
    pl.name,
    pay.amount,
    pay.currency,
    pay.status,
    pay.created_at
  FROM public.payments pay
  JOIN public.plans pl ON pay.plan_id = pl.id
  WHERE pay.user_id = user_uuid
  ORDER BY pay.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================================================
-- 5. Contact Inquiries Table
-- =================================================================================================

-- Create inquiries table
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  file_url TEXT, -- URL to uploaded file if any
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on inquiries table
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Policies for inquiries table
DROP POLICY IF EXISTS "Allow public insert for inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Advisors can view all inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Advisors can update inquiry status" ON public.inquiries;

CREATE POLICY "Allow public insert for inquiries" ON public.inquiries
  FOR INSERT WITH CHECK (true); -- Anyone can submit an inquiry

CREATE POLICY "Advisors can view all inquiries" ON public.inquiries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND account_type = 'advisor')
  );

CREATE POLICY "Advisors can update inquiry status" ON public.inquiries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND account_type = 'advisor')
  );

-- Trigger for updating 'updated_at' on inquiries table
DROP TRIGGER IF EXISTS handle_inquiries_updated_at ON public.inquiries;
CREATE TRIGGER handle_inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for inquiries table for better performance
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON public.inquiries(email);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at);

-- =================================================================================================
-- 6. Final Verification (Optional - for testing purposes)
-- =================================================================================================

-- Verify tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'referrals', 'plans', 'payments', 'inquiries');

-- Verify functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'handle_updated_at',
    'handle_new_user', 
    'generate_referral_code', 
    'get_referral_stats',
    'get_referral_count_by_code',
    'create_referral_relationship',
    'get_subscription_stats',
    'get_user_payment_history'
  );

-- Verify triggers exist
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
  AND trigger_name IN (
    'on_auth_user_created', 
    'handle_profiles_updated_at',
    'handle_referrals_updated_at',
    'handle_plans_updated_at',
    'handle_payments_updated_at',
    'handle_inquiries_updated_at'
  );

-- Test referral code generation (example)
SELECT generate_referral_code('John', 'Doe') as sample_referral_code;

-- Check profiles table structure (example)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;
