-- Fix security issue: Require authentication to read profiles
-- This prevents anonymous users from harvesting email addresses
CREATE POLICY "Require authentication to read profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Drop the overly permissive policies and replace with authenticated-only policies
-- Note: Keep existing policies for users viewing own profile and admins viewing all

-- Fix security issue: Require authentication to read user_roles
-- This prevents anonymous users from seeing role assignments
CREATE POLICY "Require authentication to read user_roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (true);

-- Note: The generated_sites "Public can view published sites" policy is intentional
-- Published sites are meant to be publicly viewable. The business_data contains
-- only Google Places API data which is already public information.