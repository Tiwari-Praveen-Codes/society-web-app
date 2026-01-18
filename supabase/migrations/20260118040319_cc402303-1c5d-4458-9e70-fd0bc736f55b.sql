-- Create notices table
CREATE TABLE public.notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- Secretaries can create notices for their societies
CREATE POLICY "Secretaries can insert notices"
ON public.notices
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.societies 
    WHERE id = society_id 
    AND secretary_id = auth.uid()
    AND status = 'active'
  )
);

-- Secretaries can update their society notices
CREATE POLICY "Secretaries can update notices"
ON public.notices
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.societies 
    WHERE id = society_id 
    AND secretary_id = auth.uid()
  )
);

-- Secretaries can delete their society notices
CREATE POLICY "Secretaries can delete notices"
ON public.notices
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.societies 
    WHERE id = society_id 
    AND secretary_id = auth.uid()
  )
);

-- Society members can view notices
CREATE POLICY "Members can view society notices"
ON public.notices
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.society_members 
    WHERE society_id = notices.society_id 
    AND user_id = auth.uid()
    AND status = 'active'
  )
);

-- Secretaries can view their society notices
CREATE POLICY "Secretaries can view notices"
ON public.notices
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.societies 
    WHERE id = society_id 
    AND secretary_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_notices_updated_at
  BEFORE UPDATE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();