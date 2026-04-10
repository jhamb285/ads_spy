import { getConfig, getBrandListAsync, AdSpyConfig } from './config';
import { createApifyClient, scrapeAdsForUrl } from './apifyClient';
import { normalizeApifyAdsBatch } from './normalize';
import { createGeminiClient as createLLMClient, analyzeAdWithLLM } from './llm';
import { createSlackClient, sendAdToSlack } from './slack';
import { logAdAnalysis } from './logger';
import { processAdMedia } from './media';
import {
  initializeDatabase,
  hasAdBeenProcessed,
  saveAd,
  closeDatabase,
  getBrandsWithPages,
  updateBrandPageStats,
} from './storage';
import { createGeminiClient, analyzeAdWithGemini } from './gemini';
import { calculateActiveDays } from './utils';
import { PlatformFactory } from './platforms/factory';
import { NormalizedAd } from './platforms/types';

/**
 * Process ads for all brands - checks for new ads only
 * Now supports multi-page brands and database-backed settings
 */
export async function processAds() {
  console.log('🚀 Starting ad intelligence pipeline...\n');
  console.log(`📅 Run time: ${new Date().toISOString()}\n`);

  try {
    const config = getConfig();

    // Initialize database
    initializeDatabase();
    console.log('✅ Database connection initialized\n');

    // Load AdSpy settings from database
    await AdSpyConfig.loadSettings();

    // Check master kill switch
    if (!AdSpyConfig.isScraperEnabled()) {
      console.log('🛑 AdSpy scraper is DISABLED (master kill switch)\n');
      console.log('   To enable, update settings via API: PATCH /api/settings/scraper_enabled\n');
      return;
    }
    console.log('✅ AdSpy scraper is ENABLED\n');

    // Sync brands from Google Sheets (if configured)
    // Note: Google Sheets sync is optional and can be enabled by setting up GOOGLE_SHEETS_ID
    // For now, skipping to avoid TypeScript compilation issues
    // if (process.env.GOOGLE_SHEETS_ID) {
    //   try {
    //     console.log('📊 Syncing brands from Google Sheets...');
    //     const { syncBrandsFromSheet } = await import('../scripts/sync-brands-from-sheet');
    //     await syncBrandsFromSheet(false);
    //     console.log('✅ Brand sync complete\n');
    //   } catch (error: any) {
    //     console.warn('⚠️  Brand sync failed (continuing with database brands):', error.message);
    //     console.warn('   Make sure GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_SERVICE_ACCOUNT_KEY are set\n');
    //   }
    // } else {
      console.log('ℹ️  Google Sheets sync disabled (will use database brands)\n');
    // }

    // Initialize clients
    const apifyClient = createApifyClient(config.apifyApiToken);
    const llmClient = createLLMClient(config.geminiApiKey);
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiClient = geminiApiKey ? createGeminiClient(geminiApiKey) : null;

    if (!geminiClient) {
      console.log('⚠️  Gemini API key not found - will use OpenAI only\n');
    }

    const slackClient = config.slackToken && config.slackChannel
      ? createSlackClient(config.slackToken)
      : null;

    if (!slackClient) {
      console.log('⚠️  Slack tokens not found - will log results to console instead\n');
    }

    // Load brands with their pages from database
    const brandsWithPages = await getBrandsWithPages(true); // activeOnly = true
    console.log(`🎯 Monitoring ${brandsWithPages.length} active competitor brand(s)\n`);

    let newAdsCount = 0;
    let skippedAdsCount = 0;
    let totalPagesProcessed = 0;

    // Process each brand
    for (const brand of brandsWithPages) {
      console.log(`\n📊 Processing brand: ${brand.brand_name} (${brand.avatar})\n`);

      // Check if brand has reached daily limit
      const hasReachedDailyLimit = await AdSpyConfig.hasBrandReachedDailyLimit(brand.id);
      if (hasReachedDailyLimit) {
        const dailyLimit = await AdSpyConfig.getMaxDailyAdsForBrand(brand.id);
        console.log(`⏭️  Skipping brand ${brand.brand_name}: daily limit reached (${dailyLimit} ads/day)\n`);
        continue;
      }

      // Get max ads setting for this brand (considers overrides)
      const maxAdsForBrand = await AdSpyConfig.getMaxAdsForBrand(brand.id);
      console.log(`⚙️  Max ads for this brand: ${maxAdsForBrand}\n`);

      // Get active pages for this brand
      const activePages = brand.pages.filter((p: any) => p.is_active);

      if (activePages.length === 0) {
        console.log(`⚠️  No active pages for ${brand.brand_name}`);
        continue;
      }

      console.log(`📄 Found ${activePages.length} active page(s) for ${brand.brand_name}\n`);

      // Process each page for this brand
      for (const page of activePages) {
        totalPagesProcessed++;

        console.log(`  📍 Processing page: ${page.page_name || page.page_url}\n`);

        try {
          // 1. Scrape ads from Apify
          const apifyItems = await scrapeAdsForUrl(
            apifyClient,
            page.page_url,
            maxAdsForBrand,
            config.daysBack
          );

          if (apifyItems.length === 0) {
            console.log(`  ⚠️  No ads found for page ${page.page_url}`);
            continue;
          }

          // 2. Normalize ads
          const normalizedAds = normalizeApifyAdsBatch(
            apifyItems,
            brand.avatar,
            brand.brand_name
          );

          console.log(`  📝 Normalized ${normalizedAds.length} ads from this page`);

          // 2.5. Filter ads by minimum active days (if configured)
          const minActiveDays = brand.min_active_days ?? config.minActiveDays;
          let filteredAds = normalizedAds;
          if (minActiveDays !== undefined && minActiveDays > 0) {
            filteredAds = normalizedAds.filter(ad => {
              const activeDays = calculateActiveDays(
                ad.startDate,
                ad.endDate,
                ad.raw.isActive
              );
              if (activeDays === null) {
                console.log(`  ⚠️  Could not calculate active days for ad ${ad.id}, skipping filter`);
                return true; // Include if we can't calculate
              }
              const meetsThreshold = activeDays >= minActiveDays;
              if (!meetsThreshold) {
                console.log(`  ⏭️  Skipping ad ${ad.id}: active for ${activeDays} days (minimum: ${minActiveDays} days)`);
              }
              return meetsThreshold;
            });
            console.log(`  📊 Filtered to ${filteredAds.length} ads (minimum ${minActiveDays} active days)`);
          }

          // Track new ads from this page
          let newAdsFromPage = 0;

          // 3. Process each ad
          for (const ad of filteredAds) {
            // Dedup check - skip if already processed (check database)
            const alreadyProcessed = await hasAdBeenProcessed(ad.id);
            if (alreadyProcessed) {
              console.log(`  ⏭️  Skipping already processed ad: ${ad.id}`);
              skippedAdsCount++;
              continue;
            }

            // Check daily limit again (per ad, more granular)
            const hasReachedDailyLimit = await AdSpyConfig.hasBrandReachedDailyLimit(brand.id);
            if (hasReachedDailyLimit) {
              const dailyLimit = await AdSpyConfig.getMaxDailyAdsForBrand(brand.id);
              console.log(`  🛑 Daily limit reached (${dailyLimit} ads/day), stopping scrape for ${brand.brand_name}\n`);
              break; // Stop processing this page
            }

            newAdsCount++;
            newAdsFromPage++;

            console.log(`  ✨ Processing new ad ${newAdsFromPage}/${filteredAds.length}: ${ad.id}`);

            // 3.5. Process media (images and videos)
            const media = await processAdMedia(llmClient, ad);
            if (media.imageDescription) {
              ad.imageDescription = media.imageDescription;
              // Append image description to text for LLM analysis
              ad.text = ad.text + '\n\n[Image Description]\n' + media.imageDescription;
            }
            if (media.videoTranscript) {
              ad.videoTranscript = media.videoTranscript;
              // Append video transcript to text for LLM analysis
              ad.text = ad.text + '\n\n[Video Transcript]\n' + media.videoTranscript;
            }

            // 4. Analyze with Gemini (if available)
            let geminiAnalysis;
            if (geminiClient) {
              try {
                geminiAnalysis = await analyzeAdWithGemini(geminiClient, ad);
              } catch (error) {
                console.error(`  ❌ Gemini analysis failed for ad ${ad.id}:`, error);
              }
            }

            // 5. Analyze with OpenAI
            const openaiAnalysis = await analyzeAdWithLLM(
              llmClient,
              ad,
              config.offerDescription
            );

            // 6. Save to database with full breakdown
            await saveAd(ad, geminiAnalysis, openaiAnalysis);

            // 7. Send to Slack or log to console
            if (slackClient && (config.slackChannelStatic || config.slackChannel)) {
              const staticChannel = config.slackChannelStatic || config.slackChannel || 'adspy-static';
              const videosChannel = config.slackChannelVideos || undefined;
              await sendAdToSlack(slackClient, staticChannel, ad, openaiAnalysis, videosChannel);
            } else {
              logAdAnalysis(ad, openaiAnalysis);
            }

            // Small delay to avoid rate limits
            await sleep(1000);
          }

          // Update page statistics
          if (newAdsFromPage > 0) {
            await updateBrandPageStats(page.id, newAdsFromPage);
          }

          console.log(`  ✅ Completed page: ${newAdsFromPage} new ads processed\n`);

        } catch (error) {
          console.error(`  ❌ Error processing page ${page.page_url}:`, error);
          // Continue with next page
          continue;
        }
      }

      console.log(`✅ Completed brand: ${brand.brand_name}\n`);
    }

    console.log('\n✅ Pipeline completed successfully!');
    console.log(`📈 Summary:`);
    console.log(`   - Brands processed: ${brandsWithPages.length}`);
    console.log(`   - Pages processed: ${totalPagesProcessed}`);
    console.log(`   - New ads processed: ${newAdsCount}`);
    console.log(`   - Ads skipped (already processed): ${skippedAdsCount}`);

    // Close database connection
    await closeDatabase();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    await closeDatabase();
    // Don't exit on error - continue running for next scheduled run
  }
}

/**
 * Calculate milliseconds until next scheduled run time
 * Default: runs daily at 9:00 AM
 */
function getMsUntilNextRun(hour: number = 9, minute: number = 0): number {
  const now = new Date();
  const nextRun = new Date();
  
  nextRun.setHours(hour, minute, 0, 0);
  
  // If the time has already passed today, schedule for tomorrow
  if (nextRun.getTime() <= now.getTime()) {
    nextRun.setDate(nextRun.getDate() + 1);
  }
  
  return nextRun.getTime() - now.getTime();
}

/**
 * Schedule the next run
 */
export function scheduleNextRun() {
  const msUntilNext = getMsUntilNextRun();
  const nextRunDate = new Date(Date.now() + msUntilNext);
  
  const hoursUntil = msUntilNext / 1000 / 60 / 60;
  console.log(`\n⏰ Next scheduled run: ${nextRunDate.toISOString()}`);
  console.log(`   (in ${Math.round(hoursUntil * 10) / 10} hours)\n`);
  
  setTimeout(async () => {
    await processAds();
    scheduleNextRun(); // Schedule the next run after completion
  }, msUntilNext);
}

/**
 * Start the daily analysis service - runs continuously
 */
export async function startDailyAnalysis() {
  console.log('🔄 Starting continuous ad monitoring service...\n');
  
  // Run immediately on startup
  await processAds();
  
  // Schedule daily runs
  scheduleNextRun();
  
  // Keep the process alive
  console.log('✅ Daily analysis service is running.\n');
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * =====================================================================
 * COMPETITIVE ANALYSIS (1-vs-5 Ad Dominance Engine)
 * =====================================================================
 */

/**
 * Analyze 1 subject brand vs 5 competitors
 * Returns competitive intelligence with gap analysis and recommendations
 */
export async function analyzeCompetitorSet(
  input: import('./comparator').CompetitorSetInput,
  options?: {
    platform?: 'facebook' | 'google';
    adsPerPage?: number;
    daysBack?: number;
  }
): Promise<import('./comparator').CompetitiveAnalysisResult> {
  const platform = options?.platform || 'facebook';
  const adsPerPage = options?.adsPerPage || 5;
  const daysBack = options?.daysBack || 30;

  console.log(`🚀 Starting competitive analysis: 1-vs-5 Ad Dominance Engine [${platform.toUpperCase()}]\n`);
  console.log(`📅 Analysis time: ${new Date().toISOString()}\n`);

  const startTime = Date.now();

  try {
    // 1. Validate input
    const subjectCount = input.competitors.filter(c => c.isSubject).length;
    const competitorCount = input.competitors.filter(c => !c.isSubject).length;

    if (subjectCount !== 1) {
      throw new Error(`Invalid input: Expected exactly 1 subject, got ${subjectCount}`);
    }

    if (competitorCount < 1 || competitorCount > 10) {
      throw new Error(`Invalid input: Expected 1-10 competitors, got ${competitorCount}`);
    }

    console.log(`✅ Input validated: 1 subject + ${competitorCount} competitors\n`);

    // 2. Initialize clients
    const config = getConfig();
    initializeDatabase();

    const apifyClient = createApifyClient(config.apifyApiToken);
    const llmClient = createLLMClient(config.geminiApiKey);
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiClient = geminiApiKey ? createGeminiClient(geminiApiKey) : null;

    if (!geminiClient) {
      throw new Error('GEMINI_API_KEY is required for competitive analysis');
    }

    console.log('✅ Clients initialized\n');

    // 3. Parallel scraping (6 brands concurrently)
    console.log(`📡 Starting parallel scraping for 6 brands [${platform.toUpperCase()}]...\n`);

    // Create platform client
    const platformClient = PlatformFactory.createClient(platform, apifyClient);

    const scrapePromises = input.competitors.map(async (entity) => {
      console.log(`   🔍 Scraping: ${entity.name} (${entity.domain})`);

      try {
        const normalizedAds = await platformClient.scrapeAdsForCompetitor(
          {
            name: entity.name,
            domain: entity.domain,
            isSubject: entity.isSubject,
            industry: (entity as any).industry, // Add industry field for Google Ads
            adTransparencyUrl: (entity as any).adTransparencyUrl // Add adTransparencyUrl for Google Ads
          },
          adsPerPage,
          daysBack
        );

        if (normalizedAds.length === 0) {
          console.log(`   ⚠️  No ads found for ${entity.name}`);
          return { entity, ads: [] };
        }

        console.log(`   ✅ ${entity.name}: ${normalizedAds.length} ads scraped`);
        return { entity, ads: normalizedAds };
      } catch (error) {
        console.error(`   ❌ Error scraping ${entity.name}:`, error);
        return { entity, ads: [] };
      }
    });

    const scrapeResults = await Promise.all(scrapePromises);

    const elapsedScrape = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Scraping complete in ${elapsedScrape}s\n`);

    // Separate subject and competitors
    const subjectResult = scrapeResults.find(r => r.entity.isSubject);
    const competitorResults = scrapeResults.filter(r => !r.entity.isSubject);

    const subjectName = input.competitors.find(c => c.isSubject)?.name || 'Unknown';
    const competitorsWithNoAds = competitorResults
      .filter(r => r.ads.length === 0)
      .map(r => r.entity.name);

    if (!subjectResult || subjectResult.ads.length === 0) {
      console.warn(`⚠️  No ads found for subject brand "${subjectName}" — returning soft no_ads_found result`);
      await closeDatabase();
      return {
        analysis_id: null,
        status: 'no_ads_found',
        subject_brand_name: subjectName,
        message: `Subject brand "${subjectName}" has no active ads in Meta Ad Library. Skip this lead.`,
        subject: null,
        competitors: [],
        gaps: null,
        recommendations: [],
        market_insights: null,
      };
    }

    if (competitorsWithNoAds.length > 0) {
      console.warn(`⚠️  ${competitorsWithNoAds.length} competitor(s) returned no ads: ${competitorsWithNoAds.join(', ')}`);
    }

    // Filter out competitors with no ads
    const validCompetitors = competitorResults.filter(r => r.ads.length > 0);
    if (validCompetitors.length < 3) {
      console.warn(`⚠️  Warning: Only ${validCompetitors.length} competitors returned ads (minimum 3 recommended)`);
    }

    const allAds = [
      ...subjectResult.ads,
      ...validCompetitors.flatMap(r => r.ads)
    ];

    console.log(`📊 Total ads to process: ${allAds.length}`);
    console.log(`   - Subject: ${subjectResult.ads.length} ads`);
    console.log(`   - Competitors: ${validCompetitors.reduce((sum, r) => sum + r.ads.length, 0)} ads\n`);

    // 4. Process media for all ads
    console.log('🖼️  Processing media (images and videos)...\n');

    for (const ad of allAds) {
      const media = await processAdMedia(llmClient, ad);
      if (media.imageDescription) {
        ad.imageDescription = media.imageDescription;
      }
      if (media.videoTranscript) {
        ad.videoTranscript = media.videoTranscript;
      }
    }

    console.log('✅ Media processing complete\n');

    // 5. Save all ads to database
    console.log('💾 Saving ads to database...\n');

    for (const ad of allAds) {
      try {
        const alreadyProcessed = await hasAdBeenProcessed(ad.id);
        if (!alreadyProcessed) {
          await saveAd(ad, undefined, undefined, platform);
        }
      } catch (error) {
        console.error(`   ❌ Error saving ad ${ad.id}:`, error);
      }
    }

    console.log('✅ Ads saved to database\n');

    // 6. Full ad analysis via Gemini (11 dimensions per ad)
    const { analyzeAds } = await import('./comparator');
    const adAnalyses = await analyzeAds(geminiClient, allAds);

    // 7. Competitive analysis
    const { performCompetitiveAnalysis, buildCompetitiveLLMPrompt } = await import('./comparator');

    const competitorGroups = validCompetitors.map(r => ({
      brandName: r.entity.name,
      ads: r.ads
    }));

    const analysisResult = performCompetitiveAnalysis(
      subjectResult.ads,
      competitorGroups,
      adAnalyses
    );

    // 8. Generate recommendations via Gemini
    console.log('🤖 Generating strategic recommendations...\n');

    const { analyzeCompetitiveGaps } = await import('./llm');
    const competitivePrompt = buildCompetitiveLLMPrompt(
      subjectResult.ads,
      competitorGroups,
      analysisResult.gaps.missing_hooks,
      analysisResult.gaps.underutilized_formats,
      adAnalyses,
      analysisResult.gaps
    );

    const gapAnalysis = await analyzeCompetitiveGaps(llmClient, competitivePrompt);

    // 9. Store analysis in database
    const { v4: uuidv4 } = await import('uuid');
    const analysisId = uuidv4();

    const { storeCompetitiveAnalysis } = await import('./storage');

    const adsForStorage = allAds.map(ad => ({
      ad_id: ad.id,
      is_subject: ad.brandName === subjectResult.entity.name,
      hook_category: adAnalyses.get(ad.id)?.hookType || 'Other',
      creative_format: ad.videoUrl ? 'video' : 'image'
    }));

    await storeCompetitiveAnalysis({
      subject_brand_name: subjectResult.entity.name,
      subject_domain: subjectResult.entity.domain,
      competitors: analysisResult.competitors.map(c => ({
        name: c.name,
        ad_count: c.ad_count,
        top_hooks: Object.entries(c.hook_distribution)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 3)
          .map(([hook]) => hook)
      })),
      hook_gap_analysis: {
        missing_hooks: analysisResult.gaps.missing_hooks,
        subject_hook_distribution: analysisResult.subject.hook_distribution,
        competitor_hook_distribution: analysisResult.competitors.map(c => ({
          name: c.name,
          hooks: c.hook_distribution
        }))
      },
      format_gap_analysis: {
        underutilized_formats: analysisResult.gaps.underutilized_formats,
        subject_format_distribution: analysisResult.subject.format_distribution,
        competitor_format_distribution: analysisResult.competitors.map(c => ({
          name: c.name,
          formats: c.format_distribution
        }))
      },
      dominant_patterns: analysisResult.market_insights,
      recommendations: gapAnalysis.recommendations.map(r =>
        `[${r.priority.toUpperCase()}] ${r.action}: ${r.example}`
      ),
      total_subject_ads: subjectResult.ads.length,
      total_competitor_ads: validCompetitors.reduce((sum, r) => sum + r.ads.length, 0),
      platform,
      ads: adsForStorage
    });

    // 10. Build final result
    const result: import('./comparator').CompetitiveAnalysisResult = {
      analysis_id: analysisId,
      status: 'ok',
      subject: analysisResult.subject,
      competitors: analysisResult.competitors,
      gaps: analysisResult.gaps,
      recommendations: gapAnalysis.recommendations,
      market_insights: analysisResult.market_insights
    };

    const elapsedTotal = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Competitive analysis complete in ${elapsedTotal}s!`);
    console.log(`📊 Analysis ID: ${analysisId}\n`);

    return result;
  } catch (error) {
    console.error('❌ Competitive analysis failed:', error);
    throw error;
  } finally {
    await closeDatabase();
  }
}

// Run if executed directly (for backward compatibility)
if (require.main === module) {
  startDailyAnalysis().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

