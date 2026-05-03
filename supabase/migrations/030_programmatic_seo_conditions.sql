-- Create conditions table for programmatic SEO landing pages
CREATE TABLE IF NOT EXISTS public.conditions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    page_title TEXT NOT NULL,
    meta_description TEXT,
    hero_heading TEXT NOT NULL,
    content_html TEXT NOT NULL,
    faqs JSONB DEFAULT '[]'::jsonb,
    related_service_ids UUID[] DEFAULT '{}'::uuid[],
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.conditions;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.conditions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION check_related_services_exist()
RETURNS TRIGGER AS $$
DECLARE
    invalid_id UUID;
BEGIN
    IF NEW.related_service_ids IS NOT NULL THEN
        SELECT s_id INTO invalid_id
        FROM unnest(NEW.related_service_ids) AS s_id
        WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE id = s_id);
        
        IF FOUND THEN
            RAISE EXCEPTION 'Foreign key violation: service ID % does not exist', invalid_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_related_services ON public.conditions;
CREATE TRIGGER trg_check_related_services
    BEFORE INSERT OR UPDATE ON public.conditions
    FOR EACH ROW
    EXECUTE FUNCTION check_related_services_exist();

-- Enable RLS
ALTER TABLE public.conditions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to published conditions"
    ON public.conditions FOR SELECT
    TO public
    USING (is_published = true);

CREATE POLICY "Allow authenticated full access to conditions"
    ON public.conditions FOR ALL
    TO authenticated
    USING (auth.uid() IN (SELECT id FROM public.admin_users))
    WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_conditions_slug ON public.conditions(slug);
CREATE INDEX IF NOT EXISTS idx_conditions_is_published ON public.conditions(is_published);
