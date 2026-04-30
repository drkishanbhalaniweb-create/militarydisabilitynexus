import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Node 20.6+ native env loading
try {
  process.loadEnvFile(path.resolve(__dirname, '../.env.local'));
} catch {
  try {
     process.loadEnvFile(path.resolve(__dirname, '../.env'));
  } catch {
     // Fallback to existing process.env variables if no file is found
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key. Check your .env.local file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('Fetching live and published blog posts...');

  // Only fetch published posts as per validation
  const { data: posts, error: fetchError } = await supabase
    .from('blog_posts')
    .select('id, title, category, tags, excerpt, is_published')
    .eq('is_published', true);

  if (fetchError) {
    console.error('Error fetching posts:', fetchError);
    return;
  }

  console.log(`Found ${posts.length} published posts. Beginning migration...`);

  let successCount = 0;
  let errorCount = 0;

  for (const post of posts) {
    // Replicate the exact fallback logic used in the frontend
    const tagsArray = post.tags || [];
    const keywordsStr = `${post.category || ''}, VA disability, ${tagsArray.join(', ')}`;
    const descriptionStr = post.excerpt || '';

    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({
        seo_keywords: keywordsStr,
        seo_description: descriptionStr,
      })
      .eq('id', post.id);

    if (updateError) {
      console.error(`❌ Failed to update post ID: ${post.id}`, updateError);
      errorCount++;
    } else {
      console.log(`✅ Migrated SEO data for: "${post.title}"`);
      successCount++;
    }
  }

  console.log('\nMigration Complete!');
  console.log(`✅ Successfully updated: ${successCount}`);
  if (errorCount > 0) {
    console.log(`❌ Failed updates: ${errorCount}`);
  }
}

runMigration().catch(console.error);
