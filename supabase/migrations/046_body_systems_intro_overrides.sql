-- Migration: Add custom text section overrides for body_systems.
ALTER TABLE public.body_systems ADD COLUMN IF NOT EXISTS pathways_intro TEXT;
ALTER TABLE public.body_systems ADD COLUMN IF NOT EXISTS challenges_title TEXT;
ALTER TABLE public.body_systems ADD COLUMN IF NOT EXISTS services_title TEXT;
ALTER TABLE public.body_systems ADD COLUMN IF NOT EXISTS services_intro TEXT;
ALTER TABLE public.body_systems ADD COLUMN IF NOT EXISTS paired_title TEXT;

COMMENT ON COLUMN public.body_systems.pathways_intro IS 'Custom introductory text for the Signature Pathways section';
COMMENT ON COLUMN public.body_systems.challenges_title IS 'Custom heading for the Challenges section';
COMMENT ON COLUMN public.body_systems.services_title IS 'Custom heading for the Medical Evidence Services section';
COMMENT ON COLUMN public.body_systems.services_intro IS 'Custom introductory text for the Medical Evidence Services section';
COMMENT ON COLUMN public.body_systems.paired_title IS 'Custom heading for the Commonly Paired section';
