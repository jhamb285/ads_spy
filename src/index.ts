// Main entry point - can be used for importing functions
export { normalizeApifyAd, normalizeApifyAdsBatch, NormalizedAd } from './normalize';
export type { ApifyAdItem, ApifyAdSnapshot, ApifyAdCard } from './normalize';
export { analyzeAdWithLLM, createOpenAIClient } from './llm';
export type { AdAnalysis } from './llm';
export { scrapeAdsForUrl, createApifyClient } from './apifyClient';
export { sendAdToSlack, createSlackClient } from './slack';
export { getConfig, BRAND_LIST } from './config';
export type { BrandItem, Config } from './config';
export { generateAdTasks } from './generateTasks';
export { loadConfigFromSheet } from './services/sheet';
export type { SheetConfig, AdTask } from './types';
export { startDailyAnalysis } from './main';
export { startBot } from './bot';

// Import functions for use in this file
import { startDailyAnalysis } from './main';
import { startBot } from './bot';

/**
 * Start the unified application - both daily analysis and Slack bot
 */
async function startApp() {
  console.log('🚀 Starting Ad Intelligence Application...\n');

  try {
    // Start both services concurrently
    // Both services will keep running in the background
    const [dailyAnalysisResult, botResult] = await Promise.allSettled([
      startDailyAnalysis(),
      startBot(),
    ]);

    // Check if either service failed to start
    if (dailyAnalysisResult.status === 'rejected') {
      console.error('❌ Failed to start daily analysis service:', dailyAnalysisResult.reason);
    }
    if (botResult.status === 'rejected') {
      console.error('❌ Failed to start Slack bot:', botResult.reason);
    }

    // If both failed, exit
    if (dailyAnalysisResult.status === 'rejected' && botResult.status === 'rejected') {
      console.error('❌ Both services failed to start. Exiting...');
      process.exit(1);
    }

    console.log('\n✅ Application is running!');
    console.log('   - Daily analysis will run automatically');
    console.log('   - Slack bot is listening for manual requests');
    console.log('   - Press Ctrl+C to stop\n');
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  startApp().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}
