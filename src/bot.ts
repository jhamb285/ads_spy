import { App } from '@slack/bolt';
import { getConfig, AdSpyConfig } from './config';
import { createApifyClient, scrapeAdsForUrl } from './apifyClient';
import { normalizeApifyAdsBatch } from './normalize';
import { createGeminiClient as createLLMClient, analyzeAdWithLLM } from './llm';
import { sendAdToSlack } from './slack';
import { processAdMedia } from './media';
import { initializeDatabase, hasAdBeenProcessed, saveAd } from './storage';
import { createGeminiClient, analyzeAdWithGemini } from './gemini';
import { calculateActiveDays } from './utils';

/**
 * Check if URL is a Facebook Ad Library URL (specific ad)
 */
function isAdLibraryUrl(url: string): boolean {
  return /facebook\.com\/ads\/library\/\?id=/.test(url);
}

/**
 * Extract Facebook URL from text (page URL or ad library URL)
 */
function extractFacebookUrl(text: string): string | null {
  // Match Facebook URLs (various formats)
  const patterns = [
    /https?:\/\/(www\.)?(facebook\.com|fb\.com)\/[^\s<>"']+/gi,
    /facebook\.com\/[^\s<>"']+/gi,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[0]) {
      let url = match[0];
      // Ensure it's a full URL
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      // Remove trailing punctuation
      url = url.replace(/[.,;!?]+$/, '');
      return url;
    }
  }

  return null;
}

/**
 * Extract brand name from URL or use default
 */
function extractBrandName(url: string): string {
  try {
    const match = url.match(/facebook\.com\/([^\/\?]+)/);
    if (match && match[1]) {
      return match[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  } catch (e) {
    // Ignore
  }
  return 'Unknown Brand';
}

/**
 * Process a single ad URL (Facebook Ad Library URL) and send analysis to Slack
 */
async function processAdUrl(
  adUrl: string,
  channel: string,
  apifyClient: any,
  llmClient: any,
  geminiClient: any,
  slackClient: any,
  config: any
): Promise<void> {
  console.log(`\n📊 Processing single ad from URL: ${adUrl}\n`);

  try {
    // Send initial message
    await slackClient.chat.postMessage({
      channel,
      text: `🔍 Analyzing ad... This may take a minute.`,
    });

    // 1. Scrape the specific ad from Apify
    // Apify can handle ad library URLs directly
    const apifyItems = await scrapeAdsForUrl(
      apifyClient,
      adUrl,
      1, // Only need 1 ad
      undefined // No date filter needed for specific ad
    );

    if (apifyItems.length === 0) {
      await slackClient.chat.postMessage({
        channel,
        text: `⚠️ No ad found for this URL. Please check the Facebook Ad Library URL.`,
      });
      return;
    }

    // 2. Normalize the ad
    const normalizedAds = normalizeApifyAdsBatch(
      apifyItems,
      'Ad Analysis', // Default avatar
      undefined // Let it use the page name from the ad
    );

    if (normalizedAds.length === 0) {
      await slackClient.chat.postMessage({
        channel,
        text: `⚠️ Could not process the ad. Please try again.`,
      });
      return;
    }

    const ad = normalizedAds[0];
    console.log(`📝 Processing ad: ${ad.id}`);

    // 2.5. Check minimum active days filter (if configured)
    const minActiveDays = config.minActiveDays;
    if (minActiveDays !== undefined && minActiveDays > 0) {
      const activeDays = calculateActiveDays(
        ad.startDate,
        ad.endDate,
        ad.raw.isActive
      );
      if (activeDays !== null && activeDays < minActiveDays) {
        await slackClient.chat.postMessage({
          channel,
          text: `⏭️ Ad skipped: This ad has been active for ${activeDays} days, but the minimum is ${minActiveDays} days.`,
        });
        return;
      }
    }

    // 3. Process media (images and videos)
    const media = await processAdMedia(llmClient, ad);
    if (media.imageDescription) {
      ad.imageDescription = media.imageDescription;
      ad.text = ad.text + '\n\n[Image Description]\n' + media.imageDescription;
    }
    if (media.videoTranscript) {
      ad.videoTranscript = media.videoTranscript;
      ad.text = ad.text + '\n\n[Video Transcript]\n' + media.videoTranscript;
    }

    // 4. Analyze with Gemini (if available)
    let geminiAnalysis;
    if (geminiClient) {
      try {
        geminiAnalysis = await analyzeAdWithGemini(geminiClient, ad);
      } catch (error) {
        console.error(`❌ Gemini analysis failed for ad ${ad.id}:`, error);
      }
    }

    // 5. Analyze with OpenAI
    const openaiAnalysis = await analyzeAdWithLLM(
      llmClient,
      ad,
      config.offerDescription
    );

    // 6. Save to database
    await saveAd(ad, geminiAnalysis, openaiAnalysis);

    // 7. Send to Slack
    await sendAdToSlack(slackClient, channel, ad, openaiAnalysis);

    // Send completion message
    await slackClient.chat.postMessage({
      channel,
      text: `✅ Analysis complete!`,
    });
  } catch (error) {
    console.error(`❌ Error processing ad URL:`, error);
    await slackClient.chat.postMessage({
      channel,
      text: `❌ Error analyzing ad: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}

/**
 * Process a single brand URL and send results to Slack
 */
async function processBrandUrl(
  pageUrl: string,
  channel: string,
  apifyClient: any,
  llmClient: any,
  geminiClient: any,
  slackClient: any,
  config: any
): Promise<void> {
  const brandName = extractBrandName(pageUrl);
  const avatar = brandName; // Use brand name as avatar for now

  console.log(`\n📊 Processing brand: ${brandName} from URL: ${pageUrl}\n`);

  try {
    // Send initial message
    await slackClient.chat.postMessage({
      channel,
      text: `🔍 Analyzing ads for ${brandName}... This may take a few minutes.`,
    });

    // 1. Scrape ads from Apify
    const apifyItems = await scrapeAdsForUrl(
      apifyClient,
      pageUrl,
      config.maxAdsPerBrand,
      config.daysBack
    );

    if (apifyItems.length === 0) {
      await slackClient.chat.postMessage({
        channel,
        text: `⚠️ No ads found for ${brandName}. Please check the Facebook page URL.`,
      });
      return;
    }

    // 2. Normalize ads
    const normalizedAds = normalizeApifyAdsBatch(
      apifyItems,
      avatar,
      brandName
    );

    console.log(`📝 Normalized ${normalizedAds.length} ads`);

    // 2.5. Filter ads by minimum active days (if configured)
    const minActiveDays = config.minActiveDays;
    let filteredAds = normalizedAds;
    if (minActiveDays !== undefined && minActiveDays > 0) {
      filteredAds = normalizedAds.filter(ad => {
        const activeDays = calculateActiveDays(
          ad.startDate,
          ad.endDate,
          ad.raw.isActive
        );
        if (activeDays === null) {
          console.log(`⚠️  Could not calculate active days for ad ${ad.id}, skipping filter`);
          return true; // Include if we can't calculate
        }
        const meetsThreshold = activeDays >= minActiveDays;
        if (!meetsThreshold) {
          console.log(`⏭️  Skipping ad ${ad.id}: active for ${activeDays} days (minimum: ${minActiveDays} days)`);
        }
        return meetsThreshold;
      });
      console.log(`📊 Filtered to ${filteredAds.length} ads (minimum ${minActiveDays} active days)`);
    }

    // Send summary
    await slackClient.chat.postMessage({
      channel,
      text: `✅ Found ${normalizedAds.length} ads${filteredAds.length !== normalizedAds.length ? ` (${filteredAds.length} meet the minimum ${minActiveDays} active days requirement)` : ''}. Analyzing them now...`,
    });

    // 3. Process each ad (limit to maxAdsPerBrand)
    let processedCount = 0;
    for (const ad of filteredAds.slice(0, config.maxAdsPerBrand)) {
      try {
        // Check if already processed
        const alreadyProcessed = await hasAdBeenProcessed(ad.id);
        if (alreadyProcessed) {
          console.log(`⏭️  Skipping already processed ad: ${ad.id}`);
          continue;
        }

        // 3.5. Process media (images and videos)
        const media = await processAdMedia(llmClient, ad);
        if (media.imageDescription) {
          ad.imageDescription = media.imageDescription;
          ad.text = ad.text + '\n\n[Image Description]\n' + media.imageDescription;
        }
        if (media.videoTranscript) {
          ad.videoTranscript = media.videoTranscript;
          ad.text = ad.text + '\n\n[Video Transcript]\n' + media.videoTranscript;
        }

        // 4. Analyze with Gemini (if available)
        let geminiAnalysis;
        if (geminiClient) {
          try {
            geminiAnalysis = await analyzeAdWithGemini(geminiClient, ad);
          } catch (error) {
            console.error(`❌ Gemini analysis failed for ad ${ad.id}:`, error);
          }
        }

        // 5. Analyze with OpenAI
        const openaiAnalysis = await analyzeAdWithLLM(
          llmClient,
          ad,
          config.offerDescription
        );

        // 6. Save to database
        await saveAd(ad, geminiAnalysis, openaiAnalysis);

        // 7. Send to Slack
        await sendAdToSlack(slackClient, channel, ad, openaiAnalysis);

        processedCount++;

        // Small delay to avoid rate limits
        await sleep(1000);
      } catch (error) {
        console.error(`❌ Error processing ad ${ad.id}:`, error);
        // Continue with next ad
        continue;
      }
    }

    // Send completion message
    await slackClient.chat.postMessage({
      channel,
      text: `✅ Completed! Processed ${processedCount} ads for ${brandName}.`,
    });
  } catch (error) {
    console.error(`❌ Error processing brand ${brandName}:`, error);
    await slackClient.chat.postMessage({
      channel,
      text: `❌ Error processing ${brandName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Start the Slack bot
 */
export async function startBot(): Promise<void> {
  console.log('🤖 Starting Slack bot...\n');

  const config = getConfig();

  if (!config.slackToken) {
    throw new Error('SLACK_TOKEN is required for bot mode');
  }

  // Initialize database
  initializeDatabase();
  console.log('✅ Database connection initialized\n');

  // Load AdSpy settings from database
  await AdSpyConfig.loadSettings();
  console.log('✅ AdSpy settings loaded\n');
  console.log('ℹ️  Note: Bot mode processes manual URL requests and bypasses the master kill switch\n');

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
    console.log('⚠️  Gemini API key not found\n');
  }

  // Initialize Slack app
  const appToken = process.env.SLACK_APP_TOKEN;
  if (!appToken) {
    throw new Error('SLACK_APP_TOKEN is required for bot mode. Get it from https://api.slack.com/apps');
  }

  const app = new App({
    token: config.slackToken,
    socketMode: true,
    appToken: appToken,
  });

  // Listen for messages containing Facebook URLs
  app.message(async ({ message, say, client }) => {
    console.log('📨 Message received:', {
      channel: 'channel' in message ? message.channel : 'unknown',
      text: 'text' in message ? message.text?.substring(0, 100) : 'no text',
      subtype: 'subtype' in message ? message.subtype : 'none',
      user: 'user' in message ? message.user : 'unknown'
    });

    // Skip bot messages
    if ('subtype' in message && message.subtype === 'bot_message') {
      console.log('⏭️  Skipping bot message');
      return;
    }

    const text = 'text' in message ? message.text : '';
    if (!text) {
      console.log('⏭️  Skipping message with no text');
      return;
    }

    const facebookUrl = extractFacebookUrl(text);
    console.log('🔍 Extracted Facebook URL:', facebookUrl || 'none');
    
    if (facebookUrl) {
      const channel = 'channel' in message ? message.channel : '';
      console.log('✅ Processing Facebook URL:', facebookUrl);
      
      // Check if it's an ad library URL (specific ad) or a page URL
      if (isAdLibraryUrl(facebookUrl)) {
        console.log('📊 Processing as single ad URL');
        // Process single ad URL
        await processAdUrl(
          facebookUrl,
          channel,
          apifyClient,
          llmClient,
          geminiClient,
          client,
          config
        );
      } else {
        console.log('📊 Processing as brand/page URL');
        // Process brand/page URL
        await processBrandUrl(
          facebookUrl,
          channel,
          apifyClient,
          llmClient,
          geminiClient,
          client,
          config
        );
      }
    } else {
      console.log('⏭️  No Facebook URL found in message');
      // Send help guide when no Facebook URL is found
      const channel = 'channel' in message ? message.channel : '';
      await client.chat.postMessage({
        channel,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '📚 Ad Intelligence Bot Guide',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'I can analyze Facebook ads for you! Just send me a Facebook URL.',
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*📄 To analyze all ads from a Facebook page:*\nSend me a Facebook page URL, for example:\n`https://www.facebook.com/moringabyrosabella/`',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*🎯 To analyze a specific ad:*\nSend me a Facebook Ad Library URL, for example:\n`https://www.facebook.com/ads/library/?id=123456789`',
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: '💡 Tip: I\'ll analyze the ads and provide insights on why they work, how to improve them, and a rewritten version for your offer.',
              },
            ],
          },
        ],
        text: 'Ad Intelligence Bot Guide - Send me a Facebook URL to analyze ads!',
      });
    }
  });

  // Add error handler
  app.error(async (error) => {
    console.error('❌ Slack bot error:', error);
  });

  // Start the app
  await app.start();
  console.log('✅ Slack bot is running!');
  console.log('   - Send a Facebook page URL to analyze all ads from that page');
  console.log('   - Send a Facebook Ad Library URL to analyze a specific ad');
  console.log('\n📋 Setup Checklist:');
  console.log('   1. Bot is invited to the channel (type: /invite @your-bot-name)');
  console.log('   2. Bot has required scopes: chat:write, channels:history, im:history');
  console.log('   3. Socket Mode is enabled in Slack app settings');
  console.log('   4. Try sending a message with a Facebook URL in the channel\n');
}

// Run if executed directly
if (require.main === module) {
  startBot().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

