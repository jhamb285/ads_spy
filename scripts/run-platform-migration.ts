/**
 * Run database migration to add platform support
 * Adds platform column to adspy_ads and adspy_competitor_analyses tables
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function runMigration() {
  console.log('🔧 Running platform migration...\n');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    // Read migration SQL file
    const migrationPath = path.join(__dirname, 'migration-add-platform.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Executing migration SQL...\n');

    // Execute migration
    await pool.query(migrationSQL);

    console.log('\n✅ Migration completed successfully!\n');

    // Verify migration
    console.log('🔍 Verifying migration...\n');

    const verifyAdsTable = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'adspy_ads' AND column_name = 'platform'
    `);

    const verifyAnalysesTable = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'adspy_competitor_analyses' AND column_name = 'platform'
    `);

    if (verifyAdsTable.rows.length > 0) {
      console.log('✅ adspy_ads.platform column exists');
      console.log(`   Type: ${verifyAdsTable.rows[0].data_type}`);
      console.log(`   Default: ${verifyAdsTable.rows[0].column_default}`);
    } else {
      console.log('❌ adspy_ads.platform column NOT found!');
    }

    if (verifyAnalysesTable.rows.length > 0) {
      console.log('✅ adspy_competitor_analyses.platform column exists');
      console.log(`   Type: ${verifyAnalysesTable.rows[0].data_type}`);
      console.log(`   Default: ${verifyAnalysesTable.rows[0].column_default}`);
    } else {
      console.log('❌ adspy_competitor_analyses.platform column NOT found!');
    }

    console.log('');

    // Count existing data
    const adsCount = await pool.query(`SELECT COUNT(*) FROM adspy_ads WHERE platform = 'facebook'`);
    const analysesCount = await pool.query(`SELECT COUNT(*) FROM adspy_competitor_analyses WHERE platform = 'facebook'`);

    console.log('📊 Data Summary:');
    console.log(`   - Ads with platform=facebook: ${adsCount.rows[0].count}`);
    console.log(`   - Analyses with platform=facebook: ${analysesCount.rows[0].count}`);
    console.log('');

  } catch (error: any) {
    console.error('❌ Migration failed!');
    console.error('Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('🎉 Migration script completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });
