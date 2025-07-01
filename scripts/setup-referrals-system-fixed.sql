-- Create a table to store referral relationships
create table referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references public.profiles(id) on delete cascade not null,
  referred_id uuid references public.profiles(id) on delete cascade not null unique, -- Each referred user can only have one referrer
  created_at timestamp with time zone default now() not null,
  -- Add a status for the referral, e.g., 'pending', 'active', 'paid'
  status text default 'pending' not null
);

-- Set up Row Level Security (RLS) for referrals table
alter table referrals enable row level security;

-- Allow users to view referrals they made
create policy "Referrers can view their own referrals." on referrals
  for select using (auth.uid() = referrer_id);

-- Allow referred users to view their referrer (optional, if needed)
create policy "Referred users can view their referrer." on referrals
  for select using (auth.uid() = referred_id);

-- Function to create a referral relationship
create or replace function create_referral_relationship(
  referrer_code text,
  referred_user_id uuid
)
returns void as $$
declare
  referrer_profile_id uuid;
begin
  -- Find the referrer's profile ID using their referral code
  select id into referrer_profile_id
  from public.profiles
  where referral_code = referrer_code;

  -- If a referrer is found and the referred user is not the referrer themselves
  if referrer_profile_id is not null and referrer_profile_id != referred_user_id then
    -- Insert the referral
