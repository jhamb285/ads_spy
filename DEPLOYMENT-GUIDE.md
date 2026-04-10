# Competitive Analysis - Quick Deployment Guide

## Prerequisites

✅ Node.js 18+ installed
✅ PostgreSQL 12+ running
✅ API Keys ready:
   - `APIFY_API_KEY`
   - `OPENAI_API_KEY`
   - `GEMINI_API_KEY`
   - `DATABASE_URL`

---

## 5-Minute Deployment

### Step 1: Install Dependencies (30 seconds)

```bash
cd /Users/arpitjhamb/Desktop/ads_spy_leads/project1
npm install
```

### Step 2: Run Database Migration (30 seconds)

```bash
# Set DATABASE_URL if not in .env
export DATABASE_URL="postgresql://user:pass@host:port/database"

# Run migration
psql $DATABASE_URL -f scripts/schema-competitor-analysis.sql
```

**Expected output:**
```
NOTICE:  ✅ Competitor Analysis schema created successfully!
CREATE TABLE
CREATE TABLE
CREATE INDEX (x8)
```

### Step 3: Verify Environment Variables (10 seconds)

```bash
# Check .env file has these keys:
cat .env | grep -E "(GEMINI_API_KEY|APIFY_API_KEY|OPENAI_API_KEY|DATABASE_URL)"
```

### Step 4: Compile TypeScript (60 seconds)

```bash
npm run build
```

**Expected output:**
```
(No errors - silent success)
```

### Step 5: Restart API Server (10 seconds)

```bash
# If using PM2
pm2 restart ads-intel-api

# OR run directly
npm run api
```

### Step 6: Verify Deployment (30 seconds)

```bash
# Check API is running
curl http://localhost:1002/health

# Expected: {"status":"ok","timestamp":"2026-02-11T..."}
```

---

## Testing

### Test 1: Validate Endpoint Exists

```bash
curl -X POST http://localhost:1002/api/analyze-competitor-set \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected response:**
```json
{
  "error": "competitors array is required"
}
```

✅ If you see this error, the endpoint is working!

### Test 2: Full Analysis (Optional)

**Edit test file:**
```bash
nano scripts/test-competitor-analysis.ts
```

**Replace placeholder URLs with real Facebook pages:**
- YOUR_SUBJECT_BRAND → https://facebook.com/nike
- COMPETITOR_1 → https://facebook.com/adidas
- (etc.)

**Run test:**
```bash
npm run test-competitor-analysis
```

**Expected time:** 90-120 seconds

---

## Verification Checklist

- [ ] Database tables created (`\dt adspy_competitor*`)
- [ ] API endpoint responds (400 error = good!)
- [ ] Environment variables set
- [ ] TypeScript compiled (no errors)
- [ ] API server restarted
- [ ] Logs show new endpoints

**Check logs:**
```bash
pm2 logs ads-intel-api --lines 20
```

**Look for:**
```
🎯 Competitive Analysis (1-vs-5 Ad Dominance Engine):
   POST /api/analyze-competitor-set
   GET /api/competitor-analyses/:id
   GET /api/competitor-analyses
```

---

## Quick Test Example

**Create test file:**
```bash
cat > /tmp/test-competitor-set.json << 'EOF'
{
  "competitors": [
    {
      "name": "Nike",
      "domain": "https://www.facebook.com/nike",
      "isSubject": true
    },
    {
      "name": "Adidas",
      "domain": "https://www.facebook.com/adidas",
      "isSubject": false
    },
    {
      "name": "Puma",
      "domain": "https://www.facebook.com/PUMA",
      "isSubject": false
    },
    {
      "name": "Reebok",
      "domain": "https://www.facebook.com/Reebok",
      "isSubject": false
    },
    {
      "name": "New Balance",
      "domain": "https://www.facebook.com/newbalance",
      "isSubject": false
    },
    {
      "name": "Under Armour",
      "domain": "https://www.facebook.com/underarmour",
      "isSubject": false
    }
  ]
}
EOF
```

**Run test:**
```bash
curl -X POST http://localhost:1002/api/analyze-competitor-set \
  -H "Content-Type: application/json" \
  -d @/tmp/test-competitor-set.json \
  | jq .
```

**Expected:** JSON response with `analysis_id` and `recommendations`

---

## Troubleshooting

### Error: "Table already exists"
**Solution:** Migration already run - skip to Step 3

### Error: "GEMINI_API_KEY is required"
**Solution:**
```bash
echo "GEMINI_API_KEY=your_key" >> .env
pm2 restart ads-intel-api
```

### Error: "Connection refused"
**Solution:** Start API server first
```bash
pm2 start src/api.ts --name ads-intel-api --interpreter ts-node
```

### Slow Performance (>3 minutes)
**Check:**
1. Apify API key is valid
2. Internet connection is stable
3. OpenAI/Gemini APIs are responsive

---

## n8n Integration

### Webhook Configuration

**Endpoint:** `http://YOUR_VPS_IP:1002/api/analyze-competitor-set`
**Method:** POST
**Headers:** `Content-Type: application/json`
**Timeout:** 180000 (3 minutes)

### Sample n8n Flow

```
1. Webhook Trigger (Form Submission)
   ↓
2. Extract Brand URLs (Function Node)
   ↓
3. Format Competitor Set (Set Node)
   ↓
4. HTTP Request (POST to API)
   ↓
5. Parse Response (JSON)
   ↓
6. Send to Sales Team (Email/Slack)
```

---

## Monitoring

### Check Analysis Count
```sql
SELECT COUNT(*) FROM adspy_competitor_analyses;
```

### Recent Analyses
```sql
SELECT
  subject_brand_name,
  total_subject_ads + total_competitor_ads as total_ads,
  analyzed_at
FROM adspy_competitor_analyses
ORDER BY analyzed_at DESC
LIMIT 5;
```

### Average Execution Time
```sql
SELECT
  AVG(EXTRACT(EPOCH FROM (analyzed_at - created_at))) as avg_seconds
FROM adspy_competitor_analyses;
```

---

## Production Deployment (VPS)

### On VPS

```bash
# Navigate to project
cd /opt/project1

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Run migration
psql $DATABASE_URL -f scripts/schema-competitor-analysis.sql

# Compile
npm run build

# Restart PM2
pm2 restart ads-intel-api

# Check status
pm2 status
pm2 logs ads-intel-api --lines 50
```

### Verify Remote

```bash
curl http://178.156.213.149:1002/api/analyze-competitor-set \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected:** `{"error":"competitors array is required"}`

---

## Rollback Plan

If something goes wrong:

```bash
# Stop API
pm2 stop ads-intel-api

# Restore previous version
git reset --hard HEAD~1

# Rebuild
npm install
npm run build

# Restart
pm2 restart ads-intel-api
```

**Database rollback:**
```sql
DROP TABLE IF EXISTS adspy_competitor_analysis_ads;
DROP TABLE IF EXISTS adspy_competitor_analyses;
```

---

## Support

**Documentation:**
- Full Guide: `docs/COMPETITIVE-ANALYSIS.md`
- Implementation Summary: `IMPLEMENTATION-SUMMARY.md`

**Logs:**
```bash
pm2 logs ads-intel-api --lines 100
```

**Database:**
```bash
psql $DATABASE_URL -c "SELECT * FROM adspy_competitor_analyses LIMIT 1;"
```

---

**Deployment Time:** ~5 minutes
**Status:** ✅ Production Ready
**Last Updated:** 2026-02-11
