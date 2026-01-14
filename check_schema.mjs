import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try to load env variables
const envPath = path.join(process.cwd(), 'frontend', '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking contacts table columns...');
    // We can't easily get full schema via anon key usually, but we can try a select
    const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching contacts:', error);
    } else {
        console.log('Columns in contacts:', Object.keys(data[0] || {}));
    }

    console.log('\nChecking form_submissions table columns...');
    const { data: formData, error: formError } = await supabase
        .from('form_submissions')
        .select('*')
        .limit(1);

    if (formError) {
        console.error('Error fetching form_submissions:', formError);
    } else {
        console.log('Columns in form_submissions:', Object.keys(formData[0] || {}));
    }
}

checkSchema();
