/**
 * API Endpoints Test Script
 *
 * Tests all multi-page and settings API endpoints.
 * Requires API server to be running on localhost:3001
 *
 * Usage:
 *   npm run api  # Start API server in another terminal
 *   npm run test-api
 */

import 'dotenv/config';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1002';

interface TestResult {
  endpoint: string;
  method: string;
  passed: boolean;
  status?: number;
  message: string;
  duration: number;
}

const results: TestResult[] = [];
let testBrandId: number | null = null;
let testPageId: number | null = null;

/**
 * Helper function to make API request
 */
async function request(
  method: string,
  endpoint: string,
  body?: any
): Promise<{ ok: boolean; status: number; data: any }> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = response.ok ? await response.json() : await response.text();
    const duration = Date.now() - startTime;

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error: any) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

/**
 * Run a test and record result
 */
async function test(
  name: string,
  method: string,
  endpoint: string,
  expectedStatus: number,
  body?: any
): Promise<any> {
  const startTime = Date.now();

  try {
    console.log(`Testing: ${method} ${endpoint}...`);

    const result = await request(method, endpoint, body);
    const duration = Date.now() - startTime;

    const passed = result.status === expectedStatus;

    results.push({
      endpoint,
      method,
      passed,
      status: result.status,
      message: passed
        ? `✅ ${result.status} (${duration}ms)`
        : `❌ Expected ${expectedStatus}, got ${result.status}`,
      duration,
    });

    if (passed) {
      console.log(`   ✅ ${result.status} (${duration}ms)`);
    } else {
      console.log(`   ❌ Expected ${expectedStatus}, got ${result.status}`);
      console.log(`   Response:`, result.data);
    }

    return result.data;
  } catch (error: any) {
    const duration = Date.now() - startTime;

    results.push({
      endpoint,
      method,
      passed: false,
      message: `❌ ${error.message}`,
      duration,
    });

    console.log(`   ❌ ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('\n🧪 API Endpoints Test Suite\n');
  console.log(`API URL: ${API_URL}\n`);
  console.log('='.repeat(60));
  console.log('\n');

  // Check if API is running
  try {
    await request('GET', '/health', undefined);
    console.log('✅ API server is running\n');
  } catch (error) {
    console.error('❌ API server is not running!');
    console.error(`   Make sure to start API server: npm run api\n`);
    process.exit(1);
  }

  // 1. SETTINGS API TESTS
  console.log('📋 Testing Settings API\n');

  // GET /api/settings
  const settings = await test(
    'Get global settings',
    'GET',
    '/api/settings',
    200
  );

  // Verify settings structure
  if (settings) {
    console.log('   Settings:', {
      scraper_enabled: settings.scraper_enabled,
      max_ads_per_brand: settings.max_ads_per_brand,
      max_daily_ads_per_brand: settings.max_daily_ads_per_brand,
    });
  }

  // PATCH /api/settings/:key
  await test(
    'Update scraper_enabled setting',
    'PATCH',
    '/api/settings/scraper_enabled',
    200,
    { enabled: true }
  );

  await test(
    'Update max_ads_per_brand setting',
    'PATCH',
    '/api/settings/max_ads_per_brand',
    200,
    { value: 15 }
  );

  await test(
    'Update max_daily_ads_per_brand setting',
    'PATCH',
    '/api/settings/max_daily_ads_per_brand',
    200,
    { value: 5 }
  );

  // GET /api/settings/scraper-status
  await test(
    'Get scraper status',
    'GET',
    '/api/settings/scraper-status',
    200
  );

  // POST /api/settings/reload
  await test(
    'Reload settings on server',
    'POST',
    '/api/settings/reload',
    200
  );

  console.log('\n');

  // 2. BRANDS API TESTS
  console.log('📋 Testing Brands API\n');

  // GET /api/brands
  const brands = await test(
    'Get all brands',
    'GET',
    '/api/brands',
    200
  );

  if (brands && brands.length > 0) {
    testBrandId = brands[0].id;
    console.log(`   Using brand ID ${testBrandId} for tests\n`);
  } else {
    console.log('   ⚠️  No brands found, creating test brand...\n');

    const newBrand = await test(
      'Create test brand',
      'POST',
      '/api/brands',
      201,
      {
        avatar: 'Test',
        brand_name: 'Test Brand for API Testing',
        active: true,
      }
    );

    if (newBrand) {
      testBrandId = newBrand.id;
      console.log(`   Created brand ID ${testBrandId}\n`);
    }
  }

  if (!testBrandId) {
    console.error('❌ No test brand available, cannot continue with brand-specific tests\n');
    process.exit(1);
  }

  console.log('\n');

  // 3. BRAND PAGES API TESTS
  console.log('📋 Testing Brand Pages API\n');

  // GET /api/brands/:id/pages
  await test(
    'Get pages for brand',
    'GET',
    `/api/brands/${testBrandId}/pages`,
    200
  );

  // POST /api/brands/:id/pages
  const newPage = await test(
    'Add page to brand',
    'POST',
    `/api/brands/${testBrandId}/pages`,
    201,
    {
      page_url: `https://www.facebook.com/test-page-${Date.now()}`,
      page_name: 'Test Page',
      is_active: true,
    }
  );

  if (newPage) {
    testPageId = newPage.id;
    console.log(`   Created page ID ${testPageId}\n`);
  }

  // Test duplicate page URL (should fail with 409)
  if (newPage) {
    await test(
      'Add duplicate page URL (should fail)',
      'POST',
      `/api/brands/${testBrandId}/pages`,
      409,
      {
        page_url: newPage.page_url,
        page_name: 'Duplicate',
        is_active: true,
      }
    );
  }

  // PATCH /api/brands/:brandId/pages/:pageId
  if (testPageId) {
    await test(
      'Update page',
      'PATCH',
      `/api/brands/${testBrandId}/pages/${testPageId}`,
      200,
      {
        page_name: 'Updated Test Page',
        is_active: false,
      }
    );
  }

  // GET /api/brands/:id/with-pages
  await test(
    'Get brand with pages',
    'GET',
    `/api/brands/${testBrandId}/with-pages`,
    200
  );

  // GET /api/brands/all-with-pages
  await test(
    'Get all brands with pages',
    'GET',
    '/api/brands/all-with-pages',
    200
  );

  console.log('\n');

  // 4. BRAND SETTINGS API TESTS
  console.log('📋 Testing Brand Settings API\n');

  // GET /api/brands/:id/settings
  await test(
    'Get brand settings',
    'GET',
    `/api/brands/${testBrandId}/settings`,
    200
  );

  // PATCH /api/brands/:id/settings
  await test(
    'Update brand settings',
    'PATCH',
    `/api/brands/${testBrandId}/settings`,
    200,
    {
      use_overrides: true,
      max_ads_override: 20,
      max_daily_ads_override: 7,
    }
  );

  // GET /api/brands/:id/effective-settings
  const effectiveSettings = await test(
    'Get effective brand settings',
    'GET',
    `/api/brands/${testBrandId}/effective-settings`,
    200
  );

  if (effectiveSettings) {
    console.log('   Effective settings:', {
      max_ads_per_brand: effectiveSettings.max_ads_per_brand,
      max_daily_ads_per_brand: effectiveSettings.max_daily_ads_per_brand,
    });
  }

  console.log('\n');

  // 5. CLEANUP
  console.log('📋 Cleanup Test Data\n');

  // DELETE /api/brands/:brandId/pages/:pageId
  if (testPageId) {
    await test(
      'Delete test page',
      'DELETE',
      `/api/brands/${testBrandId}/pages/${testPageId}`,
      204
    );
  }

  // Reset brand settings
  await test(
    'Reset brand settings',
    'PATCH',
    `/api/brands/${testBrandId}/settings`,
    200,
    {
      use_overrides: false,
      max_ads_override: null,
      max_daily_ads_override: null,
    }
  );

  // Reset global settings
  await test(
    'Reset max_ads_per_brand',
    'PATCH',
    '/api/settings/max_ads_per_brand',
    200,
    { value: 10 }
  );

  await test(
    'Reset max_daily_ads_per_brand',
    'PATCH',
    '/api/settings/max_daily_ads_per_brand',
    200,
    { value: 3 }
  );

  console.log('\n');

  // SUMMARY
  console.log('='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  const avgDuration = Math.round(results.reduce((sum, r) => sum + r.duration, 0) / total);

  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);
  console.log(`Average Duration: ${avgDuration}ms`);
  console.log('='.repeat(60) + '\n');

  if (failed > 0) {
    console.log('❌ API Tests FAILED\n');
    console.log('Failed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.method} ${r.endpoint}: ${r.message}`);
    });
    console.log('\n');
    process.exit(1);
  } else {
    console.log('✅ API Tests PASSED\n');
    console.log('🎉 All API endpoints working correctly!\n');
    process.exit(0);
  }
}

// Run tests
main().catch(error => {
  console.error('\n❌ Test suite failed:', error.message);
  process.exit(1);
});
