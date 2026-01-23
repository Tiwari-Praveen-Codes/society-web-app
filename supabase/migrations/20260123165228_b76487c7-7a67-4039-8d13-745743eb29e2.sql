-- Fix the infinite recursion in societies RLS policy
-- The "Members can view their societies" policy incorrectly references society_members.id instead of societies.id

-- Drop the broken policy
DROP POLICY IF EXISTS "Members can view their societies" ON public.societies;

-- Recreate with correct reference
CREATE POLICY "Members can view their societies" 
ON public.societies 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM society_members
    WHERE society_members.society_id = societies.id 
    AND society_members.user_id = auth.uid()
  )
);