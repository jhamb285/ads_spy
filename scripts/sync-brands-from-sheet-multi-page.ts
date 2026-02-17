/**
 * Sync Brands from Google Sheets (Multi-Page Support)
 *
 * This script syncs brands and their multiple pages from Google Sheets to the database.
 * It supports two sheet structures:
 *
 * Structure A (Legacy - Single Page):
 *   "Brands" tab with columns: Avatar, Brand Name, Facebook Page URL, Active, Min Active Days
 *   → Automatically migrates to Structure B
 *
 * Structure B (Multi-Page):
 *   "Brands" tab: Avatar, Brand Name, Active, Min Active Days
 *   "Brand Pages" tab: Brand Name, Page URL, Page Name, Active
 *
 * Usage:
 *   npm run sync-brands                    # Sync from sheet to database
 *   npm run sync-brands -- --write-back    # Two-way sync (write stats to sheet)
 */

import 'dotenv/config';
import { GoogleSpreadsheet, GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { getPool, initializeDatabase, closeDatabase } from '../src/storage';

interface BrandRow {
  avatar: string;
  brandName: string;
  active: boolean;
  minActiveDays: number;
}

interface PageRow {
  brandName: string;
  pageUrl: string;
  pageName: string | null;
  active: boolean;
}

/**
 * Validate Facebook page URL format
 */
function isValidFacebookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'www.facebook.com' || parsed.hostname === 'facebook.com';
  } catch {
    return false;
  }
}

/**
 * Parse brand row from Google Sheet
 */
function parseBrandRow(row: any, rowIndex: number): BrandRow | null {
  const avatar = row.get('Avatar') || row.get('avatar');
  const brandName = row.get('Brand Name') || row.get('brand_name') || row.get('brandName');
  const activeStr = (row.get('Active') || row.get('active') || 'TRUE').toString().toUpperCase();
  const minActiveDaysStr = row.get('Min Active Days') || row.get('min_active_days') || row.get('minActiveDays') || '0';

  // Validation
  if (!brandName) {
    console.warn(`⚠️  Row ${rowIndex + 2}: Missing Brand Name, skipping`);
    return null;
  }

  const active = activeStr === 'TRUE' || activeStr === '1' || activeStr === 'YES';
  const minActiveDays = parseInt(minActiveDaysStr) || 0;

  return {
    avatar: avatar || brandName,
    brandName,
    active,
    minActiveDays
  };
}

/**
 * Parse page row from Google Sheet
 */
function parsePageRow(row: any, rowIndex: number): PageRow | null {
  const brandName = row.get('Brand Name') || row.get('brand_name') || row.get('brandName');
  const pageUrl = row.get('Page URL') || row.get('page_url') || row.get('pageUrl');
  const pageName = row.get('Page Name') || row.get('page_name') || row.get('pageName') || null;
  const activeStr = (row.get('Active') || row.get('active') || 'TRUE').toString().toUpperCase();

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

  return {
    brandName,
    pageUrl,
    pageName,
    active
  };
}

/**
 * Detect if using legacy single-page structure
 */
function hasLegacyStructure(brandsSheet: GoogleSpreadsheetWorksheet): boolean {
  const headers = brandsSheet.headerValues;
  return headers.some(h =>
    h.toLowerCase().includes('facebook') ||
    h.toLowerCase().includes('page_url') ||
    h.toLowerCase().includes('pageurl')
  );
}

/**
 * Migrate legacy structure to multi-page structure
 */
async function migrateLegacyStructure(
  doc: GoogleSpreadsheet,
  brandsSheet: GoogleSpreadsheetWorksheet
): Promise<{ brandsSheet: GoogleSpreadsheetWorksheet, pagesSheet: GoogleSpreadsheetWorksheet }> {
  console.log('\n📋 Legacy structure detected. Migrating to multi-page structure...\n');

  // Read existing data
  const oldRows = await brandsSheet.getRows();
  const legacyData: Array<{ brand: BrandRow, pageUrl: string }> = [];

  for (let i = 0; i < oldRows.length; i++) {
    const avatar = oldRows[i].get('Avatar') || oldRows[i].get('avatar');
    const brandName = oldRows[i].get('Brand Name') || oldRows[i].get('brand_name') || oldRows[i].get('brandName');
    const pageUrl = oldRows[i].get('Facebook Page URL') || oldRows[i].get('page_url') || oldRows[i].get('pageUrl');
    const activeStr = (oldRows[i].get('Active') || oldRows[i].get('active') || 'TRUE').toString().toUpperCase();
    const minActiveDaysStr = oldRows[i].get('Min Active Days') || oldRows[i].get('min_active_days') || oldRows[i].get('minActiveDays') || '0';

    if (brandName && pageUrl) {
      legacyData.push({
        brand: {
          avatar: avatar || brandName,
          brandName,
          active: activeStr === 'TRUE' || activeStr === '1' || activeStr === 'YES',
          minActiveDays: parseInt(minActiveDaysStr) || 0
        },
        pageUrl
      });
    }
  }

  console.log(`   Found ${legacyData.length} brands with pages\n`);

  // Delete old Brands sheet
  await brandsSheet.delete();
  console.log('   🗑️  Deleted old "Brands" sheet');

  // Create new Brands sheet (without page URL)
  const newBrandsSheet = await doc.addSheet({
    title: 'Brands',
    headerValues: ['Avatar', 'Brand Name', 'Active', 'Min Active Days', 'Total Pages', 'Total Ads Scraped', 'Last Scraped']
  });
  console.log('   ✅ Created new "Brands" sheet');

  // Create Brand Pages sheet
  const pagesSheet = await doc.addSheet({
    title: 'Brand Pages',
    headerValues: ['Brand Name', 'Page URL', 'Page Name', 'Active', 'Total Ads Scraped', 'Last Scraped']
  });
  console.log('   ✅ Created "Brand Pages" sheet');

  // Populate new sheets with legacy data
  const brandRows = legacyData.map(item => ({
    'Avatar': item.brand.avatar,
    'Brand Name': item.brand.brandName,
    'Active': item.brand.active ? 'TRUE' : 'FALSE',
    'Min Active Days': item.brand.minActiveDays,
    'Total Pages': '1',
    'Total Ads Scraped': '',
    'Last Scraped': ''
  }));

  const pageRows = legacyData.map(item => ({
    'Brand Name': item.brand.brandName,
    'Page URL': item.pageUrl,
    'Page Name': 'Main Page',
    'Active': 'TRUE',
    'Total Ads Scraped': '',
    'Last Scraped': ''
  }));

  await newBrandsSheet.addRows(brandRows);
  await pagesSheet.addRows(pageRows);

  console.log(`   ✅ Migrated ${brandRows.length} brands and ${pageRows.length} pages\n`);
  console.log('   ⚠️  Migration complete. Please review the new sheets.\n');

  return { brandsSheet: newBrandsSheet, pagesSheet };
}

/**
 * Main sync function
 */
export async function syncBrandsFromSheet(writeBack: boolean = false): Promise<void> {
  console.log('📊 Starting Google Sheets → Database brand sync (Multi-Page)...\n');

  // Validate environment variables
  const sheetsId = process.env.GOOGLE_SHEETS_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!sheetsId || !serviceAccountEmail || !serviceAccountKey) {
    console.error('❌ Missing required environment variables:');
    if (!sheetsId) console.error('   - GOOGLE_SHEETS_ID');
    if (!serviceAccountEmail) console.error('   - GOOGLE_SERVICE_ACCOUNT_EMAIL');
    if (!serviceAccountKey) console.error('   - GOOGLE_SERVICE_ACCOUNT_KEY');
    console.error('\nPlease set these in your .env file. See GOOGLE_SHEETS_SETUP.md for instructions.\n');
    process.exit(1);
  }

  // Initialize database
  initializeDatabase();
  const pool = getPool();

  try {
    // Load Google Sheet
    console.log(`📄 Loading Google Sheet: ${sheetsId}`);

    // Clean up private key
    let privateKey = serviceAccountKey.trim();
    if (privateKey.startsWith('"')) {
      privateKey = privateKey.substring(1);
    }
    if (privateKey.endsWith('",') || privateKey.endsWith('"')) {
      privateKey = privateKey.replace(/",?$/, '');
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    const serviceAccountAuth = new JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(sheetsId, serviceAccountAuth);

    await doc.loadInfo();
    console.log(`✅ Connected to sheet: "${doc.title}"\n`);

    // Find or create sheets
    let brandsSheet = doc.sheetsByTitle['Brands'];
    let pagesSheet = doc.sheetsByTitle['Brand Pages'];

    // Handle legacy structure
    if (brandsSheet && hasLegacyStructure(brandsSheet)) {
      const migrated = await migrateLegacyStructure(doc, brandsSheet);
      brandsSheet = migrated.brandsSheet;
      pagesSheet = migrated.pagesSheet;
      console.log('⚠️  Please re-run sync after reviewing the migrated sheets.\n');
      return;
    }

    // Create sheets if they don't exist
    if (!brandsSheet) {
      console.log('📝 "Brands" tab not found. Creating it...');
      brandsSheet = await doc.addSheet({
        title: 'Brands',
        headerValues: ['Avatar', 'Brand Name', 'Active', 'Min Active Days', 'Total Pages', 'Total Ads Scraped', 'Last Scraped']
      });
      console.log('✅ Created "Brands" tab with headers\n');
    }

    if (!pagesSheet) {
      console.log('📝 "Brand Pages" tab not found. Creating it...');
      pagesSheet = await doc.addSheet({
        title: 'Brand Pages',
        headerValues: ['Brand Name', 'Page URL', 'Page Name', 'Active', 'Total Ads Scraped', 'Last Scraped']
      });
      console.log('✅ Created "Brand Pages" tab with headers\n');
    }

    // Load rows from sheets
    const brandRows = await brandsSheet.getRows();
    const pageRows = await pagesSheet.getRows();

    console.log(`📋 Found ${brandRows.length} brands and ${pageRows.length} pages in sheets\n`);

    if (brandRows.length === 0 && pageRows.length === 0) {
      console.log('⚠️  No data found in sheets. Add brands and pages, then run sync again.\n');
      return;
    }

    // Parse brands
    const validBrands: BrandRow[] = [];
    for (let i = 0; i < brandRows.length; i++) {
      const brand = parseBrandRow(brandRows[i], i);
      if (brand) {
        validBrands.push(brand);
      }
    }

    console.log(`✅ Parsed ${validBrands.length} valid brands\n`);

    // Parse pages
    const validPages: PageRow[] = [];
    for (let i = 0; i < pageRows.length; i++) {
      const page = parsePageRow(pageRows[i], i);
      if (page) {
        validPages.push(page);
      }
    }

    console.log(`✅ Parsed ${validPages.length} valid pages\n`);

    // Sync brands to database
    console.log('🔄 Syncing brands to database...\n');

    let brandsInserted = 0;
    let brandsUpdated = 0;
    let brandsSkipped = 0;

    for (const brand of validBrands) {
      try {
        // Check if brand exists
        const existing = await pool.query(
          'SELECT id, active, avatar, min_active_days FROM adspy_brands WHERE brand_name = $1',
          [brand.brandName]
        );

        if (existing.rowCount === 0) {
          // Insert new brand
          await pool.query(`
            INSERT INTO adspy_brands (avatar, brand_name, active, min_active_days)
            VALUES ($1, $2, $3, $4)
          `, [brand.avatar, brand.brandName, brand.active, brand.minActiveDays]);

          console.log(`   ➕ Inserted brand: ${brand.brandName} (${brand.active ? 'active' : 'inactive'})`);
          brandsInserted++;
        } else {
          // Update existing brand if changed
          const existingBrand = existing.rows[0];
          const hasChanges =
            existingBrand.avatar !== brand.avatar ||
            existingBrand.active !== brand.active ||
            existingBrand.min_active_days !== brand.minActiveDays;

          if (hasChanges) {
            await pool.query(`
              UPDATE adspy_brands
              SET avatar = $1, active = $2, min_active_days = $3, updated_at = NOW()
              WHERE brand_name = $4
            `, [brand.avatar, brand.active, brand.minActiveDays, brand.brandName]);

            console.log(`   🔄 Updated brand: ${brand.brandName}`);
            brandsUpdated++;
          } else {
            brandsSkipped++;
          }
        }
      } catch (error: any) {
        console.error(`   ❌ Error syncing brand "${brand.brandName}": ${error.message}`);
      }
    }

    // Sync pages to database
    console.log('\n🔄 Syncing pages to database...\n');

    let pagesInserted = 0;
    let pagesUpdated = 0;
    let pagesSkipped = 0;

    for (const page of validPages) {
      try {
        // Get brand ID
        const brandResult = await pool.query(
          'SELECT id FROM adspy_brands WHERE brand_name = $1',
          [page.brandName]
        );

        if (brandResult.rowCount === 0) {
          console.warn(`   ⚠️  Brand "${page.brandName}" not found for page ${page.pageUrl}, skipping`);
          continue;
        }

        const brandId = brandResult.rows[0].id;

        // Check if page exists
        const existing = await pool.query(
          'SELECT id, page_name, is_active FROM adspy_brand_pages WHERE brand_id = $1 AND page_url = $2',
          [brandId, page.pageUrl]
        );

        if (existing.rowCount === 0) {
          // Insert new page
          await pool.query(`
            INSERT INTO adspy_brand_pages (brand_id, page_url, page_name, is_active)
            VALUES ($1, $2, $3, $4)
          `, [brandId, page.pageUrl, page.pageName, page.active]);

          console.log(`   ➕ Inserted page: ${page.brandName} → ${page.pageName || page.pageUrl.substring(0, 50)}`);
          pagesInserted++;
        } else {
          // Update existing page if changed
          const existingPage = existing.rows[0];
          const hasChanges =
            existingPage.page_name !== page.pageName ||
            existingPage.is_active !== page.active;

          if (hasChanges) {
            await pool.query(`
              UPDATE adspy_brand_pages
              SET page_name = $1, is_active = $2, updated_at = NOW()
              WHERE brand_id = $3 AND page_url = $4
            `, [page.pageName, page.active, brandId, page.pageUrl]);

            console.log(`   🔄 Updated page: ${page.brandName} → ${page.pageName || page.pageUrl.substring(0, 50)}`);
            pagesUpdated++;
          } else {
            pagesSkipped++;
          }
        }
      } catch (error: any) {
        console.error(`   ❌ Error syncing page "${page.pageUrl}": ${error.message}`);
      }
    }

    // Write back stats to sheet (if enabled)
    if (writeBack) {
      console.log('\n📤 Writing stats back to Google Sheet...\n');

      // Update Brands sheet with totals
      for (let i = 0; i < brandRows.length; i++) {
        const brandName = brandRows[i].get('Brand Name') || brandRows[i].get('brand_name') || brandRows[i].get('brandName');

        if (!brandName) continue;

        // Get brand stats
        const statsResult = await pool.query(`
          SELECT
            (SELECT COUNT(*) FROM adspy_brand_pages WHERE brand_id = b.id) as total_pages,
            (SELECT SUM(total_ads_scraped) FROM adspy_brand_pages WHERE brand_id = b.id) as total_ads,
            (SELECT MAX(last_scraped_at) FROM adspy_brand_pages WHERE brand_id = b.id) as last_scraped
          FROM adspy_brands b
          WHERE b.brand_name = $1
        `, [brandName]);

        if (statsResult.rowCount > 0) {
          const stats = statsResult.rows[0];
          brandRows[i].set('Total Pages', (stats.total_pages || 0).toString());
          brandRows[i].set('Total Ads Scraped', (stats.total_ads || 0).toString());
          brandRows[i].set('Last Scraped', stats.last_scraped ? new Date(stats.last_scraped).toISOString() : '');
        }
      }

      await brandsSheet.saveUpdatedCells();
      console.log('   ✅ Brand stats written to sheet');

      // Update Brand Pages sheet with stats
      for (let i = 0; i < pageRows.length; i++) {
        const brandName = pageRows[i].get('Brand Name') || pageRows[i].get('brand_name') || pageRows[i].get('brandName');
        const pageUrl = pageRows[i].get('Page URL') || pageRows[i].get('page_url') || pageRows[i].get('pageUrl');

        if (!brandName || !pageUrl) continue;

        // Get page stats
        const pageStatsResult = await pool.query(`
          SELECT bp.total_ads_scraped, bp.last_scraped_at
          FROM adspy_brand_pages bp
          JOIN adspy_brands b ON bp.brand_id = b.id
          WHERE b.brand_name = $1 AND bp.page_url = $2
        `, [brandName, pageUrl]);

        if (pageStatsResult.rowCount > 0) {
          const stats = pageStatsResult.rows[0];
          pageRows[i].set('Total Ads Scraped', (stats.total_ads_scraped || 0).toString());
          pageRows[i].set('Last Scraped', stats.last_scraped_at ? new Date(stats.last_scraped_at).toISOString() : '');
        }
      }

      await pagesSheet.saveUpdatedCells();
      console.log('   ✅ Page stats written to sheet');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SYNC SUMMARY');
    console.log('='.repeat(60));
    console.log('BRANDS:');
    console.log(`   Brands inserted:        ${brandsInserted}`);
    console.log(`   Brands updated:         ${brandsUpdated}`);
    console.log(`   Brands skipped:         ${brandsSkipped} (no changes)`);
    console.log('\nPAGES:');
    console.log(`   Pages inserted:         ${pagesInserted}`);
    console.log(`   Pages updated:          ${pagesUpdated}`);
    console.log(`   Pages skipped:          ${pagesSkipped} (no changes)`);
    console.log('='.repeat(60) + '\n');

    if (brandsInserted > 0 || brandsUpdated > 0 || pagesInserted > 0 || pagesUpdated > 0) {
      console.log('✅ Brand and page sync completed successfully!\n');
    } else {
      console.log('✅ Sync completed. No changes needed.\n');
    }

  } catch (error: any) {
    console.error('\n❌ SYNC FAILED\n');
    console.error(`Error: ${error.message}`);

    if (error.message.includes('No authentication')) {
      console.error('\n💡 Make sure:');
      console.error('   1. GOOGLE_SHEETS_ID is correct');
      console.error('   2. Service account has access to the sheet');
      console.error('   3. Sheet is shared with the service account email\n');
    }

    throw error;
  } finally {
    await closeDatabase();
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
