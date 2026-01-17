-- Create policy for admin to view all societies
CREATE POLICY "Admins can view all societies"
ON public.societies
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create policy for admin to update all societies (for approvals)
CREATE POLICY "Admins can update all societies"
ON public.societies
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));