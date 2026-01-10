-- Enable RLS on diagnostic_sessions if not already enabled
ALTER TABLE diagnostic_sessions ENABLE ROW LEVEL SECURITY;

-- 1. Allow Public Inserts (so users can take the diagnostic)
DROP POLICY IF EXISTS "Allow public diagnostic submissions" ON diagnostic_sessions;
CREATE POLICY "Allow public diagnostic submissions"
ON diagnostic_sessions FOR INSERT TO public WITH CHECK (true);

-- 2. Allow Admins full access (to read, and ESPECIALLY delete for the Reset button)
DROP POLICY IF EXISTS "Admin full access to diagnostics" ON diagnostic_sessions;
CREATE POLICY "Admin full access to diagnostics"
ON diagnostic_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Verify polices
SELECT tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'diagnostic_sessions';
