/**
 * Google Ads Normalizer
 * Converts Google Ads Transparency Center data to common NormalizedAd format
 */

import { NormalizedAd, CompetitorInput } from '../types';

// Legacy interface (kept for backward compatibility)
interface GoogleSearchResult {
  url: string;
  title: string;
  description: string;
  isAd: boolean;
  position: number;
  adExtensions?: string[];
}

// New interface for Google Ads Transparency Center data
// Matches actual output from silva95gustavo/google-ads-scraper Apify actor
export interface GoogleTransparencyAd {
  advertiserId: string;           // e.g., "AR12702210093945454593"
  advertiserName: string;         // e.g., "A-TEX PEST MANAGEMENT INC."
  creativeId: string;             // e.g., "CR09649426728124153857"
  format: 'TEXT' | 'IMAGE' | 'VIDEO';
  previewUrl?: string;
  adLibraryUrl?: string;          // Direct URL to the ad in transparency center
  firstShown?: string;            // ISO timestamp (e.g., "2025-12-01T14:37:59.993Z")
  lastShown?: string;             // ISO timestamp
  numServedDays?: number;         // Number of days ad was served
  regionStats: Array<{            // Geographic and date data
    regionCode: string;           // e.g., "US"
    regionName: string;           // e.g., "United States"
    lastShown: string;            // YYYY-MM-DD
  }>;
  variations: Array<{             // Format-specific creative data
    // For TEXT ads:
    headline?: string;
    body?: string;
    clickUrl?: string;
    address?: string;
    imageUrls?: string[];

    // For IMAGE/VIDEO ads:
    imageUrl?: string;
    videoUrl?: string;
    description?: string;
    logoUri?: string;
  }>;
}

/**
 * Normalize Google SERP ad to common NormalizedAd format
 * @deprecated Use normalizeGoogleTransparencyAd for Transparency Center data
 */
export function normalizeGoogleAd(
  googleAd: GoogleSearchResult,
  competitor: CompetitorInput
): NormalizedAd {
  // Generate unique ID (Google Search doesn't provide ad IDs)
  const id = `google-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Combine title + description as main text
  const text = `${googleAd.title}\n${googleAd.description}`;

  // Add extensions if available
  const fullText = googleAd.adExtensions && googleAd.adExtensions.length > 0
    ? `${text}\n\nExtensions: ${googleAd.adExtensions.join(', ')}`
    : text;

  // Generate a search URL for reference
  const searchQuery = encodeURIComponent(competitor.industry || competitor.name);
  const adUrl = `https://www.google.com/search?q=${searchQuery}`;

  return {
    id,
    pageName: competitor.name,
    avatar: '', // No avatar for Google Ads
    brandName: competitor.name,
    text: fullText,
    title: googleAd.title,
    linkUrl: googleAd.url,
    imageUrl: undefined, // Google Search ads are text-only
    videoUrl: undefined,
    imageDescription: undefined,
    videoTranscript: undefined,
    adUrl,
    startDate: new Date().toISOString(), // We don't know actual start date
    endDate: new Date().toISOString(),
    platform: 'google',
    raw: googleAd,
  };
}

/**
 * Normalize Google Ads Transparency Center ad to common NormalizedAd format
 */
export function normalizeGoogleTransparencyAd(
  ad: GoogleTransparencyAd,
  competitor: CompetitorInput
): NormalizedAd {
  // Use real ad ID from transparency center
  const id = `google-${ad.creativeId}`;

  // Extract dates - prefer top-level fields, fallback to regionStats
  let firstShown: string;
  let lastShown: string;

  if (ad.firstShown && ad.lastShown) {
    // Use top-level ISO timestamps, convert to YYYY-MM-DD
    firstShown = ad.firstShown.split('T')[0];
    lastShown = ad.lastShown.split('T')[0];
  } else {
    // Fallback to regionStats
    const regionDate = ad.regionStats?.[0]?.lastShown || new Date().toISOString().split('T')[0];
    firstShown = regionDate;
    lastShown = regionDate;
  }

  // Get first variation (primary creative)
  const primaryVariation = ad.variations?.[0] || {};

  // Extract text based on ad format
  let text = '';
  let title = '';
  let linkUrl: string | undefined;
  let imageUrl: string | undefined;
  let videoUrl: string | undefined;

  if (ad.format === 'TEXT') {
    // TEXT ads: extract from variations
    title = primaryVariation.headline || '';
    text = [primaryVariation.headline, primaryVariation.body]
      .filter(Boolean)
      .join('\n');
    linkUrl = primaryVariation.clickUrl;
    // TEXT ads can have images too (logo/icon)
    if (primaryVariation.imageUrls && primaryVariation.imageUrls.length > 0) {
      imageUrl = primaryVariation.imageUrls[0];
    }
  } else if (ad.format === 'IMAGE') {
    // IMAGE ads: extract from variations
    title = primaryVariation.headline || primaryVariation.description || '';
    text = primaryVariation.description || '';
    imageUrl = primaryVariation.imageUrl || ad.previewUrl;
    linkUrl = primaryVariation.clickUrl;
  } else if (ad.format === 'VIDEO') {
    // VIDEO ads: extract from variations
    title = primaryVariation.headline || primaryVariation.description || '';
    text = primaryVariation.description || '';
    videoUrl = primaryVariation.videoUrl || ad.previewUrl;
    linkUrl = primaryVariation.clickUrl;
  }

  // Use adLibraryUrl if available, otherwise build it
  const adUrl = ad.adLibraryUrl ||
    `https://adstransparency.google.com/advertiser/${ad.advertiserId}/creative/${ad.creativeId}`;

  return {
    id,
    pageName: ad.advertiserName,
    avatar: '',
    brandName: competitor.name,
    text,
    title,
    linkUrl,
    imageUrl,
    videoUrl,
    imageDescription: undefined,
    videoTranscript: undefined,
    adUrl,
    startDate: firstShown,
    endDate: lastShown,
    platform: 'google',
    raw: ad,
  };
}
