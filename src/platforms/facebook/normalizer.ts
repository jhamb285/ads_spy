/**
 * Facebook Ads Normalizer
 * Converts Apify Facebook Ads Library data to common NormalizedAd format
 */

import { NormalizedAd } from '../types';

// Types matching the Apify response
export interface ApifyAdCard {
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

export interface ApifyAdVideo {
  videoHdUrl?: string;
  videoSdUrl?: string;
  videoPreviewImageUrl?: string;
  watermarkedVideoHdUrl?: string | null;
  watermarkedVideoSdUrl?: string | null;
}

export interface ApifyAdImage {
  originalImageUrl?: string;
  resizedImageUrl?: string;
}

export interface ApifyAdBody {
  text?: string;
}

export interface ApifyAdSnapshot {
  pageId: string;
  pageName: string;
  pageProfileUri: string;
  caption?: string;
  ctaText?: string;
  cards?: ApifyAdCard[];
  body?: ApifyAdBody;
  videos?: ApifyAdVideo[];
  images?: ApifyAdImage[];
  linkUrl?: string;
  title?: string;
}

export interface ApifyAdItem {
  inputUrl: string;
  pageID: string;
  adArchiveID?: string;
  adArchiveId: string;
  pageId: string;
  pageName: string;
  startDateFormatted: string;
  endDateFormatted: string;
  isActive: boolean;
  categories?: string[];
  snapshot: ApifyAdSnapshot;
}

/**
 * Pick the "main" card from snapshot.cards
 */
function getPrimaryCard(snapshot: ApifyAdSnapshot): ApifyAdCard | undefined {
  if (!snapshot.cards || snapshot.cards.length === 0) return undefined;
  return snapshot.cards[0];
}

/**
 * Convert one Apify item into NormalizedAd format
 */
export function normalizeApifyAd(
  apifyItem: ApifyAdItem,
  avatar: string,
  brandNameOverride?: string
): NormalizedAd {
  const snapshot = apifyItem.snapshot;
  const card = getPrimaryCard(snapshot);

  const id = apifyItem.adArchiveId || apifyItem.adArchiveID || apifyItem.pageId;

  // Get text from body.text, card.body, or caption
  const text =
    snapshot.body?.text?.trim() ||
    card?.body?.trim() ||
    snapshot.caption?.trim() ||
    '';

  const linkUrl =
    card?.linkUrl ||
    snapshot.linkUrl ||
    undefined;

  // Get image from images array, cards, or fallback
  const firstImage = snapshot.images?.[0];
  const imageUrl =
    firstImage?.resizedImageUrl ||
    firstImage?.originalImageUrl ||
    card?.resizedImageUrl ||
    card?.originalImageUrl ||
    undefined;

  // Get video from videos array or cards
  const firstVideo = snapshot.videos?.[0];
  const videoUrl =
    firstVideo?.videoHdUrl ||
    firstVideo?.videoSdUrl ||
    card?.videoHdUrl ||
    card?.videoSdUrl ||
    undefined;

  const title =
    card?.title ||
    snapshot.title ||
    undefined;

  // Construct Facebook Ad Library URL from adArchiveId
  const adUrl = apifyItem.adArchiveId || apifyItem.adArchiveID
    ? `https://www.facebook.com/ads/library/?id=${apifyItem.adArchiveId || apifyItem.adArchiveID}`
    : apifyItem.inputUrl || undefined;

  return {
    id,
    pageName: snapshot.pageName || apifyItem.pageName,
    avatar,
    brandName: brandNameOverride || snapshot.pageName || apifyItem.pageName,
    text,
    title,
    linkUrl,
    imageUrl,
    videoUrl,
    adUrl,
    startDate: apifyItem.startDateFormatted,
    endDate: apifyItem.endDateFormatted,
    platform: 'facebook',
    raw: apifyItem,
  };
}

/**
 * Normalize a batch of Apify items
 * Dedups by id
 */
export function normalizeApifyAdsBatch(
  items: ApifyAdItem[],
  avatar: string,
  brandNameOverride?: string
): NormalizedAd[] {
  const seen = new Set<string>();
  const result: NormalizedAd[] = [];

  for (const item of items) {
    const ad = normalizeApifyAd(item, avatar, brandNameOverride);
    if (!ad.id || seen.has(ad.id)) continue;
    seen.add(ad.id);
    result.push(ad);
  }

  return result;
}
