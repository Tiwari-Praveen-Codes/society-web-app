-- Create society_members table to link users to societies
CREATE TABLE public.society_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'resident',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(society_id, user_id)
);

-- Enable RLS
ALTER TABLE public.society_members ENABLE ROW LEVEL SECURITY;

-- Users can view their own memberships
CREATE POLICY "Users can view own memberships"
ON public.society_members
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own membership (for joining societies)
CREATE POLICY "Users can insert own membership"
ON public.society_members
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Secretaries can view members of their societies
CREATE POLICY "Secretaries can view society members"
ON public.society_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.societies 
    WHERE id = society_id 
    AND secretary_id = auth.uid()
  )
);

-- Secretaries can manage members of their societies
CREATE POLICY "Secretaries can manage society members"
ON public.society_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.societies 
    WHERE id = society_id 
    AND secretary_id = auth.uid()
  )
);

-- Admins can view all members
CREATE POLICY "Admins can view all members"
ON public.society_members
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_society_members_updated_at
  BEFORE UPDATE ON public.society_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Allow users to view societies they are members of
CREATE POLICY "Members can view their societies"
ON public.societies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.society_members 
    WHERE society_id = id 
    AND user_id = auth.uid()
  )
);