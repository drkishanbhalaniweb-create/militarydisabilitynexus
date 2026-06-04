-- Migration: Migrate conditions to Service-Driven Architecture
-- Adds service_id to conditions, drops global slug uniqueness, enforces composite uniqueness.

-- 1. Add service_id column
ALTER TABLE public.conditions ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id) ON DELETE CASCADE;

-- 2. Assign default service_id to existing conditions
-- We'll try to find 'independent-medical-opinion-nexus-letter'. If it doesn't exist, we pick the first service.
DO $$
DECLARE
    default_service_id UUID;
BEGIN
    SELECT id INTO default_service_id FROM public.services WHERE slug = 'independent-medical-opinion-nexus-letter' LIMIT 1;
    
    IF default_service_id IS NULL THEN
        SELECT id INTO default_service_id FROM public.services LIMIT 1;
    END IF;

    IF default_service_id IS NOT NULL THEN
        UPDATE public.conditions SET service_id = default_service_id WHERE service_id IS NULL;
    END IF;
END $$;

-- 3. Drop global unique constraint on slug
-- In postgres, implicit unique constraints are named table_column_key
ALTER TABLE public.conditions DROP CONSTRAINT IF EXISTS conditions_slug_key;

-- 4. Add composite unique constraint
ALTER TABLE public.conditions ADD CONSTRAINT conditions_service_id_slug_key UNIQUE (service_id, slug);

-- 5. Drop old related_service_ids column and its validation trigger to clean up schema
DROP TRIGGER IF EXISTS trg_check_related_services ON public.conditions;
DROP FUNCTION IF EXISTS check_related_services_exist();
ALTER TABLE public.conditions DROP COLUMN IF EXISTS related_service_ids;

-- 6. Add Indexes
CREATE INDEX IF NOT EXISTS idx_conditions_service_id ON public.conditions(service_id);
