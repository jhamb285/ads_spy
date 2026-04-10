/**
 * Migration Verification Script
 *
 * Verifies that the multi-page migration has been completed successfully.
 * Checks database schema, data integrity, and relationships.
 *
 * Usage:
 *   npm run verify-migration
 */

import 'dotenv/config';
import { Pool } from 'pg';
import * as readline from 'readline';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: CheckResult[] = [];

/**
 * Helper to run a check and record result
 */
async function check(name: string, fn: () => Promise<{ passed: boolean; message: string; details?: any }>): Promise<void> {
  try {
    const result = await fn();
    results.push({
      name,
      passed: result.passed,
      message: result.message,
      details: result.details
    });

    if (result.passed) {
      console.log(`✅ ${name}`);
      if (result.details) {
        console.log(`   ${result.message}`);
      }
    } else {
      console.log(`❌ ${name}`);
      console.log(`   ${result.message}`);
    }
  } catch (error: any) {
    results.push({
      name,
      passed: false,
      message: `Error: ${error.message}`
    });
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

async function main() {
  console.log('\n🔍 AdSpy Multi-Page Migration Verification\n');
  console.log('='.repeat(60));
  console.log('\n');

  // 1. Check database connection
  await check('Database Connection', async () => {
    const result = await pool.query('SELECT NOW()');
    return {
      passed: true,
      message: `Connected to database`
    };
  });

  // 2. Check if adspy_brand_pages table exists
  await check('adspy_brand_pages table exists', async () => {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'adspy_brand_pages'
      ) as exists
    `);

    return {
      passed: result.rows[0].exists,
      message: result.rows[0].exists
        ? 'Table exists'
        : 'Table missing - run migration first'
    };
  });

  // 3. Check if adspy_settings table exists
  await check('adspy_settings table exists', async () => {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'adspy_settings'
      ) as exists
    `);

    return {
      passed: result.rows[0].exists,
      message: result.rows[0].exists
        ? 'Table exists'
        : 'Table missing - run migration first'
    };
  });

  // 4. Check if new columns exist on adspy_brands
  await check('adspy_brands has override columns', async () => {
    const columnsToCheck = ['max_ads_override', 'max_daily_ads_override', 'use_overrides'];
    const missingColumns: string[] = [];

    for (const col of columnsToCheck) {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_name = 'adspy_brands' AND column_name = $1
        ) as exists
      `, [col]);

      if (!result.rows[0].exists) {
        missingColumns.push(col);
      }
    }

    return {
      passed: missingColumns.length === 0,
      message: missingColumns.length === 0
        ? 'All override columns present'
        : `Missing columns: ${missingColumns.join(', ')}`
    };
  });

  // 5. Check if old page_url column removed from adspy_brands
  await check('Old page_url column removed from adspy_brands', async () => {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'adspy_brands' AND column_name = 'page_url'
      ) as exists
    `);

    return {
      passed: !result.rows[0].exists,
      message: result.rows[0].exists
        ? 'Old column still exists - migration incomplete'
        : 'Old column removed successfully'
    };
  });

  // 6. Check default settings exist
  await check('Default settings exist', async () => {
    const result = await pool.query(`
      SELECT key, value FROM adspy_settings
      WHERE key IN ('scraper_enabled', 'max_ads_per_brand', 'max_daily_ads_per_brand')
      ORDER BY key
    `);

    const expected = ['max_ads_per_brand', 'max_daily_ads_per_brand', 'scraper_enabled'];
    const found = result.rows.map(r => r.key);
    const missing = expected.filter(k => !found.includes(k));

    return {
      passed: missing.length === 0,
      message: missing.length === 0
        ? `All 3 settings present`
        : `Missing settings: ${missing.join(', ')}`,
      details: result.rows
    };
  });

  // 7. Check brand pages data
  await check('Brand pages populated', async () => {
    const pageCount = await pool.query('SELECT COUNT(*) FROM adspy_brand_pages');
    const brandCount = await pool.query('SELECT COUNT(*) FROM adspy_brands');

    const pages = parseInt(pageCount.rows[0].count);
    const brands = parseInt(brandCount.rows[0].count);

    return {
      passed: pages > 0,
      message: `${brands} brands, ${pages} pages`,
      details: { brands, pages }
    };
  });

  // 8. Check foreign key relationships
  await check('Foreign key constraints valid', async () => {
    const orphanedPages = await pool.query(`
      SELECT COUNT(*) FROM adspy_brand_pages bp
      WHERE NOT EXISTS (
        SELECT 1 FROM adspy_brands b WHERE b.id = bp.brand_id
      )
    `);

    const orphans = parseInt(orphanedPages.rows[0].count);

    return {
      passed: orphans === 0,
      message: orphans === 0
        ? 'No orphaned pages'
        : `${orphans} orphaned pages found`
    };
  });

  // 9. Check indexes exist
  await check('Required indexes exist', async () => {
    const indexes = await pool.query(`
      SELECT indexname FROM pg_indexes
      WHERE tablename = 'adspy_brand_pages'
      AND indexname IN ('idx_brand_pages_brand_id', 'idx_brand_pages_active', 'idx_brand_pages_last_scraped')
    `);

    const expectedIndexes = 3;
    const foundIndexes = indexes.rowCount || 0;

    return {
      passed: foundIndexes === expectedIndexes,
      message: `${foundIndexes}/${expectedIndexes} indexes present`
    };
  });

  // 10. Check unique constraint on brand_id + page_url
  await check('Unique constraint on brand_id + page_url', async () => {
    const constraints = await pool.query(`
      SELECT constraint_name FROM information_schema.table_constraints
      WHERE table_name = 'adspy_brand_pages'
      AND constraint_type = 'UNIQUE'
    `);

    return {
      passed: constraints.rowCount! > 0,
      message: constraints.rowCount! > 0
        ? 'Unique constraint exists'
        : 'Missing unique constraint'
    };
  });

  // 11. Check triggers exist
  await check('Update triggers exist', async () => {
    const triggers = await pool.query(`
      SELECT trigger_name FROM information_schema.triggers
      WHERE event_object_table IN ('adspy_brand_pages', 'adspy_settings')
      AND trigger_name LIKE '%updated_at%'
    `);

    return {
      passed: triggers.rowCount! >= 2,
      message: `${triggers.rowCount || 0} update triggers found`
    };
  });

  // 12. Test sample queries
  await check('Sample brand with pages query works', async () => {
    const result = await pool.query(`
      SELECT b.*,
        COALESCE(json_agg(
          json_build_object(
            'id', bp.id,
            'page_url', bp.page_url,
            'page_name', bp.page_name,
            'is_active', bp.is_active
          ) ORDER BY bp.created_at
        ) FILTER (WHERE bp.id IS NOT NULL), '[]'::json) as pages
      FROM adspy_brands b
      LEFT JOIN adspy_brand_pages bp ON b.id = bp.brand_id
      WHERE b.active = true
      GROUP BY b.id
      LIMIT 1
    `);

    if (result.rowCount === 0) {
      return {
        passed: true,
        message: 'No active brands (query works, no data)'
      };
    }

    const brand = result.rows[0];
    const pages = brand.pages;

    return {
      passed: true,
      message: `Sample: "${brand.brand_name}" has ${pages.length} page(s)`
    };
  });

  // 13. Check data integrity
  await check('Data integrity check', async () => {
    const issues: string[] = [];

    // Check for brands with no pages
    const brandsWithoutPages = await pool.query(`
      SELECT COUNT(*) FROM adspy_brands b
      WHERE b.active = true
      AND NOT EXISTS (
        SELECT 1 FROM adspy_brand_pages bp WHERE bp.brand_id = b.id
      )
    `);

    const noPagesCount = parseInt(brandsWithoutPages.rows[0].count);
    if (noPagesCount > 0) {
      issues.push(`${noPagesCount} active brands have no pages`);
    }

    // Check for duplicate page URLs within same brand
    const duplicates = await pool.query(`
      SELECT brand_id, page_url, COUNT(*) as count
      FROM adspy_brand_pages
      GROUP BY brand_id, page_url
      HAVING COUNT(*) > 1
    `);

    if (duplicates.rowCount! > 0) {
      issues.push(`${duplicates.rowCount} duplicate page URLs`);
    }

    return {
      passed: issues.length === 0,
      message: issues.length === 0
        ? 'No integrity issues'
        : issues.join(', ')
    };
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Total Checks: ${total}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);
  console.log('='.repeat(60) + '\n');

  if (failed > 0) {
    console.log('❌ Migration verification FAILED\n');
    console.log('Failed checks:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}: ${r.message}`);
    });
    console.log('\n');
    process.exit(1);
  } else {
    console.log('✅ Migration verification PASSED\n');
    console.log('🎉 All checks passed! Migration completed successfully.\n');
    process.exit(0);
  }
}

// Run verification
main()
  .catch(error => {
    console.error('\n❌ Verification failed with error:', error.message);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
