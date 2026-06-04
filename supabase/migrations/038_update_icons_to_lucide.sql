-- Update body_systems icons to Lucide icon names
UPDATE public.body_systems SET icon = 'Brain' WHERE slug = 'neurology';
UPDATE public.body_systems SET icon = 'HeartPulse' WHERE slug = 'mental-health';
UPDATE public.body_systems SET icon = 'Activity' WHERE slug = 'gastrointestinal';
UPDATE public.body_systems SET icon = 'Wind' WHERE slug = 'respiratory';
UPDATE public.body_systems SET icon = 'Bone' WHERE slug = 'musculoskeletal';
UPDATE public.body_systems SET icon = 'Sparkles' WHERE slug = 'dermatology';
UPDATE public.body_systems SET icon = 'Ear' WHERE slug = 'audiology';
UPDATE public.body_systems SET icon = 'Ribbon' WHERE slug = 'oncology';
UPDATE public.body_systems SET icon = 'Activity' WHERE slug = 'nephrology';
UPDATE public.body_systems SET icon = 'Venus' WHERE slug = 'ob-gyn';
UPDATE public.body_systems SET icon = 'Mars' WHERE slug = 'male-reproductive';

-- Update conditions icons to Lucide icon names
UPDATE public.conditions SET icon = 'Zap' WHERE slug = 'migraine-headaches';
UPDATE public.conditions SET icon = 'Brain' WHERE slug = 'tbi';
UPDATE public.conditions SET icon = 'Zap' WHERE slug = 'radiculopathy';
UPDATE public.conditions SET icon = 'HeartPulse' WHERE slug = 'ptsd';
UPDATE public.conditions SET icon = 'HeartPulse' WHERE slug = 'anxiety';
UPDATE public.conditions SET icon = 'Moon' WHERE slug = 'sleep-apnea';
UPDATE public.conditions SET icon = 'Bone' WHERE slug = 'lumbar-spine';
UPDATE public.conditions SET icon = 'Sparkles' WHERE slug = 'eczema-dermatitis';
UPDATE public.conditions SET icon = 'Ear' WHERE slug = 'tinnitus';
UPDATE public.conditions SET icon = 'Flame' WHERE slug = 'gerd';
UPDATE public.conditions SET icon = 'Pill' WHERE slug = 'ibs';
