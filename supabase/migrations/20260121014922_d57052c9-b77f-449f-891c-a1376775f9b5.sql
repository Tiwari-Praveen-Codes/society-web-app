-- Create visitors table for visitor entry management
CREATE TABLE public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  visitor_name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  flat_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID NOT NULL,
  resident_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- Watchmen can insert visitors in their society
CREATE POLICY "Watchmen can insert visitors"
ON public.visitors
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM society_members
    WHERE society_members.society_id = visitors.society_id
    AND society_members.user_id = auth.uid()
    AND society_members.role = 'watchman'
    AND society_members.status = 'active'
  )
);

-- Watchmen can view visitors in their society
CREATE POLICY "Watchmen can view visitors"
ON public.visitors
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM society_members
    WHERE society_members.society_id = visitors.society_id
    AND society_members.user_id = auth.uid()
    AND society_members.role = 'watchman'
    AND society_members.status = 'active'
  )
);

-- Residents can view visitors assigned to them
CREATE POLICY "Residents can view their visitors"
ON public.visitors
FOR SELECT
USING (resident_id = auth.uid());

-- Residents can update (approve/reject) their visitors
CREATE POLICY "Residents can update their visitors"
ON public.visitors
FOR UPDATE
USING (resident_id = auth.uid());

-- Secretaries can view all visitors in their society
CREATE POLICY "Secretaries can view society visitors"
ON public.visitors
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM societies
    WHERE societies.id = visitors.society_id
    AND societies.secretary_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_visitors_updated_at
BEFORE UPDATE ON public.visitors
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();