/**
 * Debug script to test Google Ads Transparency scraper directly
 */

import { ApifyClient } from 'apify-client';
import * as dotenv from 'dotenv';

dotenv.config();

const GOOGLE_ADS_TRANSPARENCY_ACTOR = 'silva95gustavo/google-ads-scraper';

async function testScraper() {
  const apifyToken = process.env.APIFY_API_TOKEN;

  if (!apifyToken) {
    console.error('❌ APIFY_API_TOKEN not found in .env');
    process.exit(1);
  }

  const client = new ApifyClient({ token: apifyToken });

  const testUrl = 'https://adstransparency.google.com/?region=US&domain=terminix.com&preset-date=Last+30+days';

  console.log('🧪 Testing Google Ads Transparency scraper...');
  console.log(`📡 URL: ${testUrl}`);
  console.log(`🎭 Actor: ${GOOGLE_ADS_TRANSPARENCY_ACTOR}`);
  console.log('');

  try {
    const input = {
      startUrls: [{ url: testUrl }],  // Try object format
      maxItems: 5,
      downloadCreativeAssets: false,
    };

    console.log('⏳ Starting Apify actor...');
    const run = await client.actor(GOOGLE_ADS_TRANSPARENCY_ACTOR).call(input);

    console.log(`✅ Actor run completed: ${run.id}`);
    console.log(`⏱️  Duration: ${run.stats.runTimeSecs}s`);
    console.log('');

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    console.log(`📦 Retrieved ${items.length} ads`);
    console.log('');

    if (items.length > 0) {
      console.log('📄 First ad structure:');
      console.log(JSON.stringify(items[0], null, 2));
    } else {
      console.log('⚠️  No ads returned by scraper');
      console.log('');
      console.log('💡 Possible reasons:');
      console.log('  1. The transparency URL has no ads');
      console.log('  2. The scraper format has changed');
      console.log('  3. The URL format is incorrect');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('Full error:', error);
  }
}

testScraper();
