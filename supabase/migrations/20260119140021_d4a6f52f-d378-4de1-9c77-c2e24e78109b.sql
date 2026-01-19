-- Create bills table
CREATE TABLE public.bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Users can view their own bills
CREATE POLICY "Users can view own bills"
ON public.bills FOR SELECT
USING (auth.uid() = user_id);

-- Secretaries can view all bills for their society
CREATE POLICY "Secretaries can view society bills"
ON public.bills FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.societies
  WHERE societies.id = bills.society_id
  AND societies.secretary_id = auth.uid()
));

-- Secretaries can insert bills for their society
CREATE POLICY "Secretaries can insert bills"
ON public.bills FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.societies
  WHERE societies.id = bills.society_id
  AND societies.secretary_id = auth.uid()
  AND societies.status = 'active'
));

-- Secretaries can update bills
CREATE POLICY "Secretaries can update bills"
ON public.bills FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.societies
  WHERE societies.id = bills.society_id
  AND societies.secretary_id = auth.uid()
));

-- Users can update their own bills (to mark as paid)
CREATE POLICY "Users can update own bills"
ON public.bills FOR UPDATE
USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_bills_updated_at
BEFORE UPDATE ON public.bills
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();