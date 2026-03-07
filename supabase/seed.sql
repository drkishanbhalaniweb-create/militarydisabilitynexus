-- Seed data for Medical Consulting Website
-- Run this after running the migrations

-- Clear existing data (for development only)
TRUNCATE services, blog_posts, testimonials CASCADE;

-- ============================================
-- SERVICES
-- ============================================
INSERT INTO services (id, slug, title, short_description, full_description, features, base_price_usd, duration, category, icon, faqs, display_order) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'nexus-rebuttal-letters',
    'Nexus & Rebuttal Letters',
    'Comprehensive medical opinions for claims and appeals',
    'Professional nexus and rebuttal letters that establish clear connections between your military service and medical conditions, or challenge unfavorable VA decisions. Our expert medical opinions provide the crucial evidence needed for both initial claims and appeals processes.',
    '["Nexus opinion letters", "Rebuttal to VA denials", "Direct/secondary/aggravation analysis", "Clear medical rationale", "Rush service: +$500 USD (36-48 hours)"]'::jsonb,
    1499,
    '7-10 business days',
    'nexus-letter',
    'file-text',
    '[
        {"question": "What''s the difference between nexus and rebuttal letters?", "answer": "Nexus letters establish the connection between military service and a condition for initial claims. Rebuttal letters challenge VA decisions by providing contrary medical evidence and opinions."},
        {"question": "Can you help with both initial claims and appeals?", "answer": "Yes, we provide nexus letters for initial claims and rebuttal letters to challenge unfavorable VA decisions in appeals."},
        {"question": "How long does it take?", "answer": "Typically 7-10 business days from the time we receive all necessary medical records and VA decision documents."}
    ]'::jsonb,
    1
),
(
    '00000000-0000-0000-0000-000000000002',
    'public-dbqs',
    'DBQs',
    'Standardized disability questionnaires for VA claims',
    'Disability Benefits Questionnaires (DBQs) are standardized medical examination forms used by the VA to evaluate disability claims. Our licensed physicians complete these forms based on current VA guidelines and your medical condition.',
    '["Latest public VA DBQs", "Objective findings", "Functional impact", "Rush service: +$50 USD (36-48 hours)"]'::jsonb,
    249,
    '5-7 business days',
    'dbq',
    'clipboard',
    '[{"question": "Do you complete VA DBQs?", "answer": "Yes, we complete public DBQs that are currently accepted by the VA for various conditions."}]'::jsonb,
    2
),
(
    '00000000-0000-0000-0000-000000000003',
    'aid-attendance',
    'Aid & Attendance (21-2680)',
    'Enhanced pension benefits for veterans needing assistance',
    'Aid and Attendance is a benefit available to veterans and surviving spouses who require the regular assistance of another person. We provide comprehensive physician evaluations to support your A&A benefit claim.',
    '["Physician evaluation", "ADL documentation", "When clinically indicated", "Rush service: +$500 USD (36-48 hours)"]'::jsonb,
    1999,
    '10-14 business days',
    'aid-attendance',
    'heart-pulse',
    '[{"question": "Can you help with Aid & Attendance?", "answer": "Yes, we provide complete physician evaluations and documentation for VA Form 21-2680."}]'::jsonb,
    3
),
(
    '00000000-0000-0000-0000-000000000004',
    'cp-coaching',
    'C&P Coaching',
    'Preparation for compensation and pension examinations',
    'Prepare for your C&P exam with expert coaching. We help you understand what to expect, how to accurately report your symptoms, and provide tips to ensure your disabilities are properly documented.',
    '["What to expect", "Accurate symptom reporting", "Logbooks & lay tips"]'::jsonb,
    29,
    'Same day or next business day',
    'coaching',
    'users',
    '[{"question": "What is C&P coaching?", "answer": "C&P coaching prepares you for your Compensation and Pension exam, helping you understand the process and communicate your condition effectively."}]'::jsonb,
    4
),
(
    '00000000-0000-0000-0000-000000000005',
    'expert-consultation',
    'One-on-One Consultation with Expert',
    'Personal consultation to review your claim with medical expert',
    'Schedule a comprehensive one-on-one consultation with our medical expert to review your VA claim, discuss your medical conditions, and receive personalized guidance on strengthening your case. This direct consultation provides expert insights tailored to your specific situation.',
    '["Personal consultation with medical expert", "Comprehensive claim review", "Medical condition assessment", "Personalized recommendations"]'::jsonb,
    249,
    '1-hour consultation scheduled within 3-5 days',
    'consultation',
    'users',
    '[
        {"question": "How does the consultation work?", "answer": "You''ll have a scheduled one-on-one video or phone consultation with our medical expert to discuss your claim, medical conditions, and receive personalized guidance."},
        {"question": "What should I prepare for the consultation?", "answer": "Bring your medical records, VA correspondence, and any questions about your claim. We''ll review everything together during the session."},
        {"question": "Can I ask questions during the consultation?", "answer": "Absolutely! This is your dedicated time with the expert to ask questions, discuss concerns, and get personalized advice for your specific situation."}
    ]'::jsonb,
    5
),
(
    '00000000-0000-0000-0000-000000000006',
    'record-review',
    'Record Review',
    'Professional analysis of your medical documentation',
    'Our medical professionals review your service and medical records to identify conditions eligible for VA compensation, build a comprehensive timeline, and prepare targeted questions for your providers.',
    '["Service/med records synthesis", "Timeline build", "Provider question set"]'::jsonb,
    99,
    '5-7 business days',
    'review',
    'file-search',
    '[{"question": "What records should I provide?", "answer": "Please provide your service treatment records, VA medical records, and any private medical records related to your conditions."}]'::jsonb,
    6
),
(
    '00000000-0000-0000-0000-000000000007',
    '1151-claim',
    '1151 Claim (VA Medical Malpractice)',
    'Expert medical opinions for VA medical negligence claims',
    'Specialized medical documentation for 38 U.S.C. § 1151 claims when veterans are injured or their conditions worsen due to VA medical care. Our expert analysis helps establish negligence and causation for these complex claims requiring higher burden of proof.',
    '["VA treatment record analysis", "Medical negligence assessment", "Causation nexus opinions", "Standard of care evaluation"]'::jsonb,
    1999,
    '10-14 business days',
    'malpractice',
    'alert-triangle',
    '[
        {"question": "What is a 1151 claim?", "answer": "A 1151 claim is filed when a veteran believes they were injured or their condition worsened due to VA medical care negligence, surgical errors, medication mistakes, or other treatment-related harm."},
        {"question": "How is this different from a regular VA claim?", "answer": "1151 claims require proving VA negligence and deviation from medical standards, not just service connection. They have a higher burden of proof but can provide compensation even for non-service-connected conditions."},
        {"question": "What evidence do I need?", "answer": "You need complete VA medical records, documentation of the injury or worsening, and expert medical opinions showing the VA deviated from accepted medical standards."},
        {"question": "Can I get compensation if my original condition wasn''t service-connected?", "answer": "Yes, 1151 claims can provide compensation for injuries caused by VA medical care regardless of whether your original condition was service-connected."}
    ]'::jsonb,
    7
);

-- ============================================
-- BLOG POSTS
-- ============================================
INSERT INTO blog_posts (id, slug, title, excerpt, content_html, category, tags, author_name, published_at, read_time) VALUES
(
    '00000000-0000-0000-0000-000000000101',
    'nexus-and-rebuttal-letters-explained',
    'Nexus and Rebuttal Letters: Your Key to VA Claim Success',
    'Understanding the difference between nexus and rebuttal letters and when you need each for your VA claim.',
    '<h2>Understanding Nexus and Rebuttal Letters</h2><p>Both nexus and rebuttal letters are crucial medical documents in the VA claims process, but they serve different purposes at different stages of your claim.</p><h3>Nexus Letters: Building Your Initial Case</h3><p>A nexus letter establishes the connection between your military service and your current medical condition. The term ''nexus'' means connection or link.</p><ul><li>Review of service records</li><li>Review of medical records</li><li>Medical rationale</li><li>Opinion to ''at least as likely as not'' standard</li></ul><h3>Rebuttal Letters: Fighting Unfavorable Decisions</h3><p>When the VA denies your claim or gives you a lower rating than expected, a rebuttal letter challenges their decision with contrary medical evidence.</p><ul><li>Addresses specific VA denial reasons</li><li>Provides alternative medical interpretation</li><li>Challenges VA examiner conclusions</li><li>Supports higher disability ratings</li></ul><h3>When Do You Need Each?</h3><p><strong>Nexus Letters:</strong> For initial claims, reopened claims, or when establishing service connection.</p><p><strong>Rebuttal Letters:</strong> For appeals, higher level reviews, or when challenging unfavorable VA decisions.</p><p>Both types of letters can be the difference between an approved and denied claim, or between a 30% and 70% disability rating.</p>',
    'nexus-letters',
    ARRAY['nexus', 'rebuttal', 'medical opinion', 'appeals'],
    'Military Disability Nexus',
    '2025-09-15 10:00:00+00',
    '6 min read'
),
(
    '00000000-0000-0000-0000-000000000102',
    'how-to-prepare-cp-exam',
    'How to Prepare for a C&P Exam',
    'What to expect at the claim exam and how to communicate symptoms accurately.',
    '<h2>Preparing for Your C&P Exam</h2><p>The Compensation and Pension (C&P) exam is a critical step in the VA claims process. Here''s how to prepare.</p><h3>Before the Exam</h3><ul><li>Gather all relevant medical records</li><li>Keep a symptom diary for at least 2 weeks</li><li>List all medications and treatments</li><li>Note how conditions affect daily life</li></ul><h3>During the Exam</h3><p>Be honest, thorough, and describe your worst days. The examiner needs to understand the full impact of your condition.</p>',
    'exam-prep',
    ARRAY['C&P', 'exam prep'],
    'Military Disability Nexus',
    '2025-09-20 10:00:00+00',
    '7 min read'
),
(
    '00000000-0000-0000-0000-000000000103',
    'aid-attendance-quick-guide',
    'Aid & Attendance (VA Form 21-2680): A Quick Guide',
    'When A&A is appropriate, ADL documentation tips, and physician evaluation basics.',
    '<h2>Aid & Attendance Benefits</h2><p>Aid and Attendance (A&A) is an additional benefit for veterans who need help with activities of daily living (ADLs).</p><h3>Who Qualifies?</h3><p>Veterans who require assistance with:</p><ul><li>Bathing or dressing</li><li>Eating or using the bathroom</li><li>Adjusting prosthetic devices</li><li>Protection from hazards due to mental conditions</li></ul><h3>Required Documentation</h3><p>VA Form 21-2680 must be completed by a physician who examines the veteran and documents their need for regular aid and attendance.</p>',
    'aid-attendance',
    ARRAY['aid & attendance', '21-2680'],
    'Military Disability Nexus',
    '2025-09-25 10:00:00+00',
    '6 min read'
),
(
    '00000000-0000-0000-0000-000000000104',
    'understanding-1151-claims',
    'Understanding 1151 Claims: When VA Medical Care Goes Wrong',
    'Learn about 38 U.S.C. § 1151 claims for compensation when VA medical treatment causes injury or worsens your condition.',
    '<h2>What is a 1151 Claim?</h2><p>A 1151 claim, filed under 38 U.S.C. § 1151, allows veterans to seek compensation when they are injured or their condition is worsened due to VA medical care, treatment, or hospitalization.</p><h3>When to Consider a 1151 Claim</h3><ul><li><strong>Surgical Errors:</strong> Complications from VA surgeries due to negligence</li><li><strong>Medication Mistakes:</strong> Wrong medications or dosages causing harm</li><li><strong>Hospital-Acquired Infections:</strong> Infections due to unsanitary conditions</li><li><strong>Misdiagnosis:</strong> Delayed or incorrect diagnosis leading to worsening</li><li><strong>Treatment Delays:</strong> Unreasonable delays causing deterioration</li></ul><h3>Key Differences from Regular Claims</h3><p>Unlike standard VA disability claims, 1151 claims require proving:</p><ul><li>VA negligence or deviation from medical standards</li><li>Direct causation between VA care and your injury</li><li>Additional disability beyond your original condition</li></ul><h3>Evidence Requirements</h3><p>Strong 1151 claims typically include:</p><ul><li>Complete VA medical records</li><li>Independent medical expert opinions</li><li>Documentation of the standard of care</li><li>Proof of additional disability or worsening</li></ul><h3>Why Expert Medical Opinion Matters</h3><p>1151 claims have a higher burden of proof than regular VA claims. Expert medical analysis is crucial to establish that the VA deviated from accepted medical standards and directly caused your injury or worsening condition.</p>',
    '1151-claims',
    ARRAY['1151 claim', 'VA malpractice', 'medical negligence'],
    'Military Disability Nexus',
    '2025-10-01 10:00:00+00',
    '8 min read'
);

-- ============================================
-- SAMPLE TESTIMONIALS
-- ============================================
INSERT INTO testimonials (name, branch, rating, feedback, tags) VALUES
('John D.', 'Army', 5, 'The nexus letter was exactly what I needed. Clear, professional, and my claim was approved within 3 months. Highly recommend!', ARRAY['nexus letter']),
('Sarah M.', 'Navy', 5, 'After two denials, the rebuttal letter helped me win my appeal. The medical analysis was thorough and addressed every point the VA raised.', ARRAY['nexus letter', 'claim readiness review']),
('Robert K.', 'Marine Corps', 5, 'Professional service from start to finish. The C&P exam coaching prepared me well for my exam. Worth every penny.', ARRAY['c&p exam coaching']);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Services inserted: ' || COUNT(*) FROM services;
SELECT 'Blog posts inserted: ' || COUNT(*) FROM blog_posts;
SELECT 'Testimonials inserted: ' || COUNT(*) FROM testimonials;
