-- Migration: Add cta_price to body_systems
ALTER TABLE public.body_systems ADD COLUMN IF NOT EXISTS cta_price TEXT;
COMMENT ON COLUMN public.body_systems.cta_price IS 'Custom pricing string displayed on the CTA button (e.g., "$400+", "$1,600+")';
