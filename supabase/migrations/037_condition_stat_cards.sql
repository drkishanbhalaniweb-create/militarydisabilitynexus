-- Migration: Condition Stat Cards
-- Switches conditions from 6 individual stat fields to a single JSONB stat_cards column
-- for consistency with the body_systems approach.

-- Step 1: Add the new column
ALTER TABLE public.conditions ADD COLUMN IF NOT EXISTS stat_cards JSONB DEFAULT '[]'::jsonb;

-- Step 2: Migrate existing data into the new column
-- Only migrate rows that have at least one old stat field populated
UPDATE public.conditions
SET stat_cards = jsonb_build_array(
  jsonb_build_object('label', 'Diagnostic Code', 'value', COALESCE('DC ' || dc_code, 'Varies'), 'subtext', COALESCE(dc_name, '')),
  jsonb_build_object('label', 'Starting At', 'value', COALESCE(stat_starting_price, '$400'), 'subtext', COALESCE(stat_provider, 'Nurse Practitioner')),
  jsonb_build_object('label', 'Turnaround', 'value', COALESCE(stat_turnaround_time, '7–10 Days'), 'subtext', COALESCE(stat_turnaround_note, 'Rush 48–72hrs')),
  jsonb_build_object('label', 'Consultation', 'value', COALESCE(stat_consultation_type, 'Free'), 'subtext', COALESCE(stat_consultation_note, 'No obligation'))
)
WHERE stat_cards = '[]'::jsonb
  AND (stat_starting_price IS NOT NULL OR stat_turnaround_time IS NOT NULL OR stat_consultation_type IS NOT NULL OR dc_code IS NOT NULL);

-- Step 3: Drop old columns
ALTER TABLE public.conditions DROP COLUMN IF EXISTS stat_turnaround_time;
ALTER TABLE public.conditions DROP COLUMN IF EXISTS stat_turnaround_note;
ALTER TABLE public.conditions DROP COLUMN IF EXISTS stat_consultation_type;
ALTER TABLE public.conditions DROP COLUMN IF EXISTS stat_consultation_note;
ALTER TABLE public.conditions DROP COLUMN IF EXISTS stat_starting_price;
ALTER TABLE public.conditions DROP COLUMN IF EXISTS stat_provider;

COMMENT ON COLUMN public.conditions.stat_cards IS 'Array of {label, value, subtext} stat card objects displayed in a 4-column grid on the condition page';
