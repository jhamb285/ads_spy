/**
 * Google Ads Platform Client
 * Scrapes Google Ads Transparency Center using Apify
 * Uses public Ad Transparency Center (adstransparency.google.com) - similar to Facebook Ads Library
 */

import { ApifyClient } from 'apify-client';
import { PlatformClient, CompetitorInput, NormalizedAd } from '../types';
import { normalizeGoogleTransparencyAd, GoogleTransparencyAd } from './normalizer';

const GOOGLE_ADS_TRANSPARENCY_ACTOR = 'silva95gustavo/google-ads-scraper';

export class GoogleClient implements PlatformClient {
  constructor(private apifyClient: ApifyClient) {}

  async scrapeAdsForCompetitor(
    competitor: CompetitorInput,
    maxAds: number,
    daysBack?: number
  ): Promise<NormalizedAd[]> {
    console.log(`📡 [Google] Scraping ads for: ${competitor.name}`);

    // Validate adTransparencyUrl exists
    if (!competitor.adTransparencyUrl) {
      throw new Error(
        `Ad Transparency URL required for ${competitor.name}. ` +
        `Expected format: https://adstransparency.google.com/?region=US&domain=example.com`
      );
    }

    // Scrape directly from transparency center
    const transparencyAds = await this.scrapeAdsFromTransparency(
      competitor.adTransparencyUrl,
      maxAds
    );

    console.log(`📦 Found ${transparencyAds.length} ads from Transparency Center`);

    // Normalize to common format
    return transparencyAds.map(ad =>
      normalizeGoogleTransparencyAd(ad, competitor)
    );
  }

  getPlatformName(): 'facebook' | 'google' {
    return 'google';
  }

  /**
   * Scrape ads from Google Ads Transparency Center
   */
  private async scrapeAdsFromTransparency(
    adTransparencyUrl: string,
    maxAds: number
  ): Promise<GoogleTransparencyAd[]> {
    console.log(`📡 Scraping Google Ad Transparency: ${adTransparencyUrl}`);

    const input = {
      startUrls: [{ url: adTransparencyUrl }],  // IMPORTANT: Must be object with url property
      maxItems: maxAds,
      shouldDownloadAssets: false,
      shouldDownloadPreviews: false,
      ocr: false,
      skipDetails: false,
    };

    try {
      const run = await this.apifyClient
        .actor(GOOGLE_ADS_TRANSPARENCY_ACTOR)
        .call(input);

      const { items } = await this.apifyClient
        .dataset(run.defaultDatasetId)
        .listItems({ limit: maxAds });

      if (!items || items.length === 0) {
        console.log(`⚠️  No ads found at transparency URL`);
        return [];
      }

      console.log(`✅ Retrieved ${items.length} ads from transparency center`);
      return items as unknown as GoogleTransparencyAd[];

    } catch (error: any) {
      console.error(`❌ Error scraping transparency center:`, error.message);
      throw error;
    }
  }
}
