-- Fix body-system writes for authenticated, active admin users.
--
-- Use a security-definer helper so this policy is not coupled to the SELECT
-- policies on admin_users, and only active admin accounts can write.

CREATE OR REPLACE FUNCTION public.is_active_admin(current_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users AS admin_user
    WHERE admin_user.id = current_uid
      AND admin_user.is_active = true
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_active_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_active_admin(uuid) TO authenticated;

DROP POLICY IF EXISTS "Allow authenticated full access to body systems"
  ON public.body_systems;

DROP POLICY IF EXISTS "Active admins can manage body systems"
  ON public.body_systems;

CREATE POLICY "Active admins can manage body systems"
  ON public.body_systems
  FOR ALL
  TO authenticated
  USING (public.is_active_admin(auth.uid()))
  WITH CHECK (public.is_active_admin(auth.uid()));
