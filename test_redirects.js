const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env.local
const envConfig = dotenv.parse(fs.readFileSync('frontend/.env.local'));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

async function testFetch() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
        console.log("No env vars");
        return;
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/conditions?select=slug,services(slug),body_systems(slug)`, {
        headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`
        }
    });

    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

testFetch();
