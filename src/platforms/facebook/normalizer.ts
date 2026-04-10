/**
 * Facebook Ads Normalizer
 * Converts curious_coder/facebook-ads-library-scraper output to common NormalizedAd format
 *
 * The actor returns items in two possible shapes:
 *
 * Shape A (page scrape wrapper):
 *   { inputUrl, pageInfo, isResultComplete, results: [...ads], totalCount }
 *   Each ad inside results has: adArchiveID, snapshot { cards, body, videos, images, ... }, etc.
 *
 * Shape B (flat ad item — may appear in some versions):
 *   { adArchiveID, snapshot, pageName, startDateFormatted, ... }
 *
 * Shape C (error item):
 *   { url, error, errorDescription }
 */

import { NormalizedAd } from '../types';

// ─── Interfaces for the curious_coder actor output ───

interface AdSnapshot {
  pageId?: string;
  pageName?: string;
  pageProfileUri?: string;
  caption?: string;
  ctaText?: string;
  cards?: AdCard[];
  body?: { text?: string } | string;
  videos?: AdVideo[];
  images?: AdImage[];
  linkUrl?: string;
  title?: string;
}

interface AdCard {
  body?: string;
  caption?: string;
  linkDescription?: string | null;
  linkUrl?: string;
  title?: string;
  ctaText?: string;
  videoHdUrl?: string | null;
  videoSdUrl?: string | null;
  videoPreviewImageUrl?: string | null;
  originalImageUrl?: string | null;
  resizedImageUrl?: string | null;
}

interface AdVideo {
  videoHdUrl?: string;
  videoSdUrl?: string;
  videoPreviewImageUrl?: string;
}

interface AdImage {
  originalImageUrl?: string;
  resizedImageUrl?: string;
}

// Re-export for backward compatibility with imports in client.ts
export interface ApifyAdItem {
  adArchiveID?: string;
  adArchiveId?: string;
  pageID?: string;
  pageId?: string;
  pageName?: string;
  inputUrl?: string;
  startDateFormatted?: string;
  endDateFormatted?: string;
  isActive?: boolean;
  snapshot?: AdSnapshot;
  [key: string]: any;
}

// ─── Main normalizer function ───

/**
 * Normalize the raw output from curious_coder/facebook-ads-library-scraper.
 * Handles wrapper objects (with results[]) and flat ad items.
 */
export function normalizeCuriousCoderAds(
  rawItems: any[],
  brandNameOverride?: string
): NormalizedAd[] {
  // Step 1: Flatten — extract actual ads from wrapper objects
  const flatAds: any[] = [];

  for (const item of rawItems) {
    if (item.results && Array.isArray(item.results)) {
      // Shape A: wrapper with results array
      for (const ad of item.results) {
        flatAds.push(ad);
      }
    } else if (item.error) {
      // Shape C: error item
      console.warn(`⚠️  [Normalizer] Skipping error item: ${item.error} - ${item.errorDescription || ''}`);
    } else if (item.snapshot || item.adArchiveID || item.adArchiveId) {
      // Shape B: flat ad item
      flatAds.push(item);
    } else {
      // Unknown shape — log keys and skip
      console.warn(`⚠️  [Normalizer] Unknown item shape, keys: ${Object.keys(item).join(', ')}`);
    }
  }

  console.log(`📋 [Normalizer] Extracted ${flatAds.length} ads from ${rawItems.length} raw items`);

  // Step 2: Normalize each ad
  const seen = new Set<string>();
  const result: NormalizedAd[] = [];

  for (let i = 0; i < flatAds.length; i++) {
    const raw = flatAds[i];
    const ad = normalizeOneAd(raw, brandNameOverride);

    // Assign fallback ID if missing
    if (!ad.id) {
      ad.id = `fb-${i}-${Date.now()}`;
    }

    // Dedup
    if (seen.has(ad.id)) continue;
    seen.add(ad.id);
    result.push(ad);
  }

  return result;
}

// Keep old export name for any remaining imports
export const normalizeApifyAdsBatch = normalizeCuriousCoderAds;

// ─── Single ad normalizer ───

function normalizeOneAd(raw: any, brandNameOverride?: string): NormalizedAd {
  const snapshot: AdSnapshot = raw.snapshot ?? {};
  const card = snapshot.cards?.[0];

  // ID — try all known field names
  const id =
    raw.adArchiveId ||
    raw.adArchiveID ||
    raw.ad_archive_id ||
    raw.id ||
    raw.pageId ||
    raw.pageID ||
    undefined;

  // Text — from body, card body, or caption
  let bodyText = '';
  if (snapshot.body) {
    bodyText = typeof snapshot.body === 'string'
      ? snapshot.body
      : snapshot.body.text || '';
  }
  const text =
    bodyText.trim() ||
    card?.body?.trim() ||
    snapshot.caption?.trim() ||
    raw.body?.trim() ||
    raw.text?.trim() ||
    '';

  // Link
  const linkUrl = card?.linkUrl || snapshot.linkUrl || raw.linkUrl || undefined;

  // Image
  const firstImage = snapshot.images?.[0];
  const imageUrl =
    firstImage?.resizedImageUrl ||
    firstImage?.originalImageUrl ||
    card?.resizedImageUrl ||
    card?.originalImageUrl ||
    raw.imageUrl ||
    raw.image_url ||
    undefined;

  // Video
  const firstVideo = snapshot.videos?.[0];
  const videoUrl =
    firstVideo?.videoHdUrl ||
    firstVideo?.videoSdUrl ||
    card?.videoHdUrl ||
    card?.videoSdUrl ||
    raw.videoUrl ||
    raw.video_url ||
    undefined;

  // Title
  const title = card?.title || snapshot.title || raw.title || undefined;

  // Page name
  const pageName =
    snapshot.pageName ||
    raw.pageName ||
    raw.page_name ||
    brandNameOverride ||
    '';

  // Ad Library URL
  const archiveId = raw.adArchiveId || raw.adArchiveID || raw.ad_archive_id;
  const adUrl = archiveId
    ? `https://www.facebook.com/ads/library/?id=${archiveId}`
    : raw.inputUrl || undefined;

  // Dates
  const startDate =
    raw.startDateFormatted || raw.start_date || raw.startDate || '';
  const endDate =
    raw.endDateFormatted || raw.end_date || raw.endDate || '';

  return {
    id,
    pageName,
    avatar: '',
    brandName: brandNameOverride || pageName,
    text,
    title,
    linkUrl,
    imageUrl,
    videoUrl,
    adUrl,
    startDate,
    endDate,
    platform: 'facebook',
    raw,
  };
}
