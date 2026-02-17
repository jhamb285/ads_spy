-- Competitor Analysis Feature Database Schema
-- 1-vs-5 Ad Dominance Engine
-- Creates tables for storing competitive analysis results

-- ====================
-- TABLE: adspy_competitor_analyses
-- ====================
-- Stores complete competitive analysis results (1 subject vs 5 competitors)
CREATE TABLE IF NOT EXISTS adspy_competitor_analyses (
  analysis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Subject Brand Info
  subject_brand_name VARCHAR(255) NOT NULL,
  subject_domain TEXT NOT NULL,

  -- Competitor Metadata (array of competitor info)
  competitors JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Gap Analysis Results
  hook_gap_analysis JSONB,
  format_gap_analysis JSONB,
  dominant_patterns JSONB,

  -- Recommendations
  recommendations TEXT[],

  -- Stats
  total_subject_ads INT DEFAULT 0,
  total_competitor_ads INT DEFAULT 0,

  -- Timestamps
  analyzed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ====================
-- TABLE: adspy_competitor_analysis_ads
-- ====================
-- Links ads to competitive analyses with categorization
CREATE TABLE IF NOT EXISTS adspy_competitor_analysis_ads (
  id SERIAL PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES adspy_competitor_analyses(analysis_id) ON DELETE CASCADE,
  ad_id VARCHAR(255) NOT NULL REFERENCES adspy_ads(ad_id) ON DELETE CASCADE,

  -- Brand Classification
  is_subject BOOLEAN NOT NULL,

  -- AI-Generated Categorization
  hook_category VARCHAR(100),
  creative_format VARCHAR(50),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),

  -- Ensure no duplicate ad entries per analysis
  UNIQUE(analysis_id, ad_id)
);

-- ====================
-- INDEXES
-- ====================

-- Analysis lookup indexes
CREATE INDEX IF NOT EXISTS idx_competitor_analyses_analysis_id
  ON adspy_competitor_analyses(analysis_id);

CREATE INDEX IF NOT EXISTS idx_competitor_analyses_subject
  ON adspy_competitor_analyses(subject_brand_name);

CREATE INDEX IF NOT EXISTS idx_competitor_analyses_analyzed_at
  ON adspy_competitor_analyses(analyzed_at DESC);

-- Analysis ads lookup indexes
CREATE INDEX IF NOT EXISTS idx_competitor_analysis_ads_analysis_id
  ON adspy_competitor_analysis_ads(analysis_id);

CREATE INDEX IF NOT EXISTS idx_competitor_analysis_ads_ad_id
  ON adspy_competitor_analysis_ads(ad_id);

CREATE INDEX IF NOT EXISTS idx_competitor_analysis_ads_is_subject
  ON adspy_competitor_analysis_ads(is_subject);

CREATE INDEX IF NOT EXISTS idx_competitor_analysis_ads_hook_category
  ON adspy_competitor_analysis_ads(hook_category);

CREATE INDEX IF NOT EXISTS idx_competitor_analysis_ads_creative_format
  ON adspy_competitor_analysis_ads(creative_format);

-- ====================
-- COMMENTS
-- ====================

COMMENT ON TABLE adspy_competitor_analyses IS 'Competitive intelligence analyses: 1 subject brand vs 5 competitors';
COMMENT ON TABLE adspy_competitor_analysis_ads IS 'Links ads to competitive analyses with AI categorization';

COMMENT ON COLUMN adspy_competitor_analyses.competitors IS 'JSONB array of competitor metadata: [{name, domain, ad_count, top_hooks}]';
COMMENT ON COLUMN adspy_competitor_analyses.hook_gap_analysis IS 'Missing hooks and competitor hook distribution';
COMMENT ON COLUMN adspy_competitor_analyses.format_gap_analysis IS 'Format comparison (video/image/ugc/carousel)';
COMMENT ON COLUMN adspy_competitor_analyses.dominant_patterns IS 'Market insights: dominant hooks, formats, patterns';
COMMENT ON COLUMN adspy_competitor_analyses.recommendations IS 'Actionable strategic recommendations';

COMMENT ON COLUMN adspy_competitor_analysis_ads.is_subject IS 'TRUE if this ad belongs to the subject brand being analyzed';
COMMENT ON COLUMN adspy_competitor_analysis_ads.hook_category IS 'AI-categorized hook type (e.g., Discount/Urgency, Social Proof)';
COMMENT ON COLUMN adspy_competitor_analysis_ads.creative_format IS 'Detected format: video, image, ugc_video, carousel';

-- ====================
-- SUCCESS MESSAGE
-- ====================

DO $$
BEGIN
  RAISE NOTICE '✅ Competitor Analysis schema created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'New tables:';
  RAISE NOTICE '  - adspy_competitor_analyses (stores analysis results)';
  RAISE NOTICE '  - adspy_competitor_analysis_ads (links ads to analyses)';
  RAISE NOTICE '';
  RAISE NOTICE 'API Endpoint: POST /api/analyze-competitor-set';
  RAISE NOTICE 'Input: 1 subject + 5 competitor Facebook page URLs';
  RAISE NOTICE 'Output: Gap analysis + actionable recommendations';
END $$;
