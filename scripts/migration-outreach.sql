-- Outreach Pipeline Tables
-- Run: psql $DATABASE_URL -f scripts/migration-outreach.sql

-- Table 1: Campaigns
CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  industry VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  max_places INT DEFAULT 50 CHECK (max_places <= 500),
  status VARCHAR(50) DEFAULT 'created',
  error_message TEXT,
  total_leads INT DEFAULT 0,
  total_with_fb INT DEFAULT 0,
  total_analyzed INT DEFAULT 0,
  total_contacts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table 2: Leads (businesses from Google Places)
CREATE TABLE IF NOT EXISTS outreach_leads (
  id SERIAL PRIMARY KEY,
  campaign_id INT NOT NULL REFERENCES outreach_campaigns(id) ON DELETE CASCADE,
  place_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(100),
  website TEXT,
  rating DECIMAL(2,1),
  reviews_count INT DEFAULT 0,
  category_name VARCHAR(255),
  fb_page_url TEXT,
  fb_ads_url TEXT,
  google_ads_url TEXT,
  analysis_id UUID,
  status VARCHAR(50) DEFAULT 'new',
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table 3: Enriched contacts per lead
CREATE TABLE IF NOT EXISTS outreach_contacts (
  id SERIAL PRIMARY KEY,
  lead_id INT NOT NULL REFERENCES outreach_leads(id) ON DELETE CASCADE,
  campaign_id INT NOT NULL REFERENCES outreach_campaigns(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  email VARCHAR(255),
  title VARCHAR(255),
  seniority VARCHAR(100),
  linkedin_url TEXT,
  company_name VARCHAR(255),
  company_linkedin_url TEXT,
  email_status VARCHAR(50) DEFAULT 'found',
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_outreach_leads_campaign ON outreach_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_outreach_leads_status ON outreach_leads(status);
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_campaign ON outreach_contacts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_lead ON outreach_contacts(lead_id);
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_seniority ON outreach_contacts(seniority);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_outreach_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_outreach_campaigns_updated_at
  BEFORE UPDATE ON outreach_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_outreach_updated_at();

CREATE TRIGGER trg_outreach_leads_updated_at
  BEFORE UPDATE ON outreach_leads
  FOR EACH ROW EXECUTE FUNCTION update_outreach_updated_at();
