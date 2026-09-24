#!/usr/bin/env node

/**
 * Zoho CRM Connection & Integration Diagnostic Tool
 *
 * Standalone CLI script to verify Zoho OAuth 2.0 credentials and test
 * lead upsert capabilities without requiring server execution.
 *
 * Usage:
 *   node scripts/testZohoConnection.js (from frontend/)
 *   node frontend/scripts/testZohoConnection.js (from repo root)
 */

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

// Locate environment files across frontend/ or repo root
function findEnvFile(fileName) {
  const candidates = [
    path.resolve(process.cwd(), fileName),
    path.resolve(__dirname, '..', fileName),
    path.resolve(process.cwd(), 'frontend', fileName),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

// Lightweight .env parser without external dependencies
function loadEnvFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) continue;
      const key = line.slice(0, eqIdx).trim();
      let val = line.slice(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      // Do not overwrite existing environment variables
      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  } catch (err) {
    console.warn(`[Diagnostic] Warning: Could not read env file at ${filePath}:`, err.message);
  }
}

// Load .env.local first (higher precedence), followed by .env
loadEnvFile(findEnvFile('.env.local'));
loadEnvFile(findEnvFile('.env'));

async function runDiagnostic() {
  console.log('======================================================');
  console.log('   Zoho CRM OAuth 2.0 Credentials Diagnostic Tool     ');
  console.log('======================================================\n');

  const zohoLibPath = pathToFileURL(path.resolve(__dirname, '../src/lib/zohoCrm.js')).href;
  const { isZohoConfigured, getAccessToken, upsertLead } = await import(zohoLibPath);

  // Pre-check credentials presence
  if (!isZohoConfigured()) {
    console.log('❌ [Zoho CRM Diagnostic] Credentials are missing or incomplete.');
    console.log('   Please add ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN to your .env.local file.\n');
    console.log('   Required variables:');
    console.log('     - ZOHO_CLIENT_ID      : ' + (process.env.ZOHO_CLIENT_ID ? 'Configured' : 'Missing'));
    console.log('     - ZOHO_CLIENT_SECRET  : ' + (process.env.ZOHO_CLIENT_SECRET ? 'Configured' : 'Missing'));
    console.log('     - ZOHO_REFRESH_TOKEN  : ' + (process.env.ZOHO_REFRESH_TOKEN ? 'Configured' : 'Missing'));
    console.log('     - ZOHO_ACCOUNTS_URL   : ' + (process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.com (default)'));
    console.log('     - ZOHO_API_DOMAIN     : ' + (process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com (default)'));
    console.log('\n📖 Refer to docs/ZOHO_CRM_SETUP.md for credential generation steps.\n');
    process.exit(0);
  }

  console.log('✅ Configuration keys detected in environment.\n');

  // Step 1: Test token refresh
  console.log('--- Step 1: Testing OAuth 2.0 Token Refresh ---');
  let token = null;
  try {
    token = await getAccessToken(true);
  } catch (err) {
    console.error('❌ Failed to acquire access token: ' + (err.message || err));
    console.error('\nTroubleshooting tips:');
    console.error('1. Verify your refresh token is not revoked or expired.');
    console.error('2. Confirm client ID and client secret match the Self Client.');
    console.error('3. Check that accounts URL and API domain match your Zoho data center (e.g. US, EU, IN).\n');
    process.exit(1);
  }

  if (!token) {
    console.error('❌ Token refresh returned empty token.\n');
    process.exit(1);
  }

  // Token acquired: print masked preview
  const maskedPreview = token.length > 8
    ? `${token.slice(0, 4)}...${token.slice(-4)}`
    : '**********';
  console.log(`✅ Token acquired: ********** (${maskedPreview})`);
  console.log('   OAuth token exchange verified successfully.\n');

  // Step 2: Test lead upsert
  console.log('--- Step 2: Testing Lead Upsert into Zoho CRM ---');
  const testPayload = {
    First_Name: 'Zoho Test',
    Last_Name: 'Verification',
    Email: 'zoho-test-verification@militarydisabilitynexus.com',
    Phone: '(555) 019-2834',
    Company: 'Veteran (Test Verification)',
    Lead_Source: 'Website - Automated Verification',
    Description: 'Automated end-to-end test lead created to verify Zoho CRM integration.',
  };

  console.log('Submitting test lead with email: ' + testPayload.Email);
  const result = await upsertLead(testPayload);

  if (!result.success) {
    console.error(`❌ Lead upsert failed: ${result.error || 'Unknown error'}`);
    if (result.raw) {
      console.error('API Response:', JSON.stringify(result.raw, null, 2));
    }
    process.exit(1);
  }

  console.log(`✅ Lead ${result.action}: Lead ID = ${result.leadId || 'N/A'}`);
  console.log('\n======================================================');
  console.log('              Verification Complete!                  ');
  console.log('======================================================');
  console.log('Next steps:');
  console.log('1. Open your Zoho CRM dashboard: https://crm.zoho.com/');
  console.log('2. Navigate to the "Leads" module.');
  console.log('3. Search for "zoho-test-verification@militarydisabilitynexus.com".');
  console.log(`4. Verify the record details (Action: ${result.action}, Lead ID: ${result.leadId || 'N/A'}).`);
  console.log('5. Safely delete this test lead when verification is complete.\n');
}

runDiagnostic().catch((err) => {
  console.error('\n❌ Unexpected error running diagnostic tool:', err);
  process.exit(1);
});
