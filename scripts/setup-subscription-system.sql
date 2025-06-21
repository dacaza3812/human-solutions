-- Create plans table
CREATE TABLE IF NOT EXISTS public.plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_interval TEXT NOT NULL DEFAULT 'month',
  features JSONB,
  stripe_price_id TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert predefined plans
INSERT INTO public.plans (name, description, price, features, is_active) VALUES
('Standard', 'Basic plan with individual consultations', 49.99, '{"consultations": 3, "duration": "1 hour each", "support": "email", "priority": "standard"}', true),
('Premium', 'Premium plan with multiple consultations and priority support', 149.99, '{"consultations": 10, "duration": "1 hour each", "support": "priority", "follow_up": true, "priority": "high"}', true),
('Collaborative', 'Collaborative plan for teams and enterprises', 299.99, '{"consultations": "unlimited", "duration": "flexible", "support": "dedicated", "team_access": true, "custom_reports": true, "priority": "enterprise"}', true);

-- Add subscription columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan_id INTEGER REFERENCES public.plans(id),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing')),
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_cancelled_at TIMESTAMP WITH TIME ZONE;

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id INTEGER NOT NULL REFERENCES public.plans(id),
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')),
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create triggers for updated_at
CREATE TRIGGER handle_plans_updated_at 
  BEFORE UPDATE ON public.plans 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_payments_updated_at 
  BEFORE UPDATE ON public.payments 
  FOR EACH ROW 
  EXECUTE FUNCTION handle_updated_at();

-- Function to get subscription statistics (for advisors)
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
$$ LANGUAGE plpgsql;

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
$$ LANGUAGE plpgsql;
