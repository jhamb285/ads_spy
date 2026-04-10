import { Pool, PoolClient } from 'pg';
import { NormalizedAd } from './normalize';
import { AdAnalysis } from './llm';
import { GeminiAnalysis } from './gemini';

/**
 * PostgreSQL connection pool
 */
let pool: Pool | null = null;

/**
 * Initialize database connection pool
 */
export function initializeDatabase(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    pool = new Pool({
      connectionString,
      // Connection pool settings
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('❌ Unexpected database error:', err);
    });

    console.log('✅ Database connection pool initialized');
  }

  return pool;
}

/**
 * Get database pool (initialize if needed)
 */
export function getPool(): Pool {
  if (!pool) {
    return initializeDatabase();
  }
  return pool;
}

/**
 * Close database connection pool
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔒 Database connection pool closed');
  }
}

/**
 * Check if an ad has been processed (exists in database)
 */
export async function hasAdBeenProcessed(adId: string): Promise<boolean> {
  const db = getPool();

  try {
    const result = await db.query(
      'SELECT 1 FROM adspy_ads WHERE ad_id = $1 LIMIT 1',
      [adId]
    );
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error(`❌ Error checking if ad ${adId} was processed:`, error);
    throw error;
  }
}

/**
 * Get brand ID by page URL (or return null if not found)
 */
export async function getBrandIdByPageUrl(pageUrl: string): Promise<number | null> {
  const db = getPool();

  try {
    const result = await db.query(
      'SELECT id FROM adspy_brands WHERE page_url = $1 LIMIT 1',
      [pageUrl]
    );

    if ((result.rowCount ?? 0) > 0) {
      return result.rows[0].id;
    }

    return null;
  } catch (error) {
    console.error(`❌ Error getting brand ID for ${pageUrl}:`, error);
    return null;
  }
}

/**
 * Save ad to database with full breakdown and analysis
 */
export async function saveAd(
  ad: NormalizedAd,
  geminiAnalysis?: GeminiAnalysis,
  openaiAnalysis?: AdAnalysis,
  platform: 'facebook' | 'google' = 'facebook'
): Promise<void> {
  const db = getPool();

  try {
    // Get brand ID from page URL or brand name
    let brandId: number | null = null;
    if (ad.raw.snapshot?.pageProfileUri) {
      brandId = await getBrandIdByPageUrl(ad.raw.snapshot.pageProfileUri);
    }

    // Prepare Gemini analysis as JSONB
    const geminiBreakdown = geminiAnalysis ? JSON.stringify({
      creativeBreakdown: geminiAnalysis.creativeBreakdown,
      hookAnalysis: geminiAnalysis.hookAnalysis,
      angleIdentification: geminiAnalysis.angleIdentification,
      structureExplanation: geminiAnalysis.structureExplanation
    }) : null;

    // Insert or update ad
    await db.query(`
      INSERT INTO adspy_ads (
        ad_id,
        brand_id,
        brand_name,
        ad_url,
        ad_creative_url,
        ad_creative_link_title,
        ad_creative_link_caption,
        ad_creative_link_description,
        ad_creative_body,
        ad_snapshot_url,
        ad_delivery_start_time,
        ad_delivery_end_time,
        page_id,
        page_name,
        is_active,
        categories,
        transcript,
        image_description,
        image_url,
        video_url,
        gemini_breakdown,
        hook_analysis,
        angle_analysis,
        structure_analysis,
        why_it_works,
        improvements,
        rewritten_ad,
        platform,
        analyzed_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, NOW()
      )
      ON CONFLICT (ad_id) DO UPDATE SET
        brand_id = EXCLUDED.brand_id,
        brand_name = EXCLUDED.brand_name,
        ad_url = EXCLUDED.ad_url,
        transcript = EXCLUDED.transcript,
        image_description = EXCLUDED.image_description,
        image_url = EXCLUDED.image_url,
        video_url = EXCLUDED.video_url,
        gemini_breakdown = EXCLUDED.gemini_breakdown,
        hook_analysis = EXCLUDED.hook_analysis,
        angle_analysis = EXCLUDED.angle_analysis,
        structure_analysis = EXCLUDED.structure_analysis,
        why_it_works = EXCLUDED.why_it_works,
        improvements = EXCLUDED.improvements,
        rewritten_ad = EXCLUDED.rewritten_ad,
        platform = EXCLUDED.platform,
        analyzed_at = NOW()
    `, [
      ad.id,
      brandId,
      ad.brandName,
      ad.adUrl,
      ad.raw.snapshot?.cards?.[0]?.resizedImageUrl || ad.raw.snapshot?.images?.[0]?.resizedImageUrl,
      ad.raw.snapshot?.cards?.[0]?.title || ad.title,
      ad.raw.snapshot?.caption,
      ad.raw.snapshot?.cards?.[0]?.linkDescription,
      ad.text,
      ad.adUrl,
      ad.raw.startDateFormatted ? new Date(ad.raw.startDateFormatted) : null,
      ad.raw.endDateFormatted ? new Date(ad.raw.endDateFormatted) : null,
      ad.raw.pageId,
      ad.pageName,
      ad.raw.isActive,
      ad.raw.categories || [],
      ad.videoTranscript,
      ad.imageDescription,
      ad.imageUrl,
      ad.videoUrl,
      geminiBreakdown,
      geminiAnalysis?.hookAnalysis,
      geminiAnalysis?.angleIdentification,
      geminiAnalysis?.structureExplanation,
      openaiAnalysis?.whyItWorks,
      openaiAnalysis?.howToImprove?.join('\n'),
      openaiAnalysis?.rewrittenAd,
      platform
    ]);

    // Update brand last_scraped_at and increment total_ads_scraped
    if (brandId) {
      await db.query(`
        UPDATE adspy_brands
        SET last_scraped_at = NOW(),
            total_ads_scraped = total_ads_scraped + 1
        WHERE id = $1
      `, [brandId]);
    }

    console.log(`✅ Saved ad ${ad.id} to database`);
  } catch (error) {
    console.error(`❌ Error saving ad ${ad.id} to database:`, error);
    throw error;
  }
}

/**
 * Search filters interface for advanced ad filtering
 */
export interface SearchFilters {
  query?: string;           // Text search across ad content
  brand?: string;           // Filter by brand name
  dateFrom?: string;        // Start date (YYYY-MM-DD)
  dateTo?: string;          // End date (YYYY-MM-DD)
  adType?: 'video' | 'image' | 'all'; // Filter by media type
  isActive?: boolean;       // Filter by active status
  limit?: number;           // Results limit (default 50)
  offset?: number;          // Pagination offset (default 0)
}

/**
 * Search ads with advanced filters
 */
export async function searchAds(filters: SearchFilters = {}): Promise<any[]> {
  const db = getPool();

  const {
    query,
    brand,
    dateFrom,
    dateTo,
    adType = 'all',
    isActive,
    limit = 50,
    offset = 0
  } = filters;

  try {
    const params: any[] = [];
    const conditions: string[] = [];
    let paramCount = 0;

    // Text search condition
    if (query) {
      paramCount++;
      params.push(`%${query}%`);
      conditions.push(`(
        ad_creative_body ILIKE $${paramCount} OR
        hook_analysis ILIKE $${paramCount} OR
        angle_analysis ILIKE $${paramCount} OR
        structure_analysis ILIKE $${paramCount} OR
        why_it_works ILIKE $${paramCount}
      )`);
    }

    // Brand filter
    if (brand) {
      paramCount++;
      params.push(`%${brand}%`);
      conditions.push(`brand_name ILIKE $${paramCount}`);
    }

    // Date range filter
    if (dateFrom) {
      paramCount++;
      params.push(dateFrom);
      conditions.push(`scraped_at >= $${paramCount}`);
    }

    if (dateTo) {
      paramCount++;
      params.push(dateTo);
      conditions.push(`scraped_at <= $${paramCount}`);
    }

    // Ad type filter
    if (adType !== 'all') {
      if (adType === 'video') {
        conditions.push('video_url IS NOT NULL');
      } else if (adType === 'image') {
        conditions.push('image_url IS NOT NULL');
      }
    }

    // Active status filter
    if (isActive !== undefined) {
      paramCount++;
      params.push(isActive);
      conditions.push(`is_active = $${paramCount}`);
    }

    // Build WHERE clause
    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // Add limit and offset
    paramCount++;
    params.push(limit);
    const limitClause = `LIMIT $${paramCount}`;

    paramCount++;
    params.push(offset);
    const offsetClause = `OFFSET $${paramCount}`;

    const result = await db.query(`
      SELECT
        id,
        ad_id,
        brand_name,
        ad_creative_body,
        ad_creative_url,
        ad_creative_link_title,
        ad_creative_link_caption,
        ad_creative_link_description,
        transcript,
        hook_analysis,
        angle_analysis,
        structure_analysis,
        why_it_works,
        improvements,
        rewritten_ad,
        ad_url,
        image_url,
        video_url,
        is_active,
        scraped_at,
        analyzed_at,
        CASE
          WHEN video_url IS NOT NULL THEN 'video'
          ELSE 'image'
        END as ad_type
      FROM adspy_ads
      ${whereClause}
      ORDER BY scraped_at DESC
      ${limitClause} ${offsetClause}
    `, params);

    return result.rows;
  } catch (error) {
    console.error(`❌ Error searching ads:`, error);
    throw error;
  }
}

/**
 * Get total count of ads matching filters
 */
export async function getAdCount(filters: SearchFilters = {}): Promise<{ total: number; videos: number; images: number }> {
  const db = getPool();

  const { query, brand, dateFrom, dateTo, adType = 'all', isActive } = filters;

  try {
    const params: any[] = [];
    const conditions: string[] = [];
    let paramCount = 0;

    // Same filter logic as searchAds
    if (query) {
      paramCount++;
      params.push(`%${query}%`);
      conditions.push(`(
        ad_creative_body ILIKE $${paramCount} OR
        hook_analysis ILIKE $${paramCount} OR
        angle_analysis ILIKE $${paramCount} OR
        structure_analysis ILIKE $${paramCount} OR
        why_it_works ILIKE $${paramCount}
      )`);
    }

    if (brand) {
      paramCount++;
      params.push(`%${brand}%`);
      conditions.push(`brand_name ILIKE $${paramCount}`);
    }

    if (dateFrom) {
      paramCount++;
      params.push(dateFrom);
      conditions.push(`scraped_at >= $${paramCount}`);
    }

    if (dateTo) {
      paramCount++;
      params.push(dateTo);
      conditions.push(`scraped_at <= $${paramCount}`);
    }

    if (adType !== 'all') {
      if (adType === 'video') {
        conditions.push('video_url IS NOT NULL');
      } else if (adType === 'image') {
        conditions.push('image_url IS NOT NULL');
      }
    }

    if (isActive !== undefined) {
      paramCount++;
      params.push(isActive);
      conditions.push(`is_active = $${paramCount}`);
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const result = await db.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN video_url IS NOT NULL THEN 1 END) as videos,
        COUNT(CASE WHEN image_url IS NOT NULL THEN 1 END) as images
      FROM adspy_ads
      ${whereClause}
    `, params);

    return {
      total: parseInt(result.rows[0].total, 10),
      videos: parseInt(result.rows[0].videos, 10),
      images: parseInt(result.rows[0].images, 10)
    };
  } catch (error) {
    console.error('❌ Error getting ad count:', error);
    return { total: 0, videos: 0, images: 0 };
  }
}

/**
 * Get all unique brand names for filter dropdown
 */
export async function getBrandNames(): Promise<string[]> {
  const db = getPool();

  try {
    const result = await db.query(`
      SELECT DISTINCT brand_name
      FROM adspy_ads
      WHERE brand_name IS NOT NULL
      ORDER BY brand_name
    `);
    return result.rows.map(row => row.brand_name);
  } catch (error) {
    console.error('❌ Error getting brand names:', error);
    return [];
  }
}

/**
 * Get ad by ad_id
 */
export async function getAdById(adId: string): Promise<any | null> {
  const db = getPool();

  try {
    const result = await db.query(`
      SELECT * FROM adspy_ads WHERE ad_id = $1
    `, [adId]);

    if ((result.rowCount ?? 0) > 0) {
      return result.rows[0];
    }

    return null;
  } catch (error) {
    console.error(`❌ Error getting ad ${adId}:`, error);
    throw error;
  }
}

/**
 * Get recent ads (for display/testing)
 */
export async function getRecentAds(limit: number = 20): Promise<any[]> {
  const db = getPool();

  try {
    const result = await db.query(`
      SELECT
        id,
        ad_id,
        brand_name,
        ad_creative_body,
        ad_url,
        image_url,
        video_url,
        is_active,
        scraped_at
      FROM adspy_ads
      ORDER BY scraped_at DESC
      LIMIT $1
    `, [limit]);

    return result.rows;
  } catch (error) {
    console.error(`❌ Error getting recent ads:`, error);
    throw error;
  }
}

/**
 * Get total ad count
 */
export async function getTotalAdCount(): Promise<number> {
  const db = getPool();

  try {
    const result = await db.query('SELECT COUNT(*) FROM adspy_ads');
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error(`❌ Error getting total ad count:`, error);
    return 0;
  }
}

/**
 * Get brand statistics
 */
export async function getBrandStats(brandId: number): Promise<any> {
  const db = getPool();

  try {
    const result = await db.query(`
      SELECT
        b.id,
        b.brand_name,
        b.page_url,
        b.active,
        b.last_scraped_at,
        b.total_ads_scraped,
        COUNT(a.id) AS ads_in_db
      FROM adspy_brands b
      LEFT JOIN adspy_ads a ON a.brand_id = b.id
      WHERE b.id = $1
      GROUP BY b.id
    `, [brandId]);

    if ((result.rowCount ?? 0) > 0) {
      return result.rows[0];
    }

    return null;
  } catch (error) {
    console.error(`❌ Error getting brand stats for brand ${brandId}:`, error);
    return null;
  }
}

/**
 * Get all brands (optionally filter by active status)
 */
export async function getBrands(activeOnly: boolean = false): Promise<any[]> {
  const db = getPool();

  try {
    const query = activeOnly
      ? 'SELECT * FROM adspy_brands WHERE active = true ORDER BY brand_name'
      : 'SELECT * FROM adspy_brands ORDER BY brand_name';

    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error('❌ Error getting brands:', error);
    throw error;
  }
}

/**
 * Add a new brand
 */
export async function addBrand(data: {
  avatar: string;
  brand_name: string;
  page_url: string;
  active?: boolean;
  min_active_days?: number;
}): Promise<any> {
  const db = getPool();

  try {
    const result = await db.query(
      `INSERT INTO adspy_brands (avatar, brand_name, page_url, active, min_active_days)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.avatar,
        data.brand_name,
        data.page_url,
        data.active ?? true,
        data.min_active_days ?? 0,
      ]
    );

    console.log(`✅ Added brand: ${data.brand_name}`);

    const newBrand = result.rows[0];

    // Notify via Slack
    const { notifyBrandAdded } = await import('./notifications');
    await notifyBrandAdded({
      avatar: newBrand.avatar,
      brand_name: newBrand.brand_name,
      active: newBrand.active,
    }).catch(err => console.warn('Failed to send notification:', err));

    // Sync to Google Sheets
    const { syncSingleBrandToSheet } = await import('./sheetSync');
    await syncSingleBrandToSheet(newBrand.id).catch(err => console.warn('Failed to sync to sheets:', err));

    return newBrand;
  } catch (error) {
    console.error(`❌ Error adding brand ${data.brand_name}:`, error);
    throw error;
  }
}

/**
 * Update an existing brand
 */
export async function updateBrand(
  id: number,
  data: Partial<{
    avatar: string;
    brand_name: string;
    page_url: string;
    active: boolean;
    min_active_days: number;
  }>
): Promise<any> {
  const db = getPool();

  try {
    const fields = Object.keys(data)
      .map((key, i) => `${key} = $${i + 1}`)
      .join(', ');
    const values = Object.values(data);

    const result = await db.query(
      `UPDATE adspy_brands
       SET ${fields}, updated_at = NOW()
       WHERE id = $${values.length + 1}
       RETURNING *`,
      [...values, id]
    );

    if ((result.rowCount ?? 0) === 0) {
      throw new Error(`Brand with id ${id} not found`);
    }

    console.log(`✅ Updated brand id ${id}`);

    const updatedBrand = result.rows[0];

    // Notify via Slack
    const changes = Object.keys(data).map(key => `${key}: ${(data as any)[key]}`);
    const { notifyBrandUpdated } = await import('./notifications');
    await notifyBrandUpdated(id, updatedBrand.brand_name, changes).catch(err => console.warn('Failed to send notification:', err));

    // Sync to Google Sheets
    const { syncSingleBrandToSheet } = await import('./sheetSync');
    await syncSingleBrandToSheet(id).catch(err => console.warn('Failed to sync to sheets:', err));

    return updatedBrand;
  } catch (error) {
    console.error(`❌ Error updating brand ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a brand
 */
export async function deleteBrand(id: number): Promise<void> {
  const db = getPool();

  try {
    // Get brand info before deleting
    const brandResult = await db.query('SELECT brand_name FROM adspy_brands WHERE id = $1', [id]);
    const brandName = brandResult.rows[0]?.brand_name || `Brand ${id}`;

    const result = await db.query('DELETE FROM adspy_brands WHERE id = $1 RETURNING *', [id]);

    if ((result.rowCount ?? 0) === 0) {
      throw new Error(`Brand with id ${id} not found`);
    }

    console.log(`✅ Deleted brand id ${id}`);

    // Notify via Slack
    const { notifyBrandDeleted } = await import('./notifications');
    await notifyBrandDeleted(id, brandName).catch(err => console.warn('Failed to send notification:', err));

    // Sync to Google Sheets
    const { syncSingleBrandToSheet } = await import('./sheetSync');
    await syncSingleBrandToSheet().catch(err => console.warn('Failed to sync to sheets:', err));
  } catch (error) {
    console.error(`❌ Error deleting brand ${id}:`, error);
    throw error;
  }
}

/**
 * =====================================================================
 * BRAND PAGES CRUD (Multi-Page Support)
 * =====================================================================
 */

export interface BrandPage {
  id: number;
  brand_id: number;
  page_url: string;
  page_name: string | null;
  is_active: boolean;
  last_scraped_at: Date | null;
  total_ads_scraped: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Get all pages for a specific brand
 */
export async function getBrandPages(brandId: number): Promise<BrandPage[]> {
  const db = getPool();

  try {
    const result = await db.query<BrandPage>(
      `SELECT * FROM adspy_brand_pages
       WHERE brand_id = $1
       ORDER BY created_at ASC`,
      [brandId]
    );

    return result.rows;
  } catch (error) {
    console.error(`❌ Error getting pages for brand ${brandId}:`, error);
    throw error;
  }
}

/**
 * Get all active pages for a specific brand
 */
export async function getActiveBrandPages(brandId: number): Promise<BrandPage[]> {
  const db = getPool();

  try {
    const result = await db.query<BrandPage>(
      `SELECT * FROM adspy_brand_pages
       WHERE brand_id = $1 AND is_active = true
       ORDER BY created_at ASC`,
      [brandId]
    );

    return result.rows;
  } catch (error) {
    console.error(`❌ Error getting active pages for brand ${brandId}:`, error);
    throw error;
  }
}

/**
 * Add a new page to a brand
 */
export async function addBrandPage(data: {
  brand_id: number;
  page_url: string;
  page_name?: string;
  is_active?: boolean;
}): Promise<BrandPage> {
  const db = getPool();

  try {
    const result = await db.query<BrandPage>(
      `INSERT INTO adspy_brand_pages (brand_id, page_url, page_name, is_active)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        data.brand_id,
        data.page_url,
        data.page_name || null,
        data.is_active ?? true,
      ]
    );

    console.log(`✅ Added page for brand ${data.brand_id}: ${data.page_url}`);

    const newPage = result.rows[0];

    // Get brand name for notification
    const brandResult = await db.query('SELECT brand_name FROM adspy_brands WHERE id = $1', [data.brand_id]);
    const brandName = brandResult.rows[0]?.brand_name || `Brand ${data.brand_id}`;

    // Notify via Slack
    const { notifyBrandPageAdded } = await import('./notifications');
    await notifyBrandPageAdded({
      brand_name: brandName,
      page_url: newPage.page_url,
      page_name: newPage.page_name,
      is_active: newPage.is_active,
    }).catch(err => console.warn('Failed to send notification:', err));

    // Sync to Google Sheets
    const { syncSingleBrandToSheet } = await import('./sheetSync');
    await syncSingleBrandToSheet(data.brand_id).catch(err => console.warn('Failed to sync to sheets:', err));

    return newPage;
  } catch (error: any) {
    // Check for unique constraint violation
    if (error.code === '23505') {
      throw new Error(`Page URL already exists for this brand: ${data.page_url}`);
    }
    console.error(`❌ Error adding page for brand ${data.brand_id}:`, error);
    throw error;
  }
}

/**
 * Update a brand page
 */
export async function updateBrandPage(
  pageId: number,
  data: Partial<{
    page_url: string;
    page_name: string;
    is_active: boolean;
    last_scraped_at: Date;
    total_ads_scraped: number;
  }>
): Promise<BrandPage> {
  const db = getPool();

  try {
    const fields = Object.keys(data)
      .map((key, i) => `${key} = $${i + 1}`)
      .join(', ');
    const values = Object.values(data);

    const result = await db.query<BrandPage>(
      `UPDATE adspy_brand_pages
       SET ${fields}, updated_at = NOW()
       WHERE id = $${values.length + 1}
       RETURNING *`,
      [...values, pageId]
    );

    if ((result.rowCount ?? 0) === 0) {
      throw new Error(`Brand page with id ${pageId} not found`);
    }

    console.log(`✅ Updated brand page id ${pageId}`);

    const updatedPage = result.rows[0];

    // Notify via Slack
    const changes = Object.keys(data).map(key => `${key}: ${(data as any)[key]}`);
    const { notifyBrandPageUpdated } = await import('./notifications');
    await notifyBrandPageUpdated(pageId, updatedPage.page_url, changes).catch(err => console.warn('Failed to send notification:', err));

    // Sync to Google Sheets
    const { syncSingleBrandToSheet } = await import('./sheetSync');
    await syncSingleBrandToSheet(updatedPage.brand_id).catch(err => console.warn('Failed to sync to sheets:', err));

    return updatedPage;
  } catch (error) {
    console.error(`❌ Error updating brand page ${pageId}:`, error);
    throw error;
  }
}

/**
 * Delete a brand page
 */
export async function deleteBrandPage(pageId: number): Promise<void> {
  const db = getPool();

  try {
    // Get page info before deleting
    const pageResult = await db.query('SELECT page_url, brand_id FROM adspy_brand_pages WHERE id = $1', [pageId]);
    const pageUrl = pageResult.rows[0]?.page_url || `Page ${pageId}`;
    const brandId = pageResult.rows[0]?.brand_id;

    const result = await db.query('DELETE FROM adspy_brand_pages WHERE id = $1', [pageId]);

    if ((result.rowCount ?? 0) === 0) {
      throw new Error(`Brand page with id ${pageId} not found`);
    }

    console.log(`✅ Deleted brand page id ${pageId}`);

    // Notify via Slack
    const { notifyBrandPageDeleted } = await import('./notifications');
    await notifyBrandPageDeleted(pageId, pageUrl).catch(err => console.warn('Failed to send notification:', err));

    // Sync to Google Sheets
    const { syncSingleBrandToSheet } = await import('./sheetSync');
    await syncSingleBrandToSheet(brandId).catch(err => console.warn('Failed to sync to sheets:', err));
  } catch (error) {
    console.error(`❌ Error deleting brand page ${pageId}:`, error);
    throw error;
  }
}

/**
 * Update brand page statistics after scraping
 * Increments total_ads_scraped and updates last_scraped_at
 */
export async function updateBrandPageStats(
  pageId: number,
  adsScraped: number
): Promise<void> {
  const db = getPool();

  try {
    await db.query(
      `UPDATE adspy_brand_pages
       SET total_ads_scraped = total_ads_scraped + $1,
           last_scraped_at = NOW(),
           updated_at = NOW()
       WHERE id = $2`,
      [adsScraped, pageId]
    );

    console.log(`📊 Updated stats for page id ${pageId}: +${adsScraped} ads`);
  } catch (error) {
    console.error(`❌ Error updating brand page stats ${pageId}:`, error);
    throw error;
  }
}

/**
 * Get a brand with all its pages
 */
export async function getBrandWithPages(brandId: number): Promise<any> {
  const db = getPool();

  try {
    // Get brand
    const brandResult = await db.query(
      'SELECT * FROM adspy_brands WHERE id = $1',
      [brandId]
    );

    if ((brandResult.rowCount ?? 0) === 0) {
      throw new Error(`Brand with id ${brandId} not found`);
    }

    const brand = brandResult.rows[0];

    // Get pages
    const pages = await getBrandPages(brandId);

    return {
      ...brand,
      pages,
    };
  } catch (error) {
    console.error(`❌ Error getting brand with pages ${brandId}:`, error);
    throw error;
  }
}

/**
 * Get all brands with their pages
 */
export async function getBrandsWithPages(activeOnly: boolean = false): Promise<any[]> {
  const db = getPool();

  try {
    const query = activeOnly
      ? `SELECT b.*,
          COALESCE(json_agg(
            json_build_object(
              'id', bp.id,
              'page_url', bp.page_url,
              'page_name', bp.page_name,
              'is_active', bp.is_active,
              'last_scraped_at', bp.last_scraped_at,
              'total_ads_scraped', bp.total_ads_scraped
            ) ORDER BY bp.created_at
          ) FILTER (WHERE bp.id IS NOT NULL), '[]'::json) as pages
         FROM adspy_brands b
         LEFT JOIN adspy_brand_pages bp ON b.id = bp.brand_id
         WHERE b.active = true
         GROUP BY b.id
         ORDER BY b.brand_name`
      : `SELECT b.*,
          COALESCE(json_agg(
            json_build_object(
              'id', bp.id,
              'page_url', bp.page_url,
              'page_name', bp.page_name,
              'is_active', bp.is_active,
              'last_scraped_at', bp.last_scraped_at,
              'total_ads_scraped', bp.total_ads_scraped
            ) ORDER BY bp.created_at
          ) FILTER (WHERE bp.id IS NOT NULL), '[]'::json) as pages
         FROM adspy_brands b
         LEFT JOIN adspy_brand_pages bp ON b.id = bp.brand_id
         GROUP BY b.id
         ORDER BY b.brand_name`;

    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error('❌ Error getting brands with pages:', error);
    throw error;
  }
}

/**
 * =====================================================================
 * SETTINGS CRUD (Global Configuration)
 * =====================================================================
 */

export interface AdSpySettings {
  scraper_enabled: boolean;
  max_ads_per_brand: number;
  max_daily_ads_per_brand: number;
}

/**
 * Get all global settings
 */
export async function getSettings(): Promise<AdSpySettings> {
  const db = getPool();

  try {
    const result = await db.query('SELECT key, value FROM adspy_settings');

    const settings: any = {};
    for (const row of result.rows) {
      if (row.key === 'scraper_enabled') {
        settings.scraper_enabled = row.value.enabled;
      } else if (row.key === 'max_ads_per_brand') {
        settings.max_ads_per_brand = row.value.value;
      } else if (row.key === 'max_daily_ads_per_brand') {
        settings.max_daily_ads_per_brand = row.value.value;
      }
    }

    // Return defaults if settings not found
    return {
      scraper_enabled: settings.scraper_enabled ?? false,
      max_ads_per_brand: settings.max_ads_per_brand ?? 10,
      max_daily_ads_per_brand: settings.max_daily_ads_per_brand ?? 3,
    };
  } catch (error) {
    console.error('❌ Error getting settings:', error);
    throw error;
  }
}

/**
 * Update a specific setting
 */
export async function updateSetting(key: string, value: any): Promise<void> {
  const db = getPool();

  try {
    // Get old value for notification
    const oldResult = await db.query('SELECT value FROM adspy_settings WHERE key = $1', [key]);
    let oldValue: any = null;
    if (oldResult.rowCount && oldResult.rowCount > 0) {
      const oldJsonb = oldResult.rows[0].value;
      if (key === 'scraper_enabled') {
        oldValue = oldJsonb.enabled;
      } else if (key === 'max_ads_per_brand' || key === 'max_daily_ads_per_brand') {
        oldValue = oldJsonb.value;
      } else {
        oldValue = oldJsonb;
      }
    }

    // Map simple values to JSONB format
    let jsonbValue: any;

    if (key === 'scraper_enabled') {
      jsonbValue = { enabled: value };
    } else if (key === 'max_ads_per_brand' || key === 'max_daily_ads_per_brand') {
      jsonbValue = { value: parseInt(value) };
    } else {
      jsonbValue = value;
    }

    await db.query(
      `INSERT INTO adspy_settings (key, value, updated_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (key)
       DO UPDATE SET value = $2, updated_at = NOW(), updated_by = $3`,
      [key, JSON.stringify(jsonbValue), 'api']
    );

    console.log(`✅ Updated setting: ${key}`);

    // Notify via Slack
    const { notifySettingsChanged } = await import('./notifications');
    await notifySettingsChanged(key, oldValue, value).catch(err => console.warn('Failed to send notification:', err));
  } catch (error) {
    console.error(`❌ Error updating setting ${key}:`, error);
    throw error;
  }
}

/**
 * Get brand-specific settings (overrides)
 */
export async function getBrandSettings(brandId: number): Promise<any> {
  const db = getPool();

  try {
    const result = await db.query(
      `SELECT max_ads_override, max_daily_ads_override, use_overrides
       FROM adspy_brands
       WHERE id = $1`,
      [brandId]
    );

    if ((result.rowCount ?? 0) === 0) {
      throw new Error(`Brand with id ${brandId} not found`);
    }

    return result.rows[0];
  } catch (error) {
    console.error(`❌ Error getting brand settings ${brandId}:`, error);
    throw error;
  }
}

/**
 * Update brand-specific settings (overrides)
 */
export async function updateBrandSettings(
  brandId: number,
  settings: {
    max_ads_override?: number | null;
    max_daily_ads_override?: number | null;
    use_overrides?: boolean;
  }
): Promise<void> {
  const db = getPool();

  try {
    // Get brand name for notification
    const brandResult = await db.query('SELECT brand_name FROM adspy_brands WHERE id = $1', [brandId]);
    const brandName = brandResult.rows[0]?.brand_name || `Brand ${brandId}`;

    const fields = Object.keys(settings)
      .map((key, i) => `${key} = $${i + 1}`)
      .join(', ');
    const values = Object.values(settings);

    const result = await db.query(
      `UPDATE adspy_brands
       SET ${fields}, updated_at = NOW()
       WHERE id = $${values.length + 1}`,
      [...values, brandId]
    );

    if ((result.rowCount ?? 0) === 0) {
      throw new Error(`Brand with id ${brandId} not found`);
    }

    console.log(`✅ Updated brand settings for id ${brandId}`);

    // Notify via Slack
    const changes = Object.keys(settings).map(key => `${key}: ${(settings as any)[key]}`);
    const { notifyBrandSettingsChanged } = await import('./notifications');
    await notifyBrandSettingsChanged(brandId, brandName, changes).catch(err => console.warn('Failed to send notification:', err));
  } catch (error) {
    console.error(`❌ Error updating brand settings ${brandId}:`, error);
    throw error;
  }
}

/**
 * Get effective settings for a brand (considers overrides)
 */
export async function getEffectiveBrandSettings(brandId: number): Promise<{
  max_ads_per_brand: number;
  max_daily_ads_per_brand: number;
}> {
  const db = getPool();

  try {
    // Get global settings
    const globalSettings = await getSettings();

    // Get brand overrides
    const brandSettings = await getBrandSettings(brandId);

    // Return effective values
    return {
      max_ads_per_brand:
        brandSettings.use_overrides && brandSettings.max_ads_override !== null
          ? brandSettings.max_ads_override
          : globalSettings.max_ads_per_brand,
      max_daily_ads_per_brand:
        brandSettings.use_overrides && brandSettings.max_daily_ads_override !== null
          ? brandSettings.max_daily_ads_override
          : globalSettings.max_daily_ads_per_brand,
    };
  } catch (error) {
    console.error(`❌ Error getting effective settings for brand ${brandId}:`, error);
    throw error;
  }
}

/**
 * Get count of ads scraped today for a brand
 */
export async function getAdsScrapedToday(brandId: number): Promise<number> {
  const db = getPool();

  try {
    const result = await db.query(
      `SELECT COUNT(*) as count
       FROM adspy_ads
       WHERE brand_id = $1
         AND scraped_at >= CURRENT_DATE
         AND scraped_at < CURRENT_DATE + INTERVAL '1 day'`,
      [brandId]
    );

    return parseInt(result.rows[0]?.count ?? '0');
  } catch (error) {
    console.error(`❌ Error getting today's ad count for brand ${brandId}:`, error);
    return 0;
  }
}

/**
 * =====================================================================
 * COMPETITIVE ANALYSIS (1-vs-5 Ad Dominance Engine)
 * =====================================================================
 */

/**
 * Store competitive analysis results
 */
export async function storeCompetitiveAnalysis(data: {
  subject_brand_name: string;
  subject_domain: string;
  competitors: any[];
  hook_gap_analysis: any;
  format_gap_analysis: any;
  dominant_patterns: any;
  recommendations: string[];
  total_subject_ads: number;
  total_competitor_ads: number;
  platform?: 'facebook' | 'google';
  ads: Array<{
    ad_id: string;
    is_subject: boolean;
    hook_category: string;
    creative_format: string;
  }>;
}): Promise<string> {
  const db = getPool();

  try {
    const platform = data.platform || 'facebook';

    // Generate UUID for analysis
    const result = await db.query(
      `INSERT INTO adspy_competitor_analyses (
        subject_brand_name,
        subject_domain,
        competitors,
        hook_gap_analysis,
        format_gap_analysis,
        dominant_patterns,
        recommendations,
        total_subject_ads,
        total_competitor_ads,
        platform,
        analyzed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING analysis_id`,
      [
        data.subject_brand_name,
        data.subject_domain,
        JSON.stringify(data.competitors),
        JSON.stringify(data.hook_gap_analysis),
        JSON.stringify(data.format_gap_analysis),
        JSON.stringify(data.dominant_patterns),
        data.recommendations,
        data.total_subject_ads,
        data.total_competitor_ads,
        platform
      ]
    );

    const analysisId = result.rows[0].analysis_id;

    // Insert ad links
    for (const ad of data.ads) {
      await db.query(
        `INSERT INTO adspy_competitor_analysis_ads (
          analysis_id,
          ad_id,
          is_subject,
          hook_category,
          creative_format
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (analysis_id, ad_id) DO NOTHING`,
        [
          analysisId,
          ad.ad_id,
          ad.is_subject,
          ad.hook_category,
          ad.creative_format
        ]
      );
    }

    console.log(`✅ Stored competitive analysis: ${analysisId}`);
    return analysisId;
  } catch (error) {
    console.error('❌ Error storing competitive analysis:', error);
    throw error;
  }
}

/**
 * Get competitive analysis by ID
 */
export async function getCompetitorAnalysisById(analysisId: string): Promise<any | null> {
  const db = getPool();

  try {
    // Get main analysis record
    const analysisResult = await db.query(
      `SELECT * FROM adspy_competitor_analyses WHERE analysis_id = $1`,
      [analysisId]
    );

    if ((analysisResult.rowCount ?? 0) === 0) {
      return null;
    }

    const analysis = analysisResult.rows[0];

    // Get linked ads
    const adsResult = await db.query(
      `SELECT
        caa.*,
        a.brand_name,
        a.ad_creative_body,
        a.ad_url,
        a.image_url,
        a.video_url
      FROM adspy_competitor_analysis_ads caa
      LEFT JOIN adspy_ads a ON caa.ad_id = a.ad_id
      WHERE caa.analysis_id = $1
      ORDER BY caa.is_subject DESC, a.brand_name`,
      [analysisId]
    );

    return {
      ...analysis,
      ads: adsResult.rows
    };
  } catch (error) {
    console.error(`❌ Error getting analysis ${analysisId}:`, error);
    throw error;
  }
}

/**
 * Get recent competitive analyses
 */
export async function getRecentCompetitorAnalyses(limit: number = 20): Promise<any[]> {
  const db = getPool();

  try {
    const result = await db.query(
      `SELECT
        analysis_id,
        subject_brand_name,
        total_subject_ads,
        total_competitor_ads,
        analyzed_at
      FROM adspy_competitor_analyses
      ORDER BY analyzed_at DESC
      LIMIT $1`,
      [limit]
    );

    return result.rows;
  } catch (error) {
    console.error('❌ Error getting recent analyses:', error);
    return [];
  }
}
