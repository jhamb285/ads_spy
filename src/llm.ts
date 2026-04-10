import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { NormalizedAd } from './normalize';

const OPENAI_MODEL = 'gpt-4o-mini';
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY is not set in environment');
    _openai = new OpenAI({ apiKey: key });
  }
  return _openai;
}

export interface AdAnalysis {
  whyItWorks: string;
  howToImprove: string[];
  rewrittenAd: string;
}

/**
 * Analyze an ad using LLM (Gemini)
 */
export async function analyzeAdWithLLM(
  _geminiClient: GoogleGenerativeAI,
  ad: NormalizedAd,
  offerDescription: string
): Promise<AdAnalysis> {
  const prompt = buildPrompt(ad, offerDescription);

  console.log(`🤖 Analyzing ad ${ad.id} with OpenAI ${OPENAI_MODEL}...`);

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a direct-response marketing expert. Always respond with valid JSON only, no markdown fences.' },
        { role: 'user', content: prompt }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    const analysis = JSON.parse(content) as AdAnalysis;
    if (!analysis.whyItWorks || !Array.isArray(analysis.howToImprove) || !analysis.rewrittenAd) {
      throw new Error('Invalid LLM response structure');
    }

    return analysis;
  } catch (error) {
    console.error(`❌ Error analyzing ad ${ad.id}:`, error);
    return {
      whyItWorks: 'Analysis failed - please review manually.',
      howToImprove: ['OpenAI call failed. Try again later.'],
      rewrittenAd: ad.text,
    };
  }
}

/**
 * Build the prompt for LLM analysis
 */
function buildPrompt(ad: NormalizedAd, offerDescription: string): string {
  return `You are a direct-response marketing expert.

Avatar: ${ad.avatar}
Brand: ${ad.brandName}

Here is the ad text:
"""
${ad.text}
"""

Our offer: ${offerDescription}

Please analyze this ad and provide:

1. In 1-2 sentences, explain why this ad works.
2. Suggest 2-3 specific ways to improve this ad.
3. Rewrite this ad for our offer. IMPORTANT: Keep the EXACT same structure, formatting, emojis, and wording. Only replace:
   - Brand/product names with our brand/product
   - URLs/links with our URLs
   - Keep everything else identical (bullet points, checkmarks, structure, tone, etc.)
   The original ad is already effective - we just want to adapt it to our brand, not rewrite it completely.

Respond in **valid JSON only** in this format:
{
  "whyItWorks": "...",
  "howToImprove": ["...", "..."],
  "rewrittenAd": "..."
}`;
}

/**
 * Create a Gemini client instance (replaces OpenAI)
 */
export function createGeminiClient(apiKey: string): GoogleGenerativeAI {
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Legacy alias for backwards compatibility
 */
export const createOpenAIClient = createGeminiClient;

/**
 * =====================================================================
 * COMPETITIVE GAP ANALYSIS (1-vs-5 Ad Dominance Engine)
 * =====================================================================
 */

/**
 * Gap analysis result from Gemini
 */
export interface CompetitiveGapAnalysis {
  whySubjectIsLosing: string;
  winningCreativeFormat: string;
  bestCompetitor: string;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    example: string;
    implementation: string;
  }>;
}

/**
 * Analyze competitive gaps and generate strategic recommendations
 * Uses Gemini to provide actionable insights based on competitor comparison
 */
export async function analyzeCompetitiveGaps(
  _geminiClient: GoogleGenerativeAI,
  competitivePrompt: string
): Promise<CompetitiveGapAnalysis> {
  console.log(`🤖 Analyzing competitive gaps with OpenAI ${OPENAI_MODEL}...`);

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are an Elite Media Buyer and competitive intelligence expert. Analyze competitor strategies and provide actionable recommendations. Always respond with valid JSON only, no markdown formatting.'
        },
        { role: 'user', content: competitivePrompt }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    const analysis = JSON.parse(content) as CompetitiveGapAnalysis;

    if (!analysis.whySubjectIsLosing || !analysis.recommendations || !Array.isArray(analysis.recommendations)) {
      throw new Error('Invalid competitive analysis response structure');
    }

    if (!analysis.winningCreativeFormat) {
      analysis.winningCreativeFormat = 'video';
    }
    if (!analysis.bestCompetitor) {
      analysis.bestCompetitor = 'Unknown';
    }

    console.log('✅ Competitive gap analysis complete');
    return analysis;
  } catch (error) {
    console.error('❌ Error analyzing competitive gaps:', error);

    // Return fallback analysis
    return {
      whySubjectIsLosing: 'Analysis failed - please review competitor ads manually.',
      winningCreativeFormat: 'video',
      bestCompetitor: 'Unable to determine',
      recommendations: [
        {
          priority: 'high',
          action: 'Review competitor ads manually',
          example: 'Manual analysis required',
          implementation: 'Conduct manual competitive audit'
        }
      ]
    };
  }
}

