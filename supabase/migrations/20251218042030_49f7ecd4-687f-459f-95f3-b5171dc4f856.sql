-- Create a secure view for public site access that excludes user_id
CREATE OR REPLACE VIEW public.public_sites AS
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

-- Drop the old public policy that exposed user_id
DROP POLICY IF EXISTS "Public can view published sites (limited)" ON public.generated_sites;