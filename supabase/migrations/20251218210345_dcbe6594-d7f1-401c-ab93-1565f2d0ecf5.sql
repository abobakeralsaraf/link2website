-- Add domain approval status to track the workflow
ALTER TABLE public.generated_sites 
ADD COLUMN IF NOT EXISTS domain_approval_status text DEFAULT 'none' 
CHECK (domain_approval_status IN ('none', 'pending', 'approved', 'rejected'));

-- Add admin notes for rejection reason or instructions
ALTER TABLE public.generated_sites 
ADD COLUMN IF NOT EXISTS domain_admin_notes text;

-- Update the public_sites view to include new columns
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
  domain_approval_status,
  created_at,
  updated_at
FROM public.generated_sites
WHERE status = 'published';

-- Grant SELECT on the view to anonymous users
GRANT SELECT ON public.public_sites TO anon;