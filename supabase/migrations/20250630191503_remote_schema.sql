set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.generate_referral_code(user_email text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  base      TEXT;
  candidate TEXT;
  suffix    INT := 0;
BEGIN
  base := regexp_replace(lower(split_part(user_email, '@', 1)), '\s+', '_', 'g');
  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = candidate) LOOP
    suffix := suffix + 1;
    candidate := base || '_' || suffix;
  END LOOP;
  RETURN candidate;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_referral_code TEXT;
  v_referred_by   TEXT;
  v_founder       BOOLEAN;
BEGIN
  -- Generar referral_code
  v_referral_code := public.generate_referral_code(NEW.email);
  -- Extraer referred_by y founder de los metadatos
  v_referred_by := NEW.raw_user_meta_data->>'referred_by';
  v_founder     := COALESCE((NEW.raw_user_meta_data->>'founder')::BOOLEAN, FALSE);

  -- Insertar nuevo perfil
  INSERT INTO public.profiles (
    id, email, first_name, last_name, phone, account_type,
    referral_code, referred_by, founder
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'client'),
    v_referral_code,
    v_referred_by,
    v_founder
  );
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_payment_commission()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  payer_profile RECORD;
  direct_ref    RECORD;
  direct_pct    NUMERIC := 50.00;
  founder_pct   NUMERIC := 10.00;
  amt_direct    NUMERIC;
  amt_indirect  NUMERIC;
BEGIN
  -- Solo ejecutar cuando status pase a 'succeeded'
  IF TG_OP = 'UPDATE'
     AND OLD.status <> 'succeeded'
     AND NEW.status = 'succeeded'
  THEN
    SELECT * INTO payer_profile
      FROM public.profiles
     WHERE id = NEW.user_id;

    -- Comisión directa (50%) si existe referido
    IF payer_profile.referred_by IS NOT NULL THEN
      SELECT * INTO direct_ref
        FROM public.profiles
       WHERE referral_code = payer_profile.referred_by;

      IF FOUND THEN
        amt_direct := NEW.amount * direct_pct / 100.0;
        INSERT INTO public.referral_transactions(
          referrer_id, referee_id, payment_id, percentage, amount
        ) VALUES (
          direct_ref.id, payer_profile.id, NEW.id, direct_pct, amt_direct
        );

        -- Comisión indirecta a fundadores (10%)
        IF direct_ref.founder THEN
          amt_indirect := NEW.amount * founder_pct / 100.0;
          INSERT INTO public.referral_transactions(
            referrer_id, referee_id, payment_id, percentage, amount
          ) VALUES (
            direct_ref.id, payer_profile.id, NEW.id, founder_pct, amt_indirect
          );
        END IF;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_profile_subscription_commission()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_pay RECORD;
  v_referrer RECORD;
  v_direct_pct   CONSTANT NUMERIC := 50.00;
  v_founder_pct  CONSTANT NUMERIC := 10.00;
  v_amt_direct   NUMERIC;
  v_amt_indirect NUMERIC;
BEGIN
  -- Sólo cuando subscription_status cambie a 'active' desde otro valor
  IF TG_OP = 'UPDATE'
     AND OLD.subscription_status IS DISTINCT FROM NEW.subscription_status
     AND NEW.subscription_status = 'active'
     AND NEW.referred_by IS NOT NULL
  THEN
    -- 1) Obtener el pago más reciente 'succeeded' de este usuario
    SELECT id, amount
      INTO v_pay
      FROM public.payments
     WHERE user_id = NEW.id
       AND status  = 'succeeded'
     ORDER BY created_at DESC
     LIMIT 1;

    IF FOUND THEN
      -- 2) Buscar el perfil del referrer
      SELECT *
        INTO v_referrer
        FROM public.profiles
       WHERE referral_code = NEW.referred_by
       LIMIT 1;

      IF FOUND THEN
        -- 3) Insertar comisión directa (50%)
        v_amt_direct := v_pay.amount * v_direct_pct / 100.0;
        INSERT INTO public.referral_transactions (
          referrer_id, referee_id, payment_id, percentage, amount
        ) VALUES (
          v_referrer.id, NEW.id, v_pay.id, v_direct_pct, v_amt_direct
        );

        -- 4) Si el referrer es founder, insertar comisión indirecta (10%)
        IF v_referrer.founder THEN
          v_amt_indirect := v_pay.amount * v_founder_pct / 100.0;
          INSERT INTO public.referral_transactions (
            referrer_id, referee_id, payment_id, percentage, amount
          ) VALUES (
            v_referrer.id, NEW.id, v_pay.id, v_founder_pct, v_amt_indirect
          );
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$
;


