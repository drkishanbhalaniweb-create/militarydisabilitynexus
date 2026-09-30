-- Migration: 059_pinned_testimonials.sql
-- Description: Adds is_pinned and pin_order columns with optimized sorting index to testimonials table.

ALTER TABLE public.testimonials
    ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS pin_order INTEGER DEFAULT 0;

-- Optimized compound index for pinned items ordering and fallback to chronological
CREATE INDEX IF NOT EXISTS idx_testimonials_pinned_order
    ON public.testimonials(is_pinned DESC, pin_order ASC, created_at DESC);

COMMENT ON COLUMN public.testimonials.is_pinned IS 'Indicates whether the testimonial is pinned to appear at the top of testimonial lists.';
COMMENT ON COLUMN public.testimonials.pin_order IS 'Display priority for pinned testimonials (lower number = higher priority, e.g. 1 appears before 2).';
