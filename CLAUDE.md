# PROJECT 1: ADSPY TOOL

**Status**: LIVE | **Code**: 100% (13/13 requirements)
**Frontend**: http://178.156.213.149:1001 | **API**: http://178.156.213.149:1002

---

## Development Workflow

```bash
# Edit code locally in /project1/
# Push to deploy:
git add project1/ && git commit -m "p1: description" && git push origin main
# VPS auto-rebuilds: npm install -> npx tsc -> pm2 restart
```

**Local path**: `/Users/par1k/Desktop/upwork/zain/project1/`
**VPS path**: `/opt/project1` (symlink to `/opt/creativeos-repo/project1`)

### PM2 Services

| Service | Name | Port |
|---------|------|------|
| API | ads-intel-api | 1002 |
| Frontend | ads-intel-frontend | 1001 |
| Bot | ads-intel-bot | — |
| Scraper | ads-intel-scraper | — (cron) |

### Key Files

```
project1/
├── src/
│   ├── api.ts              # Express API server
│   ├── bot.ts              # Slack bot
│   ├── index.ts            # Scraper entry point
│   ├── apifyClient.ts      # Facebook ad scraping via Apify
│   ├── gemini.ts           # Gemini AI breakdown
│   ├── llm.ts              # OpenAI analysis
│   ├── slack.ts            # Slack notifications
│   ├── googleSheets.ts     # Google Sheets sync
│   ├── storage.ts          # PostgreSQL operations
│   ├── config.ts           # Brand config (89 defaults)
│   ├── notifications.ts    # UI -> Slack sync
│   └── sheetSync.ts        # UI -> Sheets sync
├── frontend/               # Next.js frontend
│   └── app/
│       ├── brands/         # Brand management UI
│       ├── search/         # Ad search UI
│       ├── docs/           # Help page
│       └── settings/       # Settings page
├── dist/                   # Compiled JS (gitignored, built on VPS)
└── .env                    # Environment vars (gitignored)
```

---

## What It Does

1. Scrapes Facebook ads via Apify for configured brands
2. Analyzes each ad with Gemini (structure breakdown) + OpenAI (detailed analysis)
3. Stores in PostgreSQL with deduplication
4. Posts to Slack #adspy-feed channel
5. Syncs brands with Google Sheets
6. Full UI for brand management, ad search, and settings

## Features Complete

- PostgreSQL storage with full-text search
- 89 default brands with multi-page support
- Gemini + OpenAI analysis pipeline
- Slack integration (Socket Mode)
- Google Sheets two-way brand sync
- Admin UI (brand CRUD, search, settings, help page)
- PM2 with daily cron scheduling

## Known Issues

- **Scraper (ads-intel-scraper)** errored — needs production Apify API key
- **API keys needed**: Apify, OpenAI, Gemini for full functionality
- Slack + Google Sheets need client workspace/account setup

## Testing Results

See `delivery/project1/testing_results.md` for detailed test results.

Health check, database, frontend, brand API, search API all passing.

---

## Reference

- Source specs: `claude/CREATIVE AUTOMATION SYSTEM.pdf`, `claude/Copy of Projects - Dev Folder.pdf`
- Guides: `guide/01-SETUP-PROJECT1.md` through `guide/05-CLIENT-SUBMISSION.md`
- UI guide: `guide/08-UI-USER-GUIDE.md`
