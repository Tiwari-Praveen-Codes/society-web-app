
-- Create notifications table for real-time alerts
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  society_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('visitor', 'notice', 'bill', 'complaint', 'general')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gate_logs table for visitor entry/exit tracking
CREATE TABLE public.gate_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  society_id UUID NOT NULL,
  visitor_id UUID REFERENCES public.visitors(id),
  visitor_name TEXT NOT NULL,
  flat_number TEXT NOT NULL,
  purpose TEXT NOT NULL,
  vehicle_number TEXT,
  vehicle_type TEXT CHECK (vehicle_type IN ('car', 'bike', 'auto', 'other', NULL)),
  entry_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  exit_time TIMESTAMP WITH TIME ZONE,
  security_notes TEXT,
  logged_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gate_logs ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Gate logs policies
CREATE POLICY "Watchmen can insert gate logs"
  ON public.gate_logs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM society_members
    WHERE society_members.society_id = gate_logs.society_id
    AND society_members.user_id = auth.uid()
    AND society_members.role = 'watchman'
    AND society_members.status = 'active'
  ));

CREATE POLICY "Watchmen can update gate logs"
  ON public.gate_logs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM society_members
    WHERE society_members.society_id = gate_logs.society_id
    AND society_members.user_id = auth.uid()
    AND society_members.role = 'watchman'
    AND society_members.status = 'active'
  ));

CREATE POLICY "Watchmen can view gate logs"
  ON public.gate_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM society_members
    WHERE society_members.society_id = gate_logs.society_id
    AND society_members.user_id = auth.uid()
    AND society_members.role = 'watchman'
    AND society_members.status = 'active'
  ));

CREATE POLICY "Secretaries can view gate logs"
  ON public.gate_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM societies
    WHERE societies.id = gate_logs.society_id
    AND societies.secretary_id = auth.uid()
  ));

CREATE POLICY "Secretaries can manage gate logs"
  ON public.gate_logs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM societies
    WHERE societies.id = gate_logs.society_id
    AND societies.secretary_id = auth.uid()
  ));

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create trigger for updated_at on gate_logs
CREATE TRIGGER update_gate_logs_updated_at
  BEFORE UPDATE ON public.gate_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
