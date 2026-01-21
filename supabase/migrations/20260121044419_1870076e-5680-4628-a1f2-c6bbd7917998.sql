
-- Drop overly permissive policy
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create proper insert policies for notifications
CREATE POLICY "Secretaries can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM societies
    WHERE societies.id = notifications.society_id
    AND societies.secretary_id = auth.uid()
  ));

CREATE POLICY "Watchmen can insert visitor notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    notifications.type = 'visitor' AND
    EXISTS (
      SELECT 1 FROM society_members
      WHERE society_members.society_id = notifications.society_id
      AND society_members.user_id = auth.uid()
      AND society_members.role = 'watchman'
      AND society_members.status = 'active'
    )
  );
