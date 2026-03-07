DROP POLICY IF EXISTS "Published testimonials are viewable by everyone" ON testimonials;
DROP POLICY IF EXISTS "Testimonials are viewable by everyone" ON testimonials;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'testimonials'
          AND column_name = 'client_name'
    ) THEN
        ALTER TABLE testimonials RENAME COLUMN client_name TO name;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'testimonials'
          AND column_name = 'client_title'
    ) THEN
        ALTER TABLE testimonials RENAME COLUMN client_title TO branch;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'testimonials'
          AND column_name = 'testimonial_text'
    ) THEN
        ALTER TABLE testimonials RENAME COLUMN testimonial_text TO feedback;
    END IF;
END $$;

ALTER TABLE testimonials
    DROP COLUMN IF EXISTS client_image,
    DROP COLUMN IF EXISTS service_id,
    DROP COLUMN IF EXISTS is_featured,
    DROP COLUMN IF EXISTS is_published,
    DROP COLUMN IF EXISTS display_order;

ALTER TABLE testimonials
    ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE POLICY "Testimonials are viewable by everyone"
    ON testimonials FOR SELECT
    USING (true);

CREATE INDEX IF NOT EXISTS idx_testimonials_created ON testimonials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_tags ON testimonials USING GIN(tags);

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at
    BEFORE UPDATE ON testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
