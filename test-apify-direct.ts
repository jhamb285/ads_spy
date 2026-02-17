/**
 * Direct test of Apify scraper to see if it's working
 */

import { ApifyClient } from 'apify-client';
import * as dotenv from 'dotenv';

dotenv.config();

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

if (!APIFY_TOKEN) {
  console.error('❌ APIFY_API_TOKEN not found in environment');
  process.exit(1);
}

console.log('✅ Apify token found:', APIFY_TOKEN.substring(0, 15) + '...');

const client = new ApifyClient({ token: APIFY_TOKEN });

const testUrl = 'https://adstransparency.google.com/?region=US&domain=atexpest.com';

console.log('\n📡 Testing Apify scraper with:', testUrl);
console.log('Actor: silva95gustavo/google-ads-scraper\n');

async function test() {
  try {
    const input = {
      startUrls: [{ url: testUrl }],
      maxItems: 3,  // Just get 3 ads for quick test
      shouldDownloadAssets: false,
      shouldDownloadPreviews: false,
      ocr: false,
      skipDetails: false,
    };

    console.log('🚀 Starting Apify actor...');
    const run = await client
      .actor('silva95gustavo/google-ads-scraper')
      .call(input);

    console.log('✅ Actor run completed:', run.id);
    console.log('Status:', run.status);

    console.log('\n📥 Fetching results...');
    const { items } = await client
      .dataset(run.defaultDatasetId)
      .listItems();

    console.log(`\n✅ Found ${items.length} ads\n`);

    if (items.length === 0) {
      console.log('⚠️  No ads found. This could mean:');
      console.log('  1. The domain has no ads currently');
      console.log('  2. The scraper needs time to find ads');
      console.log('  3. There might be an issue with the scraper');
    } else {
      console.log('📋 First ad sample:');
      console.log(JSON.stringify(items[0], null, 2));
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

test();
