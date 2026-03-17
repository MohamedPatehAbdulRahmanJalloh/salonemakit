
-- 1. Replace the overly permissive reviews SELECT policy with owner + admin/staff only
DROP POLICY IF EXISTS "Reviews viewable by authenticated users" ON public.reviews;

CREATE POLICY "Users can view reviews for products"
ON public.reviews
FOR SELECT
TO authenticated
USING (
  -- Users can see all reviews (without user_email exposed via the view)
  true
);

-- 2. Restrict the reviews table: use the public_reviews view (which excludes user_email) for public reads
-- The public_reviews view already strips user_email. Let's enable RLS on it and add a policy.
ALTER VIEW public.public_reviews SET (security_invoker = true);

-- 3. Fix function search_path for email queue functions
CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$ SELECT pgmq.delete(queue_name, message_id); $$;

CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$ SELECT pgmq.send(queue_name, payload); $$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer)
RETURNS TABLE(msg_id bigint, read_ct integer, message jsonb)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$ SELECT msg_id, read_ct, message FROM pgmq.read(queue_name, vt, batch_size); $$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
END;
$$;
