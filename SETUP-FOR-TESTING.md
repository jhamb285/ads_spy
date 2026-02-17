# Setup Guide: Testing Competitive Analysis API Locally

## ✅ What Was Done

### 1. Replaced OpenAI with Gemini Everywhere
- **llm.ts**: Replaced OpenAI GPT-4 with Gemini 2.5 Flash
- **main.ts**: Updated to use Gemini client
- **bot.ts**: Updated to use Gemini client
- **config.ts**: Changed `openaiApiKey` → `geminiApiKey`
- **media.ts**: Simplified (media processing not needed for competitive analysis)

### 2. Created .env File
- Template created at `project1/.env`
- Ready for your API keys

### 3. Compiled Successfully
- All TypeScript errors fixed
- Code ready to run

---

## 🔑 Required API Keys

You need **2 API keys** to test the competitive analysis endpoint:

### 1. Gemini API Key (FREE)
**Get it here**: https://aistudio.google.com/app/apikey

**Steps**:
1. Visit https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)

**Cost**: FREE during preview period

---

### 2. Apify API Token
**Get it here**: https://console.apify.com/account/integrations

**Steps**:
1. Create account at https://console.apify.com/sign-up
2. Go to Settings → Integrations
3. Copy "Personal API token"

**Cost**: Pay-as-you-go (~$0.10-0.20 per competitive analysis)

---

## 📝 Fill in Your .env File

Open `/Users/arpitjhamb/Desktop/ads_spy_leads/project1/.env` and replace:

```bash
# REQUIRED
APIFY_API_TOKEN=YOUR_APIFY_TOKEN_HERE       # ← Paste your Apify token
GEMINI_API_KEY=YOUR_GEMINI_KEY_HERE         # ← Paste your Gemini key

# OPTIONAL (can leave as-is for testing)
OFFER_DESCRIPTION="Test offer"
DATABASE_URL=postgresql://user:pass@localhost:5432/creative_os  # Not needed for API testing
```

**Note**: DATABASE_URL is not required for testing the API endpoint (competitive analysis doesn't use database).

---

## 🚀 Test Locally

Once you've filled in the .env file, test the API locally:

### Start the API Server

```bash
cd /Users/arpitjhamb/Desktop/ads_spy_leads/project1
node dist/api.js
```

You should see:
```
🚀 API server starting on port 1002...
✅ API server running: http://localhost:1002
```

### Test the Endpoint

Open a new terminal and run:

```bash
curl -X POST http://localhost:1002/api/analyze-competitor-set \
  -H "Content-Type: application/json" \
  -d '{
  "competitors": [
    {
      "name": "Orkin Pest Control",
      "domain": "https://facebook.com/orkin",
      "isSubject": true
    },
    {
      "name": "Terminix",
      "domain": "https://facebook.com/terminix",
      "isSubject": false
    },
    {
      "name": "Aptive Environmental",
      "domain": "https://facebook.com/aptiveenvironmental",
      "isSubject": false
    },
    {
      "name": "Mosquito Squad",
      "domain": "https://facebook.com/mosquitosquad",
      "isSubject": false
    },
    {
      "name": "Mosquito Joe",
      "domain": "https://facebook.com/mosquitojoe",
      "isSubject": false
    },
    {
      "name": "TruGreen",
      "domain": "https://facebook.com/trugreen",
      "isSubject": false
    }
  ]
}'
```

**Expected output**: JSON response with analysis_id, gaps, recommendations, etc.

**Time**: Takes 2-5 minutes to scrape 30 ads and analyze

---

## 🌐 Fix VPS Authentication (For Production API)

Your VPS API at `http://178.156.213.149:1002` is currently behind authentication.

### SSH into VPS

```bash
ssh YOUR_USERNAME@178.156.213.149
```

### Find nginx Config

```bash
# Find which config file handles port 1002
sudo grep -r "1002" /etc/nginx/

# Common locations:
# - /etc/nginx/sites-enabled/default
# - /etc/nginx/conf.d/*.conf
```

### Disable Authentication

Edit the nginx config file:

```bash
sudo nano /etc/nginx/sites-enabled/default
```

Find the section for port 1002 and **remove** or **comment out** these lines:

```nginx
# BEFORE (with auth):
location /api/ {
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://localhost:1002;
}

# AFTER (without auth):
location /api/ {
    proxy_pass http://localhost:1002;
}
```

**OR** if you want to keep auth for other endpoints but not the API:

```nginx
location /api/analyze-competitor-set {
    # No auth for this specific endpoint
    proxy_pass http://localhost:1002;
}

location / {
    auth_basic "Restricted";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://localhost:1002;
}
```

### Restart nginx

```bash
sudo nginx -t                    # Test config
sudo systemctl restart nginx     # Restart nginx
```

### Test from Your Machine

```bash
curl http://178.156.213.149:1002/api/health
```

Should return: `{"status":"ok",...}` (no 302 redirect)

---

## 🎯 Test with Austin Pest Control Businesses

Once the API is working, here's how to test with real Austin businesses:

### Option 1: Use National Brands (Easier)
Already works with the test payload above (Orkin, Terminix, etc.)

### Option 2: Find Austin Businesses Manually

1. Go to Facebook and search for each business:
   - "Mosquito Squad Austin Texas"
   - "Mosquito Shield Austin"
   - etc.

2. Copy their Facebook page URLs

3. Update the test payload with real Austin URLs

---

## 📊 Expected Results

When the API works, you'll get a response like:

```json
{
  "success": true,
  "analysis_id": "550e8400-e29b-41d4-a716-446655440000",
  "subject": {
    "name": "Orkin Pest Control",
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
      "example": "Terminix uses 'Limited time offer'",
      "implementation": "Test limited availability in ads"
    }
  ],
  "market_insights": {
    "dominant_hook_type": "Social Proof",
    "dominant_format": "video"
  }
}
```

---

## ❓ Troubleshooting

### Error: "GEMINI_API_KEY is required"
- Make sure you filled in `.env` with your actual Gemini key
- Check that `.env` is in the `project1` directory
- Restart the API server after changing `.env`

### Error: "APIFY_API_TOKEN is required"
- Fill in your Apify token in `.env`
- Get it from https://console.apify.com/account/integrations

### Error: "No Facebook ads found"
- Normal for ~30-40% of businesses (not all advertise)
- Try different businesses that actively advertise

### API takes too long (>5 minutes)
- Normal for first request (scraping 30 ads)
- Subsequent requests are faster (Apify caches)

---

## 📁 Modified Files Summary

| File | Change |
|------|--------|
| `src/llm.ts` | OpenAI → Gemini |
| `src/config.ts` | `openaiApiKey` → `geminiApiKey` |
| `src/main.ts` | Use Gemini client |
| `src/bot.ts` | Use Gemini client |
| `src/media.ts` | Simplified (placeholders) |
| `.env` | Created with Gemini keys |
| `dist/` | Recompiled |

---

## ✅ Ready to Test!

1. **Fill in .env** with your Gemini + Apify keys
2. **Start API**: `node dist/api.js`
3. **Test endpoint**: Use curl command above
4. **Wait 2-5 minutes** for results
5. **Check output**: Should get analysis with gaps & recommendations

Once local testing works, fix VPS nginx authentication for n8n integration!

---

**Need help?** Let me know what error you're getting and I'll help debug!
