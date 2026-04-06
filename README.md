# AdSpy — Competitive Ad Intelligence Platform

Full-stack competitive advertising intelligence system that scrapes Facebook & Google ads, analyzes them with AI, and delivers actionable competitive insights via API, admin UI, Slack, and Google Sheets.

---

## Live Deployment

| Service | URL |
|---------|-----|
| **Frontend (Admin UI)** | `http://178.156.213.149:1001` |
| **API Server** | `http://178.156.213.149:1002` |
| **VPS Path** | `/opt/project1` |
| **Process Manager** | PM2 (4 services) |

### PM2 Services

| Name | Port | Purpose |
|------|------|---------|
| `ads-intel-api` | 1002 | Express REST API |
| `ads-intel-frontend` | 1001 | Next.js admin dashboard |
| `ads-intel-bot` | — | Slack bot (Socket Mode) |
| `ads-intel-scraper` | — | Daily cron scraper (9 AM) |

### Deployment

```bash
git push origin main
# VPS auto-rebuilds: npm install -> tsc -> pm2 restart
```

---

## Core Pipeline

```
Apify scrapes Facebook/Google ads for 89+ brands
  -> Normalize ad data across platforms
  -> Gemini AI: creative structure breakdown (hooks, format, angle)
  -> OpenAI GPT-4o Mini: strategic analysis + ad rewriting
  -> GPT-4o Vision: image analysis | Whisper: video transcription
  -> Store in PostgreSQL (deduplicated)
  -> Post to Slack #adspy-feed
  -> Sync brands with Google Sheets
```

---

## API Endpoints

### Health & Core

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/brands` | List all brands |
| `POST` | `/api/brands` | Add a brand |
| `PUT` | `/api/brands/:id` | Update a brand |
| `DELETE` | `/api/brands/:id` | Delete a brand |
| `GET` | `/api/brands/:id/pages` | Get brand pages |
| `POST` | `/api/brands/:id/pages` | Add a brand page |
| `GET` | `/api/ads/search` | Full-text ad search |
| `GET` | `/api/ads/:id` | Get ad by ID |
| `GET` | `/api/settings` | Get system settings |
| `PATCH` | `/api/settings/:key` | Update a setting |

### 1-vs-5 Competitive Analysis Engine

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze-competitor-set` | Facebook Ads competitive analysis |
| `POST` | `/api/analyze-google-competitor-set` | Google Ads competitive analysis |
| `GET` | `/api/competitor-analyses/:id` | Retrieve analysis by UUID |
| `GET` | `/api/competitor-analyses` | List recent analyses |

#### `POST /api/analyze-competitor-set`

Analyzes **1 subject brand** against **5 competitors** in parallel. Returns hook gaps, format gaps, strategic recommendations, and market insights.

**Request:**
```json
{
  "competitors": [
    { "name": "Nike", "domain": "https://www.facebook.com/nike", "isSubject": true },
    { "name": "Adidas", "domain": "https://www.facebook.com/adidas", "isSubject": false },
    { "name": "Puma", "domain": "https://www.facebook.com/PUMA", "isSubject": false },
    { "name": "Reebok", "domain": "https://www.facebook.com/Reebok", "isSubject": false },
    { "name": "New Balance", "domain": "https://www.facebook.com/newbalance", "isSubject": false },
    { "name": "Under Armour", "domain": "https://www.facebook.com/underarmour", "isSubject": false }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "analysis_id": "uuid-for-retrieval",
  "subject": {
    "name": "Nike",
    "ad_count": 5,
    "hook_distribution": { "Question": 2, "Bold Claim": 1, "..." : "..." },
    "format_distribution": { "video": 3, "image": 2 }
  },
  "gaps": {
    "missing_hooks": ["Social Proof", "Urgency"],
    "underutilized_formats": ["carousel"],
    "winning_competitors": ["Adidas"]
  },
  "recommendations": [
    {
      "priority": "high",
      "action": "Add social proof hooks",
      "example": "Adidas uses customer testimonials in 60% of ads",
      "implementation": "Create UGC-style testimonial ads"
    }
  ],
  "market_insights": {
    "dominant_hook_type": "Question",
    "dominant_format": "video",
    "average_competitor_ad_count": 4.2
  },
  "competitors": [
    { "name": "Adidas", "ad_count": 5, "top_hooks": ["Question", "Social Proof", "Bold Claim"] }
  ]
}
```

**Performance:** ~85-115 seconds | ~$3.50 per analysis

#### `POST /api/analyze-google-competitor-set`

Same analysis engine but for Google Ads via Google Transparency Center. Requires `adTransparencyUrl` field.

**Request:**
```json
{
  "competitors": [
    {
      "name": "Brand Name",
      "domain": "example.com",
      "adTransparencyUrl": "https://adstransparency.google.com/?region=US&domain=example.com",
      "isSubject": true
    }
  ]
}
```

---

## AI Analysis Pipeline

### Gemini 2.5 Flash — Creative Breakdown

Structured JSON analysis across 4 categories:

| Category | What It Extracts |
|----------|-----------------|
| **Creative Breakdown** | Imagery, colors, layout, design choices, visual hierarchy |
| **Hook Analysis** | Attention devices: questions, bold claims, pattern interrupts, emotional triggers |
| **Angle Identification** | Marketing angle (pain-point, benefit, mechanism, social proof, urgency) + target audience |
| **Structure Explanation** | Ad flow framework (PAS, BAB, etc.) and attention-to-action path |

### GPT-4o Mini — Marketing Analysis & Rewriting

- **Why It Works** — 1-2 sentence effectiveness explanation
- **How To Improve** — 2-3 actionable improvements
- **Rewritten Ad** — Adapted for your brand, preserving exact structure

### GPT-4o — Image Analysis

Describes imagery, text, people, objects, composition, product, branding, CTA (500 token max).

### Whisper-1 — Video Transcription

Extracts audio via FFmpeg, transcribes to text for AI analysis input.

### Competitive Analysis AI (Comparator)

- **Hook categorization** via Gemini (9 categories, batch processing 10 ads per call)
- **Gap analysis algorithms** — identifies missing hooks and underutilized formats
- **Strategic recommendations** via OpenAI — 3 actionable insights with competitor examples

**Source files:** `src/gemini.ts`, `src/llm.ts`, `src/media.ts`, `src/comparator.ts`

---

## Admin UI (Frontend)

Next.js 16 dashboard at port 1001 with:

| Page | Purpose |
|------|---------|
| `/brands` | Brand management (CRUD, multi-page, categories) |
| `/search` | Full-text ad search with filters |
| `/dashboard` | Overview dashboard |
| `/settings` | System settings (scraper kill switch, config) |
| `/docs` | Help & documentation |

Built with: React 19, Tailwind CSS 4, Radix UI / ShadCN, SWR for data fetching.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, TypeScript 5.3, Express 4.22 |
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, Radix UI |
| **Database** | PostgreSQL (JSONB, full-text search, deduplication) |
| **AI** | Gemini 2.5 Flash, GPT-4o, GPT-4o Mini, Whisper-1 |
| **Scraping** | Apify (Facebook ads + Google Transparency Center) |
| **Messaging** | Slack (`@slack/bolt`, Socket Mode) |
| **Sheets** | Google Sheets API (`google-spreadsheet`) |
| **Process Mgmt** | PM2 (4 services, daily cron) |
| **Automation** | n8n (webhook integration ready) |

---

## Project Structure

```
project1/
├── src/
│   ├── api.ts              # Express API server (all endpoints)
│   ├── main.ts             # Scraper pipeline + competitive analysis orchestrator
│   ├── bot.ts              # Slack bot (Socket Mode)
│   ├── index.ts            # Scraper entry point
│   ├── comparator.ts       # 1-vs-5 competitive analysis engine
│   ├── apifyClient.ts      # Facebook ad scraping via Apify
│   ├── gemini.ts           # Gemini AI analysis
│   ├── llm.ts              # OpenAI analysis + competitive gap prompts
│   ├── media.ts            # Image analysis + video transcription
│   ├── normalize.ts        # Ad data normalization
│   ├── storage.ts          # PostgreSQL operations
│   ├── config.ts           # Brand config (89 defaults)
│   ├── slack.ts            # Slack notifications
│   ├── notifications.ts    # UI -> Slack sync
│   ├── sheetSync.ts        # UI -> Sheets sync
│   └── platforms/
│       ├── factory.ts      # Platform abstraction layer
│       ├── types.ts        # Cross-platform ad types
│       ├── facebook/       # Facebook normalizer
│       └── google/         # Google Transparency normalizer + client
├── frontend/               # Next.js admin dashboard
│   └── app/
│       ├── brands/         # Brand management
│       ├── search/         # Ad search
│       ├── dashboard/      # Overview
│       ├── settings/       # System settings
│       └── docs/           # Help page
├── scripts/                # Migration, sync, and test scripts
├── docs/                   # Feature docs, n8n integration spec
├── ecosystem.config.js     # PM2 configuration
└── package.json
```

---

## Environment Variables

```bash
# Required
APIFY_API_TOKEN=           # Facebook/Google ad scraping
GEMINI_API_KEY=            # Primary AI analysis (free tier)
DATABASE_URL=              # PostgreSQL connection string

# Optional
OPENAI_API_KEY=            # GPT-4o image analysis, Whisper transcription
SLACK_TOKEN=               # Slack bot token
SLACK_APP_TOKEN=           # Slack app token
SLACK_CHANNEL=adspy-feed   # Notification channel
OFFER_DESCRIPTION=         # Your brand description for ad rewriting
MAX_ADS_PER_BRAND=10       # Ads to scrape per brand
DAYS_BACK=30               # Lookback window
MIN_ACTIVE_DAYS=5          # Minimum ad active days
API_PORT=1002              # API server port
FRONTEND_URL=http://localhost:1001
```

---

## Local Development

```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Build TypeScript
npm run build

# Run API server
npm run api

# Run frontend (separate terminal)
cd frontend && npm run dev

# Run scraper manually
npm run cron

# Run Slack bot
npm run bot

# Run everything
npm run start-all
```

---

## Database

PostgreSQL with these main tables:

- `adspy_ads` — All scraped ads with full-text search
- `adspy_brands` / `adspy_brand_pages` — Brand configuration
- `adspy_settings` — System settings
- `adspy_competitor_analyses` — Competitive analysis results
- `adspy_competitor_analysis_ads` — Links ads to analyses

---

## n8n Integration

The competitive analysis API is designed for n8n webhook workflows:

```
Lead Form Submission
  -> Extract brand URLs
  -> POST /api/analyze-competitor-set
  -> Parse JSON response
  -> Format as sales intelligence report
  -> Send to CRM / Sales Team
```

Full spec: `docs/n8n-lead-generation-integration-spec.md`

---

## Monitored Brands

89 default brands across categories: Spirituality, Supplements, Bloating/Digestive, Detox, and more. All configurable via the admin UI or Google Sheets sync.
