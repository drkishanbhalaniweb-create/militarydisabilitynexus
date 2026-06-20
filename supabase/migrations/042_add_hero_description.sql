-- Migration: Add hero_description to conditions
-- Adds a dedicated hero_description column for distinct content on the hero card.

ALTER TABLE public.conditions ADD COLUMN IF NOT EXISTS hero_description TEXT;

COMMENT ON COLUMN public.conditions.hero_description IS 'Dedicated description displayed on the hero card of the condition page';
