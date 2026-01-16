-- Create societies table
CREATE TABLE public.societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_verification',
  secretary_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;

-- Secretaries can view their own society
CREATE POLICY "Secretaries can view own society"
  ON public.societies FOR SELECT
  USING (auth.uid() = secretary_id);

-- Secretaries can insert their own society
CREATE POLICY "Secretaries can insert own society"
  ON public.societies FOR INSERT
  WITH CHECK (auth.uid() = secretary_id);

-- Secretaries can update their own society
CREATE POLICY "Secretaries can update own society"
  ON public.societies FOR UPDATE
  USING (auth.uid() = secretary_id);

-- Trigger for updated_at
CREATE TRIGGER set_societies_updated_at
  BEFORE UPDATE ON public.societies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create unique constraint so each secretary can only have one society
ALTER TABLE public.societies ADD CONSTRAINT unique_secretary UNIQUE (secretary_id);