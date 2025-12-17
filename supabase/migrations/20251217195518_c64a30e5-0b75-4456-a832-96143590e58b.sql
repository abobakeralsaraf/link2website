-- Drop all existing restrictive policies on generated_sites
DROP POLICY IF EXISTS "Admins can delete all sites" ON public.generated_sites;
DROP POLICY IF EXISTS "Admins can update all sites" ON public.generated_sites;
DROP POLICY IF EXISTS "Admins can view all sites" ON public.generated_sites;
DROP POLICY IF EXISTS "Public can view published sites" ON public.generated_sites;
DROP POLICY IF EXISTS "Users can delete their own sites" ON public.generated_sites;
DROP POLICY IF EXISTS "Users can insert their own sites" ON public.generated_sites;
DROP POLICY IF EXISTS "Users can update their own sites" ON public.generated_sites;
DROP POLICY IF EXISTS "Users can view their own sites" ON public.generated_sites;

-- Recreate policies as PERMISSIVE (default) so they work with OR logic

-- SELECT policies (any one can grant access)
CREATE POLICY "Admins can view all sites" 
ON public.generated_sites 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Users can view their own sites" 
ON public.generated_sites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view published sites" 
ON public.generated_sites 
FOR SELECT 
USING (status = 'published');

-- INSERT policy
CREATE POLICY "Users can insert their own sites" 
ON public.generated_sites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- UPDATE policies
CREATE POLICY "Admins can update all sites" 
ON public.generated_sites 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Users can update their own sites" 
ON public.generated_sites 
FOR UPDATE 
USING (auth.uid() = user_id);

-- DELETE policies
CREATE POLICY "Admins can delete all sites" 
ON public.generated_sites 
FOR DELETE 
USING (is_admin());

CREATE POLICY "Users can delete their own sites" 
ON public.generated_sites 
FOR DELETE 
USING (auth.uid() = user_id);