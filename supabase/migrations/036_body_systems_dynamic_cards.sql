-- Migration: Body Systems Dynamic Cards
-- Adds stat_cards and build_trust_links columns to body_systems
-- for admin-editable system page widgets.

-- Stat cards: up to 4 key metrics shown in a grid above the main content
ALTER TABLE public.body_systems ADD COLUMN IF NOT EXISTS stat_cards JSONB DEFAULT '[]'::jsonb;

-- Build Trust Before Buying: sidebar links for social proof
ALTER TABLE public.body_systems ADD COLUMN IF NOT EXISTS build_trust_links JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.body_systems.stat_cards IS 'Array of {label, value, subtext} stat card objects displayed in a 4-column grid';
COMMENT ON COLUMN public.body_systems.build_trust_links IS 'Array of {label, emoji, url} trust-building sidebar links (e.g. case studies, testimonials)';
