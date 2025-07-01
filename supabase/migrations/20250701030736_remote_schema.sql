set check_function_bodies = off;

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

CREATE TRIGGER referral_on_insert AFTER INSERT ON public.payments FOR EACH ROW EXECUTE FUNCTION handle_referral_on_payment_insert();


