-- Drop the existing permissive insert policy
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;

-- Create a more restrictive policy that prevents self-assignment of admin role
CREATE POLICY "Users can insert own non-admin role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND role IN ('resident', 'watchman', 'secretary')
);

-- Allow admins to assign any role
CREATE POLICY "Admins can insert any role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));