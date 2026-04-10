/**
 * Test script for Google Ads competitive analysis
 * Tests the new Google Ads SERP scraping and analysis pipeline
 */

import dotenv from 'dotenv';
dotenv.config();

async function testGoogleAdsAnalysis() {
  console.log('🧪 Testing Google Ads Competitive Analysis\n');

  // Test data: Pest control industry
  const testCompetitors = {
    competitors: [
      {
        name: 'Orkin Pest Control',
        domain: 'orkin.com',
        industry: 'pest control',
        isSubject: true
      },
      {
        name: 'Terminix',
        domain: 'terminix.com',
        industry: 'pest control',
        isSubject: false
      },
      {
        name: 'Aptive Environmental',
        domain: 'goaptive.com',
        industry: 'pest control',
        isSubject: false
      },
      {
        name: 'Mosquito Squad',
        domain: 'mosquitosquad.com',
        industry: 'mosquito control',
        isSubject: false
      },
      {
        name: 'Mosquito Joe',
        domain: 'mosquitojoe.com',
        industry: 'mosquito control',
        isSubject: false
      },
      {
        name: 'TruGreen',
        domain: 'trugreen.com',
        industry: 'lawn care',
        isSubject: false
      }
    ]
  };

  try {
    console.log('📊 Test Input:');
    console.log(`   - Subject: ${testCompetitors.competitors[0].name}`);
    console.log(`   - Competitors: ${testCompetitors.competitors.filter(c => !c.isSubject).map(c => c.name).join(', ')}`);
    console.log(`   - Platform: Google Ads (SERP scraping)`);
    console.log('');

    // Import and run analysis
    const { analyzeCompetitorSet } = await import('../src/main');

    console.log('🚀 Starting Google Ads competitive analysis...\n');

    const result = await analyzeCompetitorSet(
      testCompetitors,
      {
        platform: 'google',
        adsPerPage: 5,
        daysBack: 90
      }
    );

    console.log('\n✅ Analysis Complete!\n');
    console.log('📊 Results Summary:');
    console.log(`   - Analysis ID: ${result.analysis_id}`);
    console.log(`   - Subject Ads: ${result.subject.ad_count}`);
    console.log(`   - Competitor Ads: ${result.competitors.reduce((sum, c) => sum + c.ad_count, 0)}`);
    console.log('');

    console.log('🎯 Subject Hook Distribution:');
    Object.entries(result.subject.hook_distribution).forEach(([hook, count]) => {
      console.log(`   - ${hook}: ${count}`);
    });
    console.log('');

    console.log('❌ Missing Hooks (Gaps):');
    result.gaps.missing_hooks.forEach(hook => {
      console.log(`   - ${hook}`);
    });
    console.log('');

    console.log('💡 Recommendations (Top 3):');
    result.recommendations.slice(0, 3).forEach((rec, i) => {
      console.log(`   ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.action}`);
      console.log(`      → ${rec.example}`);
    });
    console.log('');

    console.log('📈 Market Insights:');
    console.log(`   - Dominant Hook: ${result.market_insights.dominant_hook_type}`);
    console.log(`   - Dominant Format: ${result.market_insights.dominant_format}`);
    console.log(`   - Avg Competitor Ads: ${result.market_insights.average_competitor_ad_count}`);
    console.log('');

    console.log('✅ Test PASSED! Google Ads analysis working correctly.\n');

  } catch (error: any) {
    console.error('❌ Test FAILED!');
    console.error('Error:', error.message);
    console.error('');
    console.error('Stack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Run test
testGoogleAdsAnalysis()
  .then(() => {
    console.log('🎉 All tests passed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
