import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

export type BrandItem = {
  avatar: string;      // e.g. "Truck Drivers", "Agency Owners"
  brandName: string;   // e.g. "Drive for Quantix"
  pageUrl: string;     // Facebook page URL, used by Apify
  minActiveDays?: number; // Minimum days ad must be active to be analyzed (optional, per brand)
};

// Default brand list
const DEFAULT_BRAND_LIST: BrandItem[] = [
  {
    avatar: "Rosabella",
    brandName: "Rosabella",
    pageUrl: "https://www.facebook.com/moringabyrosabella/",
    minActiveDays: 5,
  },
  { "avatar": "Spirituality", "brandName": "spirilet.com", "pageUrl": "https://www.facebook.com/106105038806701" },
  { "avatar": "Spirituality", "brandName": "https://projectyourself.com/", "pageUrl": "https://www.facebook.com/134795180050249" },
  { "avatar": "Spirituality", "brandName": "https://mindfulsouls.com/", "pageUrl": "https://www.facebook.com/184817572099721" },
  { "avatar": "Spirituality", "brandName": "www.karmaitems.com", "pageUrl": "https://www.facebook.com/109598535381020" },
  { "avatar": "Spirituality", "brandName": "https://369project.com/", "pageUrl": "https://www.facebook.com/102792421439477" },
  { "avatar": "Insecure Men", "brandName": "shopvitacore.comultimapeak.com", "pageUrl": "https://www.facebook.com/831843123349383" },
  { "avatar": "Insecure Men", "brandName": "bluestarnutraceuticals.com", "pageUrl": "https://www.facebook.com/144653225549096" },
  { "avatar": "Insecure Men", "brandName": "naturalrems.com", "pageUrl": "https://www.facebook.com/234300143107077" },
  { "avatar": "Insecure Men", "brandName": "hygienelab.com", "pageUrl": "https://www.facebook.com/127347197126621" },
  { "avatar": "Insecure Men", "brandName": "https://menerals.com/", "pageUrl": "https://www.facebook.com/536258462915019" },
  { "avatar": "Insecure Men", "brandName": "innosupps.com", "pageUrl": "https://www.facebook.com/329949444375869" },
  { "avatar": "Insecure Men", "brandName": "mengotomars.com", "pageUrl": "https://www.facebook.com/184711951390377" },
  { "avatar": "Insecure Men", "brandName": "ancestralsupplements.co", "pageUrl": "https://www.facebook.com/187583778382475" },
  { "avatar": "Insecure Men", "brandName": "xarashilajit.com", "pageUrl": "https://www.facebook.com/292335420816699" },
  { "avatar": "Insecure Men", "brandName": "peakshilajitstore.com", "pageUrl": "https://www.facebook.com/108920655642266" },
  { "avatar": "Bloating/Constipation/Poop", "brandName": "Emma relief", "pageUrl": "https://www.facebook.com/105745751961937" },
  { "avatar": "Bloating/Constipation/Poop", "brandName": "Colonbroom", "pageUrl": "https://www.facebook.com/103357974681001" },
  { "avatar": "Bloating/Constipation/Poop", "brandName": "ARMRA", "pageUrl": "https://www.facebook.com/109196117495123" },
  { "avatar": "Bloating/Constipation/Poop", "brandName": "Arrae", "pageUrl": "https://www.facebook.com/108401623899597" },
  { "avatar": "Bloating/Constipation/Poop", "brandName": "Happy mammoth", "pageUrl": "https://www.facebook.com/1343771369029582" },
  { "avatar": "Bloating/Constipation/Poop", "brandName": "Seed", "pageUrl": "https://www.facebook.com/181356250331" },
  { "avatar": "Detox", "brandName": "sourplus.com (detox)", "pageUrl": "https://www.facebook.com/104134227645898" },
  { "avatar": "Detox", "brandName": "Organicsnature.co (detox)", "pageUrl": "https://www.facebook.com/102488931453396" },
  { "avatar": "Detox", "brandName": "Catakor (detox)", "pageUrl": "https://www.facebook.com/671948515999679" },
  { "avatar": "Detox", "brandName": "Sereneherbs (detox)", "pageUrl": "https://www.facebook.com/248307828359857" },
  { "avatar": "Detox", "brandName": "https://resilia.shop/", "pageUrl": "https://www.facebook.com/547622448442236" },
  { "avatar": "Detox", "brandName": "ethale.com", "pageUrl": "https://www.facebook.com/108386698678340" },
  { "avatar": "Detox", "brandName": "oryanhealth.com", "pageUrl": "https://www.facebook.com/836023079584036" },
  { "avatar": "Detox", "brandName": "tryprimehaven.com", "pageUrl": "https://www.facebook.com/562055046990799" },
  { "avatar": "Detox", "brandName": "Saffralabs.shop", "pageUrl": "https://www.facebook.com/879284728598966" },
  { "avatar": "Detox", "brandName": "trynutrivora.com", "pageUrl": "https://www.facebook.com/614603678409016" },
  { "avatar": "Detox", "brandName": "maryruthorganics.com", "pageUrl": "https://www.facebook.com/461471903707959" },
  { "avatar": "Detox", "brandName": "auvely.com", "pageUrl": "https://www.facebook.com/109719045226605" },
  { "avatar": "Detox", "brandName": "freerangesupplements.com", "pageUrl": "https://www.facebook.com/107538644953379" },
  { "avatar": "Detox", "brandName": "tryvelvra.com", "pageUrl": "https://www.facebook.com/652010014665723" },
  { "avatar": "Detox", "brandName": "Dosedaily", "pageUrl": "https://www.facebook.com/112242250425540" },
  { "avatar": "Cortisol/puffy face", "brandName": "Rosabella", "pageUrl": "https://www.facebook.com/389183070942458" },
  { "avatar": "Cortisol/puffy face", "brandName": "Pulsetto.tech", "pageUrl": "https://www.facebook.com/104835338849392" },
  { "avatar": "Cortisol/puffy face", "brandName": "shaktimat.com", "pageUrl": "https://www.facebook.com/414329738918974" },
  { "avatar": "General", "brandName": "Primal Queen", "pageUrl": "https://www.facebook.com/125572610639402" },
  { "avatar": "General", "brandName": "Ryze", "pageUrl": "https://www.facebook.com/107940537227344" },
  { "avatar": "General", "brandName": "Norse Organics", "pageUrl": "https://www.facebook.com/125701703959711" },
  { "avatar": "General", "brandName": "Neurodrops", "pageUrl": "https://www.facebook.com/527023310491879" },
  { "avatar": "General", "brandName": "Grounding.co", "pageUrl": "https://www.facebook.com/107385845781364" },
  { "avatar": "General", "brandName": "Lhanel", "pageUrl": "https://www.facebook.com/150123041508232" },
  { "avatar": "General", "brandName": "Sassysaints", "pageUrl": "https://www.facebook.com/105363611534516" },
  { "avatar": "General", "brandName": "Heyshape", "pageUrl": "https://www.facebook.com/108815292124532" },
  { "avatar": "General", "brandName": "Smooche", "pageUrl": "https://www.facebook.com/114830840156278" },
  { "avatar": "General", "brandName": "Polar hair care", "pageUrl": "https://www.facebook.com/888537411001717" },
  { "avatar": "General", "brandName": "Forchics", "pageUrl": "https://www.facebook.com/109982436998264" },
  { "avatar": "General", "brandName": "Spoiledchild", "pageUrl": "https://www.facebook.com/103345698622969" },
  { "avatar": "General", "brandName": "Trybello.com", "pageUrl": "https://www.facebook.com/100494126121683" },
  { "avatar": "General", "brandName": "Earlybirdmorning cocktails", "pageUrl": "https://www.facebook.com/138237812716146" },
  { "avatar": "General", "brandName": "trybloomin.com", "pageUrl": "https://www.facebook.com/503989472801936" },
  { "avatar": "General", "brandName": "Neurobrocc", "pageUrl": "https://www.facebook.com/812765235568779" },
  { "avatar": "General", "brandName": "Petlabsco", "pageUrl": "https://www.facebook.com/177930899801067" },
  { "avatar": "General", "brandName": "Spacegoods", "pageUrl": "https://www.facebook.com/104163495557745" },
  { "avatar": "General", "brandName": "Serenova beauty", "pageUrl": "https://www.facebook.com/820573164478851" },
  { "avatar": "General", "brandName": "Fifth ray", "pageUrl": "https://www.facebook.com/110765378766779" },
  { "avatar": "General", "brandName": "Olavita skin", "pageUrl": "https://www.facebook.com/114540138243153" },
  { "avatar": "General", "brandName": "Thermoslim.co", "pageUrl": "https://www.facebook.com/103303048248229" },
  { "avatar": "General", "brandName": "Terra health", "pageUrl": "https://www.facebook.com/428304487728046" },
  { "avatar": "General", "brandName": "Nutri Paw", "pageUrl": "https://www.facebook.com/100862391745873" },
  { "avatar": "General", "brandName": "Taos footwear", "pageUrl": "https://www.facebook.com/134519076619788" },
  { "avatar": "General", "brandName": "City beauty", "pageUrl": "https://www.facebook.com/1431625556919604" },
  { "avatar": "General", "brandName": "Froya organics", "pageUrl": "https://www.facebook.com/278851805311073" },
  { "avatar": "General", "brandName": "Happy mammoth", "pageUrl": "https://www.facebook.com/1343771369029582" },
  { "avatar": "General", "brandName": "Scandinavian biolabs", "pageUrl": "https://www.facebook.com/108462620630298" },
  { "avatar": "General", "brandName": "Everyday dose", "pageUrl": "https://www.facebook.com/102454544917397" },
  { "avatar": "General", "brandName": "Thera hair", "pageUrl": "https://www.facebook.com/139011999285191" },
  { "avatar": "General", "brandName": "Montysupps.com", "pageUrl": "https://www.facebook.com/736039796252458" },
  { "avatar": "General", "brandName": "Fleava.shop", "pageUrl": "https://www.facebook.com/180128691861413" },
  { "avatar": "General", "brandName": "trylipocore.com", "pageUrl": "https://www.facebook.com/498772106662651" },
  { "avatar": "General", "brandName": "Obvi", "pageUrl": "https://www.facebook.com/2431731276838642" },
  { "avatar": "General", "brandName": "Undrdog", "pageUrl": "https://www.facebook.com/196764956858148" },
  { "avatar": "General", "brandName": "Arrae", "pageUrl": "https://www.facebook.com/108401623899597" },
  { "avatar": "General", "brandName": "FLO", "pageUrl": "https://www.facebook.com/142179242517441" },
  { "avatar": "General", "brandName": "holistichealthlabs.com", "pageUrl": "https://www.facebook.com/307068659928253" },
  { "avatar": "General", "brandName": "Enhanced scents", "pageUrl": "https://www.facebook.com/101440846193082" },
  { "avatar": "General", "brandName": "Getvitalix", "pageUrl": "https://www.facebook.com/455291037660905" },
  { "avatar": "General", "brandName": "Veganic", "pageUrl": "https://www.facebook.com/525636463965098" },
  { "avatar": "General", "brandName": "Klonescents", "pageUrl": "https://www.facebook.com/119921011103446" },
  { "avatar": "General", "brandName": "Botanic", "pageUrl": "https://www.facebook.com/138946309458915" },
  { "avatar": "General", "brandName": "Infinityhoop", "pageUrl": "https://www.facebook.com/101304882243072" },
  { "avatar": "General", "brandName": "Magicstyler", "pageUrl": "https://www.facebook.com/277755915431693" },
  { "avatar": "General", "brandName": "Flow pouches", "pageUrl": "https://www.facebook.com/381074388432842" },
  { "avatar": "General", "brandName": "Capyera", "pageUrl": "https://www.facebook.com/110593825333849" },
  { "avatar": "General", "brandName": "FODZYME", "pageUrl": "https://www.facebook.com/108903474669342" },
  { "avatar": "General", "brandName": "kittyspout.com", "pageUrl": "https://www.facebook.com/102825741868911" },
  { "avatar": "General", "brandName": "maelyscosmetics.com", "pageUrl": "https://www.facebook.com/145474042804451" },
  // Add more brands here as needed
];

/**
 * Load brand list from database (ASYNC)
 * Falls back to getBrandListSync() if database unavailable
 * Use this for new code
 */
export async function getBrandListAsync(): Promise<BrandItem[]> {
  try {
    const { getPool } = await import('./storage');
    const pool = getPool();

    const result = await pool.query(`
      SELECT avatar, brand_name, page_url, min_active_days
      FROM adspy_brands
      WHERE active = true
      ORDER BY brand_name ASC
    `);

    if (result.rowCount && result.rowCount > 0) {
      console.log(`📋 Loaded ${result.rowCount} active brand(s) from database`);
      return result.rows.map(row => ({
        avatar: row.avatar,
        brandName: row.brand_name,
        pageUrl: row.page_url,
        minActiveDays: row.min_active_days || 0
      }));
    }

    // No brands in database, return default list
    console.warn('⚠️  No brands found in database, using default brand list');
    return getBrandListSync();
  } catch (error) {
    // Database not available, fall back to sync method
    console.warn('⚠️  Database not available, using fallback brand list');
    return getBrandListSync();
  }
}

/**
 * Load brand list from configuration (SYNC) - for backward compatibility
 * Priority:
 * 1. BRAND_LIST environment variable (JSON string)
 * 2. brands.json file in project root
 * 3. Default hardcoded list
 */
export function getBrandListSync(): BrandItem[] {
  // Try environment variable first
  const envBrandList = process.env.BRAND_LIST;
  if (envBrandList) {
    try {
      const brands = JSON.parse(envBrandList) as BrandItem[];
      if (Array.isArray(brands) && brands.length > 0) {
        console.log(`📋 Loaded ${brands.length} brands from BRAND_LIST environment variable`);
        return brands;
      }
    } catch (error) {
      console.warn('⚠️  Failed to parse BRAND_LIST environment variable, trying file...');
    }
  }

  // Try brands.json file
  const brandsFile = path.join(process.cwd(), 'brands.json');
  if (fs.existsSync(brandsFile)) {
    try {
      const fileContent = fs.readFileSync(brandsFile, 'utf-8');
      const brands = JSON.parse(fileContent) as BrandItem[];
      if (Array.isArray(brands) && brands.length > 0) {
        console.log(`📋 Loaded ${brands.length} brands from brands.json`);
        return brands;
      }
    } catch (error) {
      console.warn('⚠️  Failed to parse brands.json, using default list...');
    }
  }

  // Fall back to default
  console.log(`📋 Using default brand list (${DEFAULT_BRAND_LIST.length} brands)`);
  return DEFAULT_BRAND_LIST;
}

// Export default brand list for migration script
export { DEFAULT_BRAND_LIST };

// Export for backward compatibility (but prefer using getBrandListAsync())
export const BRAND_LIST = getBrandList();

export interface Config {
  apifyApiToken: string;
  slackToken?: string;
  slackChannel?: string; // DEPRECATED: Use slackChannelStatic and slackChannelVideos
  slackChannelStatic?: string; // Channel for image/static ads
  slackChannelVideos?: string; // Channel for video ads
  geminiApiKey: string; // Replaced OpenAI with Gemini
  offerDescription: string;
  maxAdsPerBrand: number; // DEPRECATED: Use AdSpyConfig.getMaxAdsForBrand()
  daysBack?: number; // Optional: filter ads by days back
  minActiveDays?: number; // Optional: minimum days ad must be active to be analyzed (default for all brands)
}

/**
 * AdSpy Configuration Manager
 * Loads settings from database with fallback to environment variables
 */
export class AdSpyConfig {
  private static settings: {
    scraper_enabled: boolean;
    max_ads_per_brand: number;
    max_daily_ads_per_brand: number;
  } | null = null;

  /**
   * Load global settings from database
   * Call this once at application startup
   */
  static async loadSettings(): Promise<void> {
    try {
      const { getSettings } = await import('./storage');
      const settings = await getSettings();

      this.settings = {
        scraper_enabled: settings.scraper_enabled,
        max_ads_per_brand: settings.max_ads_per_brand,
        max_daily_ads_per_brand: settings.max_daily_ads_per_brand,
      };

      console.log('⚙️  AdSpy settings loaded from database:', {
        scraperEnabled: this.settings.scraper_enabled,
        maxAdsPerBrand: this.settings.max_ads_per_brand,
        maxDailyAdsPerBrand: this.settings.max_daily_ads_per_brand,
      });
    } catch (error) {
      console.warn('⚠️  Failed to load settings from database, using fallback values');
      this.settings = {
        scraper_enabled: process.env.SCRAPER_ENABLED !== 'false', // default: true
        max_ads_per_brand: parseInt(process.env.MAX_ADS_PER_BRAND || '10', 10),
        max_daily_ads_per_brand: parseInt(process.env.MAX_DAILY_ADS_PER_BRAND || '3', 10),
      };
    }
  }

  /**
   * Check if scraper is globally enabled (master kill switch)
   */
  static isScraperEnabled(): boolean {
    if (!this.settings) {
      console.warn('⚠️  Settings not loaded, defaulting scraper to enabled');
      return true;
    }
    return this.settings.scraper_enabled;
  }

  /**
   * Get max ads to scrape for a brand
   * Considers brand-specific overrides
   */
  static async getMaxAdsForBrand(brandId: number): Promise<number> {
    try {
      const { getEffectiveBrandSettings } = await import('./storage');
      const effectiveSettings = await getEffectiveBrandSettings(brandId);
      return effectiveSettings.max_ads_per_brand;
    } catch (error) {
      console.warn(`⚠️  Failed to get brand settings for brand ${brandId}, using global default`);
      return this.settings?.max_ads_per_brand || 10;
    }
  }

  /**
   * Get max daily ads limit for a brand
   * Considers brand-specific overrides
   */
  static async getMaxDailyAdsForBrand(brandId: number): Promise<number> {
    try {
      const { getEffectiveBrandSettings } = await import('./storage');
      const effectiveSettings = await getEffectiveBrandSettings(brandId);
      return effectiveSettings.max_daily_ads_per_brand;
    } catch (error) {
      console.warn(`⚠️  Failed to get brand settings for brand ${brandId}, using global default`);
      return this.settings?.max_daily_ads_per_brand || 3;
    }
  }

  /**
   * Check if brand has reached daily limit
   */
  static async hasBrandReachedDailyLimit(brandId: number): Promise<boolean> {
    try {
      const { getAdsScrapedToday } = await import('./storage');
      const scrapedToday = await getAdsScrapedToday(brandId);
      const dailyLimit = await this.getMaxDailyAdsForBrand(brandId);

      return scrapedToday >= dailyLimit;
    } catch (error) {
      console.warn(`⚠️  Failed to check daily limit for brand ${brandId}, allowing scrape`);
      return false;
    }
  }

  /**
   * Get global settings (read-only)
   */
  static getGlobalSettings() {
    return this.settings ? { ...this.settings } : null;
  }

  /**
   * Force reload settings from database
   * Use this after settings are updated via API
   */
  static async reloadSettings(): Promise<void> {
    await this.loadSettings();
  }
}

/**
 * Backward compatibility alias
 */
export function getBrandList(): BrandItem[] {
  return getBrandListSync();
}

export function getConfig(): Config {
  const apifyApiToken = process.env.APIFY_API_TOKEN;
  const slackToken = process.env.SLACK_TOKEN;

  // New: Separate channels for static and video ads
  const slackChannelStatic = process.env.SLACK_CHANNEL_STATIC || 'adspy-static';
  const slackChannelVideos = process.env.SLACK_CHANNEL_VIDEOS || 'adspy-videos';

  // Deprecated: Single channel (fallback for backward compatibility)
  const slackChannel = process.env.SLACK_CHANNEL || 'adspy-feed';

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const offerDescription = process.env.OFFER_DESCRIPTION;

  // DEPRECATED: Use AdSpyConfig.getMaxAdsForBrand() instead
  const maxAdsPerBrand = parseInt(process.env.MAX_ADS_PER_BRAND || '10', 10);
  const daysBack = process.env.DAYS_BACK ? parseInt(process.env.DAYS_BACK, 10) : undefined;
  const minActiveDays = process.env.MIN_ACTIVE_DAYS ? parseInt(process.env.MIN_ACTIVE_DAYS, 10) : undefined;

  if (!apifyApiToken) throw new Error('APIFY_API_TOKEN is required');
  if (!geminiApiKey) throw new Error('GEMINI_API_KEY is required');
  if (!offerDescription) throw new Error('OFFER_DESCRIPTION is required');

  // Slack is optional for main mode, required for bot mode
  // No warning here - let the caller decide

  return {
    apifyApiToken,
    slackToken,
    slackChannel,
    slackChannelStatic,
    slackChannelVideos,
    geminiApiKey,
    offerDescription,
    maxAdsPerBrand,
    daysBack,
    minActiveDays,
  };
}

