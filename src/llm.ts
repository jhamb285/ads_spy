import { GoogleGenerativeAI } from '@google/generative-ai';
import { NormalizedAd } from './normalize';

export interface AdAnalysis {
  whyItWorks: string;
  howToImprove: string[];
  rewrittenAd: string;
}

/**
 * Analyze an ad using LLM (Gemini)
 */
export async function analyzeAdWithLLM(
  geminiClient: GoogleGenerativeAI,
  ad: NormalizedAd,
  offerDescription: string
): Promise<AdAnalysis> {
  const prompt = buildPrompt(ad, offerDescription);

  console.log(`🤖 Analyzing ad ${ad.id} with Gemini...`);

  try {
    // Use Gemini 2.5 Flash - FREE during preview, 2M token context
    const model = geminiClient.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent, structure-preserving rewrites
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    if (!content) {
      throw new Error('No response from Gemini');
    }

    // Extract JSON from response (handle markdown code blocks if present)
    let jsonContent = content.trim();
    // Remove markdown code blocks if present
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    // Parse JSON response
    const analysis = JSON.parse(jsonContent) as AdAnalysis;

    // Validate structure
    if (!analysis.whyItWorks || !Array.isArray(analysis.howToImprove) || !analysis.rewrittenAd) {
      throw new Error('Invalid LLM response structure');
    }

    return analysis;
  } catch (error) {
    console.error(`❌ Error analyzing ad ${ad.id}:`, error);

    // Check if it's a rate limit error
    const { handleRateLimitError } = await import('./rateLimitHandler');
    const rateLimitInfo = await handleRateLimitError(error, 'Gemini', 'gemini-2.0-flash');

    let errorMessage = 'Analysis failed - please review manually.';
    if (rateLimitInfo) {
      const resetTime = rateLimitInfo.reset_time
        ? new Date(rateLimitInfo.reset_time).toLocaleTimeString()
        : 'Unknown';
      errorMessage = `Gemini rate limit exceeded. Resets at ${resetTime}`;
    }

    // Return fallback analysis
    return {
      whyItWorks: errorMessage,
      howToImprove: ['Rate limit reached. Try again later.'],
      rewrittenAd: ad.text, // Return original as fallback
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
  geminiClient: GoogleGenerativeAI,
  competitivePrompt: string
): Promise<CompetitiveGapAnalysis> {
  console.log('🤖 Analyzing competitive gaps with Gemini...');

  try {
    const model = geminiClient.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.4,
      },
    });

    const systemPrompt = `You are an Elite Media Buyer and competitive intelligence expert. Analyze competitor strategies and provide actionable recommendations. Always respond with valid JSON only, no markdown formatting.

${competitivePrompt}`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const content = response.text();

    if (!content) {
      throw new Error('No response from Gemini');
    }

    // Extract JSON from response
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    // Parse JSON response
    const analysis = JSON.parse(jsonContent) as CompetitiveGapAnalysis;

    // Validate structure
    if (!analysis.whySubjectIsLosing || !analysis.recommendations || !Array.isArray(analysis.recommendations)) {
      throw new Error('Invalid competitive analysis response structure');
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

