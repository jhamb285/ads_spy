/**
 * Facebook Ads Platform Client
 * Scrapes Facebook Ads Library using Apify
 */

import { ApifyClient } from 'apify-client';
import { PlatformClient, CompetitorInput, NormalizedAd } from '../types';
import { normalizeApifyAdsBatch, ApifyAdItem } from './normalizer';

const FACEBOOK_ACTOR_ID = 'apify/facebook-ads-scraper';

export class FacebookClient implements PlatformClient {
  constructor(private apifyClient: ApifyClient) {}

  async scrapeAdsForCompetitor(
    competitor: CompetitorInput,
    maxAds: number,
    daysBack?: number
  ): Promise<NormalizedAd[]> {
    console.log(`📡 [Facebook] Scraping ads for: ${competitor.domain}`);

    // Scrape Facebook Ads Library
    const apifyAds = await this.scrapeAdsForUrl(
      competitor.domain,
      maxAds,
      daysBack
    );

    // Normalize to common format
    const normalized = normalizeApifyAdsBatch(
      apifyAds,
      '', // avatar (can be set later)
      competitor.name
    );

    // Add platform field
    return normalized.map(ad => ({
      ...ad,
      platform: 'facebook' as const
    }));
  }

  getPlatformName(): 'facebook' | 'google' {
    return 'facebook';
  }

  /**
   * Scrape ads from Facebook Ads Library for a given page URL
   * Cost optimization: First try to get just the latest ad, if none found, get up to maxAds
   */
  private async scrapeAdsForUrl(
    pageUrl: string,
    maxAds: number,
    daysBack?: number
  ): Promise<ApifyAdItem[]> {
    // Step 1: Try to get just the latest ad (cost-efficient)
    console.log(`📡 Scraping latest ad for: ${pageUrl}`);

    let items = await this.runApifyActor(pageUrl, 1, daysBack);

    if (items.length > 0) {
      console.log(`✅ Found latest ad, returning 1 result`);
      return items;
    }

    // Step 2: No results with limit 1, try with higher limit
    console.log(`⚠️  No ads found with limit 1, retrying with limit ${maxAds}...`);

    items = await this.runApifyActor(pageUrl, maxAds, daysBack);

    console.log(`📦 Retrieved ${items.length} items from Apify`);
    return items;
  }

  /**
   * Run Apify Facebook Ads scraper actor
   */
  private async runApifyActor(
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

    const run = await this.apifyClient.actor(FACEBOOK_ACTOR_ID).call(input);
    const { items } = await this.apifyClient.dataset(run.defaultDatasetId).listItems();

    return items as unknown as ApifyAdItem[];
  }
}
