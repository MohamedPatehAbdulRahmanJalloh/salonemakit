-- Fix security definer view - use security invoker instead
ALTER VIEW public.public_reviews SET (security_invoker = on);