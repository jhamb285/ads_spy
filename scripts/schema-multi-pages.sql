-- AdSpy Tool: Multi-Page Brands + Master Control System
-- Schema Updates for Phase 1
-- This file adds new tables for multi-page brand support and global settings

-- ====================
-- TABLE: adspy_brand_pages
-- ====================
-- Stores multiple Facebook pages per brand (one-to-many relationship)
CREATE TABLE IF NOT EXISTS adspy_brand_pages (
  id SERIAL PRIMARY KEY,
  brand_id INT NOT NULL REFERENCES adspy_brands(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  page_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_scraped_at TIMESTAMP,
  total_ads_scraped INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(brand_id, page_url)
);

-- ====================
-- TABLE: adspy_settings
-- ====================
-- Stores global configuration for AdSpy system
CREATE TABLE IF NOT EXISTS adspy_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by VARCHAR(100) DEFAULT 'system'
);

-- ====================
-- INDEXES for adspy_brand_pages
-- ====================
CREATE INDEX IF NOT EXISTS idx_brand_pages_brand_id ON adspy_brand_pages(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_pages_active ON adspy_brand_pages(is_active);
CREATE INDEX IF NOT EXISTS idx_brand_pages_last_scraped ON adspy_brand_pages(last_scraped_at);

-- ====================
-- ADD COLUMNS to adspy_brands
-- ====================
-- Add per-brand override settings (NULL means use global settings)
DO $$
BEGIN
  -- Add max_ads_override if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'adspy_brands' AND column_name = 'max_ads_override'
  ) THEN
    ALTER TABLE adspy_brands ADD COLUMN max_ads_override INT;
  END IF;

  -- Add max_daily_ads_override if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'adspy_brands' AND column_name = 'max_daily_ads_override'
  ) THEN
    ALTER TABLE adspy_brands ADD COLUMN max_daily_ads_override INT;
  END IF;

  -- Add use_overrides if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'adspy_brands' AND column_name = 'use_overrides'
  ) THEN
    ALTER TABLE adspy_brands ADD COLUMN use_overrides BOOLEAN DEFAULT false;
  END IF;
END $$;

-- ====================
-- SEED GLOBAL SETTINGS
-- ====================
-- Insert default global settings (only if they don't exist)
INSERT INTO adspy_settings (key, value, description)
VALUES
  ('scraper_enabled', '{"enabled": true}', 'Master kill switch for AdSpy scraper'),
  ('max_ads_per_brand', '{"value": 10}', 'Default max ads to scrape per brand per run'),
  ('max_daily_ads_per_brand', '{"value": 3}', 'Default max ads per brand per day (prevents over-scraping)')
ON CONFLICT (key) DO NOTHING;

-- ====================
-- UPDATE TRIGGER for adspy_brand_pages
-- ====================
CREATE OR REPLACE FUNCTION update_brand_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER brand_pages_updated_at_trigger
BEFORE UPDATE ON adspy_brand_pages
FOR EACH ROW
EXECUTE FUNCTION update_brand_pages_updated_at();

-- ====================
-- UPDATE TRIGGER for adspy_settings
-- ====================
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER settings_updated_at_trigger
BEFORE UPDATE ON adspy_settings
FOR EACH ROW
EXECUTE FUNCTION update_settings_updated_at();

-- ====================
-- COMMENTS
-- ====================
COMMENT ON TABLE adspy_brand_pages IS 'Multiple Facebook pages per brand (one-to-many)';
COMMENT ON TABLE adspy_settings IS 'Global configuration for AdSpy system';
COMMENT ON COLUMN adspy_brand_pages.brand_id IS 'Foreign key to adspy_brands';
COMMENT ON COLUMN adspy_brand_pages.page_url IS 'Facebook page URL (must be unique within brand)';
COMMENT ON COLUMN adspy_brand_pages.is_active IS 'Whether this specific page should be scraped';
COMMENT ON COLUMN adspy_brands.max_ads_override IS 'Override global max_ads_per_brand (NULL = use global)';
COMMENT ON COLUMN adspy_brands.max_daily_ads_override IS 'Override global max_daily_ads (NULL = use global)';
COMMENT ON COLUMN adspy_brands.use_overrides IS 'Whether to use brand-specific overrides or global settings';

-- ====================
-- SUCCESS MESSAGE
-- ====================
DO $$
BEGIN
  RAISE NOTICE '✅ Multi-page brands schema created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'New tables:';
  RAISE NOTICE '  - adspy_brand_pages (stores multiple pages per brand)';
  RAISE NOTICE '  - adspy_settings (global configuration)';
  RAISE NOTICE '';
  RAISE NOTICE 'New columns on adspy_brands:';
  RAISE NOTICE '  - max_ads_override';
  RAISE NOTICE '  - max_daily_ads_override';
  RAISE NOTICE '  - use_overrides';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Run migration script to move existing page_url data';
  RAISE NOTICE '  npm run migrate:multi-pages';
END $$;
