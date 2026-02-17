# Google Ads Competitive Analysis - Setup Guide

## Overview

This system adds **Google Ads competitive analysis** capabilities parallel to the existing Facebook Ads system. Since Google has no public Ads Library (unlike Facebook), we use **keyword-based SERP scraping** to extract competitor ads.

## Architecture

```
Platform Abstraction Layer
├── Facebook Client (existing)
│   └── Scrapes Facebook Ads Library via Apify
└── Google Client (NEW)
    └── Scrapes Google Search Results (SERP) via Apify
```

### Key Differences: Facebook vs Google

| Feature | Facebook Ads | Google Ads |
|---------|-------------|------------|
| **Data Source** | Public Ads Library | SERP scraping |
| **Input** | Facebook page URL | Website domain + industry |
| **Scraper** | `apify/facebook-ads-scraper` | `apify/google-search-scraper` |
| **Ad Format** | Image/video/carousel | Text-only (search ads) |
| **Required Fields** | `name`, `domain`, `isSubject` | `name`, `domain`, `isSubject`, **`industry`** |
| **Cost per analysis** | ~$0.35-0.45 | ~$0.25-0.30 |

---

## Setup Instructions

### Step 1: Run Database Migration

The database migration adds a `platform` column to distinguish Facebook vs Google ads.

```bash
npm run migrate:platform
```

This will:
- Add `platform` column to `adspy_ads` table
- Add `platform` column to `adspy_competitor_analyses` table
- Backfill existing data with `platform='facebook'`
- Create indexes for efficient querying

**Verification**:
```sql
-- Check column exists
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'adspy_ads' AND column_name = 'platform';

-- Verify data
SELECT platform, COUNT(*) FROM adspy_ads GROUP BY platform;
```

---

### Step 2: Compile TypeScript

```bash
npm run build
```

This compiles the new platform abstraction layer:
- `src/platforms/types.ts` → `dist/platforms/types.js`
- `src/platforms/factory.ts` → `dist/platforms/factory.js`
- `src/platforms/facebook/` → `dist/platforms/facebook/`
- `src/platforms/google/` → `dist/platforms/google/`

---

### Step 3: Test Google Ads Scraping

```bash
npm run test-google-ads
```

This runs a full Google Ads competitive analysis for the pest control industry:
- Scrapes ads for 6 brands (1 subject + 5 competitors)
- Analyzes hook distribution and gaps
- Generates recommendations
- Stores results in database

**Expected output**:
```
🧪 Testing Google Ads Competitive Analysis
📊 Test Input:
   - Subject: Orkin Pest Control
   - Competitors: Terminix, Aptive Environmental, ...
   - Platform: Google Ads (SERP scraping)

🚀 Starting Google Ads competitive analysis...
✅ Analysis Complete!

📊 Results Summary:
   - Analysis ID: 550e8400-...
   - Subject Ads: 5
   - Competitor Ads: 20
```

---

## API Usage

### Endpoint: `POST /api/analyze-google-competitor-set`

**Request**:
```bash
curl -X POST http://localhost:1002/api/analyze-google-competitor-set \
  -H "Content-Type: application/json" \
  -d '{
    "competitors": [
      {
        "name": "Orkin Pest Control",
        "domain": "orkin.com",
        "industry": "pest control",
        "isSubject": true
      },
      {
        "name": "Terminix",
        "domain": "terminix.com",
        "industry": "pest control",
        "isSubject": false
      },
      {
        "name": "Aptive Environmental",
        "domain": "goaptive.com",
        "industry": "pest control",
        "isSubject": false
      },
      {
        "name": "Mosquito Squad",
        "domain": "mosquitosquad.com",
        "industry": "mosquito control",
        "isSubject": false
      },
      {
        "name": "Mosquito Joe",
        "domain": "mosquitojoe.com",
        "industry": "mosquito control",
        "isSubject": false
      },
      {
        "name": "TruGreen",
        "domain": "trugreen.com",
        "industry": "lawn care",
        "isSubject": false
      }
    ]
  }'
```

**Response**:
```json
{
  "success": true,
  "analysis_id": "550e8400-e29b-41d4-a716-446655440000",
  "platform": "google",
  "subject": {
    "name": "Orkin Pest Control",
    "ad_count": 5,
    "hook_distribution": {
      "Discount/Urgency": 2,
      "Social Proof": 1,
      "Authority": 2
    },
    "format_distribution": {
      "text": 5
    }
  },
  "gaps": {
    "missing_hooks": ["Fear of Loss", "Transformation"],
    "underutilized_formats": [],
    "winning_competitors": ["Terminix", "Aptive Environmental"]
  },
  "recommendations": [
    {
      "priority": "high",
      "action": "Add Fear of Loss hooks to Google Ads",
      "rationale": "Terminix uses 'Limited time offer' with 40% CTR improvement",
      "example": "Competitor ad: 'Only 3 days left - Book now!'"
    }
  ],
  "market_insights": {
    "dominant_hook_type": "Discount/Urgency",
    "dominant_format": "text",
    "average_competitor_ad_count": 4.2
  },
  "competitors": [...]
}
```

---

## How Google Ads Scraping Works

### 1. Keyword Generation

Based on the `industry` field, we generate search queries:

```javascript
// Example for "pest control"
keywords = [
  "pest control",
  "pest control services",
  "pest control near me",
  "best pest control",
  "pest control company"
]

// For local businesses, add location-based queries:
keywords.push(
  "pest control nyc",
  "pest control los angeles",
  "pest control chicago"
)
```

### 2. SERP Scraping

For each keyword, we scrape Google Search using Apify:

```javascript
const input = {
  queries: ["pest control"],
  resultsPerPage: 20,
  maxPagesPerQuery: 1,
  countryCode: 'us',
  languageCode: 'en'
};

const run = await apifyClient
  .actor('nFJndFXA5zjCTuudP') // apify/google-search-scraper
  .call(input);
```

### 3. Ad Extraction

Extract ads from SERP results that match the target domain:

```javascript
const paidResults = firstResult.paidResults || [];
const ads = paidResults.filter(result =>
  result.url.includes('orkin.com')
);
```

### 4. Normalization

Convert SERP ads to common `NormalizedAd` format:

```javascript
{
  id: "google-1234567890-abc123",
  text: "Orkin Pest Control - 24/7 Service\nSame day service. Free inspection. Call now!",
  title: "Orkin Pest Control - 24/7 Service",
  linkUrl: "https://orkin.com/offer",
  platform: "google",
  ...
}
```

### 5. Analysis Pipeline

From here, the **same analysis pipeline** runs for both Facebook and Google:
- Hook categorization (Gemini AI)
- Competitive gap analysis
- Recommendation generation (OpenAI)
- Storage in database

---

## Industry Keywords Configuration

### Supported Industries

The system automatically generates keywords for common industries:

| Industry | Keywords Generated |
|----------|-------------------|
| `pest control` | pest control, pest control services, pest control near me, best pest control, pest control company, pest control nyc, pest control los angeles, pest control chicago |
| `dentist` | dentist, dentist services, dentist near me, best dentist, dentist clinic, dentist nyc, dentist los angeles, dentist chicago |
| `lawyer` | lawyer, lawyer services, lawyer near me, best lawyer, law firm, lawyer nyc, lawyer los angeles, lawyer chicago |
| `plumber` | plumber, plumber services, plumber near me, best plumber, plumber company, plumber nyc, plumber los angeles, plumber chicago |

### Custom Keywords (Future Enhancement)

In the future, you can provide custom keywords:

```json
{
  "name": "Orkin",
  "domain": "orkin.com",
  "industry": "pest control",
  "keywords": [
    "termite treatment",
    "bed bug exterminator",
    "rodent control"
  ]
}
```

---

## Database Schema

### Platform Column

Both `adspy_ads` and `adspy_competitor_analyses` tables now have a `platform` column:

```sql
ALTER TABLE adspy_ads
ADD COLUMN platform VARCHAR(50) DEFAULT 'facebook' NOT NULL;

ALTER TABLE adspy_competitor_analyses
ADD COLUMN platform VARCHAR(50) DEFAULT 'facebook' NOT NULL;
```

### Querying by Platform

```sql
-- Get all Google Ads
SELECT * FROM adspy_ads WHERE platform = 'google';

-- Get Facebook Ads analyses
SELECT * FROM adspy_competitor_analyses WHERE platform = 'facebook';

-- Count ads by platform
SELECT platform, COUNT(*) FROM adspy_ads GROUP BY platform;
```

---

## Cost Analysis

### Per Analysis (1 subject + 5 competitors)

**Google Ads**:
- 5 keywords × 6 brands = 30 Google Search queries
- Apify cost: ~$0.01 (Google Search scraper is cheap)
- Gemini AI (hook categorization): ~$0.05-0.10
- OpenAI GPT-4o (recommendations): ~$0.10-0.15
- **Total: ~$0.25-0.30 per analysis**

**Facebook Ads** (for comparison):
- Apify Facebook scraper: ~$0.20-0.25
- Gemini AI: ~$0.05-0.10
- OpenAI GPT-4o: ~$0.10-0.15
- **Total: ~$0.35-0.45 per analysis**

**Savings**: Google Ads is ~30% cheaper per analysis!

---

## Troubleshooting

### Error: "Industry is required for Google Ads"

**Cause**: Missing `industry` field in competitor object

**Solution**: Add `industry` field to all competitors:
```json
{
  "name": "Brand Name",
  "domain": "example.com",
  "industry": "pest control",  // ← REQUIRED
  "isSubject": false
}
```

---

### Error: "No ads found for subject brand"

**Causes**:
1. Brand has no Google Ads presence
2. Industry keywords are too generic
3. Domain doesn't match ads (e.g., searching for "nike.com" but ads redirect to "nike.com/shoes")

**Solutions**:
1. Verify brand runs Google Ads by manually searching
2. Provide more specific `industry` field
3. Use the exact domain that appears in Google Ads

---

### Low Ad Count (<5 ads found)

**Causes**:
1. Brand has limited Google Ads presence
2. Ads are geographically targeted
3. Rate limiting by Google

**Solutions**:
1. Increase `daysBack` parameter to 90+ days
2. Add location-based keywords
3. Add delays between searches (already implemented: 1.5s delay)

---

## Testing Checklist

- [ ] Database migration completed (`npm run migrate:platform`)
- [ ] TypeScript compilation successful (`npm run build`)
- [ ] Google Ads test passes (`npm run test-google-ads`)
- [ ] Facebook ads still work (regression test)
- [ ] API endpoint returns valid response
- [ ] Data stored in database with `platform='google'`
- [ ] Analysis ID generated correctly

---

## Future Enhancements

### Phase 7 (Post-MVP)

1. **AI-Powered Keyword Generation**
   - Analyze website content to generate better keywords
   - Use OpenAI to suggest industry-specific search terms

2. **Multi-Platform Analysis**
   - Single endpoint that runs BOTH Facebook + Google analysis
   - Combined insights: "Your Facebook ads have X hook but Google ads miss Y"

3. **Historical Tracking**
   - Track ads over time (weekly snapshots)
   - Identify trend changes in competitor strategies

4. **Visual Ad Support for Google**
   - Scrape Google Display Network ads (image/video)
   - Currently only supports Search Text Ads

5. **Auto-Industry Detection**
   - Extract industry from website content automatically
   - Remove need for manual `industry` field

---

## Support

For issues or questions:
1. Check error logs: `pm2 logs ads-intel-api`
2. Verify database migration: `SELECT * FROM adspy_ads LIMIT 1;`
3. Test scraper directly: `npm run test-google-ads`
4. Report issues at: https://github.com/anthropics/claude-code/issues
