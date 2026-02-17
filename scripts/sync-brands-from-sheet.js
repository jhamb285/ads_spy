"use strict";
/**
 * Sync Brands from Google Sheets
 *
 * This script syncs the adspy_brands table with a Google Sheet named "Brands".
 * It supports two-way sync:
 * - Sheet → Database: Add/update/deactivate brands based on sheet content
 * - Database → Sheet: Optionally write back last_scraped_at and total_ads_scraped
 *
 * Usage:
 *   npm run sync-brands                    # Sync from sheet to database
 *   npm run sync-brands -- --write-back    # Two-way sync (write stats to sheet)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncBrandsFromSheet = syncBrandsFromSheet;
const google_spreadsheet_1 = require("google-spreadsheet");
const storage_1 = require("../src/storage");
/**
 * Validate Facebook page URL format
 */
function isValidFacebookUrl(url) {
    try {
        const parsed = new URL(url);
        return parsed.hostname === 'www.facebook.com' || parsed.hostname === 'facebook.com';
    }
    catch {
        return false;
    }
}
/**
 * Parse brand row from Google Sheet
 */
function parseBrandRow(row, rowIndex) {
    const avatar = row.get('Avatar') || row.get('avatar');
    const brandName = row.get('Brand Name') || row.get('brand_name') || row.get('brandName');
    const pageUrl = row.get('Facebook Page URL') || row.get('page_url') || row.get('pageUrl');
    const activeStr = (row.get('Active') || row.get('active') || 'TRUE').toString().toUpperCase();
    const minActiveDaysStr = row.get('Min Active Days') || row.get('min_active_days') || row.get('minActiveDays') || '0';
    // Validation
    if (!brandName || !pageUrl) {
        console.warn(`⚠️  Row ${rowIndex + 2}: Missing Brand Name or Page URL, skipping`);
        return null;
    }
    if (!isValidFacebookUrl(pageUrl)) {
        console.warn(`⚠️  Row ${rowIndex + 2}: Invalid Facebook URL "${pageUrl}", skipping`);
        return null;
    }
    const active = activeStr === 'TRUE' || activeStr === '1' || activeStr === 'YES';
    const minActiveDays = parseInt(minActiveDaysStr) || 0;
    return {
        avatar: avatar || brandName,
        brandName,
        pageUrl,
        active,
        minActiveDays
    };
}
/**
 * Main sync function
 */
async function syncBrandsFromSheet(writeBack = false) {
    console.log('📊 Starting Google Sheets → Database brand sync...\n');
    // Validate environment variables
    const sheetsId = process.env.GOOGLE_SHEETS_ID;
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!sheetsId || !serviceAccountEmail || !serviceAccountKey) {
        console.error('❌ Missing required environment variables:');
        if (!sheetsId)
            console.error('   - GOOGLE_SHEETS_ID');
        if (!serviceAccountEmail)
            console.error('   - GOOGLE_SERVICE_ACCOUNT_EMAIL');
        if (!serviceAccountKey)
            console.error('   - GOOGLE_SERVICE_ACCOUNT_KEY');
        console.error('\nPlease set these in your .env file. See GOOGLE_SHEETS_SETUP.md for instructions.\n');
        process.exit(1);
    }
    // Initialize database
    (0, storage_1.initializeDatabase)();
    const pool = (0, storage_1.getPool)();
    try {
        // Load Google Sheet
        console.log(`📄 Loading Google Sheet: ${sheetsId}`);
        const doc = new google_spreadsheet_1.GoogleSpreadsheet(sheetsId);
        await doc.useServiceAccountAuth({
            client_email: serviceAccountEmail,
            private_key: serviceAccountKey.replace(/\\n/g, '\n')
        });
        await doc.loadInfo();
        console.log(`✅ Connected to sheet: "${doc.title}"\n`);
        // Find or create "Brands" tab
        let brandsSheet = doc.sheetsByTitle['Brands'];
        if (!brandsSheet) {
            console.log('📝 "Brands" tab not found. Creating it...');
            brandsSheet = await doc.addSheet({
                title: 'Brands',
                headerValues: ['Avatar', 'Brand Name', 'Facebook Page URL', 'Active', 'Min Active Days', 'Last Scraped', 'Total Ads Scraped']
            });
            console.log('✅ Created "Brands" tab with headers\n');
            console.log('⚠️  Sheet is empty. Add brand rows and run sync again.\n');
            return;
        }
        // Load rows from sheet
        const rows = await brandsSheet.getRows();
        console.log(`📋 Found ${rows.length} rows in "Brands" tab\n`);
        if (rows.length === 0) {
            console.log('⚠️  No brand rows found in sheet. Add brands and run sync again.\n');
            return;
        }
        // Parse and validate rows
        const validBrands = [];
        const sheetUrls = [];
        for (let i = 0; i < rows.length; i++) {
            const brand = parseBrandRow(rows[i], i);
            if (brand) {
                validBrands.push(brand);
                sheetUrls.push(brand.pageUrl);
            }
        }
        console.log(`✅ Parsed ${validBrands.length} valid brands\n`);
        if (validBrands.length === 0) {
            console.log('❌ No valid brands to sync. Check sheet format and URLs.\n');
            return;
        }
        // Sync brands to database
        console.log('🔄 Syncing brands to database...\n');
        let insertedCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        for (const brand of validBrands) {
            try {
                // Check if brand exists
                const existing = await pool.query('SELECT id, active, avatar, brand_name, min_active_days FROM adspy_brands WHERE page_url = $1', [brand.pageUrl]);
                if (existing.rowCount === 0) {
                    // Insert new brand
                    await pool.query(`
            INSERT INTO adspy_brands (avatar, brand_name, page_url, active, min_active_days)
            VALUES ($1, $2, $3, $4, $5)
          `, [brand.avatar, brand.brandName, brand.pageUrl, brand.active, brand.minActiveDays]);
                    console.log(`   ➕ Inserted: ${brand.brandName} (${brand.active ? 'active' : 'inactive'})`);
                    insertedCount++;
                }
                else {
                    // Update existing brand if changed
                    const existingBrand = existing.rows[0];
                    const hasChanges = existingBrand.avatar !== brand.avatar ||
                        existingBrand.brand_name !== brand.brandName ||
                        existingBrand.active !== brand.active ||
                        existingBrand.min_active_days !== brand.minActiveDays;
                    if (hasChanges) {
                        await pool.query(`
              UPDATE adspy_brands
              SET avatar = $1, brand_name = $2, active = $3, min_active_days = $4, updated_at = NOW()
              WHERE page_url = $5
            `, [brand.avatar, brand.brandName, brand.active, brand.minActiveDays, brand.pageUrl]);
                        console.log(`   🔄 Updated: ${brand.brandName} (${brand.active ? 'active' : 'inactive'})`);
                        updatedCount++;
                    }
                    else {
                        skippedCount++;
                    }
                }
            }
            catch (error) {
                console.error(`   ❌ Error syncing "${brand.brandName}": ${error.message}`);
                errorCount++;
            }
        }
        // Deactivate brands not in sheet (optional safety mechanism)
        console.log('\n🔍 Checking for brands not in sheet...');
        const deactivateResult = await pool.query(`
      UPDATE adspy_brands
      SET active = false, updated_at = NOW()
      WHERE page_url NOT IN (${sheetUrls.map((_, i) => `$${i + 1}`).join(',')})
      AND active = true
      RETURNING brand_name
    `, sheetUrls);
        if (deactivateResult.rowCount > 0) {
            console.log(`   ⏸️  Deactivated ${deactivateResult.rowCount} brands not in sheet:`);
            deactivateResult.rows.forEach((row) => {
                console.log(`      - ${row.brand_name}`);
            });
        }
        // Write back stats to sheet (if enabled)
        if (writeBack) {
            console.log('\n📤 Writing stats back to Google Sheet...\n');
            const statsMap = new Map();
            // Fetch stats from database
            const stats = await pool.query(`
        SELECT page_url, last_scraped_at, total_ads_scraped
        FROM adspy_brands
        WHERE page_url = ANY($1)
      `, [sheetUrls]);
            stats.rows.forEach((row) => {
                statsMap.set(row.page_url, {
                    lastScraped: row.last_scraped_at,
                    totalAds: row.total_ads_scraped || 0
                });
            });
            // Update sheet rows
            for (let i = 0; i < rows.length; i++) {
                const pageUrl = rows[i].get('Facebook Page URL') || rows[i].get('page_url') || rows[i].get('pageUrl');
                if (pageUrl && statsMap.has(pageUrl)) {
                    const stat = statsMap.get(pageUrl);
                    rows[i].set('Last Scraped', stat.lastScraped ? stat.lastScraped.toISOString() : '');
                    rows[i].set('Total Ads Scraped', stat.totalAds.toString());
                }
            }
            await brandsSheet.saveUpdatedCells();
            console.log('   ✅ Stats written to sheet');
        }
        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 SYNC SUMMARY');
        console.log('='.repeat(60));
        console.log(`   Total rows in sheet:    ${rows.length}`);
        console.log(`   Valid brands parsed:    ${validBrands.length}`);
        console.log(`   Brands inserted:        ${insertedCount}`);
        console.log(`   Brands updated:         ${updatedCount}`);
        console.log(`   Brands skipped:         ${skippedCount} (no changes)`);
        console.log(`   Errors:                 ${errorCount}`);
        if (deactivateResult.rowCount > 0) {
            console.log(`   Brands deactivated:     ${deactivateResult.rowCount} (not in sheet)`);
        }
        console.log('='.repeat(60) + '\n');
        if (insertedCount > 0 || updatedCount > 0) {
            console.log('✅ Brand sync completed successfully!\n');
        }
        else {
            console.log('✅ Brand sync completed. No changes needed.\n');
        }
    }
    catch (error) {
        console.error('\n❌ SYNC FAILED\n');
        console.error(`Error: ${error.message}`);
        if (error.message.includes('No authentication')) {
            console.error('\n💡 Make sure:');
            console.error('   1. GOOGLE_SHEETS_ID is correct');
            console.error('   2. Service account has access to the sheet');
            console.error('   3. Sheet is shared with the service account email\n');
        }
        if (error.message.includes('not found')) {
            console.error('\n💡 Make sure:');
            console.error('   1. The sheet ID is correct');
            console.error('   2. The sheet exists and is accessible');
            console.error('   3. "Brands" tab exists in the sheet\n');
        }
        throw error;
    }
    finally {
        await (0, storage_1.closeDatabase)();
    }
}
// Run if called directly
if (require.main === module) {
    const writeBack = process.argv.includes('--write-back');
    syncBrandsFromSheet(writeBack)
        .then(() => {
        console.log('✅ Sync script finished\n');
        process.exit(0);
    })
        .catch((error) => {
        console.error('\n❌ Sync script failed:', error.message);
        process.exit(1);
    });
}
