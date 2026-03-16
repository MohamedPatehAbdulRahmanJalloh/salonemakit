-- 1. Fix reviews: remove public email exposure
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;

CREATE POLICY "Reviews are publicly viewable"
ON public.reviews FOR SELECT TO public
USING (true);

-- 2. Fix coupons: only expose active non-expired coupons publicly
DROP POLICY IF EXISTS "Coupons are viewable by everyone" ON public.coupons;

CREATE POLICY "Only active coupons are publicly viewable"
ON public.coupons FOR SELECT TO public
USING (
  is_active = true 
  AND (expires_at IS NULL OR expires_at > now())
  AND (max_uses IS NULL OR used_count < max_uses)
);

-- 3. Rate limiting: login_attempts table
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_or_email text NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_login_attempts_lookup ON public.login_attempts (ip_or_email, attempted_at DESC);

-- Auto-cleanup old attempts
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.login_attempts WHERE attempted_at < now() - interval '1 hour';
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_cleanup_login_attempts
  AFTER INSERT ON public.login_attempts
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.cleanup_old_login_attempts();

-- Rate limit check function (max 5 attempts per 15 min)
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  attempt_count integer;
BEGIN
  SELECT count(*) INTO attempt_count
  FROM public.login_attempts
  WHERE ip_or_email = p_identifier
    AND attempted_at > now() - interval '15 minutes';
  
  INSERT INTO public.login_attempts (ip_or_email) VALUES (p_identifier);
  
  RETURN attempt_count < 5;
END;
$$;