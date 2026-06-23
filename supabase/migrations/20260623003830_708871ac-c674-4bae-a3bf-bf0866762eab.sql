
-- 1) admin_emails table (replaces hardcoded admin email)
CREATE TABLE IF NOT EXISTS public.admin_emails (
  email text PRIMARY KEY,
  added_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.admin_emails TO authenticated;
GRANT ALL ON public.admin_emails TO service_role;

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage admin_emails" ON public.admin_emails;
CREATE POLICY "Admins can manage admin_emails"
ON public.admin_emails
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Seed existing admin email
INSERT INTO public.admin_emails (email)
VALUES ('bakry@abobakeralsaraf.com')
ON CONFLICT (email) DO NOTHING;

-- 2) Update handle_new_user() to use admin_emails table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );

  IF EXISTS (SELECT 1 FROM public.admin_emails WHERE email = NEW.email) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'client');
  END IF;

  RETURN NEW;
END;
$function$;

-- 3) Harden public_sites view: strip potentially sensitive keys from business_data
DROP VIEW IF EXISTS public.public_sites;
CREATE VIEW public.public_sites
WITH (security_invoker = true) AS
SELECT
  id,
  site_name,
  slug,
  place_id,
  (business_data
    - 'email'
    - 'owner_email'
    - 'contact_email'
    - 'private_notes'
    - 'internal_notes'
    - 'admin_notes'
  ) AS business_data,
  status,
  public_url,
  custom_domain,
  domain_verified,
  domain_approval_status,
  created_at,
  updated_at
FROM public.generated_sites
WHERE status = 'published';

GRANT SELECT ON public.public_sites TO anon, authenticated;

-- 4) Lock down SECURITY DEFINER functions: revoke from anon/public,
-- keep authenticated execution (required by RLS policy expressions).
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- handle_new_user is a trigger function; no one needs direct EXECUTE.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
