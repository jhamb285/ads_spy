#!/usr/bin/env ts-node

/**
 * Brand Migration Script
 *
 * Migrates the default 112 brands from config.ts to the database
 * Run this once after setting up the database schema
 *
 * Usage: npm run migrate-brands
 */

import dotenv from 'dotenv';
import { DEFAULT_BRAND_LIST } from '../src/config';
import { getPool, initializeDatabase, closeDatabase } from '../src/storage';

// Load environment variables
dotenv.config();

async function migrateBrands() {
  console.log('🚀 Starting brand migration...\n');

  try {
    // Initialize database
    const pool = initializeDatabase();
    console.log('✅ Database connection established\n');

    // Check if brands already exist
    const existingBrandsResult = await pool.query('SELECT COUNT(*) FROM adspy_brands');
    const existingCount = parseInt(existingBrandsResult.rows[0].count, 10);

    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing brands in database`);
      console.log('   This script will add any missing brands from the default list.\n');
    }

    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Insert each brand
    for (const brand of DEFAULT_BRAND_LIST) {
      try {
        // Check if brand already exists
        const existingBrand = await pool.query(
          'SELECT id FROM adspy_brands WHERE page_url = $1',
          [brand.pageUrl]
        );

        if (existingBrand.rowCount && existingBrand.rowCount > 0) {
          console.log(`⏭️  Skipping ${brand.brandName} (already exists)`);
          skippedCount++;
          continue;
        }

        // Insert brand
        await pool.query(`
          INSERT INTO adspy_brands (
            avatar,
            brand_name,
            page_url,
            min_active_days,
            active
          ) VALUES ($1, $2, $3, $4, $5)
        `, [
          brand.avatar,
          brand.brandName,
          brand.pageUrl,
          brand.minActiveDays || 0,
          true
        ]);

        console.log(`✅ Inserted ${brand.brandName}`);
        insertedCount++;
      } catch (error) {
        console.error(`❌ Error inserting ${brand.brandName}:`, error);
        errorCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Brand migration completed!');
    console.log('='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   - Total brands in default list: ${DEFAULT_BRAND_LIST.length}`);
    console.log(`   - Brands inserted: ${insertedCount}`);
    console.log(`   - Brands skipped (already exist): ${skippedCount}`);
    console.log(`   - Errors: ${errorCount}`);
    console.log('='.repeat(60));

    // Verify final count
    const finalCountResult = await pool.query('SELECT COUNT(*) FROM adspy_brands');
    const finalCount = parseInt(finalCountResult.rows[0].count, 10);
    console.log(`\n🎯 Total brands in database: ${finalCount}\n`);

    // Close database connection
    await closeDatabase();
    console.log('✅ Database connection closed\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error during brand migration:', error);
    await closeDatabase();
    process.exit(1);
  }
}

// Run migration
migrateBrands();
