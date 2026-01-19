-- Create complaints table
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Users can view their own complaints
CREATE POLICY "Users can view own complaints"
ON public.complaints FOR SELECT
USING (auth.uid() = user_id);

-- Secretaries can view all complaints for their society
CREATE POLICY "Secretaries can view society complaints"
ON public.complaints FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.societies
  WHERE societies.id = complaints.society_id
  AND societies.secretary_id = auth.uid()
));

-- Active society members can insert complaints
CREATE POLICY "Members can insert complaints"
ON public.complaints FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.society_members
    WHERE society_members.society_id = complaints.society_id
    AND society_members.user_id = auth.uid()
    AND society_members.status = 'active'
  )
);

-- Secretaries can update complaint status
CREATE POLICY "Secretaries can update complaints"
ON public.complaints FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.societies
  WHERE societies.id = complaints.society_id
  AND societies.secretary_id = auth.uid()
));

-- Add updated_at trigger
CREATE TRIGGER update_complaints_updated_at
BEFORE UPDATE ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();