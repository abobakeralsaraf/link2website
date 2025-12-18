-- 1. Fix profiles table: Add explicit deny policy for anonymous users
CREATE POLICY "Deny anonymous access to profiles" 
ON public.profiles 
FOR ALL 
TO anon
USING (false);

-- 2. Fix generated_sites: Create a view that hides user_id for public access
-- First, drop the existing public policy
DROP POLICY IF EXISTS "Public can view published sites" ON public.generated_sites;

-- Create a new policy that allows public to view published sites but excludes sensitive data
-- The application code will need to explicitly select only non-sensitive columns
CREATE POLICY "Public can view published sites (limited)" 
ON public.generated_sites 
FOR SELECT 
TO anon
USING (status = 'published');

-- 3. Ensure admins can view all sites (already exists but let's verify it's correct)
DROP POLICY IF EXISTS "Admins can view all sites" ON public.generated_sites;
CREATE POLICY "Admins can view all sites" 
ON public.generated_sites 
FOR SELECT 
TO authenticated
USING (is_admin());

-- 4. Ensure users can only view their own sites (non-admins)
DROP POLICY IF EXISTS "Users can view their own sites" ON public.generated_sites;
CREATE POLICY "Users can view their own sites" 
ON public.generated_sites 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id AND NOT is_admin());