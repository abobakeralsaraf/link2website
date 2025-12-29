-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate with is_admin() function which is SECURITY DEFINER and avoids recursion
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin());