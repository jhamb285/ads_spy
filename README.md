# AdSpy — Competitor Ad Intelligence Tool

Scrapes, analyzes, and catalogs Facebook ads to provide competitive advertising insights across creative strategy, messaging, and market positioning.

## What It Does

- **Scrapes Facebook ads** from 89+ brands using Apify, with automatic deduplication
- **Analyzes every ad** through a 3-model AI pipeline (creative breakdown, marketing analysis, image/video processing)
- **Generates rewritten versions** of competitor ads adapted for your brand while preserving structure and tone
- **Syncs results** to Slack channels and Google Sheets in real time
- **Full admin UI** for brand management, ad search, and settings

## How It Works

1. **Scrape** — Apify pulls Facebook ads for configured brands on a cron schedule
2. **Deduplicate** — PostgreSQL full-text search prevents duplicate entries
3. **Analyze (Gemini)** — Each ad gets a 4-category creative breakdown: creative elements, hook analysis, angle identification, and structure explanation
4. **Analyze (GPT-4o Mini)** — Second pass generates: why it works, how to improve it, and a rewritten version for your brand
5. **Process media** — GPT-4o Vision describes ad images; Whisper transcribes video audio
6. **Distribute** — Results posted to Slack and synced to Google Sheets

## Prompts & AI Models

### Gemini 2.5 Flash — Creative Breakdown

Produces a structured JSON analysis across 4 categories:

| Category | What It Extracts |
|----------|-----------------|
| **Creative Breakdown** | Imagery, colors, layout, design choices, visual hierarchy |
| **Hook Analysis** | Attention devices: questions, bold claims, pattern interrupts, emotional triggers |
| **Angle Identification** | Marketing angle (pain-point, benefit, mechanism, social proof, urgency) + target audience |
| **Structure Explanation** | Ad flow framework (PAS, BAB, etc.) and attention-to-action path |

**Prompt**: `"You are an expert in analyzing Facebook ads for competitor intelligence. Analyze this ad and provide insights."`

### GPT-4o Mini — Marketing Analysis & Rewriting

Temperature 0.3 for consistent, structure-preserving output:

- **Why It Works** — 1-2 sentence effectiveness explanation
- **How To Improve** — 2-3 actionable improvements
- **Rewritten Ad** — Adapted for your brand, preserving exact structure, emojis, formatting; only swaps brand names, product names, and URLs

**Prompt**: `"You are a direct-response marketing expert. Always respond with valid JSON only, no markdown formatting or code blocks."`

### GPT-4o — Image Analysis

Describes imagery, text, people, objects, composition, product, branding, CTA, and visual effectiveness (500 token max).

### Whisper-1 — Video Transcription

Extracts audio via FFmpeg (16kHz mono MP3), transcribes to text for use as input to Gemini/GPT analysis.

**Source files**: `src/gemini.ts`, `src/llm.ts`, `src/media.ts`

## Integrations

| Service | Purpose |
|---------|---------|
| **Apify** | Facebook ad scraping |
| **Gemini 2.5 Flash** | Creative breakdown (4 categories) |
| **GPT-4o Mini** | Marketing analysis + ad rewriting |
| **GPT-4o** | Image description |
| **Whisper-1** | Video transcription |
| **Slack** | Real-time notifications (Socket Mode) |
| **Google Sheets** | Two-way brand sync |
| **PostgreSQL** | Storage with full-text search + dedup |

## Tech Stack

- **Language**: TypeScript 5.3
- **Server**: Express 4.22
- **Database**: PostgreSQL (shared `creative_os` database)
- **AI SDKs**: `openai`, `@google/generative-ai`
- **Scraping**: `apify-client`
- **Slack**: `@slack/bolt` (Socket Mode)
- **Sheets**: `google-spreadsheet`, `googleapis`
- **Video**: `fluent-ffmpeg` (audio extraction)
- **Frontend**: Next.js
- **Process Manager**: PM2 (4 services: API, Frontend, Bot, Scraper)
