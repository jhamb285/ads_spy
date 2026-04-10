/**
 * Test script for Competitive Analysis feature
 * Tests the 1-vs-5 Ad Dominance Engine
 */

import 'dotenv/config';

/**
 * Test data: Sample competitor set for testing
 * Replace with real Facebook page URLs for actual testing
 */
const testCompetitorSet = {
  competitors: [
    {
      name: "Subject Brand",
      domain: "https://www.facebook.com/YOUR_SUBJECT_BRAND",
      isSubject: true
    },
    {
      name: "Competitor 1",
      domain: "https://www.facebook.com/COMPETITOR_1",
      isSubject: false
    },
    {
      name: "Competitor 2",
      domain: "https://www.facebook.com/COMPETITOR_2",
      isSubject: false
    },
    {
      name: "Competitor 3",
      domain: "https://www.facebook.com/COMPETITOR_3",
      isSubject: false
    },
    {
      name: "Competitor 4",
      domain: "https://www.facebook.com/COMPETITOR_4",
      isSubject: false
    },
    {
      name: "Competitor 5",
      domain: "https://www.facebook.com/COMPETITOR_5",
      isSubject: false
    }
  ]
};

/**
 * Test the competitive analysis API
 */
async function testCompetitiveAnalysisAPI() {
  console.log('🧪 Testing Competitive Analysis API...\n');

  const API_URL = process.env.API_URL || 'http://localhost:1002';
  const endpoint = `${API_URL}/api/analyze-competitor-set`;

  console.log(`📡 Sending request to: ${endpoint}\n`);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCompetitorSet)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${JSON.stringify(error, null, 2)}`);
    }

    const result = await response.json();

    console.log('✅ Analysis Complete!\n');
    console.log('📊 Results Summary:');
    console.log(`   Analysis ID: ${result.analysis_id}`);
    console.log(`   Subject: ${result.subject.name}`);
    console.log(`   Subject Ads: ${result.subject.ad_count}`);
    console.log(`   Competitor Ads: ${result.competitors.reduce((sum: number, c: any) => sum + c.ad_count, 0)}`);
    console.log(`   Missing Hooks: ${result.gaps.missing_hooks.length}`);
    console.log(`   Recommendations: ${result.recommendations.length}\n`);

    console.log('🎯 Missing Hooks:');
    result.gaps.missing_hooks.forEach((hook: string) => {
      console.log(`   - ${hook}`);
    });
    console.log('');

    console.log('💡 Top Recommendations:');
    result.recommendations.slice(0, 3).forEach((rec: any, idx: number) => {
      console.log(`   ${idx + 1}. [${rec.priority.toUpperCase()}] ${rec.action}`);
      console.log(`      Example: ${rec.example}`);
      console.log(`      Implementation: ${rec.implementation}\n`);
    });

    console.log('📈 Market Insights:');
    console.log(`   Dominant Hook: ${result.market_insights.dominant_hook_type}`);
    console.log(`   Dominant Format: ${result.market_insights.dominant_format}`);
    console.log(`   Avg Competitor Ads: ${result.market_insights.average_competitor_ad_count}\n`);

    console.log('✅ Test Passed!\n');

    return result;
  } catch (error) {
    console.error('❌ Test Failed:', error);
    throw error;
  }
}

/**
 * Test retrieving an analysis by ID
 */
async function testGetAnalysisById(analysisId: string) {
  console.log(`🧪 Testing GET /api/competitor-analyses/${analysisId}...\n`);

  const API_URL = process.env.API_URL || 'http://localhost:1002';
  const endpoint = `${API_URL}/api/competitor-analyses/${analysisId}`;

  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const analysis = await response.json();

    console.log('✅ Analysis Retrieved!\n');
    console.log('📊 Analysis Details:');
    console.log(`   ID: ${analysis.analysis_id}`);
    console.log(`   Subject: ${analysis.subject_brand_name}`);
    console.log(`   Total Ads: ${analysis.total_subject_ads + analysis.total_competitor_ads}`);
    console.log(`   Analyzed At: ${analysis.analyzed_at}\n`);

    console.log('✅ Test Passed!\n');

    return analysis;
  } catch (error) {
    console.error('❌ Test Failed:', error);
    throw error;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting Competitive Analysis Tests\n');
  console.log('=' .repeat(60));
  console.log('');

  // Check if test data has been configured
  if (testCompetitorSet.competitors[0].domain.includes('YOUR_SUBJECT_BRAND')) {
    console.log('⚠️  WARNING: Test data not configured!');
    console.log('');
    console.log('Please edit scripts/test-competitor-analysis.ts and replace:');
    console.log('  - YOUR_SUBJECT_BRAND with a real Facebook page URL');
    console.log('  - COMPETITOR_1 through COMPETITOR_5 with real competitor URLs');
    console.log('');
    console.log('Example URLs:');
    console.log('  - https://www.facebook.com/nike');
    console.log('  - https://www.facebook.com/adidas');
    console.log('');
    console.log('Skipping live API test.\n');
    return;
  }

  try {
    // Test 1: Create new analysis
    console.log('Test 1: POST /api/analyze-competitor-set');
    console.log('-'.repeat(60));
    const result = await testCompetitiveAnalysisAPI();
    console.log('');

    // Test 2: Retrieve analysis by ID
    console.log('Test 2: GET /api/competitor-analyses/:id');
    console.log('-'.repeat(60));
    await testGetAnalysisById(result.analysis_id);
    console.log('');

    console.log('=' .repeat(60));
    console.log('✅ All Tests Passed!');
    console.log('');
    console.log('📚 Next Steps:');
    console.log('  1. Check database: SELECT * FROM adspy_competitor_analyses LIMIT 1;');
    console.log('  2. Integrate with n8n workflow');
    console.log('  3. Test with real competitor sets from your industry');
    console.log('');

  } catch (error) {
    console.error('❌ Tests Failed!');
    console.error('');
    console.error('Troubleshooting:');
    console.error('  1. Ensure API server is running: pm2 status ads-intel-api');
    console.error('  2. Check DATABASE_URL is set in .env');
    console.error('  3. Verify GEMINI_API_KEY is set (required for hook categorization)');
    console.error('  4. Check API logs: pm2 logs ads-intel-api');
    console.error('');
    process.exit(1);
  }
}

// Run tests
runTests();
