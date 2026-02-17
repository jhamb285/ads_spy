import { GoogleGenerativeAI } from '@google/generative-ai';
import { NormalizedAd } from './normalize';

/**
 * Gemini analysis result structure
 */
export interface GeminiAnalysis {
  creativeBreakdown: string;
  hookAnalysis: string;
  angleIdentification: string;
  structureExplanation: string;
}

/**
 * Create a Gemini API client
 */
export function createGeminiClient(apiKey: string): GoogleGenerativeAI {
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Analyze an ad using Gemini API for competitor ad intelligence
 *
 * This provides the initial breakdown before OpenAI does detailed analysis
 */
export async function analyzeAdWithGemini(
  geminiClient: GoogleGenerativeAI,
  ad: NormalizedAd
): Promise<GeminiAnalysis> {
  console.log(`🔮 Analyzing ad ${ad.id} with Gemini...`);

  try {
    // Updated to Gemini 2.5 Flash (January 2026) - FREE during preview
    // 2M token context, faster, more accurate than 1.5
    const model = geminiClient.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build the prompt
    const prompt = buildGeminiPrompt(ad);

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response
    const analysis = parseGeminiResponse(text);

    console.log(`✅ Gemini analysis completed for ad ${ad.id}`);
    return analysis;
  } catch (error) {
    console.error(`❌ Error analyzing ad ${ad.id} with Gemini:`, error);

    // Check if it's a rate limit error
    const { handleRateLimitError } = await import('./rateLimitHandler');
    const rateLimitInfo = await handleRateLimitError(error, 'Gemini', 'gemini-1.5-pro');

    let errorMessage = 'Gemini analysis failed';
    if (rateLimitInfo) {
      const resetTime = rateLimitInfo.reset_time
        ? new Date(rateLimitInfo.reset_time).toLocaleTimeString()
        : 'Unknown';
      errorMessage = `Rate limit exceeded. Resets at ${resetTime}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Return empty analysis on error (don't block the pipeline)
    return {
      creativeBreakdown: `[${errorMessage}]`,
      hookAnalysis: 'N/A',
      angleIdentification: 'N/A',
      structureExplanation: 'N/A'
    };
  }
}

/**
 * Build the Gemini prompt for ad analysis
 */
function buildGeminiPrompt(ad: NormalizedAd): string {
  let prompt = `You are an expert in analyzing Facebook ads for competitor intelligence. Analyze this ad and provide insights.

**Ad Details:**
- Brand: ${ad.brandName}
- Page: ${ad.pageName}`;

  if (ad.adUrl) {
    prompt += `\n- Facebook Ad URL: ${ad.adUrl}`;
  }

  if (ad.linkUrl) {
    prompt += `\n- Landing Page: ${ad.linkUrl}`;
  }

  prompt += `\n- Active: ${ad.raw.isActive ? 'Yes' : 'No'}`;
  prompt += `\n- Start Date: ${ad.startDate}`;
  prompt += `\n- End Date: ${ad.endDate}`;

  if (ad.title) {
    prompt += `\n\n**Ad Title:**\n${ad.title}`;
  }

  prompt += `\n\n**Ad Body Text:**\n${ad.text}`;

  if (ad.imageDescription) {
    prompt += `\n\n**Image Description (AI-generated):**\n${ad.imageDescription}`;
  }

  if (ad.videoTranscript) {
    const truncatedTranscript = ad.videoTranscript.length > 1000
      ? ad.videoTranscript.substring(0, 1000) + '...'
      : ad.videoTranscript;
    prompt += `\n\n**Video Transcript:**\n${truncatedTranscript}`;
  }

  prompt += `\n\n**Please provide:**

1. **Creative Breakdown**: A comprehensive breakdown of the creative elements (imagery, colors, layout, design choices, visual hierarchy). Describe what makes this ad visually compelling.

2. **Hook Analysis**: Identify the hook used in the first few seconds/lines. What grabs attention? Is it a question, bold claim, pattern interrupt, or emotional trigger?

3. **Angle Identification**: What's the main marketing angle? Is it pain-point focused, benefit-driven, mechanism-based, social proof, urgency, or something else? Who is the target audience?

4. **Structure Explanation**: Analyze the ad structure/flow. Does it follow Problem-Agitate-Solution (PAS), Before-After-Bridge (BAB), or another framework? How does it guide the reader from attention to action?

**Format your response as JSON:**
{
  "creativeBreakdown": "...",
  "hookAnalysis": "...",
  "angleIdentification": "...",
  "structureExplanation": "..."
}`;

  return prompt;
}

/**
 * Parse Gemini response into structured analysis
 */
function parseGeminiResponse(text: string): GeminiAnalysis {
  try {
    // Try to parse as JSON first
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        creativeBreakdown: parsed.creativeBreakdown || 'N/A',
        hookAnalysis: parsed.hookAnalysis || 'N/A',
        angleIdentification: parsed.angleIdentification || 'N/A',
        structureExplanation: parsed.structureExplanation || 'N/A'
      };
    }

    // Fallback: parse sections manually
    const sections = {
      creativeBreakdown: extractSection(text, ['creative breakdown', '1.', 'creative elements']),
      hookAnalysis: extractSection(text, ['hook analysis', '2.', 'hook']),
      angleIdentification: extractSection(text, ['angle identification', '3.', 'angle', 'marketing angle']),
      structureExplanation: extractSection(text, ['structure explanation', '4.', 'structure', 'ad structure'])
    };

    return sections;
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    // Return the full text as creative breakdown
    return {
      creativeBreakdown: text,
      hookAnalysis: 'See creative breakdown',
      angleIdentification: 'See creative breakdown',
      structureExplanation: 'See creative breakdown'
    };
  }
}

/**
 * Extract a section from text based on keywords
 */
function extractSection(text: string, keywords: string[]): string {
  const lowerText = text.toLowerCase();

  for (const keyword of keywords) {
    const index = lowerText.indexOf(keyword);
    if (index !== -1) {
      // Find the end of this section (next heading or end of text)
      const nextHeadingIndex = findNextHeading(text, index + keyword.length);
      const section = text.substring(index + keyword.length, nextHeadingIndex);
      return section.trim().replace(/^[:\-\s]+/, '');
    }
  }

  return 'N/A';
}

/**
 * Find the next heading in text (line starting with number, asterisk, or all caps)
 */
function findNextHeading(text: string, startIndex: number): number {
  const remaining = text.substring(startIndex);
  const headingPattern = /\n\s*(\d+\.|\*\*|[A-Z\s]{10,}:)/;
  const match = remaining.match(headingPattern);

  if (match && match.index !== undefined) {
    return startIndex + match.index;
  }

  return text.length;
}
