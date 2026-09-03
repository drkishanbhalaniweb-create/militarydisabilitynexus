-- Migration: Add Granular Tab Permissions to Admin Users
-- Enables tab-level access control for admin dashboard

ALTER TABLE public.admin_users
ADD COLUMN IF NOT EXISTS allowed_tabs TEXT[] DEFAULT NULL;

-- Add index for querying allowed tabs
CREATE INDEX IF NOT EXISTS idx_admin_users_allowed_tabs ON public.admin_users USING GIN (allowed_tabs);

-- Document the column
COMMENT ON COLUMN public.admin_users.allowed_tabs IS 'Granular list of tab keys the user is permitted to access. If NULL, access is governed by role defaults (super_admin has all, admin has standard access).';
