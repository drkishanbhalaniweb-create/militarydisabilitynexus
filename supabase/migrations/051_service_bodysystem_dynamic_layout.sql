-- Add layout_sections JSONB column to services and body_systems

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS layout_sections JSONB DEFAULT NULL;
COMMENT ON COLUMN public.services.layout_sections IS 'Array of layout section objects: {id, type, title, content_html, is_visible}';

ALTER TABLE public.body_systems ADD COLUMN IF NOT EXISTS layout_sections JSONB DEFAULT NULL;
COMMENT ON COLUMN public.body_systems.layout_sections IS 'Array of layout section objects: {id, type, title, content_html, is_visible}';
