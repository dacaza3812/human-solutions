-- Create the 'inquiries' table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    file_url TEXT,
    status TEXT DEFAULT 'new' NOT NULL, -- 'new', 'in_progress', 'resolved', 'archived'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Remove service_area and priority columns if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inquiries' AND column_name='service_area') THEN
        ALTER TABLE public.inquiries DROP COLUMN service_area;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inquiries' AND column_name='priority') THEN
        ALTER TABLE public.inquiries DROP COLUMN priority;
    END IF;
END
$$;

-- Set up Row Level Security (RLS) for 'inquiries' table
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view their own inquiries (if applicable, though inquiries are usually public submissions)
-- For advisors, they will need a policy to view all inquiries.
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.inquiries;
CREATE POLICY "Enable read access for authenticated users" ON public.inquiries
FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for advisors to view all inquiries
DROP POLICY IF EXISTS "Advisors can view all inquiries" ON public.inquiries;
CREATE POLICY "Advisors can view all inquiries" ON public.inquiries
FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'advisor'));

-- Policy for inserting new inquiries (public access for contact form)
DROP POLICY IF EXISTS "Enable insert for all users" ON public.inquiries;
CREATE POLICY "Enable insert for all users" ON public.inquiries
FOR INSERT WITH CHECK (true);

-- Policy for advisors to update inquiry status
DROP POLICY IF EXISTS "Advisors can update inquiry status" ON public.inquiries;
CREATE POLICY "Advisors can update inquiry status" ON public.inquiries
FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'advisor'))
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'advisor'));

-- Create the 'user_roles' table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'client' -- 'client', 'advisor', 'admin'
);

-- Set up RLS for 'user_roles' table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view their own role
DROP POLICY IF EXISTS "Enable read access for authenticated users on user_roles" ON public.user_roles;
CREATE POLICY "Enable read access for authenticated users on user_roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

-- Policy for admins to manage user roles (optional, for full admin panel)
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
CREATE POLICY "Admins can manage user roles" ON public.user_roles
FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'))
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'admin'));

-- Create the 'profiles' table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    avatar_url TEXT,
    full_name TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS for 'profiles' table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view their own profile
DROP POLICY IF EXISTS "Enable read access for authenticated users on profiles" ON public.profiles;
CREATE POLICY "Enable read access for authenticated users on profiles" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Policy for authenticated users to update their own profile
DROP POLICY IF EXISTS "Enable update for authenticated users on profiles" ON public.profiles;
CREATE POLICY "Enable update for authenticated users on profiles" ON public.profiles
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create the 'referrals' table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS for 'referrals' table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view their own referrals
DROP POLICY IF EXISTS "Enable read access for authenticated users on referrals" ON public.referrals;
CREATE POLICY "Enable read access for authenticated users on referrals" ON public.referrals
FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

-- Policy for inserting new referrals (e.g., when a user signs up with a code)
DROP POLICY IF EXISTS "Enable insert for all users on referrals" ON public.referrals;
CREATE POLICY "Enable insert for all users on referrals" ON public.referrals
FOR INSERT WITH CHECK (true);

-- Create the 'subscriptions' table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,
    status TEXT NOT NULL, -- e.g., 'active', 'canceled', 'past_due'
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS for 'subscriptions' table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view their own subscriptions
DROP POLICY IF EXISTS "Enable read access for authenticated users on subscriptions" ON public.subscriptions;
CREATE POLICY "Enable read access for authenticated users on subscriptions" ON public.subscriptions
FOR SELECT USING (auth.uid() = user_id);

-- Policy for authenticated users to update their own subscriptions (e.g., via webhook)
DROP POLICY IF EXISTS "Enable update for authenticated users on subscriptions" ON public.subscriptions;
CREATE POLICY "Enable update for authenticated users on subscriptions" ON public.subscriptions
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for inserting new subscriptions (e.g., via webhook)
DROP POLICY IF EXISTS "Enable insert for all users on subscriptions" ON public.subscriptions;
CREATE POLICY "Enable insert for all users on subscriptions" ON public.subscriptions
FOR INSERT WITH CHECK (true);

-- Create the 'cases' table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    advisor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Advisor can be null initially
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open' NOT NULL, -- 'open', 'in_progress', 'closed', 'pending_advisor'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS for 'cases' table
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Policy for clients to view their own cases
DROP POLICY IF EXISTS "Clients can view their own cases" ON public.cases;
CREATE POLICY "Clients can view their own cases" ON public.cases
FOR SELECT USING (auth.uid() = client_id);

-- Policy for advisors to view cases assigned to them
DROP POLICY IF EXISTS "Advisors can view assigned cases" ON public.cases;
CREATE POLICY "Advisors can view assigned cases" ON public.cases
FOR SELECT USING (auth.uid() = advisor_id);

-- Policy for clients to create cases
DROP POLICY IF EXISTS "Clients can create cases" ON public.cases;
CREATE POLICY "Clients can create cases" ON public.cases
FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Policy for advisors to update cases assigned to them
DROP POLICY IF EXISTS "Advisors can update assigned cases" ON public.cases;
CREATE POLICY "Advisors can update assigned cases" ON public.cases
FOR UPDATE USING (auth.uid() = advisor_id)
WITH CHECK (auth.uid() = advisor_id);

-- Create the 'messages' table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS for 'messages' table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy for users to view messages in their cases
DROP POLICY IF EXISTS "Users can view messages in their cases" ON public.messages;
CREATE POLICY "Users can view messages in their cases" ON public.messages
FOR SELECT USING (
    auth.uid() = sender_id OR
    auth.uid() IN (SELECT client_id FROM public.cases WHERE id = case_id) OR
    auth.uid() IN (SELECT advisor_id FROM public.cases WHERE id = case_id)
);

-- Policy for users to send messages in their cases
DROP POLICY IF EXISTS "Users can send messages in their cases" ON public.messages;
CREATE POLICY "Users can send messages in their cases" ON public.messages
FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND (
        auth.uid() IN (SELECT client_id FROM public.cases WHERE id = case_id) OR
        auth.uid() IN (SELECT advisor_id FROM public.cases WHERE id = case_id)
    )
);

-- Create the 'quotes' table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    advisor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    description TEXT,
    status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS for 'quotes' table
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Policy for clients to view quotes for their cases
DROP POLICY IF EXISTS "Clients can view quotes for their cases" ON public.quotes;
CREATE POLICY "Clients can view quotes for their cases" ON public.quotes
FOR SELECT USING (auth.uid() IN (SELECT client_id FROM public.cases WHERE id = case_id));

-- Policy for advisors to create quotes for cases they are assigned to
DROP POLICY IF EXISTS "Advisors can create quotes for assigned cases" ON public.quotes;
CREATE POLICY "Advisors can create quotes for assigned cases" ON public.quotes
FOR INSERT WITH CHECK (auth.uid() = advisor_id AND auth.uid() IN (SELECT advisor_id FROM public.cases WHERE id = case_id));

-- Policy for clients to update quote status (accept/reject)
DROP POLICY IF EXISTS "Clients can update quote status" ON public.quotes;
CREATE POLICY "Clients can update quote status" ON public.quotes
FOR UPDATE USING (auth.uid() IN (SELECT client_id FROM public.cases WHERE id = case_id))
WITH CHECK (auth.uid() IN (SELECT client_id FROM public.cases WHERE id = case_id));

-- Create the 'appointments' table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    advisor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    title TEXT,
    description TEXT,
    status TEXT DEFAULT 'scheduled' NOT NULL, -- 'scheduled', 'completed', 'canceled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS for 'appointments' table
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own appointments
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
CREATE POLICY "Users can view their own appointments" ON public.appointments
FOR SELECT USING (auth.uid() = client_id OR auth.uid() = advisor_id);

-- Policy for users to create appointments
DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments;
CREATE POLICY "Users can create appointments" ON public.appointments
FOR INSERT WITH CHECK (auth.uid() = client_id OR auth.uid() = advisor_id);

-- Policy for users to update their own appointments
DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
CREATE POLICY "Users can update their own appointments" ON public.appointments
FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = advisor_id)
WITH CHECK (auth.uid() = client_id OR auth.uid() = advisor_id);

-- Create storage bucket for inquiry files
INSERT INTO storage.buckets (id, name, public)
VALUES ('inquiry-files', 'inquiry-files', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Add RLS policy for inquiry-files bucket
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'inquiry-files');

-- Allow public read access to files in inquiry-files bucket
CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (bucket_id = 'inquiry-files');
