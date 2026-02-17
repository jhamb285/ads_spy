/**
 * CLAUDE FALLBACK - OPTIONAL
 * To enable: npm install @anthropic-ai/sdk
 * Then uncomment imports and implementation below
 */

import { NormalizedAd } from './normalize';
import { AdAnalysis } from './llm';

// Placeholder type until @anthropic-ai/sdk is installed
interface ClaudeClient {
  messages: {
    create: (params: any) => Promise<any>;
  };
}

/**
 * Create a Claude API client
 * OPTIONAL: Only used if CLAUDE_API_KEY is set (fallback for OpenAI)
 */
export function createClaudeClient(apiKey: string): ClaudeClient {
  throw new Error('Claude SDK not installed. Run: npm install @anthropic-ai/sdk');
  // After installing, replace with:
  // import Anthropic from '@anthropic-ai/sdk';
  // return new Anthropic({ apiKey });
}

/**
 * Analyze an ad using Claude (Haiku 4.5)
 * OPTIONAL: Use as fallback if OpenAI fails
 * Pricing: $1/1M input, $5/1M output (cheapest Claude model)
 */
export async function analyzeAdWithClaude(
  claudeClient: ClaudeClient,
  ad: NormalizedAd,
  offerDescription: string
): Promise<AdAnalysis> {
  console.log(`🤖 Analyzing ad ${ad.id} with Claude (fallback)...`);

  try {
    const prompt = buildPrompt(ad, offerDescription);

    const message = await claudeClient.messages.create({
      model: 'claude-4-5-haiku', // Latest Haiku (January 2026)
      max_tokens: 2048,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse JSON response
    let jsonContent = content.text.trim();
    // Remove markdown code blocks if present
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const analysis = JSON.parse(jsonContent) as AdAnalysis;

    // Validate structure
    if (!analysis.whyItWorks || !Array.isArray(analysis.howToImprove) || !analysis.rewrittenAd) {
      throw new Error('Invalid Claude response structure');
    }

    console.log(`✅ Claude analysis completed for ad ${ad.id}`);
    return analysis;
  } catch (error) {
    console.error(`❌ Error analyzing ad ${ad.id} with Claude:`, error);
    // Return fallback analysis
    return {
      whyItWorks: 'Claude analysis failed - please review manually.',
      howToImprove: ['Review the ad structure', 'Check targeting and messaging'],
      rewrittenAd: ad.text, // Return original as fallback
    };
  }
}

/**
 * Build the prompt for Claude analysis (same as OpenAI)
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
