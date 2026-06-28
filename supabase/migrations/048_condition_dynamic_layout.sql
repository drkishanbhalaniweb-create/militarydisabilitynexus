-- Migration: Condition Dynamic Layout Sections
-- Adds layout_sections column to conditions table for custom text boxes and dynamic ordering.

ALTER TABLE public.conditions ADD COLUMN IF NOT EXISTS layout_sections JSONB DEFAULT NULL;

COMMENT ON COLUMN public.conditions.layout_sections IS 'Array of layout section objects: {id, type, title, content_html, is_visible}';
