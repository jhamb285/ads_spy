-- Platform Support Migration
-- Adds platform column to distinguish Facebook vs Google ads
-- Required for: Google Ads Competitive Analysis Feature

-- ====================
-- ADD PLATFORM COLUMN TO adspy_ads
-- ====================
DO $$
BEGIN
  -- Add platform column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'adspy_ads' AND column_name = 'platform'
  ) THEN
    ALTER TABLE adspy_ads ADD COLUMN platform VARCHAR(50) DEFAULT 'facebook' NOT NULL;
    RAISE NOTICE '✅ Added platform column to adspy_ads';
  ELSE
    RAISE NOTICE 'ℹ️  platform column already exists in adspy_ads';
  END IF;
END $$;

-- ====================
-- CREATE INDEX FOR PLATFORM
-- ====================
CREATE INDEX IF NOT EXISTS idx_adspy_ads_platform ON adspy_ads(platform);

-- ====================
-- BACKFILL EXISTING DATA
-- ====================
-- Set all existing ads to 'facebook' platform
UPDATE adspy_ads SET platform = 'facebook' WHERE platform IS NULL OR platform = '';

-- ====================
-- ADD PLATFORM COLUMN TO adspy_competitor_analyses
-- ====================
DO $$
BEGIN
  -- Add platform column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'adspy_competitor_analyses' AND column_name = 'platform'
  ) THEN
    ALTER TABLE adspy_competitor_analyses ADD COLUMN platform VARCHAR(50) DEFAULT 'facebook' NOT NULL;
    RAISE NOTICE '✅ Added platform column to adspy_competitor_analyses';
  ELSE
    RAISE NOTICE 'ℹ️  platform column already exists in adspy_competitor_analyses';
  END IF;
END $$;

-- ====================
-- CREATE INDEX FOR COMPETITOR ANALYSES PLATFORM
-- ====================
CREATE INDEX IF NOT EXISTS idx_competitor_analyses_platform ON adspy_competitor_analyses(platform);

-- ====================
-- BACKFILL COMPETITOR ANALYSES DATA
-- ====================
-- Set all existing analyses to 'facebook' platform
UPDATE adspy_competitor_analyses SET platform = 'facebook' WHERE platform IS NULL OR platform = '';

-- ====================
-- ADD COMMENTS
-- ====================
COMMENT ON COLUMN adspy_ads.platform IS 'Advertising platform: facebook, google';
COMMENT ON COLUMN adspy_competitor_analyses.platform IS 'Platform used for competitive analysis: facebook, google';

-- ====================
-- VERIFICATION QUERIES
-- ====================
-- Verify platform column exists and data is backfilled
DO $$
DECLARE
  ads_count INT;
  analyses_count INT;
BEGIN
  -- Count ads by platform
  SELECT COUNT(*) INTO ads_count FROM adspy_ads WHERE platform = 'facebook';

  -- Count analyses by platform
  SELECT COUNT(*) INTO analyses_count FROM adspy_competitor_analyses WHERE platform = 'facebook';

  RAISE NOTICE '';
  RAISE NOTICE '✅ Platform migration completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Migration Summary:';
  RAISE NOTICE '  - adspy_ads: % ads set to platform=facebook', ads_count;
  RAISE NOTICE '  - adspy_competitor_analyses: % analyses set to platform=facebook', analyses_count;
  RAISE NOTICE '  - Indexes created: idx_adspy_ads_platform, idx_competitor_analyses_platform';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Deploy platform abstraction layer code';
  RAISE NOTICE '  2. Test Google Ads scraping';
  RAISE NOTICE '  3. Deploy new API endpoint: POST /api/analyze-google-competitor-set';
END $$;
