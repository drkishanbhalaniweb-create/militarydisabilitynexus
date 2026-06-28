-- Migration: Deactivate C&P Exam Coaching service
UPDATE public.services
SET is_active = false
WHERE slug = 'cp-exam-coaching';
lo