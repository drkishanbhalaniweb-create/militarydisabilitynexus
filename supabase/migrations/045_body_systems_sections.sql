-- Migration: Body Systems Section Enhancements
-- Adds pathways, challenges, and service_descriptions columns to body_systems.

ALTER TABLE public.body_systems ADD COLUMN IF NOT EXISTS pathways JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.body_systems ADD COLUMN IF NOT EXISTS challenges JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.body_systems ADD COLUMN IF NOT EXISTS service_descriptions JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.body_systems.pathways IS 'Array of {from, to, mechanism} for signature flowcharts';
COMMENT ON COLUMN public.body_systems.challenges IS 'Array of {icon, title, description} for the why it is complex section';
COMMENT ON COLUMN public.body_systems.service_descriptions IS 'Array of {service_slug, text} for service comparisons';
