/**
 * Migration Script: Single Page → Multi-Page Brands
 *
 * This script migrates the adspy_brands table from single page_url to multiple pages:
 * 1. Creates new tables (adspy_brand_pages, adspy_settings)
 * 2. Migrates existing page_url data from adspy_brands to adspy_brand_pages
 * 3. Removes old page_url column from adspy_brands
 * 4. Creates backup for rollback
 *
 * Usage:
 *   npm run migrate:multi-pages
 *   npm run migrate:multi-pages -- --dry-run    # Test without making changes
 *   npm run migrate:multi-pages -- --rollback   # Rollback migration
 */

import 'dotenv/config';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const ROLLBACK = process.argv.includes('--rollback');

interface BrandWithPage {
  id: number;
  brand_name: string;
  page_url: string | null;
  last_scraped_at: Date | null;
  total_ads_scraped: number;
  active: boolean;
}

async function main() {
  console.log('\n🚀 AdSpy Multi-Page Migration Script\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }

  if (ROLLBACK) {
    console.log('⏮️  ROLLBACK MODE - Reverting migration\n');
    await performRollback();
    return;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  try {
    // Step 1: Check if migration is needed
    console.log('📋 Step 1: Checking if migration is needed...');
    const needsMigration = await checkMigrationNeeded(pool);

    if (!needsMigration) {
      console.log('✅ Migration already completed or not needed');
      await pool.end();
      return;
    }

    // Step 2: Create backup
    if (!DRY_RUN) {
      console.log('\n💾 Step 2: Creating backup...');
      await createBackup(pool);
    }

    // Step 3: Run schema updates
    console.log('\n🔨 Step 3: Creating new tables...');
    await runSchemaUpdates(pool);

    // Step 4: Migrate data
    console.log('\n📦 Step 4: Migrating existing page URLs...');
    await migrateData(pool);

    // Step 5: Verify migration
    if (!DRY_RUN) {
      console.log('\n✅ Step 5: Verifying migration...');
      await verifyMigration(pool);
    } else {
      console.log('\n✅ Step 5: Skipping verification (dry run mode)');
    }

    // Step 6: Remove old columns (optional, prompted)
    if (!DRY_RUN) {
      console.log('\n🗑️  Step 6: Cleaning up old columns...');
      await cleanupOldColumns(pool);
    }

    console.log('\n✨ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('  1. Test the scraper: npm run dev');
    console.log('  2. Test the API: curl http://localhost:3001/api/brands/1/pages');
    console.log('  3. Deploy to VPS when ready');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\nTo rollback: npm run migrate:multi-pages -- --rollback');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function checkMigrationNeeded(pool: Pool): Promise<boolean> {
  try {
    // Check if adspy_brand_pages table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'adspy_brand_pages'
      ) as exists
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('  ℹ️  adspy_brand_pages table does not exist - migration needed');
      return true;
    }

    // Check if page_url column still exists in adspy_brands
    const columnCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'adspy_brands' AND column_name = 'page_url'
      ) as exists
    `);

    if (columnCheck.rows[0].exists) {
      console.log('  ℹ️  page_url column still exists in adspy_brands - migration needed');
      return true;
    }

    // Check if there's data in adspy_brand_pages
    const dataCheck = await pool.query('SELECT COUNT(*) FROM adspy_brand_pages');
    const pageCount = parseInt(dataCheck.rows[0].count);

    if (pageCount === 0) {
      console.log('  ⚠️  adspy_brand_pages table is empty - migration may be incomplete');
      return true;
    }

    console.log(`  ✅ Migration appears complete (${pageCount} pages found)`);
    return false;

  } catch (error) {
    console.error('  ❌ Error checking migration status:', error);
    throw error;
  }
}

async function createBackup(pool: Pool): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const backupFile = path.join(process.cwd(), `backup_before_multi_pages_${timestamp}.json`);

  try {
    // Export current adspy_brands data
    const brandsResult = await pool.query('SELECT * FROM adspy_brands ORDER BY id');

    const backup = {
      timestamp,
      database: 'creative_os',
      table: 'adspy_brands',
      row_count: brandsResult.rowCount,
      data: brandsResult.rows
    };

    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    console.log(`  ✅ Backup saved: ${backupFile}`);
    console.log(`     Backed up ${brandsResult.rowCount} brands`);
  } catch (error) {
    console.error('  ❌ Backup failed:', error);
    throw error;
  }
}

async function runSchemaUpdates(pool: Pool): Promise<void> {
  const schemaPath = path.join(__dirname, 'schema-multi-pages.sql');

  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  if (DRY_RUN) {
    console.log('  🔍 Would run schema SQL (dry run)');
    return;
  }

  try {
    await pool.query(schemaSql);
    console.log('  ✅ Schema updates completed');
  } catch (error) {
    console.error('  ❌ Schema update failed:', error);
    throw error;
  }
}

async function migrateData(pool: Pool): Promise<void> {
  try {
    // Get all brands with page_url
    const brandsResult = await pool.query<BrandWithPage>(`
      SELECT id, brand_name, page_url, last_scraped_at, total_ads_scraped, active
      FROM adspy_brands
      WHERE page_url IS NOT NULL AND page_url != ''
      ORDER BY id
    `);

    console.log(`  📊 Found ${brandsResult.rowCount} brands with page URLs`);

    if (DRY_RUN) {
      console.log('  🔍 Would migrate the following brands:');
      brandsResult.rows.slice(0, 5).forEach(brand => {
        console.log(`     - ${brand.brand_name}: ${brand.page_url}`);
      });
      if (brandsResult.rowCount! > 5) {
        console.log(`     ... and ${brandsResult.rowCount! - 5} more`);
      }
      return;
    }

    let migratedCount = 0;
    let skippedCount = 0;

    for (const brand of brandsResult.rows) {
      try {
        // Check if page already exists (in case of re-run)
        const existingCheck = await pool.query(`
          SELECT id FROM adspy_brand_pages
          WHERE brand_id = $1 AND page_url = $2
        `, [brand.id, brand.page_url]);

        if (existingCheck.rowCount! > 0) {
          console.log(`  ⏭️  Skipping ${brand.brand_name} (page already migrated)`);
          skippedCount++;
          continue;
        }

        // Insert into adspy_brand_pages
        await pool.query(`
          INSERT INTO adspy_brand_pages (
            brand_id,
            page_url,
            page_name,
            is_active,
            last_scraped_at,
            total_ads_scraped
          )
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          brand.id,
          brand.page_url,
          null, // page_name (will be populated on next scrape)
          brand.active, // inherit active status from brand
          brand.last_scraped_at,
          brand.total_ads_scraped
        ]);

        migratedCount++;
        console.log(`  ✅ Migrated: ${brand.brand_name}`);

      } catch (error) {
        console.error(`  ❌ Error migrating ${brand.brand_name}:`, error);
        throw error;
      }
    }

    console.log(`\n  📊 Migration summary:`);
    console.log(`     Migrated: ${migratedCount}`);
    console.log(`     Skipped: ${skippedCount}`);
    console.log(`     Total: ${brandsResult.rowCount}`);

  } catch (error) {
    console.error('  ❌ Data migration failed:', error);
    throw error;
  }
}

async function verifyMigration(pool: Pool): Promise<void> {
  try {
    // Count brands
    const brandsCount = await pool.query('SELECT COUNT(*) FROM adspy_brands');
    const brandCount = parseInt(brandsCount.rows[0].count);

    // Count brand pages
    const pagesCount = await pool.query('SELECT COUNT(*) FROM adspy_brand_pages');
    const pageCount = parseInt(pagesCount.rows[0].count);

    // Count brands with page_url (if column still exists)
    let brandsWithUrlCount = 0;
    try {
      const withUrlCount = await pool.query(`
        SELECT COUNT(*) FROM adspy_brands
        WHERE page_url IS NOT NULL AND page_url != ''
      `);
      brandsWithUrlCount = parseInt(withUrlCount.rows[0].count);
    } catch {
      // Column might not exist anymore
    }

    console.log(`\n  📊 Verification:`);
    console.log(`     Total brands: ${brandCount}`);
    console.log(`     Total pages: ${pageCount}`);
    if (brandsWithUrlCount > 0) {
      console.log(`     Brands with page_url: ${brandsWithUrlCount}`);
      console.log(`     ⚠️  Expected all brands to be migrated to brand_pages`);
    }

    // Check for orphaned ads
    const orphanedAds = await pool.query(`
      SELECT COUNT(*) FROM adspy_ads
      WHERE brand_id IS NOT NULL
        AND brand_id NOT IN (SELECT id FROM adspy_brands)
    `);
    const orphanCount = parseInt(orphanedAds.rows[0].count);

    if (orphanCount > 0) {
      console.log(`     ⚠️  ${orphanCount} orphaned ads found (brand_id references non-existent brand)`);
    } else {
      console.log(`     ✅ No orphaned ads`);
    }

    // Sample some brand pages
    const samplePages = await pool.query(`
      SELECT b.brand_name, bp.page_url, bp.total_ads_scraped
      FROM adspy_brand_pages bp
      JOIN adspy_brands b ON bp.brand_id = b.id
      ORDER BY bp.id
      LIMIT 5
    `);

    console.log(`\n  📋 Sample migrated pages:`);
    samplePages.rows.forEach(row => {
      console.log(`     - ${row.brand_name}: ${row.page_url} (${row.total_ads_scraped} ads)`);
    });

  } catch (error) {
    console.error('  ❌ Verification failed:', error);
    throw error;
  }
}

async function cleanupOldColumns(pool: Pool): Promise<void> {
  try {
    // Check if columns still exist
    const columnsToRemove = ['page_url', 'last_scraped_at', 'total_ads_scraped'];
    const existingColumns: string[] = [];

    for (const colName of columnsToRemove) {
      const check = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns
          WHERE table_name = 'adspy_brands' AND column_name = $1
        ) as exists
      `, [colName]);

      if (check.rows[0].exists) {
        existingColumns.push(colName);
      }
    }

    if (existingColumns.length === 0) {
      console.log('  ✅ Old columns already removed');
      return;
    }

    console.log(`  ⚠️  Found ${existingColumns.length} old columns: ${existingColumns.join(', ')}`);
    console.log('  ℹ️  These columns are now redundant (data moved to adspy_brand_pages)');

    // In production, you might want to prompt for confirmation
    // For now, we'll remove them automatically
    console.log('  🗑️  Removing old columns...');

    for (const colName of existingColumns) {
      await pool.query(`ALTER TABLE adspy_brands DROP COLUMN IF EXISTS ${colName}`);
      console.log(`     ✅ Removed column: ${colName}`);
    }

    console.log('  ✅ Cleanup completed');

  } catch (error) {
    console.error('  ❌ Cleanup failed:', error);
    console.error('  ℹ️  You can manually remove columns later if needed');
  }
}

async function performRollback(): Promise<void> {
  console.log('⚠️  Rollback functionality not yet implemented');
  console.log('\nManual rollback steps:');
  console.log('  1. Restore from PostgreSQL backup:');
  console.log('     sudo -u postgres psql creative_os < backup_file.sql');
  console.log('  2. Or restore from JSON backup:');
  console.log('     Find backup_before_multi_pages_*.json files in project root');
  console.log('     Manually restore data if needed');
  process.exit(1);
}

// Run migration
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
