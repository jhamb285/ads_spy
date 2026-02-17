-- AdSpy Tool Database Schema
-- Project 1: Ad Intelligence Migration
-- This script creates the database tables for the self-hosted AdSpy system

-- ====================
-- TABLE: adspy_brands
-- ====================
-- Stores the list of competitor brands to monitor
CREATE TABLE IF NOT EXISTS adspy_brands (
  id SERIAL PRIMARY KEY,
  avatar VARCHAR(255) NOT NULL,
  brand_name VARCHAR(255) NOT NULL,
  page_url TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  min_active_days INT DEFAULT 0,
  last_scraped_at TIMESTAMP,
  total_ads_scraped INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ====================
-- TABLE: adspy_ads
-- ====================
-- Stores full ad data and analysis results
CREATE TABLE IF NOT EXISTS adspy_ads (
  id SERIAL PRIMARY KEY,
  ad_id VARCHAR(255) UNIQUE NOT NULL,
  brand_id INT REFERENCES adspy_brands(id) ON DELETE SET NULL,
  brand_name VARCHAR(255),

  -- Raw Ad Data from Apify
  ad_url TEXT,
  ad_creative_url TEXT,
  ad_creative_link_title TEXT,
  ad_creative_link_caption TEXT,
  ad_creative_link_description TEXT,
  ad_creative_body TEXT,
  ad_snapshot_url TEXT,
  ad_delivery_start_time TIMESTAMP,
  ad_delivery_end_time TIMESTAMP,
  page_id VARCHAR(255),
  page_name VARCHAR(255),
  is_active BOOLEAN DEFAULT false,
  categories TEXT[],

  -- Processed Media Data
  transcript TEXT,
  image_description TEXT,
  image_url TEXT,
  video_url TEXT,

  -- LLM Analysis Results
  gemini_breakdown JSONB,
  hook_analysis TEXT,
  angle_analysis TEXT,
  structure_analysis TEXT,
  why_it_works TEXT,
  improvements TEXT,
  rewritten_ad TEXT,

  -- Metadata
  scraped_at TIMESTAMP DEFAULT NOW(),
  analyzed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ====================
-- INDEXES
-- ====================

-- Brand indexes
CREATE INDEX IF NOT EXISTS idx_adspy_brands_active ON adspy_brands(active);
CREATE INDEX IF NOT EXISTS idx_adspy_brands_brand_name ON adspy_brands(brand_name);

-- Ad indexes
CREATE INDEX IF NOT EXISTS idx_adspy_ads_brand_id ON adspy_ads(brand_id);
CREATE INDEX IF NOT EXISTS idx_adspy_ads_ad_id ON adspy_ads(ad_id);
CREATE INDEX IF NOT EXISTS idx_adspy_ads_scraped_at ON adspy_ads(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_adspy_ads_brand_name ON adspy_ads(brand_name);
CREATE INDEX IF NOT EXISTS idx_adspy_ads_is_active ON adspy_ads(is_active);

-- Full-text search index for ad content
CREATE INDEX IF NOT EXISTS idx_adspy_ads_search ON adspy_ads
USING gin(to_tsvector('english',
  COALESCE(ad_creative_body, '') || ' ' ||
  COALESCE(hook_analysis, '') || ' ' ||
  COALESCE(angle_analysis, '') || ' ' ||
  COALESCE(structure_analysis, '')
));

-- ====================
-- FUNCTIONS & TRIGGERS
-- ====================

-- Update updated_at timestamp on brand updates
CREATE OR REPLACE FUNCTION update_adspy_brands_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER adspy_brands_updated_at_trigger
BEFORE UPDATE ON adspy_brands
FOR EACH ROW
EXECUTE FUNCTION update_adspy_brands_updated_at();

-- ====================
-- COMMENTS
-- ====================

COMMENT ON TABLE adspy_brands IS 'Competitor brands being monitored for ad intelligence';
COMMENT ON TABLE adspy_ads IS 'Full archive of scraped ads with AI analysis';
COMMENT ON COLUMN adspy_ads.gemini_breakdown IS 'Gemini AI analysis result (structured JSON)';
COMMENT ON COLUMN adspy_ads.transcript IS 'Video transcription from Whisper API';
COMMENT ON COLUMN adspy_ads.image_description IS 'Image analysis from GPT-4 Vision';

-- ====================
-- SUCCESS MESSAGE
-- ====================

DO $$
BEGIN
  RAISE NOTICE '✅ AdSpy database schema created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Run: npm run migrate-brands  (to import default brands)';
  RAISE NOTICE '2. Configure .env with DATABASE_URL';
  RAISE NOTICE '3. Start bot: npm run bot';
END $$;
