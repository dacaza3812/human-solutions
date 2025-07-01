set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_referral_stats(user_referral_code text)
 RETURNS TABLE(total_referrals integer, active_referrals integer, total_earnings numeric, monthly_earnings numeric)
 LANGUAGE sql
AS $function$
WITH refs AS (
  -- Todos los usuarios referidos por el código
  SELECT id
    FROM public.profiles
   WHERE lower(referred_by) = lower(user_referral_code)
),
pays AS (
  -- De esos referidos, cuál(es) han pagado al menos una vez
  SELECT DISTINCT pay.user_id
    FROM public.payments pay
    JOIN refs r ON pay.user_id = r.id
   WHERE pay.status = 'succeeded'
)
SELECT
  -- 1) Total de referidos registrados
  (SELECT COUNT(*) FROM refs) AS total_referrals,

  -- 2) Cuántos de esos han pagado al menos un plan
  (SELECT COUNT(*) FROM pays) AS active_referrals,

  -- 3) Suma de todas las comisiones generadas en referral_transactions
  (SELECT COALESCE(SUM(rt.amount), 0)
     FROM public.referral_transactions rt
     JOIN public.profiles p ON rt.referrer_id = p.id
    WHERE lower(p.referral_code) = lower(user_referral_code)
  ) AS total_earnings,

  -- 4) Suma de comisiones generadas en el mes actual
  (SELECT COALESCE(SUM(rt.amount), 0)
     FROM public.referral_transactions rt
     JOIN public.profiles p ON rt.referrer_id = p.id
    WHERE lower(p.referral_code) = lower(user_referral_code)
      AND rt.created_at >= date_trunc('month', now())
  ) AS monthly_earnings;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_referral_on_payment_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  payer    public.profiles%ROWTYPE;
  referrer public.profiles%ROWTYPE;
  pct_direct  CONSTANT NUMERIC := 50.00;
  pct_founder CONSTANT NUMERIC := 10.00;
  amt_direct   NUMERIC;
  amt_founder  NUMERIC;
BEGIN
  -- Sólo pagos 'succeeded'
  IF NEW.status <> 'succeeded' THEN
    RETURN NEW;
  END IF;

  -- Cargar perfil del que paga
  SELECT * INTO payer
    FROM public.profiles
   WHERE id = NEW.user_id;

  IF NOT FOUND OR payer.referred_by IS NULL THEN
    RETURN NEW;
  END IF;

  -- Cargar perfil del referido
  SELECT * INTO referrer
    FROM public.profiles
   WHERE referral_code = payer.referred_by
   LIMIT 1;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Insertar comisión directa (50%)
  amt_direct := NEW.amount * pct_direct / 100.0;
  INSERT INTO public.referral_transactions (
    referrer_id, referee_id, payment_id, percentage, amount
  ) VALUES (
    referrer.id, payer.id, NEW.id, pct_direct, amt_direct
  );

  -- Si es founder, insertar comisión extra (10%)
  IF referrer.founder THEN
    amt_founder := NEW.amount * pct_founder / 100.0;
    INSERT INTO public.referral_transactions (
      referrer_id, referee_id, payment_id, percentage, amount
    ) VALUES (
      referrer.id, payer.id, NEW.id, pct_founder, amt_founder
    );
  END IF;

  RETURN NEW;
END;
$function$
;


