require('dotenv').config();
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('\n🔍 Checking API Rate Limit Information...\n');

// Test OpenAI
(async () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 OpenAI API Status');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Test' }],
      max_tokens: 5
    });
    console.log('✅ OpenAI API is working!\n');
  } catch (error) {
    console.log('❌ OpenAI API Error:', error.message);
    console.log('\nError Details:');
    console.log('  Type:', error.type || 'N/A');
    console.log('  Code:', error.code || 'N/A');
    console.log('  Status:', error.status || 'N/A');

    if (error.headers) {
      console.log('\n📋 Response Headers:');
      console.log('  x-ratelimit-limit-requests:', error.headers['x-ratelimit-limit-requests'] || 'N/A');
      console.log('  x-ratelimit-remaining-requests:', error.headers['x-ratelimit-remaining-requests'] || 'N/A');
      console.log('  x-ratelimit-reset-requests:', error.headers['x-ratelimit-reset-requests'] || 'N/A');
      console.log('  retry-after:', error.headers['retry-after'] || 'N/A');

      if (error.headers['x-ratelimit-reset-requests']) {
        const resetTime = new Date(error.headers['x-ratelimit-reset-requests']);
        const now = new Date();
        const diffMs = resetTime - now;
        const diffMins = Math.floor(diffMs / 1000 / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        console.log('\n⏰ Reset Time:');
        console.log('  Date:', resetTime.toLocaleString());
        if (diffDays > 0) {
          console.log('  In:', diffDays + 'd ' + (diffHours % 24) + 'h');
        } else if (diffHours > 0) {
          console.log('  In:', diffHours + 'h ' + (diffMins % 60) + 'm');
        } else {
          console.log('  In:', diffMins + 'm');
        }
      }
    }

    // Try to get account info
    console.log('\n💳 Checking Account Status...');
    try {
      const response = await fetch('https://api.openai.com/v1/dashboard/billing/subscription', {
        headers: { 'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY }
      });
      const data = await response.json();

      if (data.error) {
        console.log('  Error:', data.error.message);
      } else if (data.has_payment_method === false) {
        console.log('  ⚠️  No payment method on file');
        console.log('  → Add billing at: https://platform.openai.com/account/billing');
      } else {
        console.log('  Plan:', data.plan ? data.plan.title : 'Unknown');
      }
    } catch (e) {
      console.log('  Unable to fetch billing info');
    }

    console.log();
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Gemini API Status');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Test');
    console.log('✅ Gemini API is working!\n');
  } catch (error) {
    console.log('❌ Gemini API Error:', error.message);

    if (error.status) {
      console.log('  Status:', error.status);
    }

    if (error.response && error.response.headers) {
      console.log('\n📋 Response Headers:');
      const headers = error.response.headers;
      console.log('  x-goog-quota-user:', headers['x-goog-quota-user'] || 'N/A');
      console.log('  x-ratelimit-limit:', headers['x-ratelimit-limit'] || 'N/A');
      console.log('  x-ratelimit-remaining:', headers['x-ratelimit-remaining'] || 'N/A');
      console.log('  x-ratelimit-reset:', headers['x-ratelimit-reset'] || 'N/A');
      console.log('  retry-after:', headers['retry-after'] || 'N/A');
    }

    console.log('\n💡 Suggestions:');
    if (error.message.includes('404')) {
      console.log('  → API key may be invalid or expired');
      console.log('  → Get new key at: https://aistudio.google.com/app/apikey');
    } else if (error.message.includes('429')) {
      console.log('  → Rate limit exceeded');
      console.log('  → Free tier: 15 requests/min, 1,500 requests/day');
      console.log('  → Upgrade at: https://console.cloud.google.com/billing');
    }

    console.log();
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
})();
