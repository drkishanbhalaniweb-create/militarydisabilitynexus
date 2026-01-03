const { execSync } = require('child_process');

// Check if we're running on Vercel
const isVercel = process.env.VERCEL === '1' || process.env.CI === 'true';

if (isVercel) {
  console.log('⚠️  Skipping react-snap on Vercel (Puppeteer not supported in build environment)');
  console.log('ℹ️  Your site will still be SEO-friendly with:');
  console.log('   - React Helmet for meta tags');
  console.log('   - Proper semantic HTML');
  console.log('   - Sitemap.xml');
  console.log('   - Reddit Pixel for tracking');
  process.exit(0);
}

// Run react-snap locally
console.log('🚀 Running react-snap for pre-rendering...');
try {
  execSync('react-snap', { stdio: 'inherit' });
  console.log('✅ Pre-rendering complete!');
} catch (error) {
  console.error('❌ react-snap failed:', error.message);
  // Don't fail the build if react-snap fails
  process.exit(0);
}
