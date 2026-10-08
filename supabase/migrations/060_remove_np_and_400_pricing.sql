-- Migration: 060_remove_np_and_400_pricing.sql
-- Description: Transition services and pricing exclusively to MD/DO clinicians ($945+ entry tier)
-- and remove historical Nurse Practitioner ($400) references.

-- 1. Update Nexus Letter service base price from 400 to 945
UPDATE public.services
SET base_price_usd = 945,
    updated_at = NOW()
WHERE slug = 'independent-medical-opinion-nexus-letter';

-- 2. Update stale $400+ / $450+ body system call-to-action prices to $945+
UPDATE public.body_systems
SET cta_price = '$945+',
    updated_at = NOW()
WHERE cta_price IN ('$400+', '$450+');

-- 3. Deactivate and archive the historical Nurse Practitioner pricing tier
UPDATE public.pricing_tiers
SET base_price = '$945+',
    note = 'Archived',
    best_for = '',
    name = 'Archived NP',
    is_active = false,
    updated_at = NOW()
WHERE slug = 'nurse-practitioner';

-- 4. Standardize medical opinion rush fee to $500 (50000 cents)
UPDATE public.service_pricing
SET rush_fee = 50000,
    updated_at = NOW()
WHERE service_type = 'medical_opinion';
