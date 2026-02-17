/**
 * Google Sheets Sync Service
 * Syncs brands and pages from database to Google Sheets
 */

import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { getPool } from './storage';

let sheetsEnabled = false;
let spreadsheetId: string = '';
let serviceAccountAuth: JWT | null = null;

/**
 * Initialize Google Sheets sync
 */
export function initializeSheetSync(
  sheetId?: string,
  serviceAccountEmail?: string,
  serviceAccountKey?: string
): void {
  if (!sheetId || !serviceAccountEmail || !serviceAccountKey) {
    console.log('ℹ️  Google Sheets sync disabled (credentials not configured)');
    return;
  }

  try {
    spreadsheetId = sheetId;
    serviceAccountAuth = new JWT({
      email: serviceAccountEmail,
      key: serviceAccountKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    sheetsEnabled = true;
    console.log(`✅ Google Sheets sync initialized: ${sheetId}`);
  } catch (error) {
    console.error('❌ Failed to initialize Google Sheets sync:', error);
  }
}

/**
 * Check if sheets sync is enabled
 */
export function isSheetSyncEnabled(): boolean {
  return sheetsEnabled;
}

/**
 * Get or create "Brands" sheet
 */
async function getBrandsSheet(doc: GoogleSpreadsheet): Promise<GoogleSpreadsheetWorksheet> {
  let sheet = doc.sheetsByTitle['Brands'];

  if (!sheet) {
    console.log('📄 Creating "Brands" sheet...');
    sheet = await doc.addSheet({
      title: 'Brands',
      headerValues: ['ID', 'Avatar', 'Brand Name', 'Active', 'Min Active Days', 'Total Pages', 'Total Ads', 'Last Scraped', 'Created At'],
    });
  }

  return sheet;
}

/**
 * Get or create "Brand Pages" sheet
 */
async function getBrandPagesSheet(doc: GoogleSpreadsheet): Promise<GoogleSpreadsheetWorksheet> {
  let sheet = doc.sheetsByTitle['Brand Pages'];

  if (!sheet) {
    console.log('📄 Creating "Brand Pages" sheet...');
    sheet = await doc.addSheet({
      title: 'Brand Pages',
      headerValues: ['Page ID', 'Brand Name', 'Page URL', 'Page Name', 'Active', 'Total Ads', 'Last Scraped', 'Created At'],
    });
  }

  return sheet;
}

/**
 * Sync all brands to Google Sheets
 */
export async function syncBrandsToSheet(): Promise<void> {
  if (!sheetsEnabled || !serviceAccountAuth) {
    console.log('⏭️  Skipping Google Sheets sync (disabled)');
    return;
  }

  try {
    console.log('📊 Syncing brands to Google Sheets...');

    const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
    await doc.loadInfo();

    const brandsSheet = await getBrandsSheet(doc);
    const pagesSheet = await getBrandPagesSheet(doc);

    // Get brands from database
    const db = getPool();
    const brandsResult = await db.query(`
      SELECT
        b.id,
        b.avatar,
        b.brand_name,
        b.active,
        b.min_active_days,
        b.created_at,
        COUNT(DISTINCT bp.id) as total_pages,
        COUNT(DISTINCT a.id) as total_ads,
        MAX(bp.last_scraped_at) as last_scraped
      FROM adspy_brands b
      LEFT JOIN adspy_brand_pages bp ON b.id = bp.brand_id
      LEFT JOIN adspy_ads a ON a.brand_id = b.id
      GROUP BY b.id
      ORDER BY b.brand_name ASC
    `);

    // Get pages from database
    const pagesResult = await db.query(`
      SELECT
        bp.id as page_id,
        b.brand_name,
        bp.page_url,
        bp.page_name,
        bp.is_active,
        bp.total_ads_scraped,
        bp.last_scraped_at,
        bp.created_at
      FROM adspy_brand_pages bp
      JOIN adspy_brands b ON bp.brand_id = b.id
      ORDER BY b.brand_name ASC, bp.page_url ASC
    `);

    // Clear existing rows and add new data
    await brandsSheet.clearRows();

    if (brandsResult.rows.length > 0) {
      const brandRows = brandsResult.rows.map((brand: any) => ({
        ID: brand.id,
        Avatar: brand.avatar || '',
        'Brand Name': brand.brand_name,
        Active: brand.active ? 'TRUE' : 'FALSE',
        'Min Active Days': brand.min_active_days || 0,
        'Total Pages': brand.total_pages || 0,
        'Total Ads': brand.total_ads || 0,
        'Last Scraped': brand.last_scraped ? new Date(brand.last_scraped).toLocaleString() : 'Never',
        'Created At': brand.created_at ? new Date(brand.created_at).toLocaleDateString() : '',
      }));

      await brandsSheet.addRows(brandRows);
      console.log(`✅ Synced ${brandRows.length} brands to sheet`);
    }

    // Sync brand pages
    await pagesSheet.clearRows();

    if (pagesResult.rows.length > 0) {
      const pageRows = pagesResult.rows.map((page: any) => ({
        'Page ID': page.page_id,
        'Brand Name': page.brand_name,
        'Page URL': page.page_url,
        'Page Name': page.page_name || '',
        Active: page.is_active ? 'TRUE' : 'FALSE',
        'Total Ads': page.total_ads_scraped || 0,
        'Last Scraped': page.last_scraped_at ? new Date(page.last_scraped_at).toLocaleString() : 'Never',
        'Created At': page.created_at ? new Date(page.created_at).toLocaleDateString() : '',
      }));

      await pagesSheet.addRows(pageRows);
      console.log(`✅ Synced ${pageRows.length} pages to sheet`);
    }

    console.log('✅ Google Sheets sync complete');
  } catch (error) {
    console.error('❌ Failed to sync to Google Sheets:', error);
  }
}

/**
 * Sync a single brand to Google Sheets (after add/update/delete)
 */
export async function syncSingleBrandToSheet(brandId?: number): Promise<void> {
  if (!sheetsEnabled) {
    return;
  }

  // For simplicity, just sync all brands
  // In a production system, you could optimize this to update only the changed row
  await syncBrandsToSheet();
}
