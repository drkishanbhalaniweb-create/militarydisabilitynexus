-- =====================================================
-- Seed Community Q&A with Optimized Content
-- Based on MDN Community QA Optimisation Pack
-- =====================================================

DO $$
DECLARE
    v_clinician_id UUID;
    v_system_user_id UUID;
    v_q1_id UUID;
    v_q2_id UUID;
    v_q3_id UUID;
    v_q4_id UUID;
    v_q5_id UUID;
    v_q6_id UUID;
BEGIN
    -- 1. Get a clinician to link to (the first active one)
    SELECT id INTO v_clinician_id FROM clinical_profiles WHERE is_active = true ORDER BY display_order ASC LIMIT 1;
    
    -- 2. Get a valid user_id to satisfy the FK constraint (first available user)
    SELECT id INTO v_system_user_id FROM auth.users LIMIT 1;

    IF v_system_user_id IS NULL THEN
        RAISE EXCEPTION 'No users found in auth.users table. Please create at least one user before running this seed script.';
    END IF;

    IF v_clinician_id IS NULL THEN
        RAISE NOTICE 'No active clinician profile found. Expert answers will be created but unlinked from a profile.';
    END IF;

    -- Q1: Nerve Issues / Numbness and Tingling in Arm
    IF NOT EXISTS (SELECT 1 FROM community_questions WHERE slug = 'va-disability-rating-arm-numbness-tingling-cervical-radiculopathy') THEN
        INSERT INTO community_questions (user_id, title, slug, content, is_anonymous, display_name, status, is_featured, seo_title, seo_description)
        VALUES (v_system_user_id, 'I have numbness and tingling down my arm. How does the VA rate nerve issues?', 'va-disability-rating-arm-numbness-tingling-cervical-radiculopathy', 'I''ve been experiencing constant numbness and tingling down my right arm. It started after my last deployment and seems to be getting worse. How does the VA actually rate these kinds of nerve issues? Is it based on the pain or something else?', false, 'Veteran Support', 'published', true, 'VA Rating for Arm Numbness & Tingling: Cervical Radiculopathy Guide', 'The VA rates arm numbness as a peripheral nerve condition. Ratings range from 10%–60%+ based on severity and which nerve is affected. Expert answer inside.')
        RETURNING id INTO v_q1_id;

        INSERT INTO community_answers (question_id, user_id, content, is_anonymous, display_name, is_expert_answer, is_best_answer, status, clinician_profile_id)
        VALUES (v_q1_id, v_system_user_id, 'Numbness and tingling down the arm is most commonly rated by the VA as cervical radiculopathy or an upper extremity peripheral nerve condition under 38 CFR Part 4. The rating is based on the severity of nerve impairment and which specific nerve is affected — not on MRI findings alone.

How the VA determines the rating:
The VA evaluates nerve conditions using a scale of incomplete to complete paralysis:
- Mild incomplete paralysis -> 10%–20%
- Moderate incomplete paralysis -> 20%–40%
- Severe incomplete paralysis -> 40%–60%
- Complete paralysis -> 60%+ depending on the nerve and limb

Ratings also differ based on whether it’s your dominant (major) or non-dominant (minor) arm — the dominant arm is rated slightly higher because the functional loss is greater.

What the C&P examiner actually tests:
During your Compensation & Pension exam, the examiner will assess muscle strength (using a 0–5 scale), grip strength, reflexes, sensation, and any visible muscle wasting. The key phrase in your exam report is “functional impairment” — the more clearly your impairment is documented in those specific terms, the better your rating outcome.

The secondary connection most veterans miss:
If your arm symptoms are caused by a service-connected neck or spine condition (such as a cervical disc herniation), the nerve condition can be rated separately as a secondary condition — meaning you get a rating for both the neck and the nerve damage on top of it. This is one of the most commonly missed rating opportunities in orthopedic claims.', false, 'Expert Clinician', true, true, 'published', v_clinician_id);
    END IF;

    -- Q2: Migraines Triggered by Tinnitus
    IF NOT EXISTS (SELECT 1 FROM community_questions WHERE slug = 'va-secondary-connection-tinnitus-migraines') THEN
        INSERT INTO community_questions (user_id, title, slug, content, is_anonymous, display_name, status, is_featured, seo_title, seo_description)
        VALUES (v_system_user_id, 'My migraines seem to be triggered by my tinnitus, will VA consider that?', 'va-secondary-connection-tinnitus-migraines', 'I have a 10% rating for tinnitus, but I also get severe migraines about 2-3 times a month. I''ve noticed that when my ears are ringing really loudly, a migraine usually follows. Will the VA consider migraines as secondary to tinnitus, or do I have to prove they are separate?', false, 'Member123', 'published', true, 'Can Tinnitus Cause Migraines? VA Secondary Service Connection Explained', 'Yes — if tinnitus triggers your migraines, you may be able to claim migraines as a secondary condition to your tinnitus. Expert VA answer here.')
        RETURNING id INTO v_q2_id;

        INSERT INTO community_answers (question_id, user_id, content, is_anonymous, display_name, is_expert_answer, is_best_answer, status, clinician_profile_id)
        VALUES (v_q2_id, v_system_user_id, 'Yes, the VA can consider migraines as a secondary service-connected condition to your tinnitus — but you need medical evidence establishing that link, not just your personal observation. If you already have tinnitus rated by the VA, migraines could be rated separately and on top of it.

How secondary service connection works:
Secondary service connection means that Condition B (migraines) was caused or aggravated by Condition A (tinnitus), which is already service-connected. The VA requires a medical nexus — a clinician’s documented opinion stating that it is “at least as likely as not” that the tinnitus is causing or contributing to the migraines.

What the medical literature supports:
There is a recognised clinical relationship between chronic tinnitus and migraine. Both conditions involve central sensitisation — an abnormal amplification of pain and sensory signals in the nervous system. The constant auditory stress of tinnitus can trigger or worsen migraine attacks in susceptible individuals. This is a defensible connection that a qualified clinician can support in a Nexus Letter.

What your rating could look like:
Tinnitus is capped at 10% (Diagnostic Code 6260). Migraines, however, are rated separately under DC 8100 and can reach 50% if you have prostrating attacks occurring very frequently. If both are service-connected, they combine — meaning your total compensation increases significantly beyond the 10% tinnitus cap.', false, 'Expert Clinician', true, true, 'published', v_clinician_id);
    END IF;

    -- Q3: Tinnitus Rating Above 10%
    IF NOT EXISTS (SELECT 1 FROM community_questions WHERE slug = 'va-tinnitus-rating-above-10-percent') THEN
        INSERT INTO community_questions (user_id, title, slug, content, is_anonymous, display_name, status, is_featured, seo_title, seo_description)
        VALUES (v_system_user_id, 'My tinnitus is constant and significantly affects my health. Can I get more than 10% rating?', 'va-tinnitus-rating-above-10-percent', 'I have ringing in my ears 24/7. It makes it hard to sleep and I have trouble concentrating at work. I''m currently at 10% for it, but it feels like it should be higher given how much it impacts my life. Can you ever get more than 10% for tinnitus?', false, 'AirForceVet', 'published', true, 'VA Tinnitus Rating: Why 10% Is the Cap and How to Get More', 'The VA caps tinnitus at 10% under DC 6260, no matter how severe. But secondary conditions like sleep apnea or migraines can significantly increase total compensation.')
        RETURNING id INTO v_q3_id;

        INSERT INTO community_answers (question_id, user_id, content, is_anonymous, display_name, is_expert_answer, is_best_answer, status, clinician_profile_id)
        VALUES (v_q3_id, v_system_user_id, 'No — under current VA regulations, the maximum schedular rating for tinnitus itself is 10%, regardless of severity. This is set by Diagnostic Code 6260, and it applies whether your tinnitus affects one ear or both, is constant or intermittent, or severely impacts your sleep and concentration. The 10% is a hard regulatory ceiling for the primary condition.

Why veterans with severe tinnitus still get just 10%:
The VA’s rating schedule for tinnitus was written with a flat rate rather than a severity scale. That means a veteran with barely noticeable ringing and one who is completely unable to sleep because of constant bilateral tinnitus both receive the same 10% rating for the condition itself.

How to increase your total rating when tinnitus is severe:
The path to higher total compensation isn’t through fighting the 10% cap. It’s through documenting the secondary conditions tinnitus causes. The conditions most commonly caused or worsened by chronic tinnitus include:
- Obstructive Sleep Apnea — sleep disruption from tinnitus can be documented as a secondary condition (rated at 0%, 30%, 50%, or 100%)
- Migraines — auditory stress from tinnitus is a recognised migraine trigger; rated separately under DC 8100 (up to 50%)
- Depression or Anxiety — chronic tinnitus is strongly associated with psychiatric conditions (up to 100%)
- Hearing Loss — frequently co-occurs with tinnitus and rated separately under its own diagnostic code', false, 'Expert Clinician', true, true, 'published', v_clinician_id);
    END IF;

    -- Q4: Prostrating Migraine Attacks
    IF NOT EXISTS (SELECT 1 FROM community_questions WHERE slug = 'what-is-a-prostrating-migraine-va-rating') THEN
        INSERT INTO community_questions (user_id, title, slug, content, is_anonymous, display_name, status, is_featured, seo_title, seo_description)
        VALUES (v_system_user_id, 'My migraines wipe me out for hours does that count as a ‘prostrating’ attack?', 'what-is-a-prostrating-migraine-va-rating', 'I keep seeing the word "prostrating" in VA rating criteria for migraines. My headaches are so bad I have to lie down in a dark room for 4-5 hours at a time and I can''t do anything. Does that count as prostrating? How do I prove this to the VA?', false, 'ArmyDoc', 'published', true, 'What Is a Prostrating Migraine? VA Rating Criteria Explained', 'If your migraines force you to stop everything and lie down for hours, they likely qualify as prostrating under VA criteria — which directly affects your rating.')
        RETURNING id INTO v_q4_id;

        INSERT INTO community_answers (question_id, user_id, content, is_anonymous, display_name, is_expert_answer, is_best_answer, status, clinician_profile_id)
        VALUES (v_q4_id, v_system_user_id, 'Yes — if your migraines force you to stop all activity and lie down for hours, that almost certainly meets the VA’s definition of a prostrating attack. Whether the VA formally recognises it depends on how well that functional impact is documented in your medical records and how clearly you describe it at your C&P exam.

What “prostrating” actually means to the VA:
The VA does not have a rigid clinical checklist for “prostrating,” but in practice it means an attack severe enough to force complete cessation of activity. If any of the following apply, your migraine is likely prostrating:
- You have to lie down in a dark, quiet room
- You cannot continue working, driving, or performing normal daily tasks
- You experience severe pain, nausea, vomiting, photophobia, or phonophobia
- The attack lasts at least several hours
- You are essentially non-functional for the duration of the episode

Why this matters: it directly determines your rating:
Migraine ratings under Diagnostic Code 8100 are built around the frequency and severity of prostrating attacks:
- Less frequent prostrating attacks -> 10%
- Prostrating attacks once a month on average -> 30%
- Prostrating attacks occurring very frequently, with economic inadaptability -> 50%

The documentation problem most veterans face:
Many veterans describe their migraines to doctors as “bad headaches” without conveying the full functional impact. If your medical records say “headache, treated with ibuprofen” rather than “incapacitating migraine requiring withdrawal from activity for 4–6 hours,” the VA will not have the evidence needed to rate them as prostrating.', false, 'Expert Clinician', true, true, 'published', v_clinician_id);
    END IF;

    -- Q5: C&P Exam Tips
    IF NOT EXISTS (SELECT 1 FROM community_questions WHERE slug = 'cp-exam-tips-dont-undersell-symptoms-va') THEN
        INSERT INTO community_questions (user_id, title, slug, content, is_anonymous, display_name, status, is_featured, seo_title, seo_description)
        VALUES (v_system_user_id, 'I have a C&P exam coming up — how do I make sure I don’t undersell my symptoms?', 'cp-exam-tips-dont-undersell-symptoms-va', 'I''m really nervous about my upcoming C&P exam for my back and knees. I tend to just "tough it out" when people ask how I''m doing. I''m worried I''ll do the same at the exam and they''ll think I''m fine. Any tips on how to accurately describe how much pain I''m actually in?', false, 'MarineVet99', 'published', true, 'C&P Exam Tips: How to Accurately Describe Symptoms Without Underselling', 'Veterans routinely undersell symptoms at C&P exams out of habit. Here''s exactly what to say, what not to say, and how to describe your worst days accurately.')
        RETURNING id INTO v_q5_id;

        INSERT INTO community_answers (question_id, user_id, content, is_anonymous, display_name, is_expert_answer, is_best_answer, status, clinician_profile_id)
        VALUES (v_q5_id, v_system_user_id, 'The most important mindset shift going into a C&P exam: describe your worst days, not your average days, and never say “I’m fine” or “I manage okay.” The VA rates you on functional impairment — what your condition prevents you from doing — not on a diagnosis or a clinician’s sympathy. If the examiner doesn’t hear it, it doesn’t exist.

The habits that cause veterans to undersell:
Military culture trains you to minimise. You’ve been conditioned to push through pain, report ready, and not complain. Common mistakes include:
- Answering “how’s your pain today?” with today’s actual number instead of your worst
- Saying “I get around okay” when you’ve modified how you move to avoid pain
- Not mentioning secondary effects like sleep loss, depression, or relationship strain
- Forgetting to describe how symptoms affect your ability to work specifically

What to prepare and say:
Before the exam, write down a concrete account of your worst episode in the past 12 months. For every symptom, know:
1. Frequency — how often does it occur?
2. Duration — how long does each episode last?
3. Severity at its worst — what is it like at its worst?
4. Functional impact — what can’t you do during or after an episode?
5. Flare-up triggers — what makes it worse?

Avoid minimising language: “it’s not that bad,” “I’ve learned to live with it,” “most days I’m okay.” These are all flags the VA examiner may record as evidence of mild impairment.', false, 'Expert Clinician', true, true, 'published', v_clinician_id);
    END IF;

    -- Q6: PTSD Rating Stuck at 30%
    IF NOT EXISTS (SELECT 1 FROM community_questions WHERE slug = 'ptsd-rating-stuck-30-percent-va-wont-increase') THEN
        INSERT INTO community_questions (user_id, title, slug, content, is_anonymous, display_name, status, is_featured, seo_title, seo_description)
        VALUES (v_system_user_id, 'My PTSD feels like it’s getting worse so why is the VA still keeping me at 30%?', 'ptsd-rating-stuck-30-percent-va-wont-increase', 'I was rated at 30% for PTSD five years ago. Since then, I''ve lost two jobs and my marriage has ended because of my symptoms. I filed for an increase, but they just kept me at 30%. Why won''t the VA increase my rating when it''s clearly having a much bigger impact now?', false, 'NavyVet_2012', 'published', true, 'PTSD Rating Stuck at 30%? Why the VA Won''t Increase It — and What to Do', 'The VA rates PTSD on functional impact, not how you feel. If your records don''t show worsening impairment, your rating won''t move. Here''s how to fix that.')
        RETURNING id INTO v_q6_id;

        INSERT INTO community_answers (question_id, user_id, content, is_anonymous, display_name, is_expert_answer, is_best_answer, status, clinician_profile_id)
        VALUES (v_q6_id, v_system_user_id, 'If your PTSD rating is stuck at 30% despite your symptoms worsening, it almost always comes down to one thing: your medical records are not documenting the functional impact of your deterioration. The VA does not rate PTSD based on how severe your symptoms feel to you — they rate based on how clearly those symptoms are documented as impairing your ability to work, maintain relationships, and carry out daily responsibilities.

How VA rating criteria work for PTSD (38 CFR § 4.130):
- 30% — occasional decrease in work efficiency, difficulty with complex tasks
- 50% — reduced reliability and productivity, panic attacks more than once per week, impaired judgment
- 70% — deficiencies in most areas including work, family relations, judgement; near-continuous panic or depression
- 100% — total occupational and social impairment

To move to 50% or higher, your medical records need to show consistent evidence of impairment in occupational and social functioning — not just symptom descriptions, but real-world consequences.

What actually moves the rating up:
1. Consistent, detailed documentation from your mental health provider describing functional impairment.
2. A Buddy Statement (lay statement under 38 CFR § 3.303) from a spouse or friend who can describe what they observe at home.
3. A formal PTSD Nexus Letter or IMO from an independent clinician who can write a clinical opinion establishing the severity in terms that map to VA criteria.', false, 'Expert Clinician', true, true, 'published', v_clinician_id);
    END IF;

END $$;
