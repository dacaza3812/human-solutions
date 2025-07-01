-- Create a table for public "profiles"
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text,
  last_name text,
  account_type text default 'client' not null, -- 'client' or 'advisor'
  phone text,
  created_at timestamp with time zone default now() not null,
  referral_code text unique, -- Unique code for advisors to share
  referred_by text -- Stores the referral code of the referrer
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Allow authenticated users to read their own profile
create policy "Users can view their own profile." on profiles
  for select using (auth.uid() = id);

-- Allow authenticated users to update their own profile
create policy "Users can update their own profile." on profiles
  for update using (auth.uid() = id);

-- Allow authenticated users to insert their own profile (handled by trigger)
create policy "Users can create their own profile." on profiles
  for insert with check (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up
create function public.handle_new_user()
returns trigger as $$
declare
  user_first_name text;
  user_last_name text;
  user_phone text;
  user_account_type text;
  user_referral_code text;
begin
  -- Extract data from raw_user_meta_data
  user_first_name := new.raw_user_meta_data->>'first_name';
  user_last_name := new.raw_user_meta_data->>'last_name';
  user_phone := new.raw_user_meta_data->>'phone';
  user_account_type := coalesce(new.raw_user_meta_data->>'account_type', 'client');
  user_referral_code := new.raw_user_meta_data->>'referral_code';

  insert into public.profiles (id, first_name, last_name, phone, account_type, referred_by)
  values (
    new.id,
    user_first_name,
    user_last_name,
    user_phone,
    user_account_type,
    user_referral_code -- Store the referral code used during signup
  );

  -- If a referral code was used, create a referral relationship
  if user_referral_code is not null and user_referral_code != '' then
    perform create_referral_relationship(user_referral_code, new.id);
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- This trigger automatically creates a profile entry when a new user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create a function to generate a unique referral code for new advisors
create or replace function generate_unique_referral_code()
returns text as $$
declare
  new_code text;
  code_exists boolean;
begin
  loop
    -- Generate a random 8-character alphanumeric code
    new_code := upper(overlay(overlay(md5(random()::text || clock_timestamp()::text) placing ' ' from 9 for 24) placing ' ' from 1 for 8));
    -- Check if the code already exists
    select exists(select 1 from profiles where referral_code = new_code) into code_exists;
    -- If it doesn't exist, use it
    if not code_exists then
      return new_code;
    end if;
  end loop;
end;
$$ language plpgsql;

-- Add a trigger to automatically generate referral_code for new advisors if not provided
create or replace function public.set_advisor_referral_code()
returns trigger as $$
begin
  if new.account_type = 'advisor' and (new.referral_code is null or new.referral_code = '') then
    new.referral_code := public.generate_unique_referral_code();
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_advisor_insert
  before insert on public.profiles
  for each row
  execute procedure public.set_advisor_referral_code();
