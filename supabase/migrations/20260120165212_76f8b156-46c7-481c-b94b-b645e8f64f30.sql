-- Create facilities table
CREATE TABLE public.facilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create facility_bookings table
CREATE TABLE public.facility_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Prevent double booking for same facility, date, and overlapping time
  CONSTRAINT no_overlapping_bookings UNIQUE (facility_id, booking_date, start_time)
);

-- Enable RLS
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_bookings ENABLE ROW LEVEL SECURITY;

-- Facilities policies
CREATE POLICY "Secretaries can insert facilities"
ON public.facilities FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM societies
  WHERE societies.id = facilities.society_id
  AND societies.secretary_id = auth.uid()
  AND societies.status = 'active'
));

CREATE POLICY "Secretaries can update facilities"
ON public.facilities FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM societies
  WHERE societies.id = facilities.society_id
  AND societies.secretary_id = auth.uid()
));

CREATE POLICY "Secretaries can delete facilities"
ON public.facilities FOR DELETE
USING (EXISTS (
  SELECT 1 FROM societies
  WHERE societies.id = facilities.society_id
  AND societies.secretary_id = auth.uid()
));

CREATE POLICY "Secretaries can view facilities"
ON public.facilities FOR SELECT
USING (EXISTS (
  SELECT 1 FROM societies
  WHERE societies.id = facilities.society_id
  AND societies.secretary_id = auth.uid()
));

CREATE POLICY "Members can view society facilities"
ON public.facilities FOR SELECT
USING (EXISTS (
  SELECT 1 FROM society_members
  WHERE society_members.society_id = facilities.society_id
  AND society_members.user_id = auth.uid()
  AND society_members.status = 'active'
));

-- Facility bookings policies
CREATE POLICY "Members can insert bookings"
ON public.facility_bookings FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM society_members
    WHERE society_members.society_id = facility_bookings.society_id
    AND society_members.user_id = auth.uid()
    AND society_members.status = 'active'
  )
);

CREATE POLICY "Secretaries can insert bookings"
ON public.facility_bookings FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM societies
  WHERE societies.id = facility_bookings.society_id
  AND societies.secretary_id = auth.uid()
));

CREATE POLICY "Users can view own bookings"
ON public.facility_bookings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Secretaries can view all bookings"
ON public.facility_bookings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM societies
  WHERE societies.id = facility_bookings.society_id
  AND societies.secretary_id = auth.uid()
));

CREATE POLICY "Members can view society bookings"
ON public.facility_bookings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM society_members
  WHERE society_members.society_id = facility_bookings.society_id
  AND society_members.user_id = auth.uid()
  AND society_members.status = 'active'
));

CREATE POLICY "Users can delete own bookings"
ON public.facility_bookings FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Secretaries can delete bookings"
ON public.facility_bookings FOR DELETE
USING (EXISTS (
  SELECT 1 FROM societies
  WHERE societies.id = facility_bookings.society_id
  AND societies.secretary_id = auth.uid()
));