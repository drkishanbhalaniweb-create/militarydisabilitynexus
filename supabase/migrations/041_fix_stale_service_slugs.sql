-- Migration: Fix stale service slugs to align database with frontend routes
-- Renames old/stale slugs and titles in public.services to match the frontend page routes.

-- Update nexus-rebuttal-letters -> independent-medical-opinion-nexus-letter
UPDATE public.services 
SET slug = 'independent-medical-opinion-nexus-letter', title = 'Independent Medical Opinion (IMO) / Nexus Letter'
WHERE slug = 'nexus-rebuttal-letters';

-- Update public-dbqs -> disability-benefits-questionnaire-dbq
UPDATE public.services 
SET slug = 'disability-benefits-questionnaire-dbq', title = 'Disability Benefits Questionnaire (DBQ)'
WHERE slug = 'public-dbqs';

-- Update aid-attendance -> aid-and-attendance
UPDATE public.services 
SET slug = 'aid-and-attendance', title = 'Aid & Attendance'
WHERE slug = 'aid-attendance';

-- Update cp-coaching -> cp-exam-coaching
UPDATE public.services 
SET slug = 'cp-exam-coaching', title = 'C&P Exam Coaching'
WHERE slug = 'cp-coaching';

-- Update 1151-claim -> va-medical-malpractice-1151-case
UPDATE public.services 
SET slug = 'va-medical-malpractice-1151-case', title = '1151 Claim (VA Medical Malpractice)'
WHERE slug = '1151-claim';

-- Update record-review -> claim-readiness-review
UPDATE public.services 
SET slug = 'claim-readiness-review', title = 'Claim Readiness Review'
WHERE slug = 'record-review';
