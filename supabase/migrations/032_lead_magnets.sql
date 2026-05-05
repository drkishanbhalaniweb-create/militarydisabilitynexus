-- Lead magnet PDF storage and email capture records

CREATE TABLE IF NOT EXISTS lead_magnet_captures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 5 AND 254),
  lead_magnet_title TEXT NOT NULL,
  pdf_storage_path TEXT NOT NULL,
  pdf_file_name TEXT,
  source_path TEXT,
  email_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (email_status IN ('pending', 'sent', 'failed')),
  email_sent_at TIMESTAMPTZ,
  email_error TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_magnet_captures_created
  ON lead_magnet_captures(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lead_magnet_captures_email
  ON lead_magnet_captures(email);

CREATE INDEX IF NOT EXISTS idx_lead_magnet_captures_title
  ON lead_magnet_captures(lead_magnet_title);

ALTER TABLE lead_magnet_captures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage lead magnet captures" ON lead_magnet_captures;
CREATE POLICY "Service role can manage lead magnet captures"
  ON lead_magnet_captures FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view lead magnet captures" ON lead_magnet_captures;
CREATE POLICY "Admins can view lead magnet captures"
  ON lead_magnet_captures FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.admin_users
      WHERE public.admin_users.id = auth.uid()
        AND public.admin_users.is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can delete lead magnet captures" ON lead_magnet_captures;
CREATE POLICY "Admins can delete lead magnet captures"
  ON lead_magnet_captures FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.admin_users
      WHERE public.admin_users.id = auth.uid()
        AND public.admin_users.is_active = true
    )
  );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lead-magnets',
  'lead-magnets',
  false,
  26214400,
  ARRAY['application/pdf', 'application/x-pdf']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Supabase owns and manages RLS on storage.objects. Do not ALTER this table
-- from project migrations; the Storage policy statements below are enough.

DROP POLICY IF EXISTS lead_magnets_admin_select ON storage.objects;
CREATE POLICY lead_magnets_admin_select ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'lead-magnets'
    AND EXISTS (
      SELECT 1
      FROM public.admin_users
      WHERE public.admin_users.id = auth.uid()
        AND public.admin_users.is_active = true
    )
  );

DROP POLICY IF EXISTS lead_magnets_admin_insert ON storage.objects;
CREATE POLICY lead_magnets_admin_insert ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'lead-magnets'
    AND EXISTS (
      SELECT 1
      FROM public.admin_users
      WHERE public.admin_users.id = auth.uid()
        AND public.admin_users.is_active = true
    )
  );

DROP POLICY IF EXISTS lead_magnets_admin_update ON storage.objects;
CREATE POLICY lead_magnets_admin_update ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'lead-magnets'
    AND EXISTS (
      SELECT 1
      FROM public.admin_users
      WHERE public.admin_users.id = auth.uid()
        AND public.admin_users.is_active = true
    )
  )
  WITH CHECK (
    bucket_id = 'lead-magnets'
    AND EXISTS (
      SELECT 1
      FROM public.admin_users
      WHERE public.admin_users.id = auth.uid()
        AND public.admin_users.is_active = true
    )
  );

DROP POLICY IF EXISTS lead_magnets_admin_delete ON storage.objects;
CREATE POLICY lead_magnets_admin_delete ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'lead-magnets'
    AND EXISTS (
      SELECT 1
      FROM public.admin_users
      WHERE public.admin_users.id = auth.uid()
        AND public.admin_users.is_active = true
    )
  );

COMMENT ON TABLE lead_magnet_captures IS 'Email captures for gated blog PDF lead magnets.';
COMMENT ON COLUMN lead_magnet_captures.pdf_storage_path IS 'Private Supabase Storage path inside the lead-magnets bucket.';
