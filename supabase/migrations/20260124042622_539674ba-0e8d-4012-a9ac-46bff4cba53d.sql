-- Create a function to automatically create visitor notifications
CREATE OR REPLACE FUNCTION public.notify_resident_of_visitor()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create notification if resident_id is set
  IF NEW.resident_id IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      society_id,
      type,
      title,
      message,
      reference_id,
      is_read
    ) VALUES (
      NEW.resident_id,
      NEW.society_id,
      'visitor',
      'Visitor at Gate',
      NEW.visitor_name || ' is waiting at the gate for Flat ' || NEW.flat_number || '. Purpose: ' || NEW.purpose,
      NEW.id,
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to call the function on visitor insert
DROP TRIGGER IF EXISTS on_visitor_created ON public.visitors;
CREATE TRIGGER on_visitor_created
  AFTER INSERT ON public.visitors
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_resident_of_visitor();

-- Enable realtime for notifications table to ensure real-time updates work
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;