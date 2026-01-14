import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ehwejkvlreyokfarjjeu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVod2Vqa3ZscmV5b2tmYXJqamV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDU5ODgsImV4cCI6MjA3NzQyMTk4OH0.4WefvIpkIlpe9tczAEnqADMIY5_pvQKOiuUs4EqybQg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCaseStudies() {
    console.log('Checking case_studies table...');
    const { data, count, error } = await supabase
        .from('case_studies')
        .select('*', { count: 'exact' });

    if (error) {
        console.error('Error fetching case studies:', error);
        return;
    }

    console.log(`Total case studies in DB: ${count}`);
    console.log('First few titles:', data.slice(0, 3).map(cs => cs.title));

    const { data: published, count: pubCount } = await supabase
        .from('case_studies')
        .select('*', { count: 'exact' })
        .eq('is_published', true);

    console.log(`Published case studies: ${pubCount}`);
}

checkCaseStudies();
