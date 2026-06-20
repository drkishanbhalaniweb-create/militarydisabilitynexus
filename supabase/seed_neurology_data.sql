-- SQL Seed Script: Neurology Body System Content Update
-- Based on prototypes/neurology-nexus-letter-hub.html
-- Use this script in the Supabase SQL editor to populate neurology page content.

UPDATE public.body_systems
SET 
  hero_description = 'Evidence-based medical opinions, prepared by licensed clinicians, can help explain the connection between a neurological condition and military service. Our nexus letters and independent medical opinions are written to support direct service connection, secondary service connection, aggravation, and toxic-exposure claims — and to add medical clarity when a claim is on appeal. We focus on the medicine: a clear diagnosis, a plain-English mechanism of causation, and rationale grounded in your records and current medical literature.',
  
  overview = '<p>Neurological claims involve the brain, spinal cord, and peripheral nerves — and the symptoms that follow when those systems are injured or affected by disease. For veterans, this commonly includes <strong>headaches and migraines, traumatic brain injury, movement disorders, nerve damage, seizures, and progressive neurological diseases</strong>. These conditions can begin during service, develop later from an in-service injury or exposure, or arise as a complication of another service-connected disability.</p><p>Neurological claims are often among the more complex in the VA system. They can be evaluated under several different rating frameworks — for example, <strong>Diagnostic Code 8045</strong> for traumatic brain injury and <strong>Diagnostic Code 8100</strong> for migraines — and symptoms frequently overlap with mental-health conditions. Because of this, the medical questions are rarely just "Does the veteran have this condition?" They are "What is causing it, how is it connected to service, and how should the medical record describe its severity?"</p><p>That is why <strong>medical causation analysis</strong> matters. The VA looks for a credible medical link between a current condition and service. A well-prepared nexus letter explains the <em>how</em> — the biological mechanism connecting the two — not just the fact that a diagnosis exists. The most common pathways we document are summarized below.</p>',
  
  pathways = '[
    {
      "from": "PTSD",
      "to": "Migraine Headaches",
      "mechanism": "Chronic stress and changes in the autonomic nervous system associated with PTSD can trigger or worsen migraine activity, supporting a secondary-connection theory."
    },
    {
      "from": "TBI",
      "to": "Migraine Headaches",
      "mechanism": "Post-traumatic headaches are one of the most common residuals of a brain injury — and can appear or intensify years after the original event."
    },
    {
      "from": "TBI",
      "to": "Cognitive Impairment",
      "mechanism": "Difficulties with memory, attention, and processing speed are recognized residuals of brain injury and are evaluated within the TBI rating framework."
    },
    {
      "from": "TBI",
      "to": "Post-Concussive Syndrome",
      "mechanism": "A cluster of headache, dizziness, sleep, and mood symptoms that can persist well beyond the expected recovery period after a concussion."
    },
    {
      "from": "Diabetes",
      "to": "Peripheral Neuropathy",
      "mechanism": "Elevated blood sugar over time damages peripheral nerves, producing the numbness, tingling, and burning of diabetic neuropathy — a well-recognized complication."
    },
    {
      "from": "Toxic Exposure",
      "to": "Parkinson''s Disease",
      "mechanism": "Certain herbicide and contaminated-water exposures are recognized pathways to Parkinson''s, and medical evidence can document the link between exposure and diagnosis."
    },
    {
      "from": "Parkinson''s Disease",
      "to": "Aid & Attendance Eligibility",
      "mechanism": "As Parkinson''s progresses and affects mobility and daily self-care, a veteran''s level of dependence may support evaluation for additional aid-and-attendance benefits."
    }
  ]'::jsonb,
  
  challenges = '[
    {
      "icon": "Compass",
      "title": "Multiple Possible Causes",
      "description": "The same symptom — a headache, for example — can stem from a TBI, PTSD, a neck injury, medication, or exposure. A useful opinion identifies the most medically supported cause."
    },
    {
      "icon": "Hourglass",
      "title": "Delayed Symptom Onset",
      "description": "Conditions like post-traumatic headaches, neuropathy, or Parkinson''s can surface years after service, making the connection less obvious without a medical explanation of the delay."
    },
    {
      "icon": "Shuffle",
      "title": "Overlapping Symptoms",
      "description": "TBI and PTSD share many symptoms. Without clear delineation, residuals can be misattributed, which affects how the record reads to the VA."
    },
    {
      "icon": "Link",
      "title": "Secondary-Connection Theories",
      "description": "Many neurological conditions are best understood as secondary to another diagnosis. Establishing that chain requires explaining the underlying biology, not just listing diagnoses."
    },
    {
      "icon": "Scale",
      "title": "Conflicting Medical Opinions",
      "description": "A brief or incomplete examination may reach a conclusion the broader record does not support. A detailed independent opinion can address those gaps directly."
    },
    {
      "icon": "FileText",
      "title": "The Need for Detailed Rationale",
      "description": "A conclusion alone carries little weight. The reasoning — the medical \"why,\" supported by literature and the record — is what gives an opinion its credibility."
    }
  ]'::jsonb,
  
  service_descriptions = '[
    {
      "service_slug": "independent-medical-opinion-nexus-letter",
      "text": "Explains mechanisms in plain English, such as how a TBI leads to migraines or how diabetes damages peripheral nerves, and helps address complex cases involving overlapping symptoms (e.g. separating TBI residuals from PTSD)."
    },
    {
      "service_slug": "disability-benefits-questionnaire-dbq",
      "text": "Standardized disability questionnaires completed by licensed clinicians to evaluate the severity of your neurological conditions (e.g., migraine frequency, neuropathy reflex/sensory deficits, TBI cognitive facets) according to VA rating criteria."
    },
    {
      "service_slug": "claim-readiness-review",
      "text": "Pinpoints gaps in your neurological medical record — such as missing neuro-imaging (MRI/CT), neuropsychological evaluation, or documented secondary connection logic — before you file."
    }
  ]'::jsonb,
  
  specialist_guide = '[
    {
      "name": "Neurologists",
      "role": "Specialist interpretation",
      "best_for": "Most valuable when a diagnosis is contested or when rating-level detail matters — such as TBI facets under DC 8045, EMG/NCS interpretation for neuropathy, or conditions like MS and Parkinson''s where specialist reasoning strengthens the record.",
      "price": "$1,200–$1,800",
      "note": "Rating-detail cases"
    },
    {
      "name": "Internal Medicine Physicians",
      "role": "Causation & secondary claims",
      "best_for": "Well-suited to many neurological causation questions once a diagnosis is documented — especially secondary and toxic-exposure claims that turn on medical reasoning across body systems rather than on specialist testing.",
      "price": "$945",
      "note": "All theories included"
    },
    {
      "name": "Nurse Practitioners",
      "role": "Often former C&P examiners",
      "best_for": "A strong fit for more straightforward claims with clear documentation. Those who have served as C&P examiners also bring firsthand familiarity with how the VA reviews medical evidence.",
      "price": "From $400",
      "note": "+$250/additional"
    }
  ]'::jsonb,
  
  faqs = '[
    {
      "question": "Can a neurological condition be service connected?",
      "answer": "Many neurological conditions can be service connected when the medical record supports a link to service. That link may be direct (the condition began in service), secondary (caused or worsened by another service-connected disability), or based on toxic exposure. A nexus letter explains the medical connection; the VA decides the claim."
    },
    {
      "question": "Can migraines be service connected?",
      "answer": "Migraines can be service connected directly, for example after a documented head injury or blast exposure, or secondarily through conditions like TBI, PTSD, or a cervical spine injury. The VA evaluates migraines under Diagnostic Code 8100 based on the frequency of prostrating attacks and their effect on work."
    },
    {
      "question": "Can PTSD cause migraines?",
      "answer": "Medical literature describes a recognized relationship: chronic stress and autonomic nervous-system changes associated with PTSD can trigger or worsen migraine activity. This supports a secondary-service-connection theory, which a nexus letter can document along with the underlying mechanism."
    },
    {
      "question": "Can a TBI cause migraines years later?",
      "answer": "Post-traumatic headaches are one of the most common residuals of a brain injury, and they can appear or worsen long after the original event. A nexus letter can connect a documented in-service TBI to later-developing migraines and explain the delayed onset in plain medical terms."
    },
    {
      "question": "Can tinnitus contribute to headaches?",
      "answer": "In some veterans, tinnitus and headaches involve related neurological pathways, and tinnitus can be one contributing factor to headache activity. Whether a connection applies depends on the individual medical picture, which a clinician reviews before forming an opinion."
    },
    {
      "question": "Can diabetes cause peripheral neuropathy?",
      "answer": "Persistently elevated blood sugar damages peripheral nerves over time, producing the numbness, tingling, burning, and weakness of diabetic peripheral neuropathy. When diabetes is service connected, neuropathy is a well-recognized secondary condition that medical evidence can support."
    },
    {
      "question": "Can Parkinson''s disease qualify for VA disability benefits?",
      "answer": "Parkinson''s disease can be evaluated for VA disability, and for certain exposures, such as qualifying herbicide or contaminated-water exposure, it is recognized as a presumptive condition. Medical evidence can document the diagnosis, its severity, and, where relevant, the exposure connection."
    },
    {
      "question": "Can a neurological condition be secondary to another service-connected disability?",
      "answer": "Yes. Secondary service connection applies when one service-connected disability causes or aggravates another condition. Common neurological examples include migraines secondary to TBI or PTSD, and peripheral neuropathy secondary to diabetes. A nexus letter explains the medical relationship between the two."
    },
    {
      "question": "Can a private nexus letter help after a denial?",
      "answer": "A private nexus letter or independent medical opinion can add medical reasoning that an earlier decision or C&P exam may have lacked, such as explaining why a condition is at least as likely as not related to service or responding to a negative opinion. It does not guarantee a different outcome, but it can strengthen the medical record on appeal."
    },
    {
      "question": "Do I need a neurologist for a nexus letter?",
      "answer": "Not always. Many neurological causation questions can be addressed by an internal medicine physician once a diagnosis is documented, while a neurologist is valuable for contested diagnoses or rating-level detail such as TBI facets or EMG/NCS findings. The right provider depends on the condition and the complexity of the claim."
    },
    {
      "question": "What evidence supports a neurological VA claim?",
      "answer": "Strong neurological claims usually combine a current diagnosis, evidence of an in-service event or exposure or a link to another service-connected condition, and a medical opinion connecting the two. Supporting records may include imaging, neuropsychological testing, treatment notes, and a clear statement of symptom frequency and severity."
    },
    {
      "question": "What does at least as likely as not mean?",
      "answer": "It is the medical-evidentiary standard used in nexus opinions, meaning the probability of a connection is at least 50 percent — as likely as not. A clinician uses it to state, in medical terms, whether a condition is reasonably connected to service. It is a medical opinion, not a legal determination."
    },
    {
      "question": "How is a nexus letter different from a C&P exam?",
      "answer": "A C&P exam is arranged by the VA as part of its review. A nexus letter or independent medical opinion is an additional, independent clinical opinion you can submit, which is useful when an exam was brief, missed a secondary theory, or reached a conclusion the medical record may not support."
    },
    {
      "question": "What happens during a free discovery call?",
      "answer": "A discovery call is a no-obligation conversation to understand your conditions and goals, talk through possible service-connection pathways, and explain whether additional medical evidence may help. There is no pressure to proceed, and we will be candid if we do not believe a letter would add value to your claim."
    }
  ]'::jsonb
WHERE slug = 'neurology';
