-- Add availability_status column to society_members
ALTER TABLE public.society_members 
ADD COLUMN availability_status TEXT NOT NULL DEFAULT 'available';

-- Create policy for watchmen to view society members
CREATE POLICY "Watchmen can view society members"
ON public.society_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM society_members wm
    WHERE wm.society_id = society_members.society_id
    AND wm.user_id = auth.uid()
    AND wm.role = 'watchman'
    AND wm.status = 'active'
  )
);

-- Allow users to update their own membership (for availability)
CREATE POLICY "Users can update own membership"
ON public.society_members FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy for watchmen to view profiles for resident names
CREATE POLICY "Watchmen can view member profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM society_members sm
    JOIN society_members wm ON wm.society_id = sm.society_id
    WHERE sm.user_id = profiles.id
    AND wm.user_id = auth.uid()
    AND wm.role = 'watchman'
    AND wm.status = 'active'
  )
);