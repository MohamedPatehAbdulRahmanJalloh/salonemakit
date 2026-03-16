CREATE TABLE public.push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token text NOT NULL,
  platform text NOT NULL DEFAULT 'ios',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, token)
);

ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own push tokens"
ON public.push_tokens FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own push tokens"
ON public.push_tokens FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push tokens"
ON public.push_tokens FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all push tokens"
ON public.push_tokens FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));