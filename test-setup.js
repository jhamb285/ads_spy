// Quick test to verify setup is working
require('dotenv').config();
const { Pool } = require('pg');

async function test() {
  console.log('\n🧪 Testing Project 1 Setup...\n');

  // Test 1: Environment variables
  console.log('✅ Test 1: Environment Variables');
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✓' : '✗'}`);
  console.log(`   APIFY_API_TOKEN: ${process.env.APIFY_API_TOKEN ? '✓' : '✗'}`);
  console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✓' : '✗'}`);
  console.log(`   GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '(not set, optional)' : '✓'}`);

  // Test 2: Database connection
  console.log('\n✅ Test 2: Database Connection');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM adspy_brands WHERE active = true');
    console.log(`   Active brands in database: ${result.rows[0].count}`);

    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name LIKE 'adspy%'
    `);
    console.log(`   Tables created: ${tables.rows.map(r => r.table_name).join(', ')}`);
  } catch (error) {
    console.error(`   ✗ Database error: ${error.message}`);
  }

  // Test 3: Sample brands
  console.log('\n✅ Test 3: Sample Brands (first 5)');
  try {
    const brands = await pool.query('SELECT brand_name, page_url, active FROM adspy_brands ORDER BY brand_name LIMIT 5');
    brands.rows.forEach(b => {
      console.log(`   - ${b.brand_name} (${b.active ? 'active' : 'inactive'})`);
    });
  } catch (error) {
    console.error(`   ✗ Error: ${error.message}`);
  }

  await pool.end();

  console.log('\n' + '='.repeat(60));
  console.log('🎉 SETUP TEST COMPLETE');
  console.log('='.repeat(60));
  console.log('\nNext steps:');
  console.log('1. Add Gemini API key to .env (optional but recommended)');
  console.log('2. Set up Slack tokens (or skip for now)');
  console.log('3. Run: npm run cron (to test batch scraping)');
  console.log('4. Or test with a specific brand/ad\n');
}

test().catch(console.error);
