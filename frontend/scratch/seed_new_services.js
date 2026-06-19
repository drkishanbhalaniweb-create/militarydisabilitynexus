const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables in environment or env-file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function upsertServiceBySlug(serviceData) {
  console.log(`Checking if service with slug '${serviceData.slug}' exists...`);
  const { data: existing, error: selectError } = await supabase
    .from('services')
    .select('id')
    .eq('slug', serviceData.slug)
    .maybeSingle();

  if (selectError) {
    console.error(`Error querying service '${serviceData.slug}':`, selectError);
    process.exit(1);
  }

  if (existing) {
    console.log(`Service '${serviceData.slug}' exists with ID ${existing.id}. Updating it...`);
    const { error: updateError } = await supabase
      .from('services')
      .update({
        title: serviceData.title,
        short_description: serviceData.short_description,
        full_description: serviceData.full_description,
        features: serviceData.features,
        base_price_usd: serviceData.base_price_usd,
        duration: serviceData.duration,
        category: serviceData.category,
        icon: serviceData.icon,
        faqs: serviceData.faqs,
        display_order: serviceData.display_order,
        is_active: serviceData.is_active
      })
      .eq('id', existing.id);

    if (updateError) {
      console.error(`Error updating service '${serviceData.slug}':`, updateError);
      process.exit(1);
    }
  } else {
    console.log(`Service '${serviceData.slug}' does not exist. Inserting new record...`);
    const { error: insertError } = await supabase
      .from('services')
      .insert([serviceData]);

    if (insertError) {
      console.error(`Error inserting service '${serviceData.slug}':`, insertError);
      process.exit(1);
    }
  }
}

async function run() {
  console.log('Connecting to Supabase...');

  // 1. Deactivate C&P Coaching and One-on-One Consultation
  console.log('Deactivating C&P Coaching and One-on-One Consultation...');
  const { error: deactivateError } = await supabase
    .from('services')
    .update({ is_active: false })
    .in('slug', ['cp-exam-coaching', 'expert-consultation']);

  if (deactivateError) {
    console.error('Error deactivating old services:', deactivateError);
    process.exit(1);
  }

  // 2. Update display orders of remaining existing services
  console.log('Updating display orders of existing services...');
  const orderUpdates = [
    { slug: 'independent-medical-opinion-nexus-letter', display_order: 1 },
    { slug: 'claim-readiness-review', display_order: 2 },
    { slug: 'disability-benefits-questionnaire-dbq', display_order: 3 },
    { slug: 'aid-and-attendance', display_order: 4 },
    { slug: 'va-medical-malpractice-1151-case', display_order: 6 }
  ];

  for (const update of orderUpdates) {
    const { error: updateError } = await supabase
      .from('services')
      .update({ display_order: update.display_order })
      .eq('slug', update.slug);
    
    if (updateError) {
      console.error(`Error updating order for ${update.slug}:`, updateError);
      process.exit(1);
    }
  }

  // 3. Upsert TDIU service
  const tdiuService = {
    id: '00000000-0000-0000-0000-000000000008',
    slug: 'tdiu-unemployability-medical-documentation',
    title: 'TDIU (Unemployability) Documentation',
    short_description: 'TDIU documentation is a clinician’s opinion showing that your service-connected disabilities prevent substantially gainful employment — the functional-capacity evidence that strengthens an attorney-handled TDIU claim.',
    full_description: 'Total Disability based on Individual Unemployability (TDIU) allows the VA to pay 100% disability compensation to veterans whose service-connected conditions prevent them from maintaining substantially gainful employment. Our USA-licensed clinicians write comprehensive medical opinions and functional capacity assessments that establish how your service-connected conditions physically and mentally limit your ability to work, providing your representative with the medical evidence needed to build a strong case.',
    features: [
      'Review of medical records, rating decisions, and employment history',
      'Clinician opinion on limitations from service-connected conditions',
      'Assessment of capacity for physical and sedentary work'
    ],
    base_price_usd: 995,
    duration: '10-14 business days',
    category: 'tdiu',
    icon: 'briefcase',
    faqs: [
      {
        question: 'How does TDIU documentation help my claim?',
        answer: 'To win a TDIU claim, you must prove that your service-connected conditions prevent you from securing or holding substantially gainful employment. Our clinicians review your medical and employment history to document your physical and mental functional limitations in a formal medical opinion, bridging the gap between your clinical diagnoses and your unemployability.'
      }
    ],
    display_order: 5,
    is_active: true
  };
  await upsertServiceBySlug(tdiuService);

  // 4. Upsert Attorney Partnership service
  const partnershipService = {
    id: '00000000-0000-0000-0000-000000000009',
    slug: 'attorney-advocate-partnership',
    title: 'Attorney & Advocate Partnership Program',
    short_description: 'Board-certified physician-authored medical evidence for VA disability law firms, accredited claims agents, and veteran service organizations — nexus letters, IMOs, DBQs, rebuttals, TDIU opinions, Aid & Attendance evaluations, and 1151 reports, delivered on your timeline and defensible at the Board of Veterans’ Appeals.',
    full_description: 'We partner with VA disability attorneys, accredited claims agents, and Veteran Service Organizations (VSOs) to provide high-quality, independent medical evidence. Our board-certified physicians write medical opinions, nexus letters, DBQs, and rebuttal reports that are legally defensible and scientifically sound, helping representatives build strong cases for their veteran clients.',
    features: [
      'Specialty-matched board-certified physicians',
      'Legally defensible medical opinions and rebuttals',
      'Dedicated advocate portals and priority turnaround timelines'
    ],
    base_price_usd: 0, // 0 for custom partnership pricing
    duration: 'Custom priority timeline',
    category: 'partnership',
    icon: 'landmark',
    faqs: [
      {
        question: 'How do you partner with attorneys and advocates?',
        answer: 'We offer dedicated medical record screening, priority turnaround times, direct access to board-certified medical experts, and bulk invoicing for law firms and advocate groups. Contact us to learn how we can support your case pipeline with high-quality medical evidence.'
      }
    ],
    display_order: 7,
    is_active: true
  };
  await upsertServiceBySlug(partnershipService);

  console.log('Seeding completed successfully!');
}

run();
