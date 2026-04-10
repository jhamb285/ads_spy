/**
 * Platform Factory
 * Creates appropriate platform client based on platform type
 */

import { PlatformClient } from './types';
import { FacebookClient } from './facebook/client';
import { GoogleClient } from './google/client';
import { ApifyClient } from 'apify-client';

export class PlatformFactory {
  /**
   * Create a platform client based on platform type
   * @param platform - Platform identifier ('facebook' | 'google')
   * @param apifyClient - Apify client instance for scraping
   * @returns Platform-specific client implementing PlatformClient interface
   */
  static createClient(
    platform: 'facebook' | 'google',
    apifyClient: ApifyClient
  ): PlatformClient {
    switch (platform) {
      case 'facebook':
        return new FacebookClient(apifyClient);
      case 'google':
        return new GoogleClient(apifyClient);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Auto-detect platform from domain URL
   * @param domain - Domain or URL (e.g., "facebook.com/nike" or "nike.com")
   * @returns Detected platform ('facebook' | 'google')
   */
  static detectPlatform(domain: string): 'facebook' | 'google' {
    if (domain.includes('facebook.com') || domain.includes('fb.com')) {
      return 'facebook';
    }
    // Any other domain is treated as website → Google Ads
    return 'google';
  }
}
