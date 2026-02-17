/**
 * Competitive Analysis Comparator Module
 * 1-vs-5 Ad Dominance Engine
 *
 * Performs full per-ad analysis across 11 dimensions:
 * hook, headline, CTA, offer, pain point, audience signals,
 * tone, image content, ad length, trust signals, USP
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NormalizedAd } from './normalize';

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
  analysis_id: string;
  subject: BrandAnalysis;
  competitors: BrandAnalysis[];
  gaps: GapAnalysis;
  recommendations: Recommendation[];
  market_insights: MarketInsights;
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
  geminiClient: GoogleGenerativeAI,
  ads: NormalizedAd[]
): Promise<Map<string, AdAnalysis>> {
  console.log(`🔮 Running full ad analysis for ${ads.length} ads (11 dimensions)...`);

  const analysisMap = new Map<string, AdAnalysis>();
  const batchSize = 8;

  for (let i = 0; i < ads.length; i += batchSize) {
    const batch = ads.slice(i, i + batchSize);
    console.log(`   Analyzing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(ads.length / batchSize)}`);

    try {
      const model = geminiClient.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = buildAdAnalysisPrompt(batch);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const analyses = parseAdAnalysisResponse(text, batch);

      for (const { adId, analysis } of analyses) {
        analysisMap.set(adId, analysis);
      }
    } catch (error) {
      console.error(`❌ Error analyzing batch:`, error);
      for (const ad of batch) {
        if (!analysisMap.has(ad.id)) {
          analysisMap.set(ad.id, fallbackAnalysis(ad));
        }
      }
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
  let prompt = `You are an expert media buyer analyzing ads across 11 dimensions.

For each ad, extract:
1. hookType — one of: ${HOOK_CATEGORIES.join(' | ')}
2. headline — core value proposition in 1 sentence (max 15 words)
3. cta — call-to-action type (e.g. "Free Quote", "Call Now", "Book Online", "Learn More", "Schedule Service", "Other")
4. offer — specific offer/discount/guarantee mentioned, or null
5. painPoint — the problem being solved, or null
6. audienceSignals — array of strings describing who this targets (e.g. ["homeowners", "new customers"])
7. tone — one of: ${TONE_CATEGORIES.join(' | ')}
8. adLength — "short" (<80 chars), "medium" (80-250 chars), or "long" (>250 chars)
9. trustSignals — array of trust indicators found (e.g. ["satisfaction guarantee", "licensed", "5-star rated"]), empty array if none
10. uniqueSellingPoint — what makes this brand different, or null

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
Return ONLY a valid JSON array, no markdown fences, no extra text:
[
  {
    "index": 0,
    "hookType": "Social Proof",
    "headline": "...",
    "cta": "Free Quote",
    "offer": "10% off first service",
    "painPoint": "pest infestation",
    "audienceSignals": ["homeowners", "families"],
    "tone": "Friendly",
    "adLength": "short",
    "trustSignals": ["licensed", "5-star rated"],
    "uniqueSellingPoint": "same-day service"
  },
  ...
]`;

  return prompt;
}

function parseAdAnalysisResponse(
  text: string,
  ads: NormalizedAd[]
): { adId: string; analysis: AdAnalysis }[] {
  try {
    const stripped = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
    const jsonMatch = stripped.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found in response');

    const parsed = JSON.parse(jsonMatch[0]);
    const results: { adId: string; analysis: AdAnalysis }[] = [];

    for (const item of parsed) {
      if (item.index === undefined || !ads[item.index]) continue;

      const ad = ads[item.index];
      const rawLen = (ad.text || '').length;
      const adLength: AdAnalysis['adLength'] = rawLen < 80 ? 'short' : rawLen < 250 ? 'medium' : 'long';

      results.push({
        adId: ad.id,
        analysis: {
          hookType: item.hookType || 'Other',
          headline: item.headline || '',
          cta: item.cta || 'Other',
          offer: item.offer || null,
          painPoint: item.painPoint || null,
          audienceSignals: Array.isArray(item.audienceSignals) ? item.audienceSignals : [],
          tone: TONE_CATEGORIES.includes(item.tone) ? item.tone : 'Professional',
          adLength: ['short', 'medium', 'long'].includes(item.adLength) ? item.adLength : adLength,
          trustSignals: Array.isArray(item.trustSignals) ? item.trustSignals : [],
          uniqueSellingPoint: item.uniqueSellingPoint || null
        }
      });
    }

    return results;
  } catch (error) {
    console.error('Error parsing ad analysis response:', error);
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
  const usageCount: { [hook: string]: number } = {};
  for (const compHooks of competitorHooks) {
    for (const hook of Object.keys(compHooks)) {
      if (compHooks[hook] > 0) usageCount[hook] = (usageCount[hook] || 0) + 1;
    }
  }
  return Object.entries(usageCount)
    .filter(([hook, count]) => count >= 2 && (!subjectHooks[hook] || subjectHooks[hook] === 0))
    .map(([hook]) => hook);
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

  for (const [format, avgUse] of Object.entries(avg)) {
    const subjectUse = totalSubject > 0
      ? subjectFormats[format as keyof FormatDistribution] / totalSubject : 0;
    if (avgUse > 0.2 && subjectUse < avgUse * 0.5) gaps.push(format);
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
