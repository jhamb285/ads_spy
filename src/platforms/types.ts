/**
 * Platform Abstraction Layer - Shared Types
 * Supports multiple advertising platforms (Facebook, Google, future platforms)
 */

// Platform-specific normalized ad structure
export interface NormalizedAd {
  id: string;
  pageName: string;
  avatar: string;
  brandName: string;
  text: string;
  title?: string;
  linkUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  imageDescription?: string;
  videoTranscript?: string;
  adUrl?: string;
  startDate: string;
  endDate: string;
  platform: 'facebook' | 'google';
  raw: any;
}

// Input for competitor scraping
export interface CompetitorInput {
  name: string;
  domain: string;  // Can be Facebook URL or website URL
  isSubject: boolean;
  industry?: string;  // Optional (kept for backward compatibility)
  adTransparencyUrl?: string;  // Required for Google Ads Transparency Center scraping
}

// Platform client interface that all platforms must implement
export interface PlatformClient {
  /**
   * Scrape ads for a competitor
   * @param competitor - Competitor information
   * @param maxAds - Maximum number of ads to scrape
   * @param daysBack - Optional: scrape ads from the last N days
   * @returns Array of normalized ads
   */
  scrapeAdsForCompetitor(
    competitor: CompetitorInput,
    maxAds: number,
    daysBack?: number
  ): Promise<NormalizedAd[]>;

  /**
   * Get the platform name
   * @returns Platform identifier ('facebook' | 'google')
   */
  getPlatformName(): 'facebook' | 'google';
}
