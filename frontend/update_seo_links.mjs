import { createClient } from '@supabase/supabase-js';
import pkg from '@next/env';
const { loadEnvConfig } = pkg;
import process from 'process';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log("Starting SEO Internal Linking Updates...");

  // Helper to append text to a service description
  async function updateService(slug, textToAppend) {
    const { data: svc, error: fetchErr } = await supabase
      .from('services')
      .select('id, full_description')
      .eq('slug', slug)
      .single();
      
    if (fetchErr) {
      console.log(`Error fetching service ${slug}:`, fetchErr);
      return;
    }
    
    const currentDesc = svc.full_description || '';
    if (currentDesc.includes(textToAppend.split('](')[0])) {
      console.log(`Service ${slug} already contains the link. Skipping.`);
      return;
    }

    const newDesc = currentDesc + '\n\n' + textToAppend;
    
    const { error: updateErr } = await supabase
      .from('services')
      .update({ full_description: newDesc })
      .eq('id', svc.id);
      
    if (updateErr) {
      console.log(`Error updating service ${slug}:`, updateErr);
    } else {
      console.log(`Successfully updated service ${slug}.`);
    }
  }

  // Phase 1
  await updateService(
    'va-medical-malpractice-1151-case',
    '### Related Resources\n- [Understanding VA 1151 Claims and Medical Malpractice](/blog/understanding-1151-claims-when-va-medical-care-goes-wrong)'
  );

  // Phase 2
  await updateService(
    'independent-medical-opinion-nexus-letter',
    '### Need help deciding?\nNot sure what type of letter you need? [Read our guide on the differences between Nexus and Rebuttal letters](/blog/nexus-and-rebuttal-letters-explained).'
  );

  // Phase 3
  await updateService(
    'independent-medical-opinion-nexus-letter',
    'We regularly support complex psychiatric claims. See our [Complete Guide to PTSD VA Claims and Nexus Letters](/blog/ptsd-va-disability-claim-nexus-letters-denial-reasons-your-complete-filing-guide).'
  );

  // Phase 5
  await updateService(
    'claim-readiness-review',
    'Before you submit your packet, find out if your [VA claim is really ready to file](/blog/is-your-va-claim-really-ready-to-file).'
  );

  // Phase 6
  await updateService(
    'disability-benefits-questionnaire-dbq',
    'Sometimes a DBQ can prevent the need for a stressful C&P exam. Learn more about [how to prepare for a C&P exam](/blog/how-to-prepare-cp-exam) if the VA requires one.'
  );

  // Phase 7
  await updateService(
    'claim-readiness-review',
    'If you have experienced a previous denial, learn [what to do if the VA denied your pre-existing condition](/blog/what-to-do-if-the-va-denied-your-pre-existing-condition).'
  );

  // Update blog timestamps to trigger sitemap change
  const slugsToTouch = [
    'understanding-1151-claims-when-va-medical-care-goes-wrong',
    'nexus-and-rebuttal-letters-explained',
    'ptsd-va-disability-claim-nexus-letters-denial-reasons-your-complete-filing-guide',
    'crohns-disease-secondary-to-ptsd-va-claim',
    'is-your-va-claim-really-ready-to-file',
    'how-to-prepare-cp-exam',
    'what-to-do-if-the-va-denied-your-pre-existing-condition'
  ];

  const now = new Date().toISOString();
  
  for (const slug of slugsToTouch) {
    const { error } = await supabase
      .from('blog_posts')
      .update({ updated_at: now })
      .eq('slug', slug);
      
    if (error) {
      console.log(`Failed to touch blog ${slug}:`, error);
    } else {
      console.log(`Touched blog ${slug} (updated_at).`);
    }
  }

  console.log("Done!");
}

main().catch(console.error);
