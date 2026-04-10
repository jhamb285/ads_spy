/**
 * Competitive Analysis Comparator Module
 * 1-vs-5 Ad Dominance Engine
 *
 * Performs full per-ad analysis across 11 dimensions:
 * hook, headline, CTA, offer, pain point, audience signals,
 * tone, image content, ad length, trust signals, USP
 */

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

// ─── Input types ─────────────────────────────────────────────────────────────

export interface CompetitorEntity {
  name: string;
  domain: string;
  isSubject: boolean;
}

export interface CompetitorSetInput {
  competitors: CompetitorEntity[];
}

// ─── Per-ad analysis ──────────────────────────────────────────────────────────

export interface AdAnalysis {
  hookType: string;             // Primary attention-grabbing mechanism
  headline: string;             // Core value proposition (1 sentence)
  cta: string;                  // Call-to-action type (e.g. "Free Quote", "Call Now")
  offer: string | null;         // Specific offer/discount/guarantee (null if none)
  painPoint: string | null;     // Problem being addressed (null if none)
  audienceSignals: string[];    // Who the ad targets
  tone: string;                 // Professional | Urgent | Friendly | Fear-based | Inspirational | Educational
  adLength: 'short' | 'medium' | 'long'; // <80 chars | 80-250 | >250
  trustSignals: string[];       // Years in business, reviews, certifications, guarantees
  uniqueSellingPoint: string | null; // What differentiates this brand
}

// ─── Brand-level aggregates ───────────────────────────────────────────────────

export interface HookDistribution {
  [hookCategory: string]: number;
}

export interface FormatDistribution {
  video: number;
  image: number;
  ugc_video: number;
  carousel: number;
}

export interface BrandAnalysis {
  name: string;
  ad_count: number;
  hook_distribution: HookDistribution;
  format_distribution: FormatDistribution;
  cta_distribution: { [cta: string]: number };
  tone_distribution: { [tone: string]: number };
  offers_used: string[];
  trust_signals_used: string[];
  pain_points_addressed: string[];
  ad_length_distribution: { short: number; medium: number; long: number };
  usps: string[];
}

// ─── Gap + result types ───────────────────────────────────────────────────────

export interface GapAnalysis {
  missing_hooks: string[];
  underutilized_formats: string[];
  winning_competitors: string[];
  missing_ctas: string[];
  missing_trust_signals: string[];
  competitor_offers: string[];
  tone_gaps: string[];
}

export interface MarketInsights {
  dominant_hook_type: string;
  dominant_format: string;
  dominant_tone: string;
  average_competitor_ad_count: number;
  most_common_cta: string;
  most_common_trust_signal: string;
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  action: string;
  example: string;
  implementation: string;
}

export interface CompetitiveAnalysisResult {
  analysis_id: string | null;
  status: 'ok' | 'no_ads_found';
  message?: string;
  subject_brand_name?: string;
  subject: BrandAnalysis | null;
  competitors: BrandAnalysis[];
  gaps: GapAnalysis | null;
  recommendations: Recommendation[];
  market_insights: MarketInsights | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const HOOK_CATEGORIES = [
  'Discount/Urgency',
  'Social Proof',
  'Fear of Loss',
  'Problem-Agitate',
  'Curiosity Gap',
  'Authority',
  'Transformation',
  'Educational',
  'Other'
];

const TONE_CATEGORIES = ['Professional', 'Urgent', 'Friendly', 'Fear-based', 'Inspirational', 'Educational'];

// ─── Full ad analysis via Gemini ──────────────────────────────────────────────

/**
 * Analyze all ads across 11 dimensions using Gemini.
 * Replaces the old categorizeHooks() — processes in batches of 8.
 */
export async function analyzeAds(
  _geminiClient: GoogleGenerativeAI,
  ads: NormalizedAd[]
): Promise<Map<string, AdAnalysis>> {
  console.log(`🔮 Running full ad analysis for ${ads.length} ads (11 dimensions) via OpenAI ${OPENAI_MODEL}...`);

  const openai = getOpenAI();
  const analysisMap = new Map<string, AdAnalysis>();
  const batchSize = 8;

  for (let i = 0; i < ads.length; i += batchSize) {
    const batch = ads.slice(i, i + batchSize);
    console.log(`   Analyzing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(ads.length / batchSize)}`);

    let success = false;
    for (let attempt = 0; attempt < 3 && !success; attempt++) {
      try {
        const prompt = buildAdAnalysisPrompt(batch);
        const completion = await openai.chat.completions.create({
          model: OPENAI_MODEL,
          temperature: 0.3,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'You are an expert media buyer. Always respond with a single valid JSON object containing an "ads" array. No markdown, no extra text.' },
            { role: 'user', content: prompt + '\n\nReturn a JSON object with shape: { "ads": [ ...array from above... ] }' }
          ]
        });
        const text = completion.choices[0]?.message?.content || '';
        const analyses = parseAdAnalysisResponse(text, batch);

        for (const { adId, analysis } of analyses) {
          analysisMap.set(adId, analysis);
        }
        success = true;
      } catch (error: any) {
        const status = error?.status || error?.response?.status;
        const isRateLimit = status === 429;
        if (isRateLimit && attempt < 2) {
          const waitSec = (attempt + 1) * 10;
          console.warn(`⚠️  OpenAI rate limit hit, retrying in ${waitSec}s (attempt ${attempt + 1}/3)...`);
          await new Promise(resolve => setTimeout(resolve, waitSec * 1000));
        } else {
          console.error(`❌ Error analyzing batch (attempt ${attempt + 1}/3):`, error?.message || error);
          for (const ad of batch) {
            if (!analysisMap.has(ad.id)) {
              analysisMap.set(ad.id, fallbackAnalysis(ad));
            }
          }
          break;
        }
      }
    }

    if (i + batchSize < ads.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`✅ Full ad analysis complete: ${analysisMap.size} ads analyzed`);
  return analysisMap;
}

function fallbackAnalysis(ad: NormalizedAd): AdAnalysis {
  const len = (ad.text || '').length;
  return {
    hookType: 'Other',
    headline: ad.title || ad.text?.substring(0, 60) || '',
    cta: 'Other',
    offer: null,
    painPoint: null,
    audienceSignals: [],
    tone: 'Professional',
    adLength: len < 80 ? 'short' : len < 250 ? 'medium' : 'long',
    trustSignals: [],
    uniqueSellingPoint: null
  };
}

function buildAdAnalysisPrompt(ads: NormalizedAd[]): string {
  let prompt = `You are an expert media buyer analyzing ${ads.length} ads across 11 dimensions.

CRITICAL: You MUST return exactly ${ads.length} items in the "ads" array — one for every ad below — and EVERY item MUST include an "index" field matching the [Ad N] label. Do not skip any ad, even if the text is short or generic.

For each ad, extract:
1. hookType — pick the BEST match from these 9 categories. Never return "Other" unless genuinely none fit:
   - Discount/Urgency: price drops, limited time, sales, "only today", "last chance"
   - Social Proof: reviews, ratings, testimonials, "#1 choice", "trusted by millions", celebrity/athlete endorsements
   - Fear of Loss: scarcity, missing out, "don't miss", limited stock, exclusive access
   - Problem-Agitate: calls out a pain point, frustration, or struggle the customer faces
   - Curiosity Gap: intriguing question, surprising fact, "the secret to...", tease without revealing
   - Authority: expertise, certifications, "made by experts", heritage, "since 1972", pro athletes
   - Transformation: before/after, "change your life", results-focused, aspirational outcomes
   - Educational: tips, how-to, guides, informative content
   - Aspirational/Lifestyle: brand imagery, mood, lifestyle without a clear sell — MAP THIS TO "Transformation" if nothing else fits
   For BRAND AWARENESS ads (Nike "Just Do It", Adidas "Impossible is Nothing"): pick Transformation or Authority, NOT Other.

2. headline — core value proposition in 1 sentence (max 15 words)
3. cta — call-to-action type. Examples: "Shop Now", "Learn More", "Sign Up", "Download App", "Free Quote", "Call Now", "Book Online", "Get Started", "Other"
4. offer — specific offer/discount/guarantee mentioned (e.g. "20% off", "free shipping", "30-day returns"), or null
5. painPoint — the problem being solved, or null
6. audienceSignals — array of strings describing who this targets (e.g. ["runners", "athletes", "gym-goers"])
7. tone — one of: ${TONE_CATEGORIES.join(' | ')}
8. adLength — "short" (<80 chars), "medium" (80-250 chars), or "long" (>250 chars)
9. trustSignals — array of trust indicators (e.g. ["free returns", "official partner", "5-star rated", "award winning"]), empty array if none
10. uniqueSellingPoint — what makes this brand different (e.g. "only sneaker with Air tech"), or null

**Ads to Analyze:**

`;

  ads.forEach((ad, index) => {
    const text = (ad.text || '').substring(0, 400);
    const title = ad.title ? `Title: ${ad.title}\n` : '';
    const imgNote = ad.imageUrl ? `[Has image]\n` : '';
    const imgDesc = (ad as any).imageDescription ? `Image description: ${(ad as any).imageDescription}\n` : '';
    prompt += `[Ad ${index}]
Brand: ${ad.brandName}
${title}${imgNote}${imgDesc}Ad text: ${text}${(ad.text || '').length > 400 ? '...' : ''}

`;
  });

  prompt += `
Return a JSON object with this EXACT shape (one item per ad, with the "index" field set to the [Ad N] number):
{
  "ads": [
    {
      "index": 0,
      "hookType": "Social Proof",
      "headline": "...",
      "cta": "Shop Now",
      "offer": "20% off",
      "painPoint": null,
      "audienceSignals": ["athletes", "runners"],
      "tone": "Inspirational",
      "adLength": "short",
      "trustSignals": ["official partner"],
      "uniqueSellingPoint": "Air cushion technology"
    }
  ]
}

Return exactly ${ads.length} items. No markdown fences. No commentary.`;

  return prompt;
}

function parseAdAnalysisResponse(
  text: string,
  ads: NormalizedAd[]
): { adId: string; analysis: AdAnalysis }[] {
  try {
    const stripped = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();

    // Support both shapes: top-level array OR object with "ads" array
    let parsed: any;
    try {
      parsed = JSON.parse(stripped);
    } catch {
      const arrayMatch = stripped.match(/\[[\s\S]*\]/);
      if (!arrayMatch) throw new Error('No JSON array found in response');
      parsed = JSON.parse(arrayMatch[0]);
    }

    let items: any[] = [];
    if (Array.isArray(parsed)) {
      items = parsed;
    } else if (parsed && Array.isArray(parsed.ads)) {
      items = parsed.ads;
    } else if (parsed && typeof parsed === 'object') {
      // Some responses nest the array under a different key — find the first array value
      const firstArrayVal = Object.values(parsed).find(v => Array.isArray(v));
      if (firstArrayVal) items = firstArrayVal as any[];
    }

    if (items.length === 0) {
      throw new Error('No ad items found in LLM response');
    }

    console.log(`   📥 Parsed ${items.length} ad analyses from LLM response (batch had ${ads.length} ads)`);

    const results: { adId: string; analysis: AdAnalysis }[] = [];
    const usedIndices = new Set<number>();

    items.forEach((item, arrayPos) => {
      // Accept item.index if present and valid, else fall back to array position
      let idx: number;
      if (typeof item.index === 'number' && ads[item.index]) {
        idx = item.index;
      } else if (arrayPos < ads.length) {
        idx = arrayPos;
      } else {
        console.warn(`   ⚠️  Skipping LLM item at position ${arrayPos} — no matching ad`);
        return;
      }

      if (usedIndices.has(idx)) {
        // Already mapped this ad — skip duplicate
        return;
      }
      usedIndices.add(idx);

      const ad = ads[idx];
      const rawLen = (ad.text || '').length;
      const computedAdLength: AdAnalysis['adLength'] = rawLen < 80 ? 'short' : rawLen < 250 ? 'medium' : 'long';

      // Normalize hookType — match loosely against known categories
      const rawHook = (item.hookType || item.hook || '').toString().trim();
      const matchedHook = HOOK_CATEGORIES.find(
        c => c.toLowerCase() === rawHook.toLowerCase()
      ) || HOOK_CATEGORIES.find(
        c => rawHook.toLowerCase().includes(c.toLowerCase().split('/')[0])
      ) || (rawHook ? rawHook : 'Other');

      results.push({
        adId: ad.id,
        analysis: {
          hookType: matchedHook,
          headline: item.headline || '',
          cta: item.cta || 'Other',
          offer: item.offer || null,
          painPoint: item.painPoint || null,
          audienceSignals: Array.isArray(item.audienceSignals) ? item.audienceSignals : [],
          tone: TONE_CATEGORIES.includes(item.tone) ? item.tone : 'Professional',
          adLength: ['short', 'medium', 'long'].includes(item.adLength) ? item.adLength : computedAdLength,
          trustSignals: Array.isArray(item.trustSignals) ? item.trustSignals : [],
          uniqueSellingPoint: item.uniqueSellingPoint || null
        }
      });
    });

    console.log(`   ✅ Mapped ${results.length}/${ads.length} ads successfully`);
    return results;
  } catch (error) {
    console.error('❌ Error parsing ad analysis response:', error);
    console.error('   Raw LLM response (first 500 chars):', text.substring(0, 500));
    return ads.map(ad => ({ adId: ad.id, analysis: fallbackAnalysis(ad) }));
  }
}

// ─── Format detection ─────────────────────────────────────────────────────────

export function detectCreativeFormat(ad: NormalizedAd): string {
  if (ad.videoUrl) return 'video';
  return 'image';
}

// ─── Gap identification ───────────────────────────────────────────────────────

export function identifyHookGaps(
  subjectHooks: HookDistribution,
  competitorHooks: HookDistribution[]
): string[] {
  // Count how many competitors use each hook, ignoring "Other"
  const usageCount: { [hook: string]: number } = {};
  for (const compHooks of competitorHooks) {
    for (const hook of Object.keys(compHooks)) {
      if (hook === 'Other') continue;
      if (compHooks[hook] > 0) usageCount[hook] = (usageCount[hook] || 0) + 1;
    }
  }

  // Minimum competitors required to flag a hook as a gap.
  // With few competitors (<=2), any 1 using it counts. With 3+, require at least 2.
  const threshold = competitorHooks.length <= 2 ? 1 : 2;

  // A hook is a gap if: (a) enough competitors use it, AND
  // (b) the subject either doesn't use it at all, OR uses it far less than competitors
  const gaps = Object.entries(usageCount)
    .filter(([hook, count]) => {
      if (count < threshold) return false;
      const subjectUse = subjectHooks[hook] || 0;
      // If subject has zero of this hook → gap
      if (subjectUse === 0) return true;
      // If subject has 1 but multiple competitors use it → still a relative gap
      const competitorAvg = count / competitorHooks.length;
      return subjectUse < competitorAvg;
    })
    .sort(([, a], [, b]) => b - a) // Most-used competitor hooks first
    .map(([hook]) => hook);

  return gaps;
}

export function identifyFormatGaps(
  subjectFormats: FormatDistribution,
  competitorFormats: FormatDistribution[]
): string[] {
  const gaps: string[] = [];
  const totalSubject = Object.values(subjectFormats).reduce((a, b) => a + b, 0);
  const avg: FormatDistribution = { video: 0, image: 0, ugc_video: 0, carousel: 0 };

  for (const cf of competitorFormats) {
    const total = Object.values(cf).reduce((a, b) => a + b, 0);
    if (total > 0) {
      avg.video += cf.video / total;
      avg.image += cf.image / total;
      avg.ugc_video += cf.ugc_video / total;
      avg.carousel += cf.carousel / total;
    }
  }

  if (competitorFormats.length > 0) {
    (Object.keys(avg) as (keyof FormatDistribution)[]).forEach(f => {
      avg[f] /= competitorFormats.length;
    });
  }

  // A format is a gap if competitors use it meaningfully (>=15%) AND
  // subject uses it noticeably less (<70% of competitor average).
  for (const [format, avgUse] of Object.entries(avg)) {
    const subjectUse = totalSubject > 0
      ? subjectFormats[format as keyof FormatDistribution] / totalSubject : 0;
    if (avgUse >= 0.15 && subjectUse < avgUse * 0.7) gaps.push(format);
  }

  return gaps;
}

function identifyStringGaps(
  subjectItems: string[],
  competitorItems: string[][]
): string[] {
  const normalized = (s: string) => s.toLowerCase().trim();
  const subjectSet = new Set(subjectItems.map(normalized));
  const usageCount: { [item: string]: number } = {};

  for (const items of competitorItems) {
    const seen = new Set<string>();
    for (const item of items) {
      const key = normalized(item);
      if (!seen.has(key)) {
        usageCount[key] = (usageCount[key] || 0) + 1;
        seen.add(key);
      }
    }
  }

  return Object.entries(usageCount)
    .filter(([item, count]) => count >= 2 && !subjectSet.has(item))
    .map(([item]) => item);
}

// ─── Core analysis functions ──────────────────────────────────────────────────

export function performCompetitiveAnalysis(
  subjectAds: NormalizedAd[],
  competitorGroups: { brandName: string; ads: NormalizedAd[] }[],
  adAnalyses: Map<string, AdAnalysis>
): {
  subject: BrandAnalysis;
  competitors: BrandAnalysis[];
  gaps: GapAnalysis;
  market_insights: MarketInsights;
} {
  console.log('📊 Performing competitive analysis...');

  const subject = buildBrandAnalysis(
    subjectAds[0]?.brandName || 'Subject', subjectAds, adAnalyses
  );
  const competitors = competitorGroups.map(g =>
    buildBrandAnalysis(g.brandName, g.ads, adAnalyses)
  );

  const gaps: GapAnalysis = {
    missing_hooks: identifyHookGaps(
      subject.hook_distribution,
      competitors.map(c => c.hook_distribution)
    ),
    underutilized_formats: identifyFormatGaps(
      subject.format_distribution,
      competitors.map(c => c.format_distribution)
    ),
    winning_competitors: competitors
      .filter(c => c.ad_count > subject.ad_count)
      .map(c => c.name),
    missing_ctas: identifyStringGaps(
      Object.keys(subject.cta_distribution),
      competitors.map(c => Object.keys(c.cta_distribution))
    ),
    missing_trust_signals: identifyStringGaps(
      subject.trust_signals_used,
      competitors.map(c => c.trust_signals_used)
    ),
    competitor_offers: [...new Set(
      competitors.flatMap(c => c.offers_used).filter(Boolean)
    )],
    tone_gaps: identifyStringGaps(
      Object.keys(subject.tone_distribution),
      competitors.map(c => Object.keys(c.tone_distribution))
    )
  };

  const market_insights = buildMarketInsights(competitors);

  console.log('✅ Competitive analysis complete');
  return { subject, competitors, gaps, market_insights };
}

function buildBrandAnalysis(
  brandName: string,
  ads: NormalizedAd[],
  adAnalyses: Map<string, AdAnalysis>
): BrandAnalysis {
  const hook_distribution: HookDistribution = {};
  const format_distribution: FormatDistribution = { video: 0, image: 0, ugc_video: 0, carousel: 0 };
  const cta_distribution: { [cta: string]: number } = {};
  const tone_distribution: { [tone: string]: number } = {};
  const ad_length_distribution = { short: 0, medium: 0, long: 0 };
  const offers_used: string[] = [];
  const trust_signals_used: string[] = [];
  const pain_points_addressed: string[] = [];
  const usps: string[] = [];

  for (const ad of ads) {
    const analysis = adAnalyses.get(ad.id) || fallbackAnalysis(ad);

    // Hook
    hook_distribution[analysis.hookType] = (hook_distribution[analysis.hookType] || 0) + 1;

    // Format
    const fmt = detectCreativeFormat(ad);
    if (fmt === 'video') format_distribution.video++;
    else format_distribution.image++;

    // CTA
    cta_distribution[analysis.cta] = (cta_distribution[analysis.cta] || 0) + 1;

    // Tone
    tone_distribution[analysis.tone] = (tone_distribution[analysis.tone] || 0) + 1;

    // Ad length
    ad_length_distribution[analysis.adLength]++;

    // Collections (deduplicated)
    if (analysis.offer && !offers_used.includes(analysis.offer)) {
      offers_used.push(analysis.offer);
    }
    for (const ts of analysis.trustSignals) {
      if (!trust_signals_used.includes(ts)) trust_signals_used.push(ts);
    }
    if (analysis.painPoint && !pain_points_addressed.includes(analysis.painPoint)) {
      pain_points_addressed.push(analysis.painPoint);
    }
    if (analysis.uniqueSellingPoint && !usps.includes(analysis.uniqueSellingPoint)) {
      usps.push(analysis.uniqueSellingPoint);
    }
  }

  return {
    name: brandName,
    ad_count: ads.length,
    hook_distribution,
    format_distribution,
    cta_distribution,
    tone_distribution,
    offers_used,
    trust_signals_used,
    pain_points_addressed,
    ad_length_distribution,
    usps
  };
}

function buildMarketInsights(competitors: BrandAnalysis[]): MarketInsights {
  const hookCounts: { [h: string]: number } = {};
  const toneCounts: { [t: string]: number } = {};
  const ctaCounts: { [c: string]: number } = {};
  const tsCounts: { [t: string]: number } = {};
  const fmtCounts = { video: 0, image: 0, ugc_video: 0, carousel: 0 };

  for (const c of competitors) {
    for (const [h, n] of Object.entries(c.hook_distribution)) {
      hookCounts[h] = (hookCounts[h] || 0) + n;
    }
    for (const [t, n] of Object.entries(c.tone_distribution)) {
      toneCounts[t] = (toneCounts[t] || 0) + n;
    }
    for (const [cta, n] of Object.entries(c.cta_distribution)) {
      ctaCounts[cta] = (ctaCounts[cta] || 0) + n;
    }
    for (const ts of c.trust_signals_used) {
      tsCounts[ts] = (tsCounts[ts] || 0) + 1;
    }
    fmtCounts.video += c.format_distribution.video;
    fmtCounts.image += c.format_distribution.image;
    fmtCounts.ugc_video += c.format_distribution.ugc_video;
    fmtCounts.carousel += c.format_distribution.carousel;
  }

  const topOf = (obj: { [k: string]: number }, fallback: string) =>
    Object.entries(obj).sort(([, a], [, b]) => b - a)[0]?.[0] || fallback;

  return {
    dominant_hook_type: topOf(hookCounts, 'Other'),
    dominant_format: topOf(fmtCounts as any, 'image'),
    dominant_tone: topOf(toneCounts, 'Professional'),
    average_competitor_ad_count: competitors.length > 0
      ? Math.round(competitors.reduce((s, c) => s + c.ad_count, 0) / competitors.length) : 0,
    most_common_cta: topOf(ctaCounts, 'Other'),
    most_common_trust_signal: topOf(tsCounts, 'None')
  };
}

// ─── LLM prompt builder ───────────────────────────────────────────────────────

export function buildCompetitiveLLMPrompt(
  subjectAds: NormalizedAd[],
  competitorAds: { brandName: string; ads: NormalizedAd[] }[],
  hookGaps: string[],
  formatGaps: string[],
  adAnalyses: Map<string, AdAnalysis>,
  gaps: GapAnalysis
): string {
  const subjectBrand = subjectAds[0]?.brandName || 'Subject Brand';

  let prompt = `You are an Elite Media Buyer. Analyze why the client is losing market share and give 3 razor-sharp recommendations.

**CLIENT: ${subjectBrand}**
`;

  subjectAds.slice(0, 3).forEach((ad, i) => {
    const a = adAnalyses.get(ad.id);
    prompt += `
[Client Ad ${i + 1}]
Text: ${(ad.text || '').substring(0, 300)}
Hook: ${a?.hookType || 'Unknown'} | Tone: ${a?.tone || '?'} | CTA: ${a?.cta || '?'}
Offer: ${a?.offer || 'None'} | Trust signals: ${a?.trustSignals?.join(', ') || 'None'}
USP: ${a?.uniqueSellingPoint || 'None'}
`;
  });

  prompt += `\n**COMPETITORS**\n`;

  for (const comp of competitorAds) {
    prompt += `\n**${comp.brandName}**\n`;
    comp.ads.slice(0, 2).forEach((ad, i) => {
      const a = adAnalyses.get(ad.id);
      prompt += `[Ad ${i + 1}] ${(ad.text || '').substring(0, 200)}
  Hook: ${a?.hookType || '?'} | CTA: ${a?.cta || '?'} | Offer: ${a?.offer || 'None'} | Trust: ${a?.trustSignals?.join(', ') || 'None'}
`;
    });
  }

  prompt += `\n**GAPS IDENTIFIED:**
Missing hooks: ${gaps.missing_hooks.join(', ') || 'None'}
Missing CTAs: ${gaps.missing_ctas.join(', ') || 'None'}
Missing trust signals: ${gaps.missing_trust_signals.join(', ') || 'None'}
Competitor offers: ${gaps.competitor_offers.join(', ') || 'None'}
Tone gaps: ${gaps.tone_gaps.join(', ') || 'None'}
Underutilized formats: ${gaps.underutilized_formats.join(', ') || 'None'}

**DELIVER:**
1. Why is the client losing? (2-3 sentences)
2. Which competitor has the best ads and why?
3. 3 prioritized recommendations — each must have a specific action, real example from competitor ads, and immediate implementation step.

Return ONLY valid JSON, no markdown fences:
{
  "whySubjectIsLosing": "...",
  "bestCompetitor": "...",
  "recommendations": [
    {
      "priority": "high",
      "action": "...",
      "example": "...",
      "implementation": "..."
    }
  ]
}`;

  return prompt;
}
