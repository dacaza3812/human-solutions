-- Create a table for user profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  billing_address TEXT,
  payment_method TEXT
);

-- Set up Row Level Security (RLS) for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create a table for user subscriptions
CREATE TABLE user_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  plan_id INT NOT NULL, -- You might link this to a 'plans' table
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS for user_subscriptions
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions." ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions." ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions." ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create a table for inquiries
CREATE TABLE inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  attachment_url TEXT,
  status TEXT DEFAULT 'pending' NOT NULL, -- e.g., 'pending', 'reviewed', 'closed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS for inquiries
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Policy for users to insert their own inquiries
CREATE POLICY "Users can insert their own inquiries." ON inquiries
  FOR INSERT WITH CHECK (auth.email() = email); -- Assuming email is unique to a user or you have a user_id column

-- Policy for authenticated users to view their own inquiries
CREATE POLICY "Authenticated users can view their own inquiries." ON inquiries
  FOR SELECT USING (auth.email() = email);

-- Policy for admins/advisors to view all inquiries (example, adjust as needed)
-- You would need a mechanism to identify admins/advisors, e.g., a role in profiles table
-- For simplicity, this example assumes a hardcoded email or a separate function to check roles
CREATE POLICY "Advisors can view all inquiries." ON inquiries
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.full_name = 'AdvisorName')); -- Replace 'AdvisorName' with actual role check

-- Policy for admins/advisors to update inquiry status
CREATE POLICY "Advisors can update inquiry status." ON inquiries
  FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.full_name = 'AdvisorName')) WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.full_name = 'AdvisorName'));

-- Create a table for referrals
CREATE TABLE referrals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  referrer_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  referred_email TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending' NOT NULL, -- e.g., 'pending', 'signed_up', 'converted'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS for referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals." ON referrals
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can insert new referrals." ON referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Create a table for cases (for advisors/clients)
CREATE TABLE cases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  advisor_id UUID REFERENCES auth.users ON DELETE CASCADE, -- Can be null if not yet assigned
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' NOT NULL, -- e.g., 'open', 'in_progress', 'closed'
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS for cases
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own cases." ON cases
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert their own cases." ON cases
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own cases." ON cases
  FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "Advisors can view assigned cases." ON cases
  FOR SELECT USING (auth.uid() = advisor_id);

CREATE POLICY "Advisors can update assigned cases." ON cases
  FOR UPDATE USING (auth.uid() = advisor_id);

-- Create a table for messages (for chat functionality)
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  case_id UUID REFERENCES cases ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  message_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their cases." ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR
    EXISTS (SELECT 1 FROM cases WHERE id = case_id AND (client_id = auth.uid() OR advisor_id = auth.uid()))
  );

CREATE POLICY "Users can insert messages in their cases." ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM cases WHERE id = case_id AND (client_id = auth.uid() OR advisor_id = auth.uid()))
  );

-- Create a table for appointments/calendar events
CREATE TABLE appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS for appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own appointments." ON appointments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appointments." ON appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments." ON appointments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointments." ON appointments
  FOR DELETE USING (auth.uid() = user_id);

-- Create a table for quotes/proposals
CREATE TABLE quotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  case_id UUID REFERENCES cases ON DELETE CASCADE NOT NULL,
  advisor_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL, -- e.g., 'pending', 'accepted', 'rejected'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS for quotes
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients and advisors can view quotes for their cases." ON quotes
  FOR SELECT USING (EXISTS (SELECT 1 FROM cases WHERE id = case_id AND (client_id = auth.uid() OR advisor_id = auth.uid())));

CREATE POLICY "Advisors can insert quotes for their cases." ON quotes
  FOR INSERT WITH CHECK (auth.uid() = advisor_id AND EXISTS (SELECT 1 FROM cases WHERE id = case_id AND advisor_id = auth.uid()));

CREATE POLICY "Advisors can update their quotes." ON quotes
  FOR UPDATE USING (auth.uid() = advisor_id);

-- Enable the uuid-ossp extension for uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to handle new user sign-ups (for profiles table)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.email); -- Or NEW.raw_user_meta_data->>'full_name' if you collect it at signup
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user on auth.users inserts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
