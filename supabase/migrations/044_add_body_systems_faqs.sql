-- Migration: Add faqs to body_systems
-- Adds a dynamic faqs column of type JSONB to body_systems table.

ALTER TABLE public.body_systems ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.body_systems.faqs IS 'Array of {question, answer} objects for the body systems FAQ section';
