/**
 * REST API Server for AdSpy Tool
 * Exposes brand management and ad search endpoints for the frontend
 */

import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  initializeDatabase,
  getBrands,
  addBrand,
  updateBrand,
  deleteBrand,
  searchAds,
  getAdById,
  getAdCount,
  getBrandNames,
  SearchFilters,
  // Brand Pages
  getBrandPages,
  getBrandWithPages,
  getBrandsWithPages,
  addBrandPage,
  updateBrandPage,
  deleteBrandPage,
  // Settings
  getSettings,
  updateSetting,
  getBrandSettings,
  updateBrandSettings,
  getEffectiveBrandSettings,
} from './storage';
import { AdSpyConfig } from './config';
import { initializeNotifications } from './notifications';
import { initializeSheetSync } from './sheetSync';

const app = express();
const PORT = process.env.API_PORT || 1002;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration - allow frontend on port 1001
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:1001',
      process.env.LANDING_PAGE_URL || 'http://localhost:3000',
      'http://178.156.213.149:1001',
      'http://178.156.213.149:3000'
    ],
    credentials: true,
  })
);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Initialize database on startup
initializeDatabase();

// Initialize Slack notifications
initializeNotifications(
  process.env.SLACK_TOKEN,
  process.env.SLACK_CHANNEL || 'adspy-feed'
);

// Initialize Google Sheets sync
initializeSheetSync(
  process.env.GOOGLE_SHEETS_ID,
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  process.env.GOOGLE_SERVICE_ACCOUNT_KEY
);

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * GET /api/brands
 * Get all brands (optionally filter by active status)
 * Query params: active=true (optional)
 */
app.get('/api/brands', async (req: Request, res: Response) => {
  try {
    const activeOnly = req.query.active === 'true';
    const brands = await getBrands(activeOnly);
    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

/**
 * POST /api/brands
 * Add a new brand
 * Body: { avatar, brand_name, page_url, active?, min_active_days? }
 */
app.post('/api/brands', async (req: Request, res: Response) => {
  try {
    const { avatar, brand_name, page_url, active, min_active_days } = req.body;

    // Validation
    if (!brand_name || !page_url) {
      return res.status(400).json({
        error: 'Missing required fields: brand_name and page_url are required',
      });
    }

    const brand = await addBrand({
      avatar: avatar || '',
      brand_name,
      page_url,
      active,
      min_active_days,
    });

    res.status(201).json(brand);
  } catch (error) {
    console.error('Error adding brand:', error);
    res.status(500).json({ error: 'Failed to add brand' });
  }
});

/**
 * PATCH /api/brands/:id
 * Update an existing brand
 * Body: Partial<{ avatar, brand_name, page_url, active, min_active_days }>
 */
app.patch('/api/brands/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid brand ID' });
    }

    const brand = await updateBrand(id, req.body);
    res.json(brand);
  } catch (error: any) {
    console.error('Error updating brand:', error);

    if (error.message?.includes('not found')) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.status(500).json({ error: 'Failed to update brand' });
  }
});

/**
 * DELETE /api/brands/:id
 * Delete a brand
 */
app.delete('/api/brands/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid brand ID' });
    }

    await deleteBrand(id);
    res.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting brand:', error);

    if (error.message?.includes('not found')) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

/**
 * GET /api/brands/names
 * Get list of unique brand names for filter dropdown
 */
app.get('/api/brands/names', async (req: Request, res: Response) => {
  try {
    const brandNames = await getBrandNames();
    res.json(brandNames);
  } catch (error) {
    console.error('Error fetching brand names:', error);
    res.status(500).json({ error: 'Failed to fetch brand names' });
  }
});

/**
 * GET /api/ads
 * Get all ads with optional filters
 * Query params:
 *   - query: text search across ad content
 *   - brand: filter by brand name
 *   - dateFrom: start date (YYYY-MM-DD)
 *   - dateTo: end date (YYYY-MM-DD)
 *   - adType: 'video' | 'image' | 'all'
 *   - isActive: 'true' | 'false'
 *   - limit: results limit (default 50)
 *   - offset: pagination offset (default 0)
 */
app.get('/api/ads', async (req: Request, res: Response) => {
  try {
    const filters: SearchFilters = {
      query: req.query.query as string,
      brand: req.query.brand as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      adType: (req.query.adType as 'video' | 'image' | 'all') || 'all',
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    };

    const ads = await searchAds(filters);
    res.json(ads);
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});

/**
 * GET /api/ads/count
 * Get total count of ads matching filters
 * Query params: same as /api/ads (except limit/offset)
 */
app.get('/api/ads/count', async (req: Request, res: Response) => {
  try {
    const filters: SearchFilters = {
      query: req.query.query as string,
      brand: req.query.brand as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      adType: (req.query.adType as 'video' | 'image' | 'all') || 'all',
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
    };

    const count = await getAdCount(filters);
    res.json(count);
  } catch (error) {
    console.error('Error getting ad count:', error);
    res.status(500).json({ error: 'Failed to get ad count' });
  }
});

/**
 * GET /api/ads/search (legacy endpoint - kept for backward compatibility)
 * Search ads by query
 * Query params: q=search_term, limit=50 (optional)
 */
app.get('/api/ads/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const ads = await searchAds({ query, limit });
    res.json(ads);
  } catch (error) {
    console.error('Error searching ads:', error);
    res.status(500).json({ error: 'Failed to search ads' });
  }
});

/**
 * GET /api/ads/:id
 * Get a single ad by ID
 */
app.get('/api/ads/:id', async (req: Request, res: Response) => {
  try {
    const adId = req.params.id;
    const ad = await getAdById(adId);

    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    res.json(ad);
  } catch (error) {
    console.error('Error fetching ad:', error);
    res.status(500).json({ error: 'Failed to fetch ad' });
  }
});

/**
 * =====================================================================
 * BRAND PAGES ENDPOINTS (Multi-Page Support)
 * =====================================================================
 */

/**
 * GET /api/brands/:id/pages
 * Get all pages for a specific brand
 */
app.get('/api/brands/:id/pages', async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.params.id);

    if (isNaN(brandId)) {
      return res.status(400).json({ error: 'Invalid brand ID' });
    }

    const pages = await getBrandPages(brandId);
    res.json(pages);
  } catch (error: any) {
    console.error(`Error fetching pages for brand ${req.params.id}:`, error);

    if (error.message?.includes('not found')) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.status(500).json({ error: 'Failed to fetch brand pages' });
  }
});

/**
 * POST /api/brands/:id/pages
 * Add a new page to a brand
 * Body: { page_url, page_name?, is_active? }
 */
app.post('/api/brands/:id/pages', async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.params.id);

    if (isNaN(brandId)) {
      return res.status(400).json({ error: 'Invalid brand ID' });
    }

    const { page_url, page_name, is_active } = req.body;

    if (!page_url) {
      return res.status(400).json({ error: 'page_url is required' });
    }

    const page = await addBrandPage({
      brand_id: brandId,
      page_url,
      page_name,
      is_active,
    });

    res.status(201).json(page);
  } catch (error: any) {
    console.error(`Error adding page to brand ${req.params.id}:`, error);

    if (error.message?.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }

    if (error.message?.includes('not found')) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.status(500).json({ error: 'Failed to add brand page' });
  }
});

/**
 * PATCH /api/brands/:brandId/pages/:pageId
 * Update a brand page
 * Body: Partial<{ page_url, page_name, is_active }>
 */
app.patch('/api/brands/:brandId/pages/:pageId', async (req: Request, res: Response) => {
  try {
    const pageId = parseInt(req.params.pageId);

    if (isNaN(pageId)) {
      return res.status(400).json({ error: 'Invalid page ID' });
    }

    const page = await updateBrandPage(pageId, req.body);
    res.json(page);
  } catch (error: any) {
    console.error(`Error updating brand page ${req.params.pageId}:`, error);

    if (error.message?.includes('not found')) {
      return res.status(404).json({ error: 'Brand page not found' });
    }

    res.status(500).json({ error: 'Failed to update brand page' });
  }
});

/**
 * DELETE /api/brands/:brandId/pages/:pageId
 * Delete a brand page
 */
app.delete('/api/brands/:brandId/pages/:pageId', async (req: Request, res: Response) => {
  try {
    const pageId = parseInt(req.params.pageId);

    if (isNaN(pageId)) {
      return res.status(400).json({ error: 'Invalid page ID' });
    }

    await deleteBrandPage(pageId);
    res.json({ success: true, message: 'Brand page deleted successfully' });
  } catch (error: any) {
    console.error(`Error deleting brand page ${req.params.pageId}:`, error);

    if (error.message?.includes('not found')) {
      return res.status(404).json({ error: 'Brand page not found' });
    }

    res.status(500).json({ error: 'Failed to delete brand page' });
  }
});

/**
 * GET /api/brands/:id/with-pages
 * Get a brand with all its pages included
 */
app.get('/api/brands/:id/with-pages', async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.params.id);

    if (isNaN(brandId)) {
      return res.status(400).json({ error: 'Invalid brand ID' });
    }

    const brand = await getBrandWithPages(brandId);
    res.json(brand);
  } catch (error: any) {
    console.error(`Error fetching brand with pages ${req.params.id}:`, error);

    if (error.message?.includes('not found')) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.status(500).json({ error: 'Failed to fetch brand with pages' });
  }
});

/**
 * GET /api/brands/all-with-pages
 * Get all brands with their pages included
 * Query params: active=true (optional)
 */
app.get('/api/brands/all-with-pages', async (req: Request, res: Response) => {
  try {
    const activeOnly = req.query.active === 'true';
    const brands = await getBrandsWithPages(activeOnly);
    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands with pages:', error);
    res.status(500).json({ error: 'Failed to fetch brands with pages' });
  }
});

/**
 * =====================================================================
 * SETTINGS ENDPOINTS (Global Configuration)
 * =====================================================================
 */

/**
 * GET /api/settings
 * Get all global settings
 */
app.get('/api/settings', async (req: Request, res: Response) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * PATCH /api/settings/:key
 * Update a specific global setting
 * Body: { value }
 */
app.patch('/api/settings/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }

    // Validate key
    const validKeys = ['scraper_enabled', 'max_ads_per_brand', 'max_daily_ads_per_brand'];
    if (!validKeys.includes(key)) {
      return res.status(400).json({ error: `Invalid setting key. Must be one of: ${validKeys.join(', ')}` });
    }

    await updateSetting(key, value);

    // Return updated settings
    const settings = await getSettings();
    res.json(settings);
  } catch (error) {
    console.error(`Error updating setting ${req.params.key}:`, error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

/**
 * GET /api/settings/scraper-status
 * Quick check for scraper enabled status
 */
app.get('/api/settings/scraper-status', async (req: Request, res: Response) => {
  try {
    const settings = await getSettings();
    res.json({ enabled: settings.scraper_enabled });
  } catch (error) {
    console.error('Error fetching scraper status:', error);
    res.status(500).json({ error: 'Failed to fetch scraper status' });
  }
});

/**
 * GET /api/brands/:id/settings
 * Get brand-specific settings (overrides)
 */
app.get('/api/brands/:id/settings', async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.params.id);

    if (isNaN(brandId)) {
      return res.status(400).json({ error: 'Invalid brand ID' });
    }

    const settings = await getBrandSettings(brandId);
    res.json(settings);
  } catch (error: any) {
    console.error(`Error fetching brand settings ${req.params.id}:`, error);

    if (error.message?.includes('not found')) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.status(500).json({ error: 'Failed to fetch brand settings' });
  }
});

/**
 * PATCH /api/brands/:id/settings
 * Update brand-specific settings (overrides)
 * Body: { max_ads_override?, max_daily_ads_override?, use_overrides? }
 */
app.patch('/api/brands/:id/settings', async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.params.id);

    if (isNaN(brandId)) {
      return res.status(400).json({ error: 'Invalid brand ID' });
    }

    await updateBrandSettings(brandId, req.body);

    // Return updated settings
    const settings = await getBrandSettings(brandId);
    res.json(settings);
  } catch (error: any) {
    console.error(`Error updating brand settings ${req.params.id}:`, error);

    if (error.message?.includes('not found')) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.status(500).json({ error: 'Failed to update brand settings' });
  }
});

/**
 * GET /api/brands/:id/effective-settings
 * Get effective settings for a brand (considers overrides)
 */
app.get('/api/brands/:id/effective-settings', async (req: Request, res: Response) => {
  try {
    const brandId = parseInt(req.params.id);

    if (isNaN(brandId)) {
      return res.status(400).json({ error: 'Invalid brand ID' });
    }

    const settings = await getEffectiveBrandSettings(brandId);
    res.json(settings);
  } catch (error: any) {
    console.error(`Error fetching effective settings ${req.params.id}:`, error);

    if (error.message?.includes('not found')) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.status(500).json({ error: 'Failed to fetch effective settings' });
  }
});

// Settings reload endpoint (admin only)
app.post('/api/settings/reload', async (req: Request, res: Response) => {
  try {
    await AdSpyConfig.reloadSettings();
    res.json({
      success: true,
      message: 'Settings reloaded from database',
      settings: AdSpyConfig.getGlobalSettings(),
    });
  } catch (error: any) {
    console.error('Failed to reload settings:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * =====================================================================
 * RATE LIMIT ERRORS ENDPOINT
 * =====================================================================
 */

/**
 * GET /api/errors/rate-limits
 * Get recent rate limit errors (last 24 hours)
 */
app.get('/api/errors/rate-limits', async (req: Request, res: Response) => {
  try {
    const { getRecentRateLimitErrors } = await import('./rateLimitHandler');
    const errors = await getRecentRateLimitErrors();
    res.json(errors);
  } catch (error) {
    console.error('Error fetching rate limit errors:', error);
    res.status(500).json({ error: 'Failed to fetch rate limit errors' });
  }
});

/**
 * =====================================================================
 * COMPETITIVE ANALYSIS ENDPOINTS (1-vs-5 Ad Dominance Engine)
 * =====================================================================
 */

/**
 * POST /api/analyze-competitor-set
 * Analyze 1 subject brand vs 5 competitors
 * Body: { competitors: [{ name, domain, isSubject }] }
 */
app.post('/api/analyze-competitor-set', async (req: Request, res: Response) => {
  try {
    const { competitors } = req.body;

    // Validation
    if (!competitors || !Array.isArray(competitors)) {
      return res.status(400).json({
        error: 'competitors array is required'
      });
    }

    // Validate each competitor has required fields
    for (const comp of competitors) {
      if (!comp.name || !comp.domain || comp.isSubject === undefined) {
        return res.status(400).json({
          error: 'Each competitor must have: name, domain, and isSubject fields'
        });
      }
    }

    // Validate exactly 1 subject and 5 competitors
    const subjectCount = competitors.filter((c: any) => c.isSubject).length;
    if (subjectCount !== 1) {
      return res.status(400).json({
        error: `Exactly 1 subject required (got ${subjectCount})`
      });
    }

    const competitorCount = competitors.filter((c: any) => !c.isSubject).length;
    if (competitorCount !== 5) {
      return res.status(400).json({
        error: `Exactly 5 competitors required (got ${competitorCount})`
      });
    }

    console.log(`📊 Starting Facebook Ads competitive analysis via API...`);

    // Import and run analysis
    const { analyzeCompetitorSet } = await import('./main');
    const result = await analyzeCompetitorSet({ competitors }, { platform: 'facebook', adsPerPage: 5, daysBack: 30 });

    // Format response
    const response = {
      success: true,
      analysis_id: result.analysis_id,
      subject: {
        name: result.subject.name,
        ad_count: result.subject.ad_count,
        hook_distribution: result.subject.hook_distribution,
        format_distribution: result.subject.format_distribution
      },
      gaps: {
        missing_hooks: result.gaps.missing_hooks,
        underutilized_formats: result.gaps.underutilized_formats,
        winning_competitors: result.gaps.winning_competitors
      },
      recommendations: result.recommendations,
      market_insights: result.market_insights,
      competitors: result.competitors.map(c => ({
        name: c.name,
        ad_count: c.ad_count,
        top_hooks: Object.entries(c.hook_distribution)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([hook]) => hook)
      }))
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error in competitive analysis:', error);

    if (error.message?.includes('No ads found')) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({
      error: 'Failed to complete competitive analysis',
      message: error.message
    });
  }
});

/**
 * POST /api/analyze-google-competitor-set
 * Competitive analysis for Google Ads (SERP-based scraping)
 *
 * Input: { competitors: [{ name, domain, isSubject, industry }] }
 * Output: Same as Facebook analysis (gaps, recommendations, insights)
 *
 * NOTE: Requires "industry" field for keyword generation
 */
app.post('/api/analyze-google-competitor-set', async (req: Request, res: Response) => {
  try {
    const { competitors } = req.body;

    // Validation
    if (!competitors || !Array.isArray(competitors)) {
      return res.status(400).json({
        error: 'competitors array is required'
      });
    }

    // Validate each competitor has required fields (including adTransparencyUrl for Google)
    for (const comp of competitors) {
      if (!comp.name || !comp.domain || comp.isSubject === undefined) {
        return res.status(400).json({
          error: 'Each competitor must have: name, domain, and isSubject fields'
        });
      }

      // Google Ads requires adTransparencyUrl for Transparency Center scraping
      if (!comp.adTransparencyUrl) {
        return res.status(400).json({
          error: 'Each competitor must have "adTransparencyUrl" field for Google Ads analysis.\n' +
                 'Example: https://adstransparency.google.com/?region=US&domain=example.com'
        });
      }

      // Validate URL format
      if (!comp.adTransparencyUrl.includes('adstransparency.google.com')) {
        return res.status(400).json({
          error: `Invalid adTransparencyUrl for ${comp.name}. Must be from adstransparency.google.com`
        });
      }
    }

    // Validate exactly 1 subject and 5 competitors
    const subjectCount = competitors.filter((c: any) => c.isSubject).length;
    if (subjectCount !== 1) {
      return res.status(400).json({
        error: `Exactly 1 subject required (got ${subjectCount})`
      });
    }

    const competitorCount = competitors.filter((c: any) => !c.isSubject).length;
    if (competitorCount !== 5) {
      return res.status(400).json({
        error: `Exactly 5 competitors required (got ${competitorCount})`
      });
    }

    console.log(`📊 Starting Google Ads competitive analysis via API...`);

    // Import and run analysis
    const { analyzeCompetitorSet } = await import('./main');
    const result = await analyzeCompetitorSet({ competitors }, { platform: 'google', adsPerPage: 5, daysBack: 90 });

    // Format response
    const response = {
      success: true,
      analysis_id: result.analysis_id,
      platform: 'google',
      subject: {
        name: result.subject.name,
        ad_count: result.subject.ad_count,
        hook_distribution: result.subject.hook_distribution,
        format_distribution: result.subject.format_distribution,
        cta_distribution: result.subject.cta_distribution,
        tone_distribution: result.subject.tone_distribution,
        offers_used: result.subject.offers_used,
        trust_signals_used: result.subject.trust_signals_used,
        pain_points_addressed: result.subject.pain_points_addressed,
        ad_length_distribution: result.subject.ad_length_distribution,
        usps: result.subject.usps
      },
      gaps: result.gaps,
      recommendations: result.recommendations,
      market_insights: result.market_insights,
      competitors: result.competitors.map(c => ({
        name: c.name,
        ad_count: c.ad_count,
        hook_distribution: c.hook_distribution,
        cta_distribution: c.cta_distribution,
        tone_distribution: c.tone_distribution,
        offers_used: c.offers_used,
        trust_signals_used: c.trust_signals_used,
        pain_points_addressed: c.pain_points_addressed,
        usps: c.usps
      }))
    };

    res.json(response);
  } catch (error: any) {
    console.error('Error in Google Ads competitive analysis:', error);

    if (error.message?.includes('No ads found')) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({
      error: 'Failed to complete Google Ads competitive analysis',
      message: error.message
    });
  }
});

/**
 * GET /api/competitor-analyses/:id
 * Get a previously completed competitive analysis by ID
 */
app.get('/api/competitor-analyses/:id', async (req: Request, res: Response) => {
  try {
    const analysisId = req.params.id;

    const { getCompetitorAnalysisById } = await import('./storage');
    const analysis = await getCompetitorAnalysisById(analysisId);

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Error fetching competitive analysis:', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

/**
 * GET /api/competitor-analyses
 * Get recent competitive analyses
 */
app.get('/api/competitor-analyses', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    const { getRecentCompetitorAnalyses } = await import('./storage');
    const analyses = await getRecentCompetitorAnalyses(limit);

    res.json(analyses);
  } catch (error) {
    console.error('Error fetching competitive analyses:', error);
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
});

/**
 * =====================================================================
 * IMAGE PROXY / CACHE ENDPOINT
 * Facebook CDN URLs expire — this endpoint fetches and caches images
 * locally so they remain accessible permanently.
 * =====================================================================
 */

const IMAGE_CACHE_DIR = path.join(__dirname, '..', 'image-cache');

// Ensure cache directory exists
if (!fs.existsSync(IMAGE_CACHE_DIR)) {
  fs.mkdirSync(IMAGE_CACHE_DIR, { recursive: true });
}

/**
 * GET /api/images/proxy?url=<encoded_url>
 * Fetches an external image, caches it locally, and serves it.
 * Subsequent requests for the same URL are served from cache.
 */
app.get('/api/images/proxy', async (req: Request, res: Response) => {
  try {
    const imageUrl = req.query.url as string;

    if (!imageUrl) {
      return res.status(400).json({ error: 'url query parameter is required' });
    }

    // Create a deterministic filename from the URL
    const urlHash = crypto.createHash('sha256').update(imageUrl).digest('hex');

    // Check if we already have it cached (try common extensions)
    const cachedFiles = fs.readdirSync(IMAGE_CACHE_DIR).filter(f => f.startsWith(urlHash));
    if (cachedFiles.length > 0) {
      const cachedPath = path.join(IMAGE_CACHE_DIR, cachedFiles[0]);
      const ext = path.extname(cachedFiles[0]).slice(1);
      const mimeMap: Record<string, string> = {
        jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
        gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
      };
      res.setHeader('Content-Type', mimeMap[ext] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      return fs.createReadStream(cachedPath).pipe(res);
    }

    // Fetch from the external URL
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Upstream returned ${response.status}` });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif',
      'image/webp': 'webp', 'image/svg+xml': 'svg',
    };
    const ext = extMap[contentType] || 'jpg';
    const filename = `${urlHash}.${ext}`;
    const filePath = path.join(IMAGE_CACHE_DIR, filename);

    // Save to cache and serve simultaneously
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.send(buffer);
  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(502).json({ error: 'Failed to fetch image' });
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Async startup function
async function startServer() {
  try {
    // Initialize database
    console.log('🔄 Initializing database connection...');
    await initializeDatabase();

    // Load settings from database
    console.log('🔄 Loading AdSpy settings from database...');
    await AdSpyConfig.loadSettings();

    // Start server
    app.listen(PORT, () => {
      console.log(`\n🚀 AdSpy API Server running on http://localhost:${PORT}`);
      console.log(``);
      console.log(`📊 Health & Info:`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
      console.log(``);
      console.log(`🏢 Brands API:`);
      console.log(`   All brands: http://localhost:${PORT}/api/brands`);
      console.log(`   Brand names: http://localhost:${PORT}/api/brands/names`);
      console.log(`   Brands with pages: http://localhost:${PORT}/api/brands/all-with-pages`);
      console.log(``);
      console.log(`📑 Brand Pages API (Multi-Page Support):`);
      console.log(`   GET/POST /api/brands/:id/pages`);
      console.log(`   PATCH/DELETE /api/brands/:brandId/pages/:pageId`);
      console.log(``);
      console.log(`📰 Ads API:`);
      console.log(`   All ads (filtered): http://localhost:${PORT}/api/ads`);
      console.log(`   Ad count: http://localhost:${PORT}/api/ads/count`);
      console.log(`   Legacy search: http://localhost:${PORT}/api/ads/search`);
      console.log(``);
      console.log(`⚙️  Settings API (Master Control):`);
      console.log(`   Global settings: http://localhost:${PORT}/api/settings`);
      console.log(`   Scraper status: http://localhost:${PORT}/api/settings/scraper-status`);
      console.log(`   Brand settings: GET/PATCH /api/brands/:id/settings`);
      console.log(`   Effective settings: /api/brands/:id/effective-settings`);
      console.log(`   Reload settings: POST /api/settings/reload`);
      console.log(``);
      console.log(`🎯 Competitive Analysis (1-vs-5 Ad Dominance Engine):`);
      console.log(`   POST /api/analyze-competitor-set`);
      console.log(`   GET /api/competitor-analyses/:id`);
      console.log(`   GET /api/competitor-analyses`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down API server...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Shutting down API server...');
  process.exit(0);
});
