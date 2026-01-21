-- Create emergency_contacts table
CREATE TABLE public.emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- All active society members can view emergency contacts
CREATE POLICY "Members can view emergency contacts"
  ON public.emergency_contacts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM society_members
    WHERE society_members.society_id = emergency_contacts.society_id
    AND society_members.user_id = auth.uid()
    AND society_members.status = 'active'
  ));

-- Secretaries can insert emergency contacts
CREATE POLICY "Secretaries can insert emergency contacts"
  ON public.emergency_contacts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM societies
    WHERE societies.id = emergency_contacts.society_id
    AND societies.secretary_id = auth.uid()
    AND societies.status = 'active'
  ));

-- Secretaries can update emergency contacts
CREATE POLICY "Secretaries can update emergency contacts"
  ON public.emergency_contacts FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM societies
    WHERE societies.id = emergency_contacts.society_id
    AND societies.secretary_id = auth.uid()
  ));

-- Secretaries can delete emergency contacts
CREATE POLICY "Secretaries can delete emergency contacts"
  ON public.emergency_contacts FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM societies
    WHERE societies.id = emergency_contacts.society_id
    AND societies.secretary_id = auth.uid()
  ));

-- Trigger for updated_at
CREATE TRIGGER update_emergency_contacts_updated_at
  BEFORE UPDATE ON public.emergency_contacts
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();