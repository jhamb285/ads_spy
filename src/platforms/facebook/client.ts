/**
 * Facebook Ads Platform Client
 * Scrapes Facebook Ad Library using curious_coder/facebook-ads-library-scraper on Apify
 */

import { ApifyClient } from 'apify-client';
import { PlatformClient, CompetitorInput, NormalizedAd } from '../types';
import { normalizeCuriousCoderAds } from './normalizer';

const FACEBOOK_ACTOR_ID = 'curious_coder/facebook-ads-library-scraper';

export class FacebookClient implements PlatformClient {
  constructor(private apifyClient: ApifyClient) {}

  async scrapeAdsForCompetitor(
    competitor: CompetitorInput,
    maxAds: number,
    daysBack?: number
  ): Promise<NormalizedAd[]> {
    console.log(`📡 [Facebook] Scraping ads for: ${competitor.name} (${competitor.domain})`);

    // Build the Facebook page URL for scraping
    const pageUrl = this.buildFacebookUrl(competitor);
    const items = await this.runApifyActor(pageUrl, maxAds);

    // Normalize to common format
    const normalized = normalizeCuriousCoderAds(items, competitor.name);

    console.log(`📦 [Facebook] ${normalized.length} ads normalized for ${competitor.name}`);
    return normalized;
  }

  getPlatformName(): 'facebook' | 'google' {
    return 'facebook';
  }

  /**
   * Build a Facebook URL from competitor input.
   * - If domain is already a facebook.com URL, use it directly
   * - Otherwise, build an Ad Library search URL using the brand name
   */
  private buildFacebookUrl(competitor: CompetitorInput): string {
    const domain = competitor.domain;

    // Already a Facebook URL — use as-is
    if (domain.includes('facebook.com')) {
      const url = domain.startsWith('http') ? domain : `https://www.facebook.com/${domain}`;
      console.log(`🔗 [Apify] Using Facebook URL: ${url}`);
      return url;
    }

    // Not a Facebook URL — search the Ad Library by brand name
    const searchUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&q=${encodeURIComponent(competitor.name)}`;
    console.log(`🔗 [Apify] Built Ad Library search URL for "${competitor.name}"`);
    return searchUrl;
  }

  /**
   * Run the curious_coder/facebook-ads-library-scraper actor
   * Input format: { urls: [{url}], count, scrapeAdDetails, scrapePageAds.activeStatus, etc. }
   */
  private async runApifyActor(
    pageUrl: string,
    maxAds: number
  ): Promise<any[]> {
    const input = {
      urls: [{ url: pageUrl }],
      count: Math.max(maxAds, 10), // Actor requires minimum 10
      scrapeAdDetails: false,
      'scrapePageAds.activeStatus': 'active',
      'scrapePageAds.countryCode': 'ALL',
      'scrapePageAds.sortBy': 'impressions_desc',
    };

    console.log(`📡 [Apify] Running actor with count=${maxAds} for: ${pageUrl}`);

    const run = await this.apifyClient.actor(FACEBOOK_ACTOR_ID).call(input);
    const { items } = await this.apifyClient.dataset(run.defaultDatasetId).listItems();

    console.log(`📦 [Apify] Received ${items.length} raw items from actor`);

    // Log first item's keys for debugging on first run
    if (items.length > 0) {
      const firstItem = items[0] as any;
      console.log(`🔍 [Apify] First item keys: ${Object.keys(firstItem).join(', ')}`);
    }

    return items as any[];
  }
}
