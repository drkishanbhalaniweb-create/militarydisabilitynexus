-- =====================================================
-- Seed 15 High-Priority Community Questions
-- Based on MDN Community QA Optimisation Pack (Part 4)
-- =====================================================

DO $$
DECLARE
    v_clinician_id UUID;
    v_system_user_id UUID;
    v_q_id UUID;
BEGIN
    -- 1. Get clinician and system user
    SELECT id INTO v_clinician_id FROM clinical_profiles WHERE is_active = true ORDER BY display_order ASC LIMIT 1;
    SELECT id INTO v_system_user_id FROM auth.users LIMIT 1;

    IF v_system_user_id IS NULL THEN
        RAISE EXCEPTION 'No users found in auth.users table.';
    END IF;

    -- Q1: Nexus Letter necessity
    IF NOT EXISTS (SELECT 1 FROM community_questions WHERE slug = 'what-is-a-nexus-letter-do-i-need-one') THEN
        INSERT INTO community_questions (user_id, title, slug, content, status, is_featured, seo_title, seo_description)
        VALUES (v_system_user_id, 'What is a nexus letter and do I actually need one for my VA claim?', 'what-is-a-nexus-letter-do-i-need-one', 'I keep hearing about nexus letters for VA claims. What exactly are they, and is it something every veteran needs to get, or only for certain types of claims?', 'published', true, 'What is a Nexus Letter? VA Claim Requirements Explained', 'A Nexus Letter is a clinical document linking your disability to service. Learn when you need one and how it affects your VA claim outcome.')
        RETURNING id INTO v_q_id;

        INSERT INTO community_answers (question_id, user_id, content, is_expert_answer, is_best_answer, status, clinician_profile_id)
        VALUES (v_q_id, v_system_user_id, 'A Nexus Letter is a formal medical opinion written by a licensed clinician that establishes a "nexus"—or a service connection—between your current medical condition and an event, injury, or illness that occurred during your military service.

Do you need one?
While not every claim requires a Nexus Letter, it is highly recommended if:
1. Your condition developed years after discharge.
2. Your service treatment records are incomplete or missing.
3. You are claiming a secondary condition (e.g., Sleep Apnea secondary to PTSD).
4. You are filing for an increase and need to prove the deterioration is linked to the original service-connected injury.

Without a clear medical nexus, the VA will likely deny the claim on the grounds that there is no evidence the condition is related to your service. A well-written letter from a qualified medical expert can provide the "missing link" needed for approval.', true, true, 'published', v_clinician_id);
    END IF;

    -- Q2: Sleep apnea secondary to PTSD
    IF NOT EXISTS (SELECT 1 FROM community_questions WHERE slug = 'claim-sleep-apnea-secondary-to-ptsd') THEN
        INSERT INTO community_questions (user_id, title, slug, content, status, is_featured, seo_title, seo_description)
        VALUES (v_system_user_id, 'How do I claim sleep apnea as secondary to PTSD?', 'claim-sleep-apnea-secondary-to-ptsd', 'I am already rated at 70% for PTSD, but I was recently diagnosed with sleep apnea and prescribed a CPAP. Can I claim this as secondary to my PTSD? What kind of evidence does the VA look for?', 'published', true, 'Claiming Sleep Apnea Secondary to PTSD: VA Evidence Guide', 'Learn how to claim sleep apnea as secondary to PTSD. Discover the medical evidence and nexus requirements needed for a successful VA claim.')
        RETURNING id INTO v_q_id;

        INSERT INTO community_answers (question_id, user_id, content, is_expert_answer, is_best_answer, status, clinician_profile_id)
        VALUES (v_q_id, v_system_user_id, 'Yes, you can claim Sleep Apnea as a secondary condition to PTSD. The VA recognizes that psychiatric conditions can aggravate or contribute to the development of sleep disorders.

To be successful, you must prove three things:
1. A current diagnosis of Sleep Apnea (usually confirmed by a sleep study).
2. An existing service-connection for PTSD.
3. A "medical nexus" connecting the two—explaining how your PTSD (or the medications used to treat it) causes or worsens your sleep apnea.

Common nexus arguments include the "intermediate step" of weight gain caused by PTSD medications or the impact of chronic stress and hyperarousal on respiratory patterns during sleep. An Independent Medical Opinion (IMO) is usually essential for these claims.', true, true, 'published', v_clinician_id);
    END IF;

    -- Q3: GERD secondary to stress or PTSD
    IF NOT EXISTS (SELECT 1 FROM community_questions WHERE slug = 'gerd-secondary-to-stress-ptsd') THEN
        INSERT INTO community_questions (user_id, title, slug, content, status, is_featured, seo_title, seo_description)
        VALUES (v_system_user_id, 'Can GERD be service connected secondary to stress or PTSD?', 'gerd-secondary-to-stress-ptsd', 'I''ve been dealing with severe acid reflux and GERD since my symptoms of PTSD started getting worse. Is there a connection the VA recognizes between stomach issues and mental health?', 'published', true, 'GERD Secondary to PTSD: Is There a VA Service Connection?', 'GERD is frequently linked to PTSD and chronic stress. Learn how the VA rates digestive issues secondary to mental health conditions.')
        RETURNING id INTO v_q_id;

        INSERT INTO community_answers (question_id, user_id, content, is_expert_answer, is_best_answer, status, clinician_profile_id)
        VALUES (v_q_id, v_system_user_id, 'There is a strong clinical link between chronic stress/PTSD and Gastroesophageal Reflux Disease (GERD). The body’s "fight or flight" response can increase stomach acid production and affect the function of the lower esophageal sphincter.

To claim GERD as secondary to PTSD:
1. You need a formal diagnosis of GERD via an endoscopy or clinical evaluation.
2. A medical nexus that explains the physiological link between your service-connected PTSD and your digestive symptoms.
3. Documentation of how your PTSD symptoms or medications (like SSRIs or NSAIDs for related pain) contribute to your GERD.

GERD is typically rated at 10%, 30%, or 60% based on the severity of symptoms like pain, vomiting, and weight loss.', true, true, 'published', v_clinician_id);
    END IF;

    -- Q4: TDIU
    IF NOT EXISTS (SELECT 1 FROM community_questions WHERE slug = 'va-tdiu-unemployability-requirements') THEN
        INSERT INTO community_questions (user_id, title, slug, content, status, is_featured, seo_title, seo_description)
        VALUES (v_system_user_id, 'What is VA Individual Unemployability (TDIU) and how do I qualify?', 'va-tdiu-unemployability-requirements', 'My disabilities make it impossible for me to keep a steady job, but I''m only rated at 70%. Can I get paid at the 100% rate even if I don''t have a 100% rating? How does TDIU work?', 'published', true, 'VA TDIU Guide: How to Qualify for 100% Unemployability Pay', 'TDIU allows veterans to receive 100% disability pay if their service-connected conditions prevent steady employment. Learn the requirements here.')
        RETURNING id INTO v_q_id;

        INSERT INTO community_answers (question_id, user_id, content, is_expert_answer, is_best_answer, status, clinician_profile_id)
        VALUES (v_q_id, v_system_user_id, 'Total Disability based on Individual Unemployability (TDIU) is a benefit that allows the VA to pay you at the 100% disability rate, even if your combined rating is lower, because your service-connected conditions prevent you from maintaining "substantially gainful employment."

Standard Requirements:
1. You have one service-connected disability rated at least 60%, OR
2. You have two or more disabilities with at least one at 40% and a combined rating of 70% or higher.

Even if you don''t meet these percentages, you can still apply for "extraschedular" TDIU if you can prove your disabilities uniquely interfere with your ability to work. You will need to provide employment history and medical evidence showing exactly how your symptoms (like social impairment, physical limitations, or frequent hospitalizations) make it impossible to hold a job.', true, true, 'published', v_clinician_id);
    END IF;

    -- Q5: Rating reduction
    IF NOT EXISTS (SELECT 1 FROM community_questions WHERE slug = 'can-va-reduce-my-disability-rating') THEN
        INSERT INTO community_questions (user_id, title, slug, content, status, is_featured, seo_title, seo_description)
        VALUES (v_system_user_id, 'Can the VA reduce my disability rating once it’s been assigned?', 'can-va-reduce-my-disability-rating', 'I finally got my 80% rating, but I''m terrified that the VA will suddenly decide I''m better and take it away. Can they just reduce my rating whenever they want, or are there protections?', 'published', true, 'VA Rating Reductions: Can the VA Take Away Your Benefits?', 'The VA can reduce ratings if there is sustained medical improvement, but there are strict legal protections. Learn about the 5, 10, and 20-year rules.')
        RETURNING id INTO v_q_id;

        INSERT INTO community_answers (question_id, user_id, content, is_expert_answer, is_best_answer, status, clinician_profile_id)
        VALUES (v_q_id, v_system_user_id, 'The VA can reduce a disability rating, but they must follow strict legal procedures and prove that there has been "sustained improvement" in your medical condition.

Key Protections:
- 5-Year Rule: If a rating has been in place for 5 years, the VA cannot reduce it unless the improvement is permanent and sustained.
- 10-Year Rule: A service connection cannot be severed after 10 years (unless there was fraud).
- 20-Year Rule: If a rating has been at or above a certain level for 20 years, it is "continuous" and cannot be reduced (unless there was fraud).

If the VA proposes a reduction, they must send you a notice and give you 60 days to submit evidence and request a hearing. Never ignore a "Notice of Proposed Reduction"—this is your chance to prove that your condition has not improved.', true, true, 'published', v_clinician_id);
    END IF;

    -- Q6: VA Math
    IF NOT EXISTS (SELECT 1 FROM community_questions WHERE slug = 'how-does-va-math-work') THEN
        INSERT INTO community_questions (user_id, title, slug, content, status, is_featured, seo_title, seo_description)
        VALUES (v_system_user_id, 'How does VA math work — why doesn’t 50% + 50% equal 100%?', 'how-does-va-math-work', 'I have two 50% ratings, but my total combined rating is only 80%. This doesn''t make any sense to me. Why doesn''t the VA just add the percentages together?', 'published', true, 'VA Math Explained: Why 50% + 50% Doesn''t Equal 100%', 'VA disability ratings are combined using "VA Math" which calculates your remaining efficiency. Learn how to calculate your combined rating.')
        RETURNING id INTO v_q_id;

        INSERT INTO community_answers (question_id, user_id, content, is_expert_answer, is_best_answer, status, clinician_profile_id)
        VALUES (v_q_id, v_system_user_id, 'VA ratings are not added; they are combined. The VA views a veteran as a "whole person" (100%). Each disability takes a percentage of what is left of that "whole."

Example (50% + 50%):
1. You start at 100% healthy. 
2. Your first 50% disability makes you 50% disabled and 50% healthy.
3. Your second 50% disability doesn''t take 50% from the original 100%; it takes 50% of the *remaining* 50% healthy part.
4. 50% of 50 is 25. So you add 25% to your initial 50%.
5. Total = 75%. The VA then rounds to the nearest 10%, which is 80%.

This is why it becomes increasingly difficult to reach 100% as your rating climbs—you are fighting for a smaller and smaller piece of "remaining" health.', true, true, 'published', v_clinician_id);
    END IF;

    -- Q7: DBQ vs Nexus Letter
    IF NOT EXISTS (SELECT 1 FROM community_questions WHERE slug = 'difference-between-dbq-and-nexus-letter') THEN
        INSERT INTO community_questions (user_id, title, slug, content, status, is_featured, seo_title, seo_description)
        VALUES (v_system_user_id, 'What is the difference between a DBQ and a Nexus Letter?', 'difference-between-dbq-and-nexus-letter', 'I''m getting my medical evidence ready and my VSO mentioned both DBQs and Nexus Letters. Do I need both? Which one is more important for getting a claim approved?', 'published', true, 'DBQ vs. Nexus Letter: Which Do You Need for Your VA Claim?', 'A DBQ documents current symptoms, while a Nexus Letter links them to service. Learn why you often need both for a successful VA disability claim.')
        RETURNING id INTO v_q_id;

        INSERT INTO community_answers (question_id, user_id, content, is_expert_answer, is_best_answer, status, clinician_profile_id)
        VALUES (v_q_id, v_system_user_id, 'While both are critical pieces of medical evidence, they serve completely different purposes:

1. Disability Benefits Questionnaire (DBQ):
- Purpose: To document the current severity of your symptoms.
- Contents: Checkboxes and measurements (like range of motion) that map directly to the VA’s Rating Schedule.
- Use: The VA uses this to determine what percentage (e.g., 30% vs 50%) you should receive once service connection is established.

2. Nexus Letter:
- Purpose: To establish that your condition was caused or aggravated by military service.
- Contents: A clinical narrative, review of medical history, and a formal medical opinion (e.g., "at least as likely as not").
- Use: The VA uses this to grant service connection.

Think of it this way: The Nexus Letter gets you in the door (service connection), and the DBQ decides how much you get paid (rating percentage).', true, true, 'published', v_clinician_id);
    END IF;

    -- Q8: Documents needed
    IF NOT EXISTS (SELECT 1 FROM community_questions WHERE slug = 'documents-needed-for-va-disability-claim') THEN
        INSERT INTO community_questions (user_id, title, slug, content, status, is_featured, seo_title, seo_description)
        VALUES (v_system_user_id, 'What documents do I need to file a VA disability claim from scratch?', 'documents-needed-for-va-disability-claim', 'I just got out and I want to start my claim. What are the absolute must-have documents I should gather before I hit submit on the VA website?', 'published', true, 'VA Claim Checklist: Essential Documents for Your Disability Claim', 'Starting a VA claim? Here is the checklist of essential documents, from DD214 to service treatment records and medical nexus evidence.')
        RETURNING id INTO v_q_id;

        INSERT INTO community_answers (question_id, user_id, content, is_expert_answer, is_best_answer, status, clinician_profile_id)
        VALUES (v_q_id, v_system_user_id, 'Filing a "Fully Developed Claim" (FDC) is the fastest way to get a decision. Here are the essential documents:

1. Discharge Papers (DD214): To prove your period of service and character of discharge.
2. Service Treatment Records (STRs): To document that the injury or illness occurred while you were in uniform.
3. Current Medical Records: Evidence from the last 12 months showing you still have the condition.
4. Statement in Support of Claim (VA Form 21-4138): Your personal narrative of how the disability affects your life.
5. Buddy Statements: Lay evidence from people who served with you or know your daily struggle.
6. Nexus Evidence: Clinical documentation linking your current diagnosis to your STRs.

Pro Tip: Don''t wait until you have everything to notify the VA. Submit an "Intent to File" (ITF) today to preserve your effective date (backpay) while you gather these documents.', true, true, 'published', v_clinician_id);
    END IF;

    -- Q9: Wrong C&P report
    IF NOT EXISTS (SELECT 1 FROM community_questions WHERE slug = 'my-cp-exam-report-was-wrong-what-can-i-do') THEN
        INSERT INTO community_questions (user_id, title, slug, content, status, is_featured, seo_title, seo_description)
        VALUES (v_system_user_id, 'My C&P exam report was wrong — what can I do?', 'my-cp-exam-report-was-wrong-what-can-i-do', 'I just got a copy of my C&P exam for my back and the examiner lied. They said I had a full range of motion when I could barely bend over. How do I fix this before the VA denies me?', 'published', true, 'Contesting a Bad C&P Exam: What to Do When the Report is Wrong', 'If your C&P examiner provided an inaccurate report, you must act quickly. Learn how to challenge a bad exam and request a new one.')
        RETURNING id INTO v_q_id;

        INSERT INTO community_answers (question_id, user_id, content, is_expert_answer, is_best_answer, status, clinician_profile_id)
        VALUES (v_q_id, v_system_user_id, 'If you believe your C&P exam was inadequate or inaccurate, you must act immediately. Do not wait for the denial letter.

Steps to challenge a bad exam:
1. Write a Statement in Support of Claim (VA Form 21-4138) immediately. Detail exactly what the examiner missed (e.g., "The examiner did not use a goniometer to measure my range of motion").
2. Call the VA (1-800-827-1000) and tell them you are contesting the exam. Request a new one.
3. If the claim is still pending, you can submit a "Memorandum for Record" detailing the examiner''s lack of thoroughness or bias.
4. Obtain an Independent Medical Opinion (IMO) from a private clinician to counter the C&P examiner’s findings.

The goal is to get a competing piece of evidence into your file so the VA has to address the discrepancy rather than just relying on the flawed C&P report.', true, true, 'published', v_clinician_id);
    END IF;

    -- Q10: Hypertension
    IF NOT EXISTS (SELECT 1 FROM community_questions WHERE slug = 'claim-hypertension-as-service-connected') THEN
        INSERT INTO community_questions (user_id, title, slug, content, status, is_featured, seo_title, seo_description)
        VALUES (v_system_user_id, 'How do I claim hypertension as service connected?', 'claim-hypertension-as-service-connected', 'I was diagnosed with high blood pressure a few years after I got out. I never had it in service. Can I still get this service-connected?', 'published', true, 'Service Connecting Hypertension: VA Requirements and PACT Act', 'Hypertension can be service-connected as a primary condition, a secondary condition, or via PACT Act presumptions. Learn which path fits your claim.')
        RETURNING id INTO v_q_id;

        INSERT INTO community_answers (question_id, user_id, content, is_expert_answer, is_best_answer, status, clinician_profile_id)
        VALUES (v_q_id, v_system_user_id, 'Hypertension (high blood pressure) is commonly claimed in three ways:

1. Direct Service Connection: If you had high blood pressure readings in your service medical records.
2. Secondary Service Connection: If your high blood pressure is caused or aggravated by another service-connected condition, such as chronic pain, sleep apnea, or kidney issues.
3. Presumptive Service Connection (PACT Act/Agent Orange): If you served in specific locations (like Vietnam or certain PACT Act zones), hypertension is now a presumptive condition. This means you only have to prove service in those areas and a current diagnosis—no nexus letter required.

To be rated, you must have three separate blood pressure readings on different days showing a diastolic pressure of 100 or higher, or a systolic pressure of 160 or higher.', true, true, 'published', v_clinician_id);
    END IF;

    -- Q11: Buddy statement
    IF NOT EXISTS (SELECT 1 FROM community_questions WHERE slug = 'what-is-a-buddy-statement-how-to-write-one') THEN
        INSERT INTO community_questions (user_id, title, slug, content, status, is_featured, seo_title, seo_description)
        VALUES (v_system_user_id, 'What is a buddy statement and how do I write one?', 'what-is-a-buddy-statement-how-to-write-one', 'My VSO told me to get a buddy letter from someone I served with. What does this letter need to say to actually help my claim? Is there a specific format?', 'published', true, 'VA Buddy Statements: How to Write Effective Lay Evidence', 'A Buddy Statement (VA Form 21-10210) provides critical lay evidence for your claim. Learn what to include to strengthen your case.')
        RETURNING id INTO v_q_id;

        INSERT INTO community_answers (question_id, user_id, content, is_expert_answer, is_best_answer, status, clinician_profile_id)
        VALUES (v_q_id, v_system_user_id, 'A Buddy Statement (formally known as a Statement in Support of Claim, VA Form 21-10210) is "lay evidence"—an account from someone who personally witnessed your injury or can describe how your condition has changed over time.

A good buddy letter should follow this structure:
1. Relationship: How they know you and how long they have known you.
2. The Event: "I was there when [Veteran] fell off the truck in 2004..."
3. Observations: "Before the injury, he was the fastest runner in the unit. After, he could barely walk to the chow hall."
4. Current Status: "I see him once a month and he is clearly in constant pain and cannot sit for more than 10 minutes."
5. Declaration: It must be signed and include the statement: "I certify that my statements are true and correct to the best of my knowledge and belief."

Buddy letters are incredibly powerful for proving "In-Service Stressors" for PTSD claims or the onset of physical injuries where medical records are thin.', true, true, 'published', v_clinician_id);
    END IF;

    -- Q12: Hearing loss and tinnitus
    IF NOT EXISTS (SELECT 1 FROM community_questions WHERE slug = 'claim-hearing-loss-and-tinnitus-separately') THEN
        INSERT INTO community_questions (user_id, title, slug, content, status, is_featured, seo_title, seo_description)
        VALUES (v_system_user_id, 'Can I claim hearing loss and tinnitus separately?', 'claim-hearing-loss-and-tinnitus-separately', 'I have ringing in my ears and I also have trouble hearing what people are saying. Should I file one claim for "ears" or do I need to list them as two different things?', 'published', true, 'Hearing Loss vs. Tinnitus: Filing Separate VA Claims', 'Hearing loss and tinnitus are distinct conditions under VA law. Learn how to claim both and what evidence is required for each.')
        RETURNING id INTO v_q_id;

        INSERT INTO community_answers (question_id, user_id, content, is_expert_answer, is_best_answer, status, clinician_profile_id)
        VALUES (v_q_id, v_system_user_id, 'Yes, hearing loss and tinnitus are rated under different Diagnostic Codes and should be claimed as separate conditions.

1. Tinnitus (DC 6260): This is the "ringing in the ears." It is a flat 10% rating, whether it is in one ear or both. It is one of the most common service-connected disabilities.
2. Hearing Loss (DC 6100): This is rated based on a very specific audiogram (hearing test) administered at a C&P exam. The VA looks at "speech recognition" and "pure tone threshold."

Important Note: It is very difficult to get a rating higher than 0% for hearing loss unless your hearing is significantly impaired. However, even a 0% rating is valuable because it grants you free hearing aids and batteries from the VA for life. Always claim both if you suffer from both.', true, true, 'published', v_clinician_id);
    END IF;

    -- Q13: Likely as not
    IF NOT EXISTS (SELECT 1 FROM community_questions WHERE slug = 'meaning-of-at-least-as-likely-as-not') THEN
        INSERT INTO community_questions (user_id, title, slug, content, status, is_featured, seo_title, seo_description)
        VALUES (v_system_user_id, 'What does “at least as likely as not” mean in a VA claim?', 'meaning-of-at-least-as-likely-as-not', 'I saw this phrase in my nexus letter. It sounds like the doctor isn''t 100% sure. Is that going to be a problem with the VA?', 'published', true, 'VA Standard of Proof: What "At Least As Likely As Not" Means', 'The VA uses a unique standard of proof called "Equipose." Learn why "at least as likely as not" is the magic phrase for claim approval.')
        RETURNING id INTO v_q_id;

        INSERT INTO community_answers (question_id, user_id, content, is_expert_answer, is_best_answer, status, clinician_profile_id)
        VALUES (v_q_id, v_system_user_id, 'In the civilian medical world, doctors talk in terms of certainty. In the VA world, the standard of proof is much lower—it’s called "at least as likely as not."

What it means:
- 50% or greater probability.
- If the evidence for and against service connection is in "equipoise" (perfectly balanced 50/50), the VA is legally required to give the "benefit of the doubt" to the Veteran and grant service connection.

What NOT to use:
Phrases like "may be related," "possibly caused by," or "could be linked" are too weak and will lead to a denial. Your clinician must use the specific phrase "at least as likely as not" (or higher, like "more likely than not") for the VA to consider the opinion valid.', true, true, 'published', v_clinician_id);
    END IF;

    -- Q14: Claim timeline
    IF NOT EXISTS (SELECT 1 FROM community_questions WHERE slug = 'how-long-does-a-va-claim-take-speed-it-up') THEN
        INSERT INTO community_questions (user_id, title, slug, content, status, is_featured, seo_title, seo_description)
        VALUES (v_system_user_id, 'How long does a VA claim take, and what can I do to speed it up?', 'how-long-does-a-va-claim-take-speed-it-up', 'I submitted my claim 3 months ago and it hasn''t moved. What is the average wait time right now? Is there any way to make them move faster?', 'published', true, 'VA Claim Timelines: How Long to Wait and How to Speed it Up', 'The average VA claim takes 120-150 days. Learn the factors that delay decisions and how to use the "Decision Ready Claim" path.')
        RETURNING id INTO v_q_id;

        INSERT INTO community_answers (question_id, user_id, content, is_expert_answer, is_best_answer, status, clinician_profile_id)
        VALUES (v_q_id, v_system_user_id, 'The average VA claim currently takes between 120 and 160 days, though this varies significantly based on the complexity of the claim and the number of disabilities listed.

How to speed up your claim:
1. File a Fully Developed Claim (FDC): Provide all medical evidence, nexus letters, and statements yourself so the VA doesn''t have to spend months searching for them.
2. Submit a "Decision Ready" Claim: Ensure every disability has a corresponding current diagnosis and nexus opinion.
3. Use the "Claim Accuracy" path: Ensure all forms are signed and all boxes are checked perfectly—the smallest administrative error can add months of delay.
4. Priority Processing: If you are experiencing extreme financial hardship, are over age 85, or have a terminal illness, you can file VA Form 21-0966 for "Priority Processing" to jump to the front of the line.', true, true, 'published', v_clinician_id);
    END IF;

    -- Q15: PACT Act
    IF NOT EXISTS (SELECT 1 FROM community_questions WHERE slug = 'pact-act-effects-on-existing-claims') THEN
        INSERT INTO community_questions (user_id, title, slug, content, status, is_featured, seo_title, seo_description)
        VALUES (v_system_user_id, 'What is the PACT Act and does it affect my existing claim?', 'pact-act-effects-on-existing-claims', 'I was denied for asthma two years ago. I heard the PACT Act changed things for people who served in the Middle East. Should I re-file, or does the VA update it automatically?', 'published', true, 'The PACT Act Guide: New Presumptive Conditions and Re-filing', 'The PACT Act is the largest expansion of VA benefits in history. Learn if your condition is now "presumptive" and how to re-file for previously denied claims.')
        RETURNING id INTO v_q_id;

        INSERT INTO community_answers (question_id, user_id, content, is_expert_answer, is_best_answer, status, clinician_profile_id)
        VALUES (v_q_id, v_system_user_id, 'The PACT Act (2022) is a massive expansion of VA benefits for veterans exposed to burn pits, Agent Orange, and other toxins. It added over 20 new "presumptive" conditions.

What "Presumptive" means for you:
If you have a presumptive condition and served in a covered location, the VA assumes your service caused the condition. You no longer need to provide a nexus letter or prove the connection.

If you were previously denied:
The VA will NOT automatically re-open your claim. You must file a Supplemental Claim. If your condition is now presumptive, your chance of approval is significantly higher. Common new presumptives include hypertension (Agent Orange), asthma, COPD, and many types of cancer for those who served in Iraq, Afghanistan, and surrounding areas.', true, true, 'published', v_clinician_id);
    END IF;

END $$;
