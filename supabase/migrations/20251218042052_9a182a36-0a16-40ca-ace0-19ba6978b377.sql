-- Fix security definer view by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.public_sites;

CREATE VIEW public.public_sites 
WITH (security_invoker = true) AS
SELECT 
  id,
  site_name,
  slug,
  place_id,
  business_data,
  status,
  public_url,
  custom_domain,
  domain_verified,
  created_at,
  updated_at
FROM public.generated_sites
WHERE status = 'published';

-- Grant SELECT on the view to anonymous users
GRANT SELECT ON public.public_sites TO anon;