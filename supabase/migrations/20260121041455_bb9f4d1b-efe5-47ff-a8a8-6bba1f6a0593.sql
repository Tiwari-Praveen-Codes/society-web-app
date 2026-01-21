-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('society-documents', 'society-documents', true);

-- Storage policies for society-documents bucket
CREATE POLICY "Anyone can view documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'society-documents');

CREATE POLICY "Secretaries can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'society-documents' AND
    EXISTS (
      SELECT 1 FROM societies
      WHERE societies.secretary_id = auth.uid()
      AND societies.status = 'active'
    )
  );

CREATE POLICY "Secretaries can delete documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'society-documents' AND
    EXISTS (
      SELECT 1 FROM societies
      WHERE societies.secretary_id = auth.uid()
    )
  );

-- Create documents metadata table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- All active society members can view documents
CREATE POLICY "Members can view society documents"
  ON public.documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM society_members
    WHERE society_members.society_id = documents.society_id
    AND society_members.user_id = auth.uid()
    AND society_members.status = 'active'
  ));

-- Secretaries can insert documents
CREATE POLICY "Secretaries can insert documents"
  ON public.documents FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM societies
    WHERE societies.id = documents.society_id
    AND societies.secretary_id = auth.uid()
    AND societies.status = 'active'
  ));

-- Secretaries can update documents
CREATE POLICY "Secretaries can update documents"
  ON public.documents FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM societies
    WHERE societies.id = documents.society_id
    AND societies.secretary_id = auth.uid()
  ));

-- Secretaries can delete documents
CREATE POLICY "Secretaries can delete documents"
  ON public.documents FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM societies
    WHERE societies.id = documents.society_id
    AND societies.secretary_id = auth.uid()
  ));

-- Trigger for updated_at
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();