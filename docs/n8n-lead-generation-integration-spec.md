# n8n Lead Generation + Competitive Analysis Integration

## Document Overview

**Purpose**: This specification provides complete technical guidance for building an n8n workflow that generates leads from Google Maps and analyzes them using the AdSpy competitive analysis system.

**Target Audience**: n8n workflow developers

**Last Updated**: February 12, 2026

**System Version**: AdSpy 1-vs-5 Ad Dominance Engine (Feb 11, 2026)

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Apify Google Maps Scraper Configuration](#2-apify-google-maps-scraper-configuration)
3. [Competitor Grouping Logic](#3-competitor-grouping-logic)
4. [Facebook Page Discovery](#4-facebook-page-discovery)
5. [AdSpy API Integration](#5-adspy-api-integration)
6. [n8n Workflow Design](#6-n8n-workflow-design)
7. [Example Use Case Walkthrough](#7-example-use-case-walkthrough)
8. [Configuration & Environment](#8-configuration--environment)
9. [Error Handling & Edge Cases](#9-error-handling--edge-cases)
10. [Cost Estimation](#10-cost-estimation)
11. [Performance Optimization](#11-performance-optimization)
12. [Testing Plan](#12-testing-plan)
13. [Reference Documentation](#13-reference-documentation)

---

## 1. Overview & Architecture

### System Goal

Create an automated lead generation workflow that:
1. Discovers businesses via Google Maps search
2. Groups them into competitive sets
3. Finds their Facebook pages
4. Analyzes their advertising strategies
5. Returns actionable competitive intelligence

### Workflow Diagram

```
┌─────────────────┐
│  User Input     │
│  "dentists in   │
│   Austin, TX"   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Apify Google Maps      │
│  Scraper                │
│  (50-100 businesses)    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Parse & Filter         │
│  Business Data          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  For Each Business:     │
│  ┌──────────────────┐   │
│  │ 1. Select as     │   │
│  │    Subject       │   │
│  │ 2. Find 2-5      │   │
│  │    Competitors   │   │
│  │ 3. Discover FB   │   │
│  │    Pages         │   │
│  │ 4. Call AdSpy    │   │
│  │    API           │   │
│  └──────────────────┘   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  AdSpy API              │
│  POST /api/analyze-     │
│  competitor-set         │
│                         │
│  • Scrapes 30 ads       │
│  • Analyzes hooks       │
│  • Identifies gaps      │
│  • Generates recs       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Aggregate Results      │
│  • 20 analyses          │
│  • Market insights      │
│  • Summary report       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Store & Notify         │
│  • Database/Sheet       │
│  • Email/Slack          │
└─────────────────────────┘
```

### System Components

**External Services**:
- **Apify**: Google Maps business scraper
- **Google Custom Search API**: Facebook page discovery (fallback)
- **AdSpy API**: Competitive ad analysis engine

**n8n Nodes Required**:
- Form Trigger (user input)
- HTTP Request (Apify, Google Search, AdSpy API)
- Code (data transformation, grouping logic)
- Split In Batches (parallel processing)
- Merge (aggregate results)
- Database/Spreadsheet (storage)
- Email/Slack (notifications)

### Data Flow

```
Google Maps Data → Competitor Groups → Facebook URLs → AdSpy Analysis → Results
```

**Key Data Transformations**:
1. Apify output → Structured business objects
2. Business objects → Competitor sets (1 subject + 2-5 competitors)
3. Business info → Facebook page URLs
4. Competitor sets → AdSpy API requests
5. API responses → Aggregated insights

---

## 2. Apify Google Maps Scraper Configuration

### Actor Information

- **Actor ID**: `WnMxbsRLNbPeYL6ge`
- **Actor Name**: Google Maps Scraper
- **Documentation**: https://console.apify.com/actors/WnMxbsRLNbPeYL6ge/information/latest/readme

### n8n HTTP Request Node Configuration

**Method**: POST

**URL**: `https://api.apify.com/v2/acts/WnMxbsRLNbPeYL6ge/runs`

**Authentication**:
- Type: Bearer Token
- Token: `{{$env.APIFY_API_TOKEN}}`

**Headers**:
```json
{
  "Content-Type": "application/json"
}
```

**Body** (JSON):
```json
{
  "searchQuery": "{{$json.searchQuery}}",
  "maxResults": {{$json.maxResults}},
  "language": "en",
  "includeWebsite": true,
  "includePhone": true
}
```

### Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `searchQuery` | string | Yes | - | Search term (e.g., "dentists in Austin, TX") |
| `maxResults` | number | No | 50 | Maximum businesses to scrape (1-100) |
| `language` | string | No | "en" | Results language |
| `includeWebsite` | boolean | No | true | Include website URLs (needed for FB discovery) |
| `includePhone` | boolean | No | true | Include phone numbers |

### Expected Output Structure

```json
{
  "items": [
    {
      "title": "Austin Dental Care",
      "address": "123 Main St, Austin, TX 78701",
      "phone": "+1 512-555-0100",
      "website": "https://austindentalcare.com",
      "categoryName": "Dental clinic",
      "rating": 4.8,
      "reviewsCount": 342,
      "location": {
        "lat": 30.2672,
        "lng": -97.7431
      },
      "placeId": "ChIJN1t_abc123xyz",
      "url": "https://www.google.com/maps/place/..."
    }
  ]
}
```

### Key Fields for Workflow

| Field | Purpose |
|-------|---------|
| `title` | Business name (for competitor matching) |
| `website` | Primary source for Facebook URL discovery |
| `categoryName` | Used for competitor grouping |
| `reviewsCount` | Used for size-based grouping |
| `rating` | Quality indicator |
| `address` | Deduplication |

### Parsing the Response

**n8n Code Node** (after Apify request):
```javascript
// Apify returns a dataset URL in the response
const runId = $input.item.json.data.id;
const datasetUrl = `https://api.apify.com/v2/acts/WnMxbsRLNbPeYL6ge/runs/${runId}/dataset/items`;

// Wait for run to complete, then fetch results
// (n8n handles this with "Wait for Webhook" pattern)
```

---

## 3. Competitor Grouping Logic

### Grouping Strategy

**Objective**: For each business, find 2-5 similar competitors to create meaningful competitive analyses.

**Similarity Criteria**:
1. **Category Match**: Same or similar business type
2. **Size Tier**: Similar review count (small/medium/large)
3. **Geographic Proximity**: Same city/region (already filtered by search)

### Size Tier Definitions

```javascript
function getSizeTier(reviewsCount) {
  if (reviewsCount <= 50) return 'small';
  if (reviewsCount <= 200) return 'medium';
  return 'large';
}
```

| Tier | Reviews Range | Typical Business Profile |
|------|---------------|--------------------------|
| Small | 0-50 | New/local businesses |
| Medium | 51-200 | Established local businesses |
| Large | 200+ | Major players, chains |

### Grouping Algorithm

**n8n Code Node Implementation**:

```javascript
// Input: Array of businesses from Apify
const businesses = $input.all().map(item => item.json);

// Helper function
function getSizeTier(reviewsCount) {
  if (reviewsCount <= 50) return 'small';
  if (reviewsCount <= 200) return 'medium';
  return 'large';
}

// Create competitor sets for each business
const competitorSets = [];

for (let i = 0; i < businesses.length; i++) {
  const subject = businesses[i];
  const subjectTier = getSizeTier(subject.reviewsCount);

  // Find competitors: same category + similar size
  let competitors = businesses.filter((b, idx) => {
    if (idx === i) return false; // Skip self

    const sameTier = getSizeTier(b.reviewsCount) === subjectTier;
    const sameCategory = b.categoryName === subject.categoryName;

    return sameTier && sameCategory;
  });

  // If fewer than 2 competitors in tier, expand to adjacent tiers
  if (competitors.length < 2) {
    competitors = businesses.filter((b, idx) => {
      if (idx === i) return false;
      return b.categoryName === subject.categoryName;
    });
  }

  // Take top 5 competitors (by review count for relevance)
  competitors = competitors
    .sort((a, b) => b.reviewsCount - a.reviewsCount)
    .slice(0, 5);

  // Only create set if we have at least 2 competitors
  if (competitors.length >= 2) {
    competitorSets.push({
      subject: subject,
      competitors: competitors,
      setSize: competitors.length + 1
    });
  }
}

return competitorSets;
```

### Handling Edge Cases

**Case 1: Not enough competitors in same category**
```javascript
// Fallback: expand to similar categories
const categoryMapping = {
  'Dental clinic': ['Cosmetic dentist', 'Orthodontist', 'Dentist'],
  'Italian restaurant': ['Restaurant', 'Pizza restaurant'],
  // Add more mappings as needed
};
```

**Case 2: All businesses are different sizes**
```javascript
// Fallback: ignore tier, just match by category
competitors = businesses.filter((b, idx) =>
  idx !== i && b.categoryName === subject.categoryName
);
```

**Case 3: Fewer than 2 total competitors**
```javascript
// Skip this business (cannot create meaningful analysis with <3 total businesses)
console.log(`Skipping ${subject.title}: insufficient competitors`);
continue;
```

### Output Format

```json
{
  "subject": {
    "title": "Austin Dental Care",
    "website": "https://austindentalcare.com",
    "categoryName": "Dental clinic",
    "reviewsCount": 342,
    "tier": "large"
  },
  "competitors": [
    {
      "title": "Smile Dental",
      "website": "https://smiledental.com",
      "reviewsCount": 298,
      "tier": "large"
    },
    {
      "title": "Premier Dentistry",
      "website": "https://premierdentistry.com",
      "reviewsCount": 401,
      "tier": "large"
    }
  ],
  "setSize": 3
}
```

---

## 4. Facebook Page Discovery

### Overview

**Goal**: Convert business information into Facebook page URLs for ad analysis.

**Two-Step Process**:
1. **Primary**: Extract from Google Maps website field
2. **Fallback**: Google search for business Facebook page

### Step 1: Website Field Extraction

**n8n Code Node**:

```javascript
const competitorSet = $input.item.json;
const allBusinesses = [competitorSet.subject, ...competitorSet.competitors];
const results = [];

for (const business of allBusinesses) {
  let facebookUrl = null;

  if (business.website) {
    // Check if website redirects to Facebook
    if (business.website.includes('facebook.com')) {
      facebookUrl = extractFacebookUrl(business.website);
    }
  }

  results.push({
    ...business,
    facebookUrl: facebookUrl,
    discoveryMethod: facebookUrl ? 'website_field' : 'not_found'
  });
}

function extractFacebookUrl(url) {
  // Extract clean Facebook page URL
  const match = url.match(/facebook\.com\/([^\/\?]+)/);
  if (match) {
    return `https://facebook.com/${match[1]}`;
  }
  return null;
}

return results;
```

### Step 2: Google Search Fallback

**For businesses without Facebook URL from Step 1**:

**n8n HTTP Request Node** (Google Custom Search API):

**URL**: `https://www.googleapis.com/customsearch/v1`

**Query Parameters**:
```javascript
{
  "key": "{{$env.GOOGLE_SEARCH_API_KEY}}",
  "cx": "{{$env.GOOGLE_SEARCH_ENGINE_ID}}",
  "q": "{{$json.title}} facebook page",
  "num": 5
}
```

**Parse Response** (Code Node):
```javascript
const searchResults = $input.item.json.items || [];
let facebookUrl = null;

for (const result of searchResults) {
  if (result.link && result.link.includes('facebook.com')) {
    const match = result.link.match(/facebook\.com\/([^\/\?]+)/);
    if (match) {
      facebookUrl = `https://facebook.com/${match[1]}`;
      break;
    }
  }
}

return {
  ...$input.item.json,
  facebookUrl: facebookUrl,
  discoveryMethod: facebookUrl ? 'google_search' : 'not_found'
};
```

### Facebook URL Validation

**Requirements**:
- Must be `facebook.com/{pagename}` format
- Exclude user profiles (`facebook.com/profile.php?id=`)
- Exclude groups (`facebook.com/groups/`)
- Exclude events (`facebook.com/events/`)

**Validation Function**:
```javascript
function isValidFacebookPage(url) {
  if (!url || !url.includes('facebook.com')) return false;

  // Exclude invalid patterns
  const invalidPatterns = [
    '/profile.php',
    '/groups/',
    '/events/',
    '/pages/category/',
    '/hashtag/'
  ];

  for (const pattern of invalidPatterns) {
    if (url.includes(pattern)) return false;
  }

  // Must have page name
  const match = url.match(/facebook\.com\/([^\/\?]+)/);
  return match && match[1].length > 0;
}
```

### Handling Missing Facebook Pages

**Option 1: Skip business entirely**
```javascript
if (!business.facebookUrl) {
  console.log(`Skipping ${business.title}: no Facebook page found`);
  continue;
}
```

**Option 2: Log and continue with reduced set**
```javascript
const validBusinesses = competitorSet.filter(b => b.facebookUrl);
if (validBusinesses.length < 3) {
  console.log(`Insufficient businesses with Facebook pages`);
  continue;
}
```

### Discovery Success Rates (Expected)

| Method | Success Rate | Notes |
|--------|--------------|-------|
| Website field | 60-70% | Many businesses link to Facebook |
| Google search | 20-30% | Additional discovery |
| **Total** | **80-90%** | Combined success rate |

---

## 5. AdSpy API Integration

### Endpoint Information

**Base URL**: `http://178.156.213.149:1002`

**Endpoint**: `POST /api/analyze-competitor-set`

**Authentication**: None (currently open)

**Timeout**: 120 seconds (analysis processes 30 ads)

### Request Format

**n8n HTTP Request Node Configuration**:

**Method**: POST

**URL**: `http://178.156.213.149:1002/api/analyze-competitor-set`

**Headers**:
```json
{
  "Content-Type": "application/json"
}
```

**Body Structure**:
```json
{
  "competitors": [
    {
      "name": "Subject Business Name",
      "domain": "https://facebook.com/subject-page",
      "isSubject": true
    },
    {
      "name": "Competitor 1 Name",
      "domain": "https://facebook.com/competitor1-page",
      "isSubject": false
    },
    {
      "name": "Competitor 2 Name",
      "domain": "https://facebook.com/competitor2-page",
      "isSubject": false
    }
  ]
}
```

**Critical Requirements**:
- Exactly **1** competitor with `isSubject: true`
- **2-5** competitors with `isSubject: false`
- Total: 3-6 competitors in array
- `domain` must be valid Facebook page URL

### Building the Request

**n8n Code Node**:

```javascript
const competitorSet = $input.item.json;

// Filter for businesses with valid Facebook URLs
const subject = competitorSet.subject;
const competitors = competitorSet.competitors.filter(c => c.facebookUrl);

// Validate minimum requirements
if (!subject.facebookUrl) {
  throw new Error(`Subject ${subject.title} has no Facebook page`);
}

if (competitors.length < 2) {
  throw new Error(`Insufficient competitors with Facebook pages: ${competitors.length}`);
}

// Build API payload
const payload = {
  competitors: [
    {
      name: subject.title,
      domain: subject.facebookUrl,
      isSubject: true
    },
    ...competitors.slice(0, 5).map(c => ({
      name: c.title,
      domain: c.facebookUrl,
      isSubject: false
    }))
  ]
};

return { json: payload };
```

### Response Structure

**Success Response** (200 OK):
```json
{
  "success": true,
  "analysis_id": "550e8400-e29b-41d4-a716-446655440000",
  "subject": {
    "name": "Austin Dental Care",
    "ad_count": 5,
    "hook_distribution": {
      "Discount/Urgency": 2,
      "Social Proof": 2,
      "Transformation": 1
    },
    "format_distribution": {
      "image": 3,
      "video": 2
    }
  },
  "gaps": {
    "missing_hooks": ["Fear of Loss", "Authority"],
    "underutilized_formats": ["ugc_video", "carousel"],
    "winning_competitors": ["Smile Dental", "Premier Dentistry"]
  },
  "recommendations": [
    {
      "priority": "high",
      "hook_type": "Fear of Loss",
      "action": "Add scarcity messaging to create urgency",
      "example": "Smile Dental uses 'Only 5 appointment slots left this week'",
      "implementation": "Test limited availability messaging in next ad campaign"
    },
    {
      "priority": "medium",
      "hook_type": "Authority",
      "action": "Showcase credentials and expertise",
      "example": "Premier Dentistry highlights '20+ years experience, Board Certified'",
      "implementation": "Feature dentist credentials in ad copy and visuals"
    }
  ],
  "market_insights": {
    "dominant_hook_type": "Social Proof",
    "dominant_format": "video",
    "average_competitor_ad_count": 4.2,
    "market_summary": "Competitors heavily use customer testimonials and video content"
  },
  "competitors": [
    {
      "name": "Smile Dental",
      "ad_count": 5,
      "hook_distribution": { /*...*/ },
      "format_distribution": { /*...*/ }
    }
  ]
}
```

### Hook Categories Reference

| Hook Type | Description | Example |
|-----------|-------------|---------|
| Discount/Urgency | Limited-time offers, scarcity | "50% off - ends Sunday!" |
| Social Proof | Reviews, testimonials, ratings | "500+ 5-star reviews" |
| Fear of Loss | FOMO, consequences of inaction | "Don't miss out on..." |
| Problem-Agitate | Highlight pain points | "Tired of toothaches?" |
| Curiosity Gap | Intrigue, questions | "The secret to..." |
| Authority | Credentials, expertise | "Award-winning dentist" |
| Transformation | Before/after, results | "Get your dream smile" |
| Educational | Tips, how-to, value | "5 tips for healthy teeth" |
| Other | Uncategorized | - |

### Creative Format Reference

| Format | Description |
|--------|-------------|
| image | Static image ads |
| video | Produced video content |
| ugc_video | User-generated video content |
| carousel | Multi-image swipeable ads |

### Error Responses

**400 Bad Request** - Invalid input:
```json
{
  "success": false,
  "error": "Must have exactly 1 subject and 2-5 competitors"
}
```

**404 Not Found** - No ads found:
```json
{
  "success": false,
  "error": "No Facebook ads found for: Austin Dental Care"
}
```

**500 Internal Server Error** - Processing failed:
```json
{
  "success": false,
  "error": "Analysis failed: Apify scraping timeout"
}
```

### Error Handling in n8n

**Code Node** (after API response):
```javascript
const response = $input.item.json;

if (!response.success) {
  console.error(`Analysis failed for ${$item(0).json.competitors[0].name}`);
  console.error(`Error: ${response.error}`);

  return {
    json: {
      status: 'failed',
      subject: $item(0).json.competitors[0].name,
      error: response.error,
      timestamp: new Date().toISOString()
    }
  };
}

// Success - pass through
return { json: response };
```

---

## 6. n8n Workflow Design

### Complete Node Flow

This section provides a step-by-step breakdown of all n8n nodes required for the complete workflow.

#### Node 1: Form Trigger

**Node Type**: `Webhook` or `Manual Trigger` with form

**Configuration**:
- **Input Fields**:
  - `searchQuery` (string, required): e.g., "dentists in Austin, TX"
  - `maxResults` (number, default 50): Number of businesses to scrape

**Output**:
```json
{
  "searchQuery": "dentists in Austin, TX",
  "maxResults": 50
}
```

---

#### Node 2: Call Apify Google Maps Scraper

**Node Type**: `HTTP Request`

**Settings**:
- Method: POST
- URL: `https://api.apify.com/v2/acts/WnMxbsRLNbPeYL6ge/runs`
- Authentication: Bearer Token (`{{$env.APIFY_API_TOKEN}}`)
- Body:
```json
{
  "searchQuery": "{{$json.searchQuery}}",
  "maxResults": {{$json.maxResults}},
  "language": "en",
  "includeWebsite": true,
  "includePhone": true
}
```

**Output**: Apify run ID

---

#### Node 3: Wait for Apify Run Completion

**Node Type**: `HTTP Request` (polling loop)

**Settings**:
- Method: GET
- URL: `https://api.apify.com/v2/acts/WnMxbsRLNbPeYL6ge/runs/{{$node["Node 2"].json.data.id}}`
- Authentication: Bearer Token
- Retry: Every 10 seconds until `status === "SUCCEEDED"`

---

#### Node 4: Fetch Apify Results

**Node Type**: `HTTP Request`

**Settings**:
- Method: GET
- URL: `https://api.apify.com/v2/acts/WnMxbsRLNbPeYL6ge/runs/{{$node["Node 2"].json.data.id}}/dataset/items`
- Authentication: Bearer Token

**Output**: Array of businesses

---

#### Node 5: Parse and Filter Business Data

**Node Type**: `Code`

**Code**:
```javascript
const items = $input.item.json;

// Filter out businesses without essential data
const validBusinesses = items.filter(business => {
  return business.title &&
         business.categoryName &&
         business.reviewsCount !== undefined;
});

// Deduplicate by title + address
const seen = new Set();
const deduplicated = validBusinesses.filter(business => {
  const key = `${business.title.toLowerCase()}|${business.address}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

return deduplicated.map(b => ({ json: b }));
```

**Output**: Array of valid, unique businesses

---

#### Node 6: Create Competitor Sets

**Node Type**: `Code`

**Code**: (Use grouping algorithm from Section 3)

```javascript
const businesses = $input.all().map(item => item.json);

function getSizeTier(reviewsCount) {
  if (reviewsCount <= 50) return 'small';
  if (reviewsCount <= 200) return 'medium';
  return 'large';
}

const competitorSets = [];

for (let i = 0; i < businesses.length; i++) {
  const subject = businesses[i];
  const subjectTier = getSizeTier(subject.reviewsCount);

  let competitors = businesses.filter((b, idx) => {
    if (idx === i) return false;
    const sameTier = getSizeTier(b.reviewsCount) === subjectTier;
    const sameCategory = b.categoryName === subject.categoryName;
    return sameTier && sameCategory;
  });

  if (competitors.length < 2) {
    competitors = businesses.filter((b, idx) => {
      if (idx === i) return false;
      return b.categoryName === subject.categoryName;
    });
  }

  competitors = competitors
    .sort((a, b) => b.reviewsCount - a.reviewsCount)
    .slice(0, 5);

  if (competitors.length >= 2) {
    competitorSets.push({
      subject: subject,
      competitors: competitors,
      setSize: competitors.length + 1
    });
  }
}

return competitorSets.map(set => ({ json: set }));
```

**Output**: Array of competitor sets

---

#### Node 7: Split Into Batches

**Node Type**: `Split In Batches`

**Settings**:
- Batch Size: 5 (process 5 analyses in parallel)

---

#### Node 8: Discover Facebook Pages (Primary Method)

**Node Type**: `Code`

**Code**:
```javascript
const competitorSet = $input.item.json;
const allBusinesses = [competitorSet.subject, ...competitorSet.competitors];

function extractFacebookUrl(url) {
  if (!url) return null;
  const match = url.match(/facebook\.com\/([^\/\?]+)/);
  if (match) {
    return `https://facebook.com/${match[1]}`;
  }
  return null;
}

const results = allBusinesses.map(business => {
  let facebookUrl = null;

  if (business.website && business.website.includes('facebook.com')) {
    facebookUrl = extractFacebookUrl(business.website);
  }

  return {
    ...business,
    facebookUrl: facebookUrl,
    discoveryMethod: facebookUrl ? 'website_field' : 'pending_search',
    needsGoogleSearch: !facebookUrl
  };
});

return {
  json: {
    subject: results[0],
    competitors: results.slice(1)
  }
};
```

**Output**: Competitor set with Facebook URLs (if found)

---

#### Node 9: IF Node - Check if Google Search Needed

**Node Type**: `IF`

**Condition**: `{{$json.subject.needsGoogleSearch || $json.competitors.some(c => c.needsGoogleSearch)}}`

- **True**: Route to Google Search Node
- **False**: Route directly to Build API Payload

---

#### Node 10: Google Search for Missing Facebook Pages (Optional)

**Node Type**: `HTTP Request`

**Settings**:
- Method: GET
- URL: `https://www.googleapis.com/customsearch/v1`
- Parameters:
```json
{
  "key": "{{$env.GOOGLE_SEARCH_API_KEY}}",
  "cx": "{{$env.GOOGLE_SEARCH_ENGINE_ID}}",
  "q": "{{$json.title}} facebook page",
  "num": 5
}
```

**Note**: This node would need to loop through each business that needs search. Consider using a Loop Over Items approach or creating a function to batch searches.

---

#### Node 11: Parse Google Search Results

**Node Type**: `Code`

**Code**:
```javascript
const searchResults = $input.item.json.items || [];
let facebookUrl = null;

for (const result of searchResults) {
  if (result.link && result.link.includes('facebook.com')) {
    const match = result.link.match(/facebook\.com\/([^\/\?]+)/);
    if (match) {
      // Validate it's not a profile, group, or event
      const invalidPatterns = ['/profile.php', '/groups/', '/events/'];
      const isInvalid = invalidPatterns.some(p => result.link.includes(p));

      if (!isInvalid) {
        facebookUrl = `https://facebook.com/${match[1]}`;
        break;
      }
    }
  }
}

return {
  json: {
    ...$input.item.json,
    facebookUrl: facebookUrl,
    discoveryMethod: facebookUrl ? 'google_search' : 'not_found'
  }
};
```

---

#### Node 12: Build AdSpy API Payload

**Node Type**: `Code`

**Code**:
```javascript
const competitorSet = $input.item.json;

const subject = competitorSet.subject;
const competitors = competitorSet.competitors.filter(c => c.facebookUrl);

// Validate minimum requirements
if (!subject.facebookUrl) {
  console.log(`Skipping ${subject.title}: no Facebook page`);
  return null;
}

if (competitors.length < 2) {
  console.log(`Skipping ${subject.title}: insufficient competitors with FB pages (${competitors.length})`);
  return null;
}

// Build API payload
const payload = {
  competitors: [
    {
      name: subject.title,
      domain: subject.facebookUrl,
      isSubject: true
    },
    ...competitors.slice(0, 5).map(c => ({
      name: c.title,
      domain: c.facebookUrl,
      isSubject: false
    }))
  ],
  metadata: {
    searchQuery: $workflow.staticData.searchQuery,
    subjectCategory: subject.categoryName,
    subjectReviews: subject.reviewsCount
  }
};

return { json: payload };
```

**Output**: AdSpy API request payload

---

#### Node 13: Call AdSpy API

**Node Type**: `HTTP Request`

**Settings**:
- Method: POST
- URL: `http://178.156.213.149:1002/api/analyze-competitor-set`
- Headers: `Content-Type: application/json`
- Body: `{{$json}}`
- Timeout: 120000 (2 minutes)
- Retry on Fail: Yes (3 attempts with exponential backoff)

**Output**: AdSpy analysis response

---

#### Node 14: Process Analysis Results

**Node Type**: `Code`

**Code**:
```javascript
const response = $input.item.json;

if (!response.success) {
  return {
    json: {
      status: 'failed',
      subject: response.subject?.name || 'unknown',
      error: response.error,
      timestamp: new Date().toISOString()
    }
  };
}

// Extract key insights
return {
  json: {
    status: 'success',
    analysis_id: response.analysis_id,
    subject: {
      name: response.subject.name,
      ad_count: response.subject.ad_count,
      hooks: response.subject.hook_distribution,
      formats: response.subject.format_distribution
    },
    gaps: {
      missing_hooks: response.gaps.missing_hooks,
      underutilized_formats: response.gaps.underutilized_formats,
      winners: response.gaps.winning_competitors
    },
    recommendations: response.recommendations.slice(0, 3), // Top 3
    market: {
      dominant_hook: response.market_insights.dominant_hook_type,
      dominant_format: response.market_insights.dominant_format
    },
    timestamp: new Date().toISOString()
  }
};
```

---

#### Node 15: Merge All Results

**Node Type**: `Merge` (after Split In Batches completes)

**Settings**:
- Mode: Keep Key Matches
- Combine all analysis results into single array

---

#### Node 16: Create Summary Report

**Node Type**: `Code`

**Code**:
```javascript
const analyses = $input.all().map(item => item.json);

// Filter successful analyses
const successful = analyses.filter(a => a.status === 'success');
const failed = analyses.filter(a => a.status === 'failed');

// Aggregate insights
const hookCounts = {};
const formatCounts = {};

successful.forEach(analysis => {
  const dominant_hook = analysis.market.dominant_hook;
  const dominant_format = analysis.market.dominant_format;

  hookCounts[dominant_hook] = (hookCounts[dominant_hook] || 0) + 1;
  formatCounts[dominant_format] = (formatCounts[dominant_format] || 0) + 1;
});

const mostCommonHook = Object.keys(hookCounts).reduce((a, b) =>
  hookCounts[a] > hookCounts[b] ? a : b
);

const mostCommonFormat = Object.keys(formatCounts).reduce((a, b) =>
  formatCounts[a] > formatCounts[b] ? a : b
);

return {
  json: {
    summary: {
      total_businesses: analyses.length,
      successful_analyses: successful.length,
      failed_analyses: failed.length,
      success_rate: `${Math.round(successful.length / analyses.length * 100)}%`
    },
    market_overview: {
      most_common_hook: mostCommonHook,
      most_common_format: mostCommonFormat,
      hook_distribution: hookCounts,
      format_distribution: formatCounts
    },
    analyses: successful,
    failures: failed.map(f => ({
      business: f.subject,
      error: f.error
    }))
  }
};
```

---

#### Node 17: Store Results (Database/Spreadsheet)

**Node Type**: `HTTP Request` or `Google Sheets` node

**For Database** (HTTP Request):
- Method: POST
- URL: Your database API endpoint
- Body: `{{$json}}`

**For Google Sheets**:
- Operation: Append Row
- Sheet: "Lead Analyses"
- Values: Extract fields from summary

---

#### Node 18: Send Notification

**Node Type**: `Email` or `Slack` node

**Email Example**:
- To: User email
- Subject: `Lead Analysis Complete: {{$json.summary.successful_analyses}} businesses analyzed`
- Body:
```
Your lead generation analysis is complete!

Summary:
- Total businesses: {{$json.summary.total_businesses}}
- Successful analyses: {{$json.summary.successful_analyses}}
- Failed: {{$json.summary.failed_analyses}}

Market Insights:
- Most common hook type: {{$json.market_overview.most_common_hook}}
- Most common ad format: {{$json.market_overview.most_common_format}}

View full results: [link to dashboard]
```

---

### Workflow Diagram

```
[1] Form Trigger
     │
     ▼
[2] Call Apify
     │
     ▼
[3] Wait for Completion
     │
     ▼
[4] Fetch Results
     │
     ▼
[5] Parse & Filter ────────────────┐
     │                             │
     ▼                             │
[6] Create Competitor Sets         │
     │                             │
     ▼                             │
[7] Split In Batches (Size: 5) ◄───┘
     │
     ├─► [8] Discover FB Pages (Primary)
     │        │
     │        ▼
     │   [9] IF: Needs Google Search?
     │        │
     │        ├─► YES: [10] Google Search
     │        │         │
     │        │         ▼
     │        │    [11] Parse Search Results
     │        │         │
     │        │         └─────────┐
     │        │                   │
     │        └─► NO ─────────────┤
     │                            │
     │   ┌────────────────────────┘
     │   │
     │   ▼
     ├─► [12] Build API Payload
     │        │
     │        ▼
     ├─► [13] Call AdSpy API
     │        │
     │        ▼
     └─► [14] Process Results
              │
              ▼
         (Batch Loop)
              │
              ▼
         [15] Merge Results
              │
              ▼
         [16] Create Summary
              │
              ▼
         [17] Store Results
              │
              ▼
         [18] Send Notification
```

### Processing Time Estimates

| Node | Time | Notes |
|------|------|-------|
| 1-4 | 2-5 min | Apify scraping 50 businesses |
| 5-6 | <10 sec | Data processing |
| 7-14 | 10-25 min | 5 parallel batches × 2-5 min per analysis |
| 15-18 | <30 sec | Aggregation and notification |
| **Total** | **12-30 min** | For 20-25 businesses |

---

## 7. Example Use Case Walkthrough

### Scenario: Analyzing Dental Clinics in Austin, TX

**User Goal**: Discover dental clinics in Austin and understand their Facebook advertising strategies.

---

### Step-by-Step Execution

#### Step 1: User Input (0:00)

User fills form:
- Search Query: `"dentists in Austin, TX"`
- Max Results: `20`

#### Step 2: Google Maps Scraping (0:00 - 2:30)

Apify scraper finds 20 dental businesses:

| Business | Category | Reviews | Website |
|----------|----------|---------|---------|
| Austin Dental Care | Dental clinic | 342 | austindentalcare.com |
| Smile Dental | Dental clinic | 298 | smiledental.com |
| Premier Dentistry | Dental clinic | 401 | premierdentistry.com |
| South Austin Dentist | Dental clinic | 89 | southaustindentist.com |
| Bright Smile Clinic | Cosmetic dentist | 156 | brightsmileclinic.com |
| ... | ... | ... | ... |

**Output**: 20 businesses scraped

---

#### Step 3: Grouping (2:30 - 2:35)

n8n creates competitor sets:

**Set 1**: Austin Dental Care (Large)
- Subject: Austin Dental Care (342 reviews)
- Competitors: Premier Dentistry (401), Smile Dental (298), Downtown Dental (267), Family Dental Austin (312)

**Set 2**: Smile Dental (Large)
- Subject: Smile Dental (298 reviews)
- Competitors: Austin Dental Care (342), Premier Dentistry (401), Downtown Dental (267), Family Dental Austin (312)

**Set 3**: South Austin Dentist (Medium)
- Subject: South Austin Dentist (89 reviews)
- Competitors: Bright Smile Clinic (156), Gentle Care Dental (102), Westlake Dentistry (134), Cedar Park Dental (78)

... (17 more sets)

**Output**: 20 competitor sets created

---

#### Step 4: Facebook Page Discovery (2:35 - 4:00)

**Primary Method (Website Field)**:
- Austin Dental Care → `facebook.com/austindentalcare` ✅
- Smile Dental → `facebook.com/smiledentaltx` ✅
- South Austin Dentist → Not found in website ❌

**Fallback Method (Google Search)**:
- South Austin Dentist → Google search → `facebook.com/southaustindds` ✅

**Results**:
- 18 businesses: Facebook pages found via website field
- 1 business: Facebook page found via Google search
- 1 business: No Facebook page found (skipped)

**Output**: 19 valid competitor sets with Facebook URLs

---

#### Step 5: AdSpy Analysis (4:00 - 24:00)

n8n processes 19 analyses in 4 batches (5 parallel at a time):

**Batch 1** (4:00 - 9:00):
- Analyzing: Austin Dental Care, Smile Dental, Premier Dentistry, South Austin Dentist, Bright Smile Clinic
- Each analysis takes ~5 minutes (scraping 30 ads + AI analysis)

**Batch 2** (9:00 - 14:00):
- Analyzing: Next 5 businesses

**Batch 3** (14:00 - 19:00):
- Analyzing: Next 5 businesses

**Batch 4** (19:00 - 24:00):
- Analyzing: Final 4 businesses

**Sample Analysis Result** (Austin Dental Care):

```json
{
  "analysis_id": "550e8400-e29b-41d4-a716-446655440000",
  "subject": {
    "name": "Austin Dental Care",
    "ad_count": 5,
    "hook_distribution": {
      "Discount/Urgency": 2,
      "Social Proof": 2,
      "Transformation": 1
    },
    "format_distribution": {
      "image": 3,
      "video": 2
    }
  },
  "gaps": {
    "missing_hooks": ["Fear of Loss", "Authority"],
    "underutilized_formats": ["ugc_video", "carousel"]
  },
  "recommendations": [
    {
      "priority": "high",
      "action": "Add scarcity messaging",
      "example": "Smile Dental uses 'Only 5 slots left this week'"
    }
  ],
  "market_insights": {
    "dominant_hook_type": "Social Proof",
    "dominant_format": "video"
  }
}
```

---

#### Step 6: Results Aggregation (24:00 - 24:30)

**Summary Report Generated**:

```json
{
  "summary": {
    "total_businesses": 20,
    "successful_analyses": 19,
    "failed_analyses": 1,
    "success_rate": "95%"
  },
  "market_overview": {
    "most_common_hook": "Social Proof",
    "most_common_format": "video",
    "hook_distribution": {
      "Social Proof": 12,
      "Discount/Urgency": 8,
      "Transformation": 6,
      "Authority": 4,
      "Educational": 3
    },
    "format_distribution": {
      "video": 14,
      "image": 10,
      "ugc_video": 2,
      "carousel": 1
    }
  },
  "key_insights": [
    "63% of Austin dental clinics lead with Social Proof (testimonials, reviews)",
    "Video ads dominate (74% of businesses use video as primary format)",
    "UGC video is underutilized - only 2 businesses use it",
    "Most common gap: Authority hooks (credentials, expertise)",
    "Discount/Urgency is heavily used (42% of businesses)"
  ]
}
```

---

#### Step 7: Notification Sent (24:30)

**Email to User**:

```
Subject: Lead Analysis Complete: 19 Austin dental clinics analyzed

Hi!

Your competitive analysis is complete. Here's what we found:

📊 SUMMARY
- 20 businesses discovered
- 19 successfully analyzed
- 1 had no Facebook presence

🎯 KEY MARKET INSIGHTS
- Most common hook type: Social Proof (testimonials dominate)
- Most common ad format: Video (74% of businesses)
- Biggest opportunity: UGC video content (only 11% use it)

💡 TOP RECOMMENDATIONS ACROSS MARKET
1. Add Authority hooks (credentials, awards) - 68% of businesses missing this
2. Test UGC video format - competitors using it see higher engagement
3. Don't overuse Discount/Urgency - market is saturated with this approach

📁 View full results: [Dashboard Link]

Each business has a detailed analysis with specific recommendations.

---
Powered by AdSpy Lead Generation System
```

---

### Expected Outcomes

**For User**:
- Complete competitive landscape of Austin dental market
- 19 individual business analyses with gaps & recommendations
- Market-level insights about advertising trends
- Actionable intelligence for approaching each lead

**Business Value**:
- Can position services based on competitor gaps
- Knows which businesses are advertising aggressively
- Understands market saturation of different ad approaches
- Can tailor outreach: "I noticed you're not using UGC video like your top competitor..."

---

## 8. Configuration & Environment

### Required API Keys

| Service | Purpose | How to Obtain | Cost |
|---------|---------|---------------|------|
| **Apify API Token** | Google Maps scraping + Facebook ad scraping | https://console.apify.com/account/integrations | Pay-as-you-go |
| **Google Custom Search API Key** | Facebook page discovery (fallback) | https://console.cloud.google.com/ | 100 queries/day free |
| **Google Custom Search Engine ID** | Custom search config | https://programmablesearchengine.google.com/ | Free |

### n8n Environment Variables

Add to n8n settings or `.env` file:

```bash
# Apify
APIFY_API_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Custom Search (optional - for Facebook discovery fallback)
GOOGLE_SEARCH_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GOOGLE_SEARCH_ENGINE_ID=0123456789abcdef:xxxxxxxxx

# AdSpy API
ADSPY_API_URL=http://178.156.213.149:1002
```

### Apify Setup

#### 1. Create Apify Account
- Go to https://console.apify.com/sign-up
- Verify email

#### 2. Get API Token
- Navigate to Settings → Integrations
- Copy "Personal API token"
- Save as `APIFY_API_TOKEN` in n8n

#### 3. Test Google Maps Scraper
```bash
curl -X POST https://api.apify.com/v2/acts/WnMxbsRLNbPeYL6ge/runs \
  -H "Authorization: Bearer YOUR_APIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "searchQuery": "coffee shops in Seattle",
    "maxResults": 5
  }'
```

### Google Custom Search Setup (Optional)

Only needed if using Google Search fallback for Facebook page discovery.

#### 1. Enable Custom Search API
- Go to https://console.cloud.google.com/
- Create new project or select existing
- Enable "Custom Search API"

#### 2. Create API Key
- APIs & Services → Credentials
- Create Credentials → API Key
- Restrict key to Custom Search API
- Save as `GOOGLE_SEARCH_API_KEY`

#### 3. Create Custom Search Engine
- Go to https://programmablesearchengine.google.com/
- Create new search engine
- Search the entire web: ON
- Copy "Search engine ID"
- Save as `GOOGLE_SEARCH_ENGINE_ID`

### AdSpy API Configuration

**Current Status**: No authentication required

**Base URL**: `http://178.156.213.149:1002`

**Available Endpoints**:
- `POST /api/analyze-competitor-set` - Main analysis endpoint
- `GET /api/health` - Health check

**Future**: May add API key authentication. Monitor for updates.

---

## 9. Error Handling & Edge Cases

### Error Categories

#### 1. Apify Scraping Errors

**Error**: `Apify run timed out`

**Cause**: Google Maps scraper took >10 minutes

**Solution**:
```javascript
// In Wait for Completion node
const maxWaitTime = 600000; // 10 minutes
const startTime = Date.now();

while (Date.now() - startTime < maxWaitTime) {
  const status = await checkRunStatus();
  if (status === 'SUCCEEDED') break;
  if (status === 'FAILED') throw new Error('Apify run failed');
  await sleep(10000); // Wait 10 seconds
}
```

**Error**: `No results found for search query`

**Cause**: Invalid search query or no businesses in area

**Solution**:
```javascript
const results = $input.item.json;

if (!results.items || results.items.length === 0) {
  throw new Error(`No businesses found for: ${$workflow.staticData.searchQuery}`);
}
```

---

#### 2. Facebook Page Discovery Errors

**Error**: `No Facebook page found for business`

**Frequency**: ~10-20% of businesses

**Solution**:
```javascript
// Option 1: Skip business
if (!business.facebookUrl) {
  console.log(`Skipping ${business.title}: no Facebook page`);
  return null; // Node outputs nothing for this item
}

// Option 2: Mark for manual review
if (!business.facebookUrl) {
  return {
    json: {
      ...business,
      status: 'needs_manual_review',
      reason: 'no_facebook_page'
    }
  };
}
```

**Error**: `Facebook URL is invalid (profile/group/event)`

**Solution**:
```javascript
function isValidFacebookPage(url) {
  const invalidPatterns = [
    '/profile.php',
    '/groups/',
    '/events/',
    '/pages/category/'
  ];

  return !invalidPatterns.some(pattern => url.includes(pattern));
}

if (!isValidFacebookPage(facebookUrl)) {
  console.log(`Invalid Facebook URL for ${business.title}: ${facebookUrl}`);
  facebookUrl = null;
}
```

---

#### 3. Competitor Grouping Errors

**Error**: `Not enough competitors in category`

**Cause**: Only 1-2 businesses in specific category

**Solution**:
```javascript
// Expand to broader category
const categoryExpansion = {
  'Cosmetic dentist': 'Dental clinic',
  'Orthodontist': 'Dental clinic',
  'Italian restaurant': 'Restaurant'
};

if (competitors.length < 2) {
  const broaderCategory = categoryExpansion[subject.categoryName];
  if (broaderCategory) {
    competitors = businesses.filter(b =>
      b.categoryName === broaderCategory && b.title !== subject.title
    );
  }
}

// If still not enough, skip this business
if (competitors.length < 2) {
  console.log(`Skipping ${subject.title}: only ${competitors.length} competitors found`);
  return null;
}
```

---

#### 4. AdSpy API Errors

**Error**: `400 Bad Request - Must have exactly 1 subject and 2-5 competitors`

**Cause**: Invalid payload structure

**Solution**:
```javascript
// Validate before sending
const payload = buildApiPayload(competitorSet);

const subjectCount = payload.competitors.filter(c => c.isSubject).length;
const competitorCount = payload.competitors.filter(c => !c.isSubject).length;

if (subjectCount !== 1) {
  throw new Error(`Invalid subject count: ${subjectCount} (must be 1)`);
}

if (competitorCount < 2 || competitorCount > 5) {
  throw new Error(`Invalid competitor count: ${competitorCount} (must be 2-5)`);
}
```

**Error**: `404 Not Found - No Facebook ads found for business`

**Cause**: Business has no active Facebook ads

**Frequency**: ~30-40% of businesses (not all businesses advertise on Facebook)

**Solution**:
```javascript
// Log and continue
if (response.status === 404) {
  console.log(`No ads found for ${subject.name} - business may not be advertising`);

  return {
    json: {
      status: 'no_ads_found',
      subject: subject.name,
      note: 'Business has no active Facebook ads',
      timestamp: new Date().toISOString()
    }
  };
}
```

**Error**: `500 Internal Server Error`

**Cause**: Apify scraping timeout, AI analysis failure, or database error

**Solution**:
```javascript
// Retry with exponential backoff
const maxRetries = 3;
let retries = 0;
let response;

while (retries < maxRetries) {
  try {
    response = await callAdSpyApi(payload);
    break;
  } catch (error) {
    retries++;
    if (retries >= maxRetries) throw error;

    const delay = Math.pow(2, retries) * 1000; // 2s, 4s, 8s
    console.log(`Retry ${retries}/${maxRetries} after ${delay}ms`);
    await sleep(delay);
  }
}
```

---

#### 5. Rate Limiting

**Error**: `429 Too Many Requests (Apify or Google Search)`

**Cause**: Exceeded API rate limits

**Solution**:
```javascript
// Add delays between requests
const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds

// In batch processing node
await sleep(DELAY_BETWEEN_REQUESTS);
```

**Apify Limits**:
- Free tier: ~1000 scraping operations/month
- Paid tier: Based on compute units

**Google Search Limits**:
- Free tier: 100 queries/day
- Paid tier: 10,000 queries/day

---

### Complete Error Handling Wrapper

**Code Node Template**:

```javascript
async function safeExecute(fn, context) {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      retries++;

      // Log error
      console.error(`Error in ${context}: ${error.message}`);
      console.error(`Attempt ${retries}/${maxRetries}`);

      // Check if retryable
      const isRetryable = [500, 502, 503, 504, 429].includes(error.statusCode);

      if (!isRetryable || retries >= maxRetries) {
        // Non-retryable or max retries reached
        return {
          status: 'error',
          context: context,
          error: error.message,
          retries: retries,
          timestamp: new Date().toISOString()
        };
      }

      // Exponential backoff
      const delay = Math.pow(2, retries) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage
const result = await safeExecute(async () => {
  return await callAdSpyApi(payload);
}, 'AdSpy API Call');
```

---

## 10. Cost Estimation

### Per-Workflow Run Costs

**Assumptions**:
- 50 businesses scraped from Google Maps
- 40 businesses with Facebook pages found (80% success rate)
- 35 businesses successfully analyzed (70% have active ads)

---

### Apify Costs

#### Google Maps Scraper
- **Cost**: ~$0.01-0.02 per 100 results
- **For 50 results**: ~$0.005-0.01

#### Facebook Ad Scraper (within AdSpy API)
- **Cost per business**: ~$0.02-0.04 (5 ads)
- **For 35 businesses**: ~$0.70-1.40

**Total Apify**: ~$0.71-1.41 per run

---

### Google Custom Search API (Optional Fallback)

- **Free Tier**: 100 queries/day (sufficient for most workflows)
- **Paid Tier**: $5 per 1,000 queries
- **Typical Usage**: 5-10 fallback searches per run

**Total Google Search**: $0 (free tier) to $0.05 (paid tier)

---

### AI Analysis Costs (within AdSpy API)

#### Gemini AI (Google)
- **Cost**: ~$0.05-0.10 per analysis (30 ads)
- **For 35 businesses**: ~$1.75-3.50

#### OpenAI GPT-4o
- **Cost**: ~$0.10-0.15 per analysis (recommendations)
- **For 35 businesses**: ~$3.50-5.25

**Total AI**: ~$5.25-8.75 per run

---

### Total Cost Breakdown

| Component | Cost per Run |
|-----------|--------------|
| Google Maps Scraping | $0.01 |
| Facebook Ad Scraping | $0.71-1.41 |
| Google Search (optional) | $0-0.05 |
| Gemini AI | $1.75-3.50 |
| OpenAI GPT-4o | $3.50-5.25 |
| **TOTAL** | **$5.97-10.22** |

---

### Cost Scenarios

#### Small Run (20 businesses)
- Google Maps: $0.01
- Facebook scraping: $0.28-0.56
- AI analysis: $2.10-3.50
- **Total**: ~$2.39-4.07

#### Medium Run (50 businesses)
- Google Maps: $0.01
- Facebook scraping: $0.70-1.40
- AI analysis: $5.25-8.75
- **Total**: ~$5.96-10.16

#### Large Run (100 businesses)
- Google Maps: $0.02
- Facebook scraping: $1.40-2.80
- AI analysis: $10.50-17.50
- **Total**: ~$11.92-20.32

---

### Monthly Cost Estimates

**Assumptions**: Running workflow 4 times per month (weekly)

#### Light Usage (20 businesses per run)
- **Per run**: $2.39-4.07
- **Monthly**: ~$9.56-16.28

#### Regular Usage (50 businesses per run)
- **Per run**: $5.96-10.16
- **Monthly**: ~$23.84-40.64

#### Heavy Usage (100 businesses per run)
- **Per run**: $11.92-20.32
- **Monthly**: ~$47.68-81.28

---

### Cost Optimization Tips

1. **Reduce maxResults**: Only scrape businesses you intend to analyze
2. **Filter early**: Remove businesses without websites before Facebook discovery
3. **Cache Facebook URLs**: Store discovered Facebook pages for reuse
4. **Batch wisely**: Process 5-10 analyses in parallel (balance speed vs cost)
5. **Skip non-advertisers**: Filter out businesses unlikely to have Facebook ads (e.g., very small businesses)

---

## 11. Performance Optimization

### Parallelization Strategy

#### Current Bottleneck: Sequential API Calls

**Problem**: Processing 50 businesses sequentially takes ~250 minutes (5 min × 50)

**Solution**: Batch processing with parallelization

---

### Optimal Batch Configuration

#### Batch Size: 5 Concurrent Analyses

**Rationale**:
- AdSpy API can handle 5-10 concurrent requests
- Each analysis uses separate Apify actors (isolated)
- Balances speed vs server load

**Time Savings**:
- Sequential: 50 businesses × 5 min = 250 min
- Parallel (batches of 5): 50 / 5 × 5 min = 50 min
- **Reduction**: 80% faster

---

### n8n Split In Batches Configuration

```
Node Settings:
- Batch Size: 5
- Options: "Keep data on reset" = OFF
```

**Workflow Impact**:
```
Input: 50 competitor sets

Batch 1: Processes sets 1-5  (0-5 min)
Batch 2: Processes sets 6-10 (5-10 min)
Batch 3: Processes sets 11-15 (10-15 min)
...
Batch 10: Processes sets 46-50 (45-50 min)

Total time: ~50 minutes (vs 250 minutes sequential)
```

---

### Caching Strategy

#### 1. Facebook Page Discovery Cache

**Implementation**:
- Store business name → Facebook URL mappings in n8n database or external cache (Redis, etc.)
- TTL: 7-30 days (Facebook pages rarely change)

**Code Example**:
```javascript
const cache = await getCache(); // n8n static data or Redis

// Check cache first
let facebookUrl = cache[business.title];

if (!facebookUrl) {
  // Discover via website or Google search
  facebookUrl = await discoverFacebookPage(business);

  // Store in cache
  cache[business.title] = facebookUrl;
  await saveCache(cache);
}
```

**Benefits**:
- Reduces Google Search API calls by ~70-80%
- Faster workflow execution (skip discovery step)
- Lower cost

---

#### 2. Competitor Set Cache

**When to Use**: If analyzing same search queries repeatedly

**Implementation**:
- Store `searchQuery` → competitor sets in cache
- TTL: 1-7 days (business rankings change slowly)

**Benefits**:
- Skip Google Maps scraping step
- Instant competitor set retrieval
- Massive cost savings for repeat queries

---

### Smart Filtering

#### Pre-Filter Businesses Before Analysis

**Objective**: Only analyze businesses likely to have Facebook ads

**Filtering Criteria**:
1. **Review Count**: >20 reviews (established businesses more likely to advertise)
2. **Rating**: >3.5 stars (quality businesses invest in advertising)
3. **Has Website**: Businesses with websites more likely to have Facebook presence

**Code Example**:
```javascript
const businesses = $input.all().map(item => item.json);

const viable = businesses.filter(b => {
  return b.reviewsCount >= 20 &&
         b.rating >= 3.5 &&
         b.website;
});

console.log(`Filtered: ${businesses.length} → ${viable.length} viable businesses`);
return viable.map(b => ({ json: b }));
```

**Impact**:
- Reduces analysis count by ~30-40%
- Focuses on businesses with advertising budget
- Maintains quality of results

---

### Async Processing

#### Option: Run Workflow in Background

**Use Case**: Large runs (100+ businesses) that take >60 minutes

**n8n Implementation**:
- Use n8n's webhook trigger for async processing
- Return workflow run ID immediately
- Send email/webhook notification when complete

**Flow**:
```
1. User submits form → Receives run ID
2. Workflow processes in background
3. User can check status via webhook
4. Email sent on completion
```

---

### Database Optimization

#### Store Results for Reuse

**Schema**:
```sql
CREATE TABLE lead_analyses (
  id SERIAL PRIMARY KEY,
  analysis_id UUID,
  business_name VARCHAR(255),
  search_query VARCHAR(255),
  analysis_date TIMESTAMP,
  gaps JSONB,
  recommendations JSONB,
  market_insights JSONB
);

CREATE INDEX idx_business_search ON lead_analyses(business_name, search_query);
CREATE INDEX idx_date ON lead_analyses(analysis_date);
```

**Benefits**:
- Avoid re-analyzing same businesses
- Historical trend analysis
- Quick lookups for past results

---

### Performance Metrics to Track

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Google Maps scrape time** | <3 min | Apify run duration |
| **Facebook discovery success rate** | >80% | URLs found / total businesses |
| **Analysis success rate** | >70% | Successful analyses / attempted |
| **Average analysis time** | <5 min | API response time |
| **Total workflow time** | <60 min | End-to-end for 50 businesses |

---

## 12. Testing Plan

### Test Scenarios

#### Test 1: Small Dataset (Smoke Test)

**Objective**: Verify workflow works end-to-end

**Input**:
- Search Query: `"coffee shops in Seattle, WA"`
- Max Results: `5`

**Expected Output**:
- 5 businesses scraped
- 4-5 Facebook pages found
- 3-4 successful analyses
- 1-2 businesses may have no ads (404 from API)

**Success Criteria**:
- Workflow completes without errors
- At least 3 analyses returned
- Summary report generated
- Notification sent

**Time**: ~10 minutes

---

#### Test 2: Medium Dataset (Real-World Scenario)

**Objective**: Test grouping logic and batch processing

**Input**:
- Search Query: `"dentists in Austin, TX"`
- Max Results: `25`

**Expected Output**:
- 25 businesses scraped
- ~20 Facebook pages found (80% success rate)
- ~15 successful analyses (60% have ads)
- Competitor sets correctly grouped by size tier

**Success Criteria**:
- Grouping algorithm creates valid sets (1 subject + 2-5 competitors)
- Businesses in same category grouped together
- Large/medium/small tiers separated
- Batch processing works (5 parallel)

**Time**: ~30 minutes

---

#### Test 3: Mixed Categories

**Objective**: Test category grouping with diverse businesses

**Input**:
- Search Query: `"restaurants in Miami, FL"`
- Max Results: `30`

**Expected Output**:
- Multiple categories: Italian, Mexican, Seafood, American, etc.
- Each category grouped separately
- No cross-category competitor sets

**Success Criteria**:
- Italian restaurants only compete with Italian restaurants
- Category expansion works (if <2 in specific category)
- No invalid competitor sets

**Time**: ~40 minutes

---

#### Test 4: Edge Case - No Facebook Presence

**Objective**: Test fallback handling when businesses lack Facebook pages

**Input**:
- Search Query: `"local hardware stores in rural Montana"`
- Max Results: `10`

**Expected Output**:
- 10 businesses scraped
- ~3-5 Facebook pages found (lower success rate for rural businesses)
- ~2-3 successful analyses

**Success Criteria**:
- Workflow doesn't crash when many businesses lack Facebook
- Google Search fallback is attempted
- Businesses without Facebook are skipped gracefully
- Summary report shows failures clearly

**Time**: ~15 minutes

---

#### Test 5: Error Handling - Invalid Search

**Objective**: Test error handling for invalid inputs

**Input**:
- Search Query: `"xyzabc123nonexistent"`
- Max Results: `10`

**Expected Output**:
- Apify returns 0 results
- Workflow stops gracefully with error message

**Success Criteria**:
- No crash
- Clear error message: "No businesses found for: xyzabc123nonexistent"
- User notified of failure

**Time**: ~2 minutes

---

#### Test 6: API Error Handling

**Objective**: Test AdSpy API error scenarios

**Manual Steps**:
1. Temporarily modify payload to have 0 competitors (should trigger 400 error)
2. Send business with no Facebook ads (should trigger 404)
3. Test retry logic by simulating 500 error

**Expected Behavior**:
- 400: Validation error logged, business skipped
- 404: "No ads found" status returned
- 500: Retry with exponential backoff (3 attempts)

**Success Criteria**:
- All errors handled gracefully
- Retries work correctly
- Workflow continues to next business after errors

**Time**: ~15 minutes

---

#### Test 7: Performance - Large Dataset

**Objective**: Test system performance at scale

**Input**:
- Search Query: `"real estate agents in Los Angeles, CA"`
- Max Results: `100`

**Expected Output**:
- 100 businesses scraped
- ~80 Facebook pages found
- ~60 successful analyses

**Success Criteria**:
- Workflow completes in <120 minutes (2 hours)
- Batch processing reduces total time
- Memory usage stays reasonable
- All results stored correctly

**Time**: ~120 minutes

---

### Manual Test Checklist

Before deploying to production, verify:

- [ ] Apify API token is valid and working
- [ ] Google Search API key is configured (if using fallback)
- [ ] AdSpy API endpoint is reachable
- [ ] n8n environment variables are set correctly
- [ ] All nodes are connected properly in workflow
- [ ] Split In Batches is configured with batch size 5
- [ ] Error handling nodes are in place
- [ ] Notification node (email/Slack) is configured
- [ ] Storage node (database/sheets) is working
- [ ] Test with 5 businesses completes successfully
- [ ] Test with 25 businesses shows parallel processing
- [ ] Summary report is formatted correctly
- [ ] Failed analyses are logged properly

---

### Automated Testing (Optional)

For advanced setups, create automated tests:

```javascript
// Test 1: Validate API Response Structure
async function testApiResponse() {
  const mockPayload = {
    competitors: [
      { name: "Test Subject", domain: "https://facebook.com/test", isSubject: true },
      { name: "Test Comp 1", domain: "https://facebook.com/test1", isSubject: false },
      { name: "Test Comp 2", domain: "https://facebook.com/test2", isSubject: false }
    ]
  };

  const response = await callAdSpyApi(mockPayload);

  assert(response.success === true, "Response should have success=true");
  assert(response.analysis_id, "Response should have analysis_id");
  assert(response.subject, "Response should have subject data");
  assert(response.gaps, "Response should have gaps");
  assert(response.recommendations, "Response should have recommendations");
}

// Test 2: Validate Grouping Algorithm
function testGroupingLogic() {
  const businesses = [
    { title: "A", categoryName: "Dental", reviewsCount: 100 },
    { title: "B", categoryName: "Dental", reviewsCount: 150 },
    { title: "C", categoryName: "Dental", reviewsCount: 120 },
    { title: "D", categoryName: "Restaurant", reviewsCount: 200 }
  ];

  const sets = createCompetitorSets(businesses);

  assert(sets.length === 3, "Should create 3 sets (A, B, C)");
  assert(sets[0].competitors.length >= 2, "Each set should have 2+ competitors");
  assert(sets[0].competitors.every(c => c.categoryName === "Dental"), "Competitors should be same category");
}
```

---

## 13. Reference Documentation

### Internal AdSpy Documentation

These files contain detailed information about the AdSpy competitive analysis system:

1. **API Documentation**:
   - File: `/Users/arpitjhamb/Desktop/ads_spy_leads/project1/docs/COMPETITIVE-ANALYSIS.md`
   - Contains: Full API specification, request/response examples, error codes
   - Key Sections:
     - Lines 70-200: API endpoint specification
     - Lines 300-400: Hook categories explained
     - Lines 500-600: Example analyses

2. **Implementation Summary**:
   - File: `/Users/arpitjhamb/Desktop/ads_spy_leads/project1/IMPLEMENTATION-SUMMARY.md`
   - Contains: System architecture, deployment info, testing results

3. **Database Schema**:
   - File: `/Users/arpitjhamb/Desktop/ads_spy_leads/project1/scripts/schema-competitor-analysis.sql`
   - Contains: Complete database schema for competitive analyses

4. **Test Examples**:
   - File: `/Users/arpitjhamb/Desktop/ads_spy_leads/project1/scripts/test-competitor-analysis.ts`
   - Contains: Real API call examples, test data

5. **Source Code**:
   - API: `/Users/arpitjhamb/Desktop/ads_spy_leads/project1/src/api.ts` (lines 653-779)
   - Main Logic: `/Users/arpitjhamb/Desktop/ads_spy_leads/project1/src/main.ts` (lines 331-570)
   - Comparator: `/Users/arpitjhamb/Desktop/ads_spy_leads/project1/src/comparator.ts` (448 lines)

---

### External Documentation

#### Apify

- **Google Maps Scraper**:
  - URL: https://console.apify.com/actors/WnMxbsRLNbPeYL6ge/information/latest/readme
  - Sections: Input schema, output fields, pricing

- **Apify API Reference**:
  - URL: https://docs.apify.com/api/v2
  - Key Topics: Running actors, polling for results, dataset retrieval

#### n8n

- **HTTP Request Node**:
  - URL: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/
  - Topics: Authentication, headers, error handling

- **Code Node**:
  - URL: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/
  - Topics: JavaScript execution, data transformation, async functions

- **Split In Batches Node**:
  - URL: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.splitinbatches/
  - Topics: Batch processing, parallelization

#### Google Custom Search

- **API Documentation**:
  - URL: https://developers.google.com/custom-search/v1/overview
  - Topics: Query parameters, result format, quotas

- **Programmable Search Engine**:
  - URL: https://programmablesearchengine.google.com/about/
  - Topics: Creating search engines, site restrictions

---

### Quick Reference Tables

#### Hook Categories

| Hook Type | Description | Usage % | Example |
|-----------|-------------|---------|---------|
| Discount/Urgency | Limited-time offers | 15-25% | "50% off ends tonight!" |
| Social Proof | Testimonials, reviews | 30-40% | "Trusted by 10,000+ customers" |
| Fear of Loss | FOMO, consequences | 10-15% | "Don't miss out on..." |
| Problem-Agitate | Pain point focus | 5-10% | "Tired of bad service?" |
| Curiosity Gap | Intrigue, questions | 10-15% | "The secret to..." |
| Authority | Credentials | 5-10% | "Award-winning experts" |
| Transformation | Before/after | 10-15% | "Transform your smile" |
| Educational | Tips, how-to | 5-10% | "5 tips for..." |
| Other | Uncategorized | 5-10% | - |

#### Creative Formats

| Format | Description | Usage % |
|--------|-------------|---------|
| image | Static image ads | 40-50% |
| video | Produced video | 30-40% |
| ugc_video | User-generated video | 5-10% |
| carousel | Multi-image swipeable | 10-15% |

#### API Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process results |
| 400 | Bad request (invalid payload) | Fix payload structure |
| 404 | No ads found | Log as "no ads", continue |
| 429 | Rate limited | Wait and retry |
| 500 | Server error | Retry with backoff |
| 503 | Service unavailable | Retry later |

---

### Support & Troubleshooting

#### Common Issues

**Issue**: "Apify run never completes"
- **Cause**: Large search query, slow scraping
- **Solution**: Reduce maxResults, check Apify actor logs

**Issue**: "Most businesses have no Facebook page"
- **Cause**: Rural area, B2B businesses, old businesses
- **Solution**: Adjust search query to urban areas, B2C businesses

**Issue**: "AdSpy API returns 404 for all businesses"
- **Cause**: Businesses not advertising on Facebook
- **Solution**: Normal behavior, ~30-40% of businesses don't advertise

**Issue**: "Workflow takes >2 hours"
- **Cause**: Sequential processing, large dataset
- **Solution**: Implement parallel batches (section 11)

**Issue**: "Out of Google Search API quota"
- **Cause**: Free tier limit (100/day) exceeded
- **Solution**: Reduce maxResults or upgrade to paid tier

---

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-12 | Initial specification document |

---

### Contact Information

**AdSpy API Maintainer**:
- System: Project 1 AdSpy Tool
- Documentation: `/Users/arpitjhamb/Desktop/ads_spy_leads/project1/docs/COMPETITIVE-ANALYSIS.md`

**n8n Community**:
- Forum: https://community.n8n.io/
- Discord: https://discord.gg/n8n

**Apify Support**:
- Docs: https://docs.apify.com/
- Community: https://discord.com/invite/jyEM2PRvMU

---

## Conclusion

This specification provides everything needed to build a complete lead generation workflow that integrates with the AdSpy competitive analysis system.

### Key Takeaways

1. **System Integration**: n8n orchestrates Google Maps scraping → Facebook discovery → AdSpy analysis
2. **Smart Grouping**: Businesses are automatically grouped into competitive sets based on category and size
3. **Scalable Architecture**: Batch processing enables parallel analysis of 50+ businesses in <60 minutes
4. **Error Resilience**: Comprehensive error handling ensures workflow continues despite failures
5. **Cost Effective**: ~$6-10 per workflow run for 50 businesses analyzed

### Next Steps

1. **Setup Phase**:
   - Create Apify account and get API token
   - Configure n8n environment variables
   - (Optional) Setup Google Custom Search API

2. **Development Phase**:
   - Build n8n workflow following Section 6
   - Implement error handling from Section 9
   - Test with small dataset (5 businesses)

3. **Testing Phase**:
   - Run all test scenarios from Section 12
   - Verify batch processing performance
   - Validate error handling

4. **Production Phase**:
   - Deploy to production n8n instance
   - Monitor costs and performance metrics
   - Optimize based on usage patterns

### Success Metrics

After implementation, you should achieve:
- ✅ 80%+ Facebook page discovery success rate
- ✅ 60%+ successful competitive analysis rate
- ✅ <60 minutes total processing time (50 businesses)
- ✅ <$10 per workflow run
- ✅ Actionable competitive intelligence for every analyzed business

---

**Document Complete**

For questions or clarifications about this specification, refer to the source documentation in `/Users/arpitjhamb/Desktop/ads_spy_leads/project1/docs/`.
