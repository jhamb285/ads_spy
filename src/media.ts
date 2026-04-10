import { GoogleGenerativeAI } from '@google/generative-ai';
import { NormalizedAd } from './normalize';

/**
 * Media processing functions
 *
 * NOTE: Media analysis (image/video) is not required for competitive analysis API
 * These functions return placeholders and can be implemented later if needed
 */

/**
 * Analyze an image - PLACEHOLDER (not needed for competitive analysis)
 */
export async function analyzeImage(
  geminiClient: GoogleGenerativeAI,
  imageUrl: string
): Promise<string> {
  console.log(`🖼️  [SKIPPED] Image analysis: ${imageUrl.substring(0, 60)}...`);
  return '[Image analysis not implemented]';
}

/**
 * Transcribe a video - PLACEHOLDER (not needed for competitive analysis)
 */
export async function transcribeVideo(
  geminiClient: GoogleGenerativeAI,
  videoUrl: string
): Promise<string> {
  console.log(`🎥  [SKIPPED] Video transcription: ${videoUrl.substring(0, 60)}...`);
  return '[Video transcription not implemented]';
}

/**
 * Process ad media (image + video) - PLACEHOLDER
 */
export async function processAdMedia(
  geminiClient: GoogleGenerativeAI,
  ad: NormalizedAd
): Promise<{
  imageDescription?: string;
  videoTranscript?: string;
}> {
  console.log(`📹  [SKIPPED] Media processing for ad ${ad.id}`);

  // Return empty object - media processing not needed for competitive analysis
  return {};
}
