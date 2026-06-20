-- Migration: Add hero_description to body_systems
-- Adds a dedicated hero_description column for distinct content on the hero card.

ALTER TABLE public.body_systems ADD COLUMN IF NOT EXISTS hero_description TEXT;

COMMENT ON COLUMN public.body_systems.hero_description IS 'Dedicated description displayed on the hero card of the body systems page';
