-- Seed Body Systems and Conditions from Reference HTML
-- This script uses ON CONFLICT DO NOTHING to avoid duplicates.

DO $$ 
DECLARE
    nexus_id UUID;
    dbq_id UUID;
    system_id UUID;
BEGIN
    -- 1. Get Service IDs
    SELECT id INTO nexus_id FROM services WHERE slug = 'independent-medical-opinion-nexus-letter';
    SELECT id INTO dbq_id FROM services WHERE slug = 'disability-benefits-questionnaire-dbq';

    IF nexus_id IS NULL OR dbq_id IS NULL THEN
        RAISE EXCEPTION 'Core services (Nexus/DBQ) not found. Please ensure they exist before seeding.';
    END IF;

    -- 2. Seed Pricing Tiers
    INSERT INTO pricing_tiers (name, slug, provider_description, base_price, mental_health_price, note, best_for, features, is_featured, display_order)
    VALUES 
    ('Nurse Practitioner', 'nurse-practitioner', 'Former C&P Examiner', '$400', 'N/A', '+ $250 per additional condition', 'Straightforward claims with strong service records.', '["Former VA C&P examining experience", "Full record review + clinical rationale", "\"At least as likely as not\" opinion", "7–10 business day turnaround", "One-on-one consultation", "$250 per additional condition"]'::jsonb, false, 1),
    ('Internist / Specialist', 'internist-specialist', 'Board-Certified (Specialty-Matched)', '$945–$1,800', '$1,600–$2,400', 'All claim theories included', 'Secondary, denied, complex claims. All theories (presumptive, direct, secondary) in one letter.', '["Board-certified physician matched to condition", "All claim theories in single letter", "Detailed medical literature citations", "Addresses counterarguments & denials", "Rush 48–72hrs available", "One-on-one specialist consultation"]'::jsonb, true, 2),
    ('Complex / High-Stakes', 'complex-high-stakes', 'Sub-Specialist or Multi-Specialist', '$2,000+', '$2,000+', 'Custom quote', '1151, oncology, multi-condition TDIU, BVA appeals.', '["Sub-specialist or multi-specialist team", "Forensic-level record analysis", "Multi-condition combined opinions", "Rebuttal of negative C&P opinions", "BVA hearing-ready documentation", "Attorney coordination"]'::jsonb, false, 3)
    ON CONFLICT (slug) DO NOTHING;

    -- 3. Seed Body Systems
    INSERT INTO body_systems (name, icon, slug, description, overview, specialist_guide, paired_systems, pair_note, is_mental_health, display_order)
    VALUES 
    ('Neurology', 'Brain', 'neurology', 'Headaches, TBI, movement disorders, nerve damage.', 
     'Neurology claims encompass conditions affecting the brain, spinal cord, and peripheral nerves. These are among the most complex VA claims because they often involve multiple rating criteria (DC 8045 for TBI, DC 8100 for migraines) and frequently intersect with mental health secondary claims.',
     '[{"n": "Nurse Practitioner", "r": "Former C&P Examiner", "b": "Straightforward migraine or tinnitus-related headache claims with clear STR documentation.", "p": "From $400", "t": "+$250/additional"}, {"n": "Internal Medicine MD", "r": "Board-Certified Internist", "b": "Most neurology nexus opinions once diagnosis is documented. All claim theories included in single letter.", "p": "$945", "t": "All theories included"}, {"n": "Neurologist", "r": "Board-Certified", "b": "TBI rating-detail (DC 8045), ALS, MS, Parkinson''s, EMG/NCS interpretation.", "p": "$1,200–$1,800", "t": "Rating-detail cases"}]'::jsonb,
     '{"Mental Health", "Audiology", "Musculoskeletal"}', 
     'Neurology frequently pairs with mental health (PTSD secondary to TBI), audiology (tinnitus from same blast event), and musculoskeletal (cervical spine causing radiculopathy).', 
     false, 1),
    ('Mental Health', 'HeartPulse', 'mental-health', 'PTSD, anxiety, depression, insomnia, MST.', 
     'Mental health is unique — the diagnosis and nexus question are inseparable. Always requires psychiatrist or Ph.D./Psy.D. psychologist.',
     '[{"n": "Psychiatrist (MD)", "r": "Board-Certified", "b": "All mental health claims.", "p": "$1,600–$2,400", "t": "Required"}, {"n": "Psychologist (Ph.D./Psy.D.)", "r": "Doctorate-Level", "b": "Equal weight to psychiatrists. Often more affordable.", "p": "$1,600–$2,000", "t": "Equal VA weight"}]'::jsonb,
     '{"GI", "Respiratory", "Neurology"}', 
     'Mental health is the most commonly paired system — GERD, IBS, sleep apnea frequently secondary to PTSD medications.', 
     true, 2),
    ('GI (Gastrointestinal)', 'Activity', 'gastrointestinal', 'GERD, IBS, Crohn''s, ulcerative colitis.', 
     'GI conditions are the most commonly filed secondary claims. Once diagnosis is confirmed, the nexus question is causation analysis — core internal medicine competency.',
     '[{"n": "Nurse Practitioner", "r": "Former C&P Examiner", "b": "Straightforward GERD or IBS with clear medication connection.", "p": "From $400", "t": "+$250/additional"}, {"n": "Internal Medicine MD", "r": "Board-Certified", "b": "Most GI nexus opinions. All theories included.", "p": "$945", "t": "All theories included"}, {"n": "Gastroenterologist", "r": "Board-Certified", "b": "Contested diagnosis or biopsy interpretation.", "p": "$1,200–$1,800", "t": "Contested"}]'::jsonb,
     '{"Mental Health", "Respiratory", "Musculoskeletal"}', 
     'GI claims almost always pair with mental health — GERD and IBS commonly secondary to PTSD medications.', 
     false, 3),
    ('Respiratory', 'Wind', 'respiratory', 'Sleep apnea, asthma, COPD, burn pit conditions.', 'Respiratory claims surged after the PACT Act. Most handled by internist once PFTs or polysomnogram exist.', NULL, NULL, NULL, false, 4),
    ('Musculoskeletal', 'Bone', 'musculoskeletal', 'Back, knee, shoulder, neck, joint disorders.', 'The most commonly filed VA claims. NP or internist for non-surgical; orthopedist for surgical cases.', NULL, NULL, NULL, false, 5),
    ('Dermatology', 'Sparkles', 'dermatology', 'Eczema, psoriasis, chloracne, burn scars.', 'Often toxic-exposure-driven. Internist handles exposure causation effectively.', NULL, NULL, NULL, false, 6),
    ('Audiology', 'Ear', 'audiology', 'Hearing loss, tinnitus, ear conditions.', 'Tinnitus is #1 VA condition. Once audiogram exists, internist writes effective nexus.', NULL, NULL, NULL, false, 7),
    ('Cancer / Oncology', 'Ribbon', 'oncology', 'Agent Orange, burn pit, radiation cancers.', 'Presumptive cancers: internist confirms diagnosis and service. Non-presumptive: oncologist argues causation.', NULL, NULL, NULL, false, 8),
    ('Nephrology', 'Activity', 'nephrology', 'Kidney disease, ESRD, dialysis.', 'CKD stages 1–3: internist. Advanced disease: nephrologist for rating precision.', NULL, NULL, NULL, false, 9),
    ('OB-GYN', 'Venus', 'ob-gyn', 'Endometriosis, fibroids, PCOS, reproductive conditions.', 'Many gynecologic VA claims are toxic-exposure-medicine questions. Internist often writes more compelling causation.', NULL, NULL, NULL, false, 10),
    ('Male Reproductive', 'Mars', 'male-reproductive', 'ED, prostate, testosterone deficiency.', 'Most male reproductive claims are secondary — ED to PTSD meds, prostate cancer presumptive for Agent Orange.', NULL, NULL, NULL, false, 11)
    ON CONFLICT (slug) DO NOTHING;

    -- 3. Seed Conditions (Neurology)
    SELECT id INTO system_id FROM body_systems WHERE slug = 'neurology';
    IF system_id IS NOT NULL THEN
        -- Migraine
        INSERT INTO conditions (service_id, body_system_id, slug, icon, page_title, hero_heading, short_description, content_html, dc_code, dc_name, ratings, features, secondary_connections, specialist_guide, paired_conditions, seo_keywords, is_published)
        SELECT s.id, system_id, 'migraine-headaches', 'Zap', 'Migraine / Headaches', 'Migraine / Headaches', 
        'Expert nexus letters and DBQs for migraine and chronic headache VA disability claims.',
        '<p>Migraine headaches are rated under VA Diagnostic Code 8100 at 0%, 10%, 30%, or 50% based on the frequency of prostrating attacks and their economic impact.</p>',
        '8100', 'Migraine Headaches',
        '[{"pct": "50%", "criteria": "Very frequent, completely prostrating and prolonged attacks productive of severe economic inadaptability"}, {"pct": "30%", "criteria": "Prostrating attacks occurring on average once a month over the last several months"}, {"pct": "10%", "criteria": "Prostrating attacks averaging one in two months over the last several months"}]'::jsonb,
        ARRAY['Nexus letters for primary/secondary connection', 'DBQ completion documenting frequency', 'Documentation targeting 30% and 50% thresholds'],
        '[{"from": "PTSD", "mechanism": "Autonomic nervous system dysregulation"}, {"from": "TBI", "mechanism": "Post-traumatic headaches"}]'::jsonb,
        '[{"name": "Internal Medicine MD", "price": "$945", "best_for": "Most migraine claims"}]'::jsonb,
        ARRAY['TBI', 'PTSD', 'Tinnitus'], ARRAY['migraine nexus letter', 'migraine VA claim'], true
        FROM (SELECT nexus_id as id UNION SELECT dbq_id as id) s
        ON CONFLICT (service_id, slug) DO NOTHING;

        -- TBI
        INSERT INTO conditions (service_id, body_system_id, slug, icon, page_title, hero_heading, short_description, content_html, dc_code, dc_name, ratings, features, secondary_connections, specialist_guide, paired_conditions, seo_keywords, is_published)
        SELECT s.id, system_id, 'tbi', 'Brain', 'Traumatic Brain Injury (TBI)', 'Traumatic Brain Injury (TBI)', 
        'Expert nexus letters for TBI claims rated under DC 8045 across cognitive, behavioral, and somatic domains.',
        '<p>Traumatic Brain Injury is rated under the specialized DC 8045 criteria across three domains: cognitive, behavioral/emotional, and physical/somatic.</p>',
        '8045', 'Traumatic Brain Injury',
        '[{"pct": "100%", "criteria": "Total occupational and social impairment"}, {"pct": "70%", "criteria": "Deficiencies in most areas"}]'::jsonb,
        ARRAY['Facet-level documentation across cognitive, behavioral, and somatic domains', 'Differentiation of TBI residuals from comorbid PTSD symptoms'],
        '[{"from": "Blast Exposure", "mechanism": "Concussive and sub-concussive blast injuries"}]'::jsonb,
        '[{"name": "Neurologist", "price": "$1,200–$1,800", "best_for": "Required for TBI rating-detail"}]'::jsonb,
        ARRAY['Migraine', 'PTSD'], ARRAY['TBI nexus letter', 'DC 8045'], true
        FROM (SELECT nexus_id as id UNION SELECT dbq_id as id) s
        ON CONFLICT (service_id, slug) DO NOTHING;
        
        -- Radiculopathy
        INSERT INTO conditions (service_id, body_system_id, slug, icon, page_title, hero_heading, short_description, content_html, dc_code, dc_name, ratings, features, secondary_connections, specialist_guide, paired_conditions, seo_keywords, is_published)
        SELECT s.id, system_id, 'radiculopathy', 'Zap', 'Radiculopathy', 'Radiculopathy', 
        'Nexus letters for radiculopathy claims secondary to spinal conditions.',
        '<p>Radiculopathy involves nerve root compression causing radiating pain, numbness, or weakness. It is almost always filed secondary to service-connected spinal conditions (lumbar or cervical).</p>',
        '8520', 'Nerve Root Compression',
        '[{"pct": "10%–60%", "criteria": "Based on affected nerve root and degree of incomplete paralysis"}]'::jsonb,
        ARRAY['Secondary connection to spinal conditions', 'Imaging correlation with clinical findings'],
        '[{"from": "Lumbar Spine", "mechanism": "Disc herniation or stenosis compressing nerve roots"}]'::jsonb,
        '[{"name": "Internal Medicine MD", "price": "$945", "best_for": "Most radiculopathy claims"}]'::jsonb,
        ARRAY['Back Pain', 'Neck Pain'], ARRAY['radiculopathy nexus letter', 'radiculopathy VA claim'], true
        FROM (SELECT nexus_id as id UNION SELECT dbq_id as id) s
        ON CONFLICT (service_id, slug) DO NOTHING;
    END IF;

    -- 4. Seed Conditions (Mental Health)
    SELECT id INTO system_id FROM body_systems WHERE slug = 'mental-health';
    IF system_id IS NOT NULL THEN
        -- PTSD
        INSERT INTO conditions (service_id, body_system_id, slug, icon, page_title, hero_heading, short_description, content_html, dc_code, dc_name, ratings, features, secondary_connections, specialist_guide, paired_conditions, seo_keywords, is_published)
        SELECT s.id, system_id, 'ptsd', 'HeartPulse', 'PTSD', 'PTSD', 
        'Expert nexus letters for PTSD VA claims including combat, MST, and non-combat stressors.',
        '<p>PTSD is rated under VA § 4.130 at 0%, 10%, 30%, 50%, 70%, or 100% based on occupational and social impairment.</p>',
        '9411', 'Post-Traumatic Stress Disorder',
        '[{"pct": "100%", "criteria": "Total occupational and social impairment"}, {"pct": "70%", "criteria": "Deficiencies in most areas"}]'::jsonb,
        ARRAY['DSM-5 assessment and stressor verification', 'Documentation targeting 70% and 100% rating criteria'],
        '[{"from": "Combat", "mechanism": "Direct combat exposure stressor"}]'::jsonb,
        '[{"name": "Psychiatrist (MD)", "price": "$1,600–$2,400", "best_for": "Required — non-negotiable"}]'::jsonb,
        ARRAY['GERD', 'IBS', 'Sleep Apnea'], ARRAY['PTSD nexus letter', 'PTSD VA claim'], true
        FROM (SELECT nexus_id as id UNION SELECT dbq_id as id) s
        ON CONFLICT (service_id, slug) DO NOTHING;
        
        -- Anxiety
        INSERT INTO conditions (service_id, body_system_id, slug, icon, page_title, hero_heading, short_description, content_html, dc_code, dc_name, ratings, features, secondary_connections, specialist_guide, paired_conditions, seo_keywords, is_published)
        SELECT s.id, system_id, 'anxiety', 'HeartPulse', 'Anxiety / GAD', 'Anxiety / GAD', 
        'Nexus letters for anxiety and GAD claims secondary to service or chronic pain.',
        '<p>Generalized Anxiety Disorder is rated under the same § 4.130 criteria as PTSD. It can be directly connected to service or secondary to chronic pain.</p>',
        '9400', 'Generalized Anxiety Disorder',
        '[{"pct": "0%–100%", "criteria": "Same § 4.130 mental health rating criteria as PTSD"}]'::jsonb,
        ARRAY['DSM-5 GAD diagnosis and nexus opinion', 'Secondary connection to chronic pain conditions'],
        '[{"from": "Chronic Pain", "mechanism": "Anxiety secondary to service-connected pain conditions"}]'::jsonb,
        '[{"name": "Psychiatrist (MD)", "price": "$1,600–$2,400", "best_for": "Required"}]'::jsonb,
        ARRAY['PTSD', 'Insomnia'], ARRAY['anxiety nexus letter', 'GAD VA claim'], true
        FROM (SELECT nexus_id as id UNION SELECT dbq_id as id) s
        ON CONFLICT (service_id, slug) DO NOTHING;
    END IF;

    -- 5. Seed Conditions (Respiratory)
    SELECT id INTO system_id FROM body_systems WHERE slug = 'respiratory';
    IF system_id IS NOT NULL THEN
        -- Sleep Apnea
        INSERT INTO conditions (service_id, body_system_id, slug, icon, page_title, hero_heading, short_description, content_html, dc_code, dc_name, ratings, features, secondary_connections, specialist_guide, paired_conditions, seo_keywords, is_published)
        SELECT s.id, system_id, 'sleep-apnea', 'Moon', 'Sleep Apnea', 'Sleep Apnea', 
        'Expert nexus letters for Sleep Apnea VA claims secondary to PTSD, obesity, or rhinitis.',
        '<p>Sleep apnea is rated under DC 6847 based on the requirement for a CPAP machine or other breathing assistance.</p>',
        '6847', 'Sleep Apnea Syndrome',
        '[{"pct": "50%", "criteria": "Requires use of breathing assistance device (CPAP)"}, {"pct": "30%", "criteria": "Persistent day-time hypersomnolence"}]'::jsonb,
        ARRAY['Nexus letters for secondary connection to PTSD', 'Obesity as an intermediate step nexus opinions'],
        '[{"from": "PTSD", "mechanism": "Weight gain from meds and autonomic arousal"}, {"from": "Rhinitis", "mechanism": "Mechanical airway obstruction"}]'::jsonb,
        '[{"name": "Internal Medicine MD", "price": "$945", "best_for": "Most sleep apnea claims"}]'::jsonb,
        ARRAY['PTSD', 'Rhinitis'], ARRAY['sleep apnea nexus letter', 'VA sleep apnea claim'], true
        FROM (SELECT nexus_id as id UNION SELECT dbq_id as id) s
        ON CONFLICT (service_id, slug) DO NOTHING;
    END IF;

    -- 6. Seed Conditions (Musculoskeletal)
    SELECT id INTO system_id FROM body_systems WHERE slug = 'musculoskeletal';
    IF system_id IS NOT NULL THEN
        -- Back Pain
        INSERT INTO conditions (service_id, body_system_id, slug, icon, page_title, hero_heading, short_description, content_html, dc_code, dc_name, ratings, features, secondary_connections, specialist_guide, paired_conditions, seo_keywords, is_published)
        SELECT s.id, system_id, 'lumbar-spine', 'Bone', 'Lumbar Spine / Back Pain', 'Lumbar Spine / Back Pain', 
        'Expert nexus letters and DBQs for back pain and degenerative disc disease claims.',
        '<p>Spinal conditions are primarily rated based on Range of Motion (ROM) under the General Rating Formula for Diseases and Injuries of the Spine.</p>',
        '5242', 'Degenerative Arthritis of the Spine',
        '[{"pct": "40%", "criteria": "Unfavorable ankylosis of the entire thoracolumbar segment"}, {"pct": "20%", "criteria": "Forward flexion of the thoracolumbar spine 31 to 60 degrees"}]'::jsonb,
        ARRAY['DBQs documenting ROM measurements', 'Nexus letters for secondary radiculopathy'],
        '[{"from": "In-service Injury", "mechanism": "Acute trauma leading to chronic degeneration"}]'::jsonb,
        '[{"name": "Internal Medicine MD", "price": "$945", "best_for": "Most spinal claims"}]'::jsonb,
        ARRAY['Radiculopathy', 'Knee Pain'], ARRAY['VA back pain claim', 'lumbar spine nexus'], true
        FROM (SELECT nexus_id as id UNION SELECT dbq_id as id) s
        ON CONFLICT (service_id, slug) DO NOTHING;
    END IF;

    -- 7. Seed Conditions (Dermatology)
    SELECT id INTO system_id FROM body_systems WHERE slug = 'dermatology';
    IF system_id IS NOT NULL THEN
        -- Eczema
        INSERT INTO conditions (service_id, body_system_id, slug, icon, page_title, hero_heading, short_description, content_html, dc_code, dc_name, ratings, features, secondary_connections, specialist_guide, paired_conditions, seo_keywords, is_published)
        SELECT s.id, system_id, 'eczema-dermatitis', 'Sparkles', 'Eczema / Dermatitis', 'Eczema / Dermatitis', 
        'Nexus letters for skin conditions related to toxic exposure or service stress.',
        '<p>Skin conditions are rated based on the percentage of body area affected or the requirement for systemic therapy (corticosteroids, etc.).</p>',
        '7806', 'Dermatitis',
        '[{"pct": "60%", "criteria": "Systemic therapy required for 6 months or more"}, {"pct": "30%", "criteria": "Systemic therapy required for 6 weeks or more"}]'::jsonb,
        ARRAY['Nexus for PACT Act / Toxic Exposure connection', 'Documentation of systemic therapy requirements'],
        '[{"from": "Toxic Exposure", "mechanism": "Environmental triggers from burn pits or chemicals"}]'::jsonb,
        '[{"name": "Internal Medicine MD", "price": "$945", "best_for": "Most skin claims"}]'::jsonb,
        ARRAY['Asthma', 'PTSD'], ARRAY['VA eczema claim', 'dermatitis nexus letter'], true
        FROM (SELECT nexus_id as id UNION SELECT dbq_id as id) s
        ON CONFLICT (service_id, slug) DO NOTHING;
    END IF;

    -- 8. Seed Conditions (Audiology)
    SELECT id INTO system_id FROM body_systems WHERE slug = 'audiology';
    IF system_id IS NOT NULL THEN
        -- Tinnitus
        INSERT INTO conditions (service_id, body_system_id, slug, icon, page_title, hero_heading, short_description, content_html, dc_code, dc_name, ratings, features, secondary_connections, specialist_guide, paired_conditions, seo_keywords, is_published)
        SELECT s.id, system_id, 'tinnitus', 'Ear', 'Tinnitus', 'Tinnitus', 
        'Nexus letters for the most common VA disability claim: ringing in the ears.',
        '<p>Tinnitus is currently rated at a flat 10% under DC 6260, regardless of whether it is in one or both ears.</p>',
        '6260', 'Tinnitus',
        '[{"pct": "10%", "criteria": "Recurrent ringing, whistling, or buzzing in the ears"}]'::jsonb,
        ARRAY['Nexus linking tinnitus to acoustic trauma', 'Secondary connection for migraines or mental health'],
        '[{"from": "Acoustic Trauma", "mechanism": "Exposure to high-decibel noise during service"}]'::jsonb,
        '[{"name": "Internal Medicine MD", "price": "$945", "best_for": "Most tinnitus claims"}]'::jsonb,
        ARRAY['Hearing Loss', 'Migraine', 'Anxiety'], ARRAY['tinnitus nexus letter', 'ringing in ears VA'], true
        FROM (SELECT nexus_id as id UNION SELECT dbq_id as id) s
        ON CONFLICT (service_id, slug) DO NOTHING;
    END IF;

    -- 9. Seed Conditions (GI)
    SELECT id INTO system_id FROM body_systems WHERE slug = 'gastrointestinal';
    IF system_id IS NOT NULL THEN
        -- GERD
        INSERT INTO conditions (service_id, body_system_id, slug, icon, page_title, hero_heading, short_description, content_html, dc_code, dc_name, ratings, features, secondary_connections, specialist_guide, paired_conditions, seo_keywords, is_published)
        SELECT s.id, system_id, 'gerd', 'Flame', 'GERD', 'GERD', 
        'Expert nexus letters for GERD VA claims secondary to PTSD medications or in-service onset.',
        '<p>GERD is rated under DC 7346 based on severity of symptoms including substernal pain, regurgitation, and dysphagia.</p>',
        '7346', 'Hiatal Hernia / GERD',
        '[{"pct": "60%", "criteria": "Severe impairment of health"}, {"pct": "30%", "criteria": "Persistently recurrent epigastric distress"}]'::jsonb,
        ARRAY['Nexus letters for GERD secondary to PTSD medications', 'Direct stress mechanism nexus opinions'],
        '[{"from": "PTSD Medications", "mechanism": "SSRIs and SNRIs increase gastric acid production"}]'::jsonb,
        '[{"name": "Internal Medicine MD", "price": "$945", "best_for": "Most GERD claims"}]'::jsonb,
        ARRAY['IBS', 'PTSD'], ARRAY['GERD nexus letter', 'DC 7346'], true
        FROM (SELECT nexus_id as id UNION SELECT dbq_id as id) s
        ON CONFLICT (service_id, slug) DO NOTHING;
        
        -- IBS
        INSERT INTO conditions (service_id, body_system_id, slug, icon, page_title, hero_heading, short_description, content_html, dc_code, dc_name, ratings, features, secondary_connections, specialist_guide, paired_conditions, seo_keywords, is_published)
        SELECT s.id, system_id, 'ibs', 'Pill', 'IBS', 'IBS', 
        'Nexus letters for IBS VA claims secondary to PTSD or Gulf War service.',
        '<p>IBS is rated under DC 7319 based on frequency and severity of episodes. It is commonly connected to PTSD or Gulf War presumptive service.</p>',
        '7319', 'Irritable Colon Syndrome',
        '[{"pct": "30%", "criteria": "Diarrhea, or alternating diarrhea and constipation"}, {"pct": "10%", "criteria": "Frequent episodes of bowel disturbance"}]'::jsonb,
        ARRAY['Secondary connection to PTSD and medications', 'Gulf War presumptive documentation'],
        '[{"from": "Gulf War Service", "mechanism": "Presumptive condition for qualifying Gulf War veterans"}]'::jsonb,
        '[{"name": "Internal Medicine MD", "price": "$945", "best_for": "Most IBS claims"}]'::jsonb,
        ARRAY['GERD', 'PTSD'], ARRAY['IBS nexus letter', 'IBS VA claim'], true
        FROM (SELECT nexus_id as id UNION SELECT dbq_id as id) s
        ON CONFLICT (service_id, slug) DO NOTHING;
    END IF;

END $$;
