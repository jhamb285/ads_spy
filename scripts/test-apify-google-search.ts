/**
 * Simple test to see what Apify Google Search scraper returns
 */

import dotenv from 'dotenv';
import { ApifyClient } from 'apify-client';

dotenv.config();

async function testApifyGoogleSearch() {
  console.log('🧪 Testing Apify Google Search Scraper\n');

  const apifyClient = new ApifyClient({ token: process.env.APIFY_API_TOKEN! });

  const input = {
    queries: 'pest control services',
    resultsPerPage: 20,
    maxPagesPerQuery: 1,
    countryCode: 'us',
    languageCode: 'en',
    includeUnfilteredResults: false,
  };

  console.log('📡 Input:', JSON.stringify(input, null, 2));
  console.log('\n🚀 Running scraper...\n');

  try {
    const run = await apifyClient
      .actor('nFJndFXA5zjCTuudP') // apify/google-search-scraper
      .call(input);

    const { items } = await apifyClient
      .dataset(run.defaultDatasetId)
      .listItems();

    if (!items || items.length === 0) {
      console.log('❌ No results returned');
      return;
    }

    const result = items[0];

    console.log('✅ Got results!\n');
    console.log('📊 Response structure:');
    console.log('  - Keys:', Object.keys(result));
    console.log('');

    // Check for paidResults
    console.log('🔍 Paid Results:');
    if (result.paidResults) {
      console.log(`  - Type: ${typeof result.paidResults}`);
      console.log(`  - Is Array: ${Array.isArray(result.paidResults)}`);
      console.log(`  - Count: ${Array.isArray(result.paidResults) ? result.paidResults.length : 'N/A'}`);

      if (Array.isArray(result.paidResults) && result.paidResults.length > 0) {
        console.log('  - Sample ad:');
        const ad = result.paidResults[0];
        console.log(JSON.stringify(ad, null, 4));
      }
    } else {
      console.log('  - paidResults: undefined');
    }
    console.log('');

    // Check for organicResults
    console.log('🔍 Organic Results:');
    if (result.organicResults) {
      console.log(`  - Type: ${typeof result.organicResults}`);
      console.log(`  - Is Array: ${Array.isArray(result.organicResults)}`);
      console.log(`  - Count: ${Array.isArray(result.organicResults) ? result.organicResults.length : 'N/A'}`);

      if (Array.isArray(result.organicResults) && result.organicResults.length > 0) {
        console.log('  - Sample result:');
        const organic = result.organicResults[0];
        console.log(`    - url: ${organic.url}`);
        console.log(`    - title: ${organic.title}`);
        console.log(`    - description: ${organic.description}`);
        console.log(`    - has 'isAd' field: ${organic.hasOwnProperty('isAd')}`);
      }
    } else {
      console.log('  - organicResults: undefined');
    }
    console.log('');

    // Show full result structure
    console.log('📄 Full result (first 500 chars):');
    const resultStr = JSON.stringify(result, null, 2);
    console.log(resultStr.substring(0, 500) + '...\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

testApifyGoogleSearch().catch(console.error);
