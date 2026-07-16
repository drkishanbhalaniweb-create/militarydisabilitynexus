-- Published condition pages must have both relationships required by their canonical URL.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'published_conditions_require_routing'
      AND conrelid = 'public.conditions'::regclass
  ) THEN
    ALTER TABLE public.conditions
      ADD CONSTRAINT published_conditions_require_routing
      CHECK (
        NOT is_published
        OR (service_id IS NOT NULL AND body_system_id IS NOT NULL)
      ) NOT VALID;
  END IF;
END
$$;

ALTER TABLE public.conditions
  VALIDATE CONSTRAINT published_conditions_require_routing;
