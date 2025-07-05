-- Verify profiles table and RLS
SELECT * FROM profiles;
-- As authenticated user: SELECT * FROM profiles WHERE id = auth.uid();

-- Verify user_subscriptions table and RLS
SELECT * FROM user_subscriptions;
-- As authenticated user: SELECT * FROM user_subscriptions WHERE user_id = auth.uid();

-- Verify inquiries table and RLS
SELECT * FROM inquiries;
-- As authenticated user: SELECT * FROM inquiries WHERE email = auth.email();
-- As advisor: SELECT * FROM inquiries; (if advisor policy is set up)

-- Verify referrals table and R2LS
SELECT * FROM referrals;
-- As authenticated user: SELECT * FROM referrals WHERE referrer_id = auth.uid();

-- Verify cases table and RLS
SELECT * FROM cases;
-- As client: SELECT * FROM cases WHERE client_id = auth.uid();
-- As advisor: SELECT * FROM cases WHERE advisor_id = auth.uid();

-- Verify messages table and RLS
SELECT * FROM messages;
-- As user in a case: SELECT * FROM messages WHERE case_id = 'your_case_id';

-- Verify appointments table and RLS
SELECT * FROM appointments;
-- As authenticated user: SELECT * FROM appointments WHERE user_id = auth.uid();

-- Verify quotes table and RLS
SELECT * FROM quotes;
-- As user in a case: SELECT * FROM quotes WHERE case_id = 'your_case_id';
-- As advisor: SELECT * FROM quotes WHERE advisor_id = auth.uid();

-- Verify handle_new_user function and trigger
-- This requires a new user signup to test.
-- After a new user signs up, check the profiles table:
-- SELECT * FROM profiles WHERE id = 'new_user_uuid';
