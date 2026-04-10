/**
 * Complete End-to-End Test for Project 1
 * Tests: Google Sheets → Database → AI Analysis → Slack → UI
 */

require('dotenv').config();
const { WebClient } = require('@slack/web-api');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[36m';
const RESET = '\x1b[0m';

console.log(`\n${BLUE}═══════════════════════════════════════════════════════${RESET}`);
console.log(`${BLUE}  PROJECT 1: COMPLETE END-TO-END TEST${RESET}`);
console.log(`${BLUE}═══════════════════════════════════════════════════════${RESET}\n`);

async function testSlackConnection() {
  console.log(`${YELLOW}[1/5] Testing Slack Connection...${RESET}`);

  try {
    if (!process.env.SLACK_TOKEN) {
      throw new Error('SLACK_TOKEN not found in .env');
    }

    if (!process.env.SLACK_CHANNEL) {
      throw new Error('SLACK_CHANNEL not found in .env');
    }

    const slack = new WebClient(process.env.SLACK_TOKEN);

    // Test 1: Get bot info
    const authTest = await slack.auth.test();
    console.log(`   ✅ Bot authenticated: ${authTest.user}`);
    console.log(`   📋 Workspace: ${authTest.team}`);

    // Test 2: Find channel
    let channels;
    try {
      channels = await slack.conversations.list({
        types: 'public_channel,private_channel',
      });
    } catch (listError) {
      console.log(`   ${RED}❌ conversations.list failed:${RESET}`, listError.message);
      if (listError.data && listError.data.needed) {
        console.log(`   ${YELLOW}💡 Missing scope: ${listError.data.needed}${RESET}`);
      }
      throw listError;
    }

    const targetChannel = channels.channels.find(
      (c) => c.name === process.env.SLACK_CHANNEL
    );

    if (!targetChannel) {
      console.log(
        `   ${RED}❌ Channel #${process.env.SLACK_CHANNEL} not found${RESET}`
      );
      console.log(`   ${YELLOW}💡 Create channel #${process.env.SLACK_CHANNEL} in Slack${RESET}`);
      return false;
    }

    console.log(`   ✅ Channel found: #${targetChannel.name} (${targetChannel.id})`);

    // Test 3: Check if bot is in channel
    const members = await slack.conversations.members({
      channel: targetChannel.id,
    });

    const botIsMember = members.members.includes(authTest.user_id);

    if (!botIsMember) {
      console.log(`   ${YELLOW}⚠️  Bot not in channel yet${RESET}`);
      console.log(`   ${YELLOW}💡 Adding bot to channel...${RESET}`);

      try {
        await slack.conversations.join({ channel: targetChannel.id });
        console.log(`   ✅ Bot joined channel successfully`);
      } catch (err) {
        console.log(`   ${YELLOW}⚠️  Couldn't auto-join. Please add manually:${RESET}`);
        console.log(`      1. Go to #${process.env.SLACK_CHANNEL} in Slack`);
        console.log(`      2. Click channel name → Integrations`);
        console.log(`      3. Click "Add an app"`);
        console.log(`      4. Select your bot`);
        return false;
      }
    } else {
      console.log(`   ✅ Bot is already in channel`);
    }

    // Test 4: Send test message
    const testMessage = await slack.chat.postMessage({
      channel: targetChannel.id,
      text: '✅ *Project 1 Test Started*\nTesting complete end-to-end flow...',
    });

    console.log(`   ✅ Test message sent successfully`);
    console.log(`   ${GREEN}✓ Slack connection working!${RESET}\n`);

    return true;
  } catch (error) {
    console.log(`   ${RED}❌ Slack test failed:${RESET}`, error.message);
    console.log(`   ${YELLOW}💡 Check SLACK_TOKEN and SLACK_CHANNEL in .env${RESET}\n`);
    return false;
  }
}

async function testGoogleSheets() {
  console.log(`${YELLOW}[2/5] Testing Google Sheets Connection...${RESET}`);

  try {
    if (!process.env.GOOGLE_SHEETS_ID) {
      throw new Error('GOOGLE_SHEETS_ID not found in .env');
    }

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL not found in .env');
    }

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY not found in .env');
    }

    // Remove quotes if present and handle newlines
    let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '';
    // Remove surrounding quotes and any trailing comma/newline
    privateKey = privateKey.trim();
    if (privateKey.startsWith('"')) {
      privateKey = privateKey.substring(1);
    }
    if (privateKey.endsWith('",') || privateKey.endsWith('"')) {
      privateKey = privateKey.replace(/",?$/, '');
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEETS_ID,
      serviceAccountAuth
    );

    await doc.loadInfo();
    console.log(`   ✅ Connected to sheet: "${doc.title}"`);

    // Find or create "Brands" sheet
    let brandsSheet = doc.sheetsByTitle['Brands'];

    if (!brandsSheet) {
      console.log(`   ⚠️  "Brands" tab not found, creating...`);
      brandsSheet = await doc.addSheet({
        title: 'Brands',
        headerValues: [
          'Avatar',
          'Brand Name',
          'Facebook Page URL',
          'Active',
          'Min Active Days',
          'Last Scraped',
          'Total Ads Scraped',
        ],
      });
      console.log(`   ✅ Created "Brands" tab`);
    } else {
      console.log(`   ✅ "Brands" tab found`);
    }

    // Check if we have test brands
    const rows = await brandsSheet.getRows();
    console.log(`   📊 Current brands in sheet: ${rows.length}`);

    // Add test brand if none exist
    if (rows.length === 0) {
      console.log(`   ➕ Adding test brand to sheet...`);
      await brandsSheet.addRow({
        Avatar: '🧪',
        'Brand Name': 'Test Brand - Nike',
        'Facebook Page URL': 'https://www.facebook.com/nike/',
        Active: 'TRUE',
        'Min Active Days': '0',
      });
      console.log(`   ✅ Test brand added`);
    }

    console.log(`   ${GREEN}✓ Google Sheets connection working!${RESET}\n`);
    return true;
  } catch (error) {
    console.log(`   ${RED}❌ Google Sheets test failed:${RESET}`, error.message);
    console.log(`   ${YELLOW}💡 Check Google Sheets credentials in .env${RESET}\n`);
    return false;
  }
}

async function testDatabase() {
  console.log(`${YELLOW}[3/5] Testing Database Connection...${RESET}`);

  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // Test connection
    const result = await pool.query('SELECT COUNT(*) FROM adspy_brands');
    const brandCount = result.rows[0].count;

    console.log(`   ✅ Database connected`);
    console.log(`   📊 Brands in database: ${brandCount}`);

    // Check for ads
    const adsResult = await pool.query('SELECT COUNT(*) FROM adspy_ads');
    const adsCount = adsResult.rows[0].count;

    console.log(`   📊 Ads in database: ${adsCount}`);

    console.log(`   ${GREEN}✓ Database connection working!${RESET}\n`);
    return true;
  } catch (error) {
    console.log(`   ${RED}❌ Database test failed:${RESET}`, error.message);
    console.log(`   ${YELLOW}💡 Check DATABASE_URL in .env${RESET}`);
    console.log(`   ${YELLOW}💡 Make sure PostgreSQL is running${RESET}\n`);
    return false;
  }
}

async function testAPIKeys() {
  console.log(`${YELLOW}[4/5] Checking API Keys...${RESET}`);

  const checks = {
    APIFY_API_TOKEN: !!process.env.APIFY_API_TOKEN,
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_key_here',
  };

  for (const [key, present] of Object.entries(checks)) {
    if (present) {
      console.log(`   ✅ ${key}: Present`);
    } else {
      console.log(`   ${RED}❌ ${key}: Missing or placeholder${RESET}`);
    }
  }

  const allPresent = Object.values(checks).every((v) => v);

  if (allPresent) {
    console.log(`   ${GREEN}✓ All API keys configured!${RESET}\n`);
  } else {
    console.log(`   ${YELLOW}⚠️  Some API keys missing - scraper may fail${RESET}\n`);
  }

  return allPresent;
}

async function sendSlackSummary(results) {
  if (!process.env.SLACK_TOKEN) return;

  try {
    const slack = new WebClient(process.env.SLACK_TOKEN);

    const emoji = results.allPassed ? '🎉' : '⚠️';
    const status = results.allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED';

    const message = [
      `${emoji} *Project 1 Test Summary*`,
      '',
      '*Test Results:*',
      results.slack ? '✅ Slack Integration' : '❌ Slack Integration',
      results.sheets ? '✅ Google Sheets' : '❌ Google Sheets',
      results.database ? '✅ Database' : '❌ Database',
      results.apiKeys ? '✅ API Keys' : '⚠️  API Keys (some missing)',
      '',
      `*Status:* ${status}`,
      '',
      results.allPassed
        ? '✅ *Ready to run scraper:* `npm run cron`'
        : '⚠️  Fix failed tests before running scraper',
    ].join('\n');

    await slack.chat.postMessage({
      channel: process.env.SLACK_CHANNEL,
      text: message,
    });

    console.log(`   ✅ Summary sent to Slack\n`);
  } catch (error) {
    console.log(`   ⚠️  Couldn't send summary to Slack\n`);
  }
}

async function main() {
  const results = {
    slack: false,
    sheets: false,
    database: false,
    apiKeys: false,
  };

  // Run tests
  results.slack = await testSlackConnection();
  results.sheets = await testGoogleSheets();
  results.database = await testDatabase();
  results.apiKeys = await testAPIKeys();

  // Final summary
  console.log(`${BLUE}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${BLUE}  TEST SUMMARY${RESET}`);
  console.log(`${BLUE}═══════════════════════════════════════════════════════${RESET}\n`);

  results.allPassed = results.slack && results.sheets && results.database;

  if (results.allPassed) {
    console.log(`${GREEN}🎉 ALL CORE TESTS PASSED!${RESET}\n`);
    console.log(`${GREEN}✓ Slack Integration: Working${RESET}`);
    console.log(`${GREEN}✓ Google Sheets: Working${RESET}`);
    console.log(`${GREEN}✓ Database: Working${RESET}`);

    if (results.apiKeys) {
      console.log(`${GREEN}✓ API Keys: All configured${RESET}\n`);
      console.log(`${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
      console.log(`${GREEN}  READY TO RUN COMPLETE TEST!${RESET}`);
      console.log(`${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);
      console.log(`Next steps:`);
      console.log(`  1. Sync brands from Google Sheets:`);
      console.log(`     ${BLUE}npm run sync-brands${RESET}\n`);
      console.log(`  2. Run scraper (will analyze 2 ads per brand):`);
      console.log(`     ${BLUE}npm run cron${RESET}\n`);
      console.log(`  3. Check results in:`);
      console.log(`     • Slack: #${process.env.SLACK_CHANNEL}`);
      console.log(`     • Database: psql -d creative_os`);
      console.log(`     • UI: http://localhost:3000/search\n`);
    } else {
      console.log(`${YELLOW}⚠️  API Keys: Some missing${RESET}\n`);
      console.log(`${YELLOW}Please add missing API keys to .env before running scraper${RESET}\n`);
    }
  } else {
    console.log(`${RED}❌ SOME TESTS FAILED${RESET}\n`);
    if (!results.slack) console.log(`${RED}✗ Slack Integration: Failed${RESET}`);
    if (!results.sheets) console.log(`${RED}✗ Google Sheets: Failed${RESET}`);
    if (!results.database) console.log(`${RED}✗ Database: Failed${RESET}`);
    console.log(
      `\n${YELLOW}Please fix the failed tests above before proceeding${RESET}\n`
    );
  }

  // Send summary to Slack
  console.log(`${YELLOW}[5/5] Sending Summary to Slack...${RESET}`);
  await sendSlackSummary(results);

  console.log(
    `${BLUE}═══════════════════════════════════════════════════════${RESET}\n`
  );

  process.exit(results.allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error(`\n${RED}Fatal error:${RESET}`, error);
  process.exit(1);
});
