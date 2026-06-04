-- Migration: Service Content Architecture
-- Adds pricing_tiers and body_systems tables.
-- Extends conditions with structured clinical, specialist, and relationship fields.
-- All condition ALTER statements are additive — existing rows are unaffected.


-- ============================================
-- PRICING TIERS
-- ============================================

CREATE TABLE IF NOT EXISTS public.pricing_tiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    provider_description TEXT,
    base_price TEXT NOT NULL,
    mental_health_price TEXT,
    note TEXT,
    best_for TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.pricing_tiers IS 'Admin-managed pricing tiers displayed in the pricing comparison modal';
COMMENT ON COLUMN public.pricing_tiers.base_price IS 'Display string, e.g. "$400" or "$945–$1,800"';
COMMENT ON COLUMN public.pricing_tiers.mental_health_price IS 'Alternate price shown for MH conditions, e.g. "$1,600–$2,400"';
COMMENT ON COLUMN public.pricing_tiers.is_featured IS 'Highlights this tier with a "Most Chosen" badge';


-- ============================================
-- BODY SYSTEMS
-- ============================================

CREATE TABLE IF NOT EXISTS public.body_systems (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    description TEXT NOT NULL,
    overview TEXT NOT NULL,
    is_mental_health BOOLEAN DEFAULT false,
    specialist_guide JSONB DEFAULT '[]'::jsonb,
    paired_systems TEXT[] DEFAULT '{}'::text[],
    pair_note TEXT,
    display_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.body_systems IS 'Medical body system categories that group conditions (e.g. Neurology, GI, Mental Health)';
COMMENT ON COLUMN public.body_systems.specialist_guide IS 'Array of {name, role, best_for, price, note} objects';
COMMENT ON COLUMN public.body_systems.paired_systems IS 'Names of body systems commonly paired with this one';


-- ============================================
-- EXTEND CONDITIONS TABLE
-- ============================================

-- Classification
ALTER TABLE public.conditions ADD COLUMN IF NOT EXISTS body_system_id UUID REFERENCES public.body_systems(id) ON DELETE SET NULL;
ALTER TABLE public.conditions ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '📋';
ALTER TABLE public.conditions ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE public.conditions ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- VA diagnostic code and rating criteria
ALTER TABLE public.conditions ADD COLUMN IF NOT EXISTS dc_code TEXT;
ALTER TABLE public.conditions ADD COLUMN IF NOT EXISTS dc_name TEXT;
ALTER TABLE public.conditions ADD COLUMN IF NOT EXISTS ratings JSONB DEFAULT '[]'::jsonb;

-- Clinical content
ALTER TABLE public.conditions ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}'::text[];
ALTER TABLE public.conditions ADD COLUMN IF NOT EXISTS secondary_connections JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.conditions ADD COLUMN IF NOT EXISTS specialist_guide JSONB DEFAULT '[]'::jsonb;

-- Related conditions
ALTER TABLE public.conditions ADD COLUMN IF NOT EXISTS paired_conditions TEXT[] DEFAULT '{}'::text[];
ALTER TABLE public.conditions ADD COLUMN IF NOT EXISTS pair_note TEXT;
ALTER TABLE public.conditions ADD COLUMN IF NOT EXISTS internal_links JSONB DEFAULT '[]'::jsonb;

-- SEO
ALTER TABLE public.conditions ADD COLUMN IF NOT EXISTS seo_keywords TEXT[] DEFAULT '{}'::text[];

COMMENT ON COLUMN public.conditions.dc_code IS 'VA Diagnostic Code, e.g. "8100"';
COMMENT ON COLUMN public.conditions.ratings IS 'Array of {pct, criteria} rating breakdowns';
COMMENT ON COLUMN public.conditions.secondary_connections IS 'Array of {from, mechanism} service connection pathways';
COMMENT ON COLUMN public.conditions.specialist_guide IS 'Array of {name, price, best_for} provider recommendations';
COMMENT ON COLUMN public.conditions.internal_links IS 'Array of {type, icon, label, title, url} cross-links';


-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_pricing_tiers_slug ON public.pricing_tiers(slug);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_display_order ON public.pricing_tiers(display_order);

CREATE INDEX IF NOT EXISTS idx_body_systems_slug ON public.body_systems(slug);
CREATE INDEX IF NOT EXISTS idx_body_systems_published ON public.body_systems(is_published);
CREATE INDEX IF NOT EXISTS idx_body_systems_display_order ON public.body_systems(display_order);

CREATE INDEX IF NOT EXISTS idx_conditions_body_system ON public.conditions(body_system_id);
CREATE INDEX IF NOT EXISTS idx_conditions_display_order ON public.conditions(display_order);


-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================

-- Ensure the shared trigger function exists (safe to re-run)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_pricing_tiers ON public.pricing_tiers;
CREATE TRIGGER set_updated_at_pricing_tiers
    BEFORE UPDATE ON public.pricing_tiers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_body_systems ON public.body_systems;
CREATE TRIGGER set_updated_at_body_systems
    BEFORE UPDATE ON public.body_systems
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- ============================================
-- ROW LEVEL SECURITY — PRICING TIERS
-- ============================================

ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active pricing tiers"
    ON public.pricing_tiers FOR SELECT
    TO public
    USING (is_active = true);

CREATE POLICY "Allow authenticated full access to pricing tiers"
    ON public.pricing_tiers FOR ALL
    TO authenticated
    USING (auth.uid() IN (SELECT id FROM public.admin_users))
    WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));


-- ============================================
-- ROW LEVEL SECURITY — BODY SYSTEMS
-- ============================================

ALTER TABLE public.body_systems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to published body systems"
    ON public.body_systems FOR SELECT
    TO public
    USING (is_published = true);

CREATE POLICY "Allow authenticated full access to body systems"
    ON public.body_systems FOR ALL
    TO authenticated
    USING (auth.uid() IN (SELECT id FROM public.admin_users))
    WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));
