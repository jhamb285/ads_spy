import { ApifyClient } from 'apify-client';
import { ApifyAdItem } from './normalize';

const ACTOR_ID = 'apify/facebook-ads-scraper'; // Facebook Ads Library Scraper actor ID

/**
 * Run Apify actor with given limit
 */
async function runApifyActor(
  apifyClient: ApifyClient,
  pageUrl: string,
  limit: number,
  daysBack?: number
): Promise<ApifyAdItem[]> {
  const input: any = {
    isDetailsPerAd: false,
    onlyTotal: false,
    resultsLimit: limit,
    startUrls: [{ url: pageUrl }],
    extendOutputFunction: '',
    extendScraperFunction: '',
    proxyConfiguration: { useApifyProxy: true },
  };

  // Add date filter if specified
  if (daysBack) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    input.startDate = startDate.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  const run = await apifyClient.actor(ACTOR_ID).call(input);
  const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

  return items as unknown as ApifyAdItem[];
}

/**
 * Scrape ads from Apify for a given Facebook page URL
 * Cost optimization: First try to get just the latest ad, if none found, get up to maxAds
 */
export async function scrapeAdsForUrl(
  apifyClient: ApifyClient,
  pageUrl: string,
  maxAds: number,
  daysBack?: number
): Promise<ApifyAdItem[]> {
  // Step 1: Try to get just the latest ad (cost-efficient)
  console.log(`📡 Scraping latest ad for: ${pageUrl}`);
  
  let items = await runApifyActor(apifyClient, pageUrl, 1, daysBack);
  
  if (items.length > 0) {
    console.log(`✅ Found latest ad, returning 1 result`);
    return items;
  }

  // Step 2: No results with limit 1, try with higher limit
  console.log(`⚠️  No ads found with limit 1, retrying with limit ${maxAds}...`);
  
  items = await runApifyActor(apifyClient, pageUrl, maxAds, daysBack);
  
  console.log(`📦 Retrieved ${items.length} items from Apify`);
  return items;
}

/**
 * Create an Apify client instance
 */
export function createApifyClient(apiToken: string): ApifyClient {
  return new ApifyClient({ token: apiToken });
}

