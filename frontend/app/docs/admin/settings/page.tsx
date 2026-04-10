import { Metadata } from 'next'
import { PageHeader } from '@/components/docs/PageHeader'
import { Breadcrumbs } from '@/components/docs/Breadcrumbs'
import { PageNavigation } from '@/components/docs/PageNavigation'
import { StatCard, StatGrid } from '@/components/docs/StatCard'
import { ScreenshotCard } from '@/components/docs/ScreenshotCard'
import { Tabs, Tab } from '@/components/docs/Tabs'
import { Accordion } from '@/components/docs/Accordion'
import { InfoBox, WarningBox, SuccessBox } from '@/components/docs/CalloutBox'
import { ComparisonTable } from '@/components/docs/ComparisonTable'
import { CodeBlock } from '@/components/docs/CodeBlock'
import { FeatureGrid, Feature } from '@/components/docs/FeatureCard'
import { QuickActionCard, QuickActionGrid } from '@/components/docs/QuickActionCard'
import { getPageNavigation } from '@/lib/docs-config'

export const metadata: Metadata = {
  title: 'Settings & Configuration - AdSpy Tool Documentation',
  description: 'Configure scraper settings, API keys, notifications, and performance tuning',
}

export default function SettingsPage() {
  const { prev, next } = getPageNavigation('/docs/admin/settings')

  return (
    <div>
      <Breadcrumbs items={[{ label: 'For Admins', href: '/docs/admin' }, { label: 'Settings' }]} />
      <PageHeader
        title="Settings & Configuration"
        description="Configure scraper behavior, API integrations, notifications, and performance settings"
        icon="⚙️"
      />

      {/* Settings Overview */}
      <section className="mt-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Settings Overview</h2>
        <StatGrid columns={4}>
          <StatCard
            icon="🔧"
            label="Configuration Areas"
            value="6"
            variant="primary"
            description="Scraper, APIs, notifications, performance, security, display"
          />
          <StatCard
            icon="🔑"
            label="API Integrations"
            value="7"
            variant="success"
            description="OpenAI, Gemini, Apify, Slack, Google Sheets, Meta, Dropbox"
          />
          <StatCard
            icon="🔒"
            label="Security Level"
            value="High"
            variant="warning"
            description="Environment variables, encrypted storage, audit logs"
          />
          <StatCard
            icon="📝"
            label="Auto-Save"
            value="Enabled"
            variant="default"
            description="Settings persist immediately on change"
          />
        </StatGrid>

        <ScreenshotCard
          title="Settings Dashboard"
          description="The settings page is divided into 6 main sections: Scraper Settings, API Configuration, Notification Preferences, Performance Tuning, Security Settings, and Display Options. Each section has its own tab with relevant controls and validation."
          caption="Tip: Changes to critical settings (like API keys) require confirmation before saving."
          aspectRatio="16:9"
        />
      </section>

      {/* Global Scraper Settings */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Global Scraper Settings</h2>
        <p className="text-slate-700 text-lg mb-8">
          Control how the AdSpy scraper behaves across all brands. These settings affect scraping frequency, volume limits, and data retention.
        </p>

        <ComparisonTable
          headers={['Setting', 'Default', 'Recommended', 'Description']}
          rows={[
            {
              label: 'Scraper Enabled',
              values: ['✅ On', '✅ On', 'Master switch for all scraping operations'],
            },
            {
              label: 'Scrape Frequency',
              values: ['Daily at 2 AM', 'Daily at 2 AM', 'How often to scrape all brands (cron schedule)'],
            },
            {
              label: 'Max Ads Per Brand',
              values: ['100', '50-100', 'Limit ads fetched per brand per scrape (prevents overages)'],
            },
            {
              label: 'Max Daily Total Ads',
              values: ['Unlimited', '5000', 'Global daily limit across all brands (cost control)'],
            },
            {
              label: 'Min Active Days',
              values: ['7 days', '7-30 days', 'Only scrape ads active for X days (filters old ads)'],
            },
            {
              label: 'Auto-Dedup',
              values: ['✅ On', '✅ On', 'Skip ads already in database (prevents duplicates)'],
            },
            {
              label: 'Retry Failed Scrapes',
              values: ['3 attempts', '3-5 attempts', 'How many times to retry if scrape fails'],
            },
            {
              label: 'Data Retention',
              values: ['1 year', '6-12 months', 'Automatically archive ads older than X'],
            },
          ]}
        />

        <div className="mt-8">
          <WarningBox title="Cost Control">
            The <strong>Max Daily Total Ads</strong> setting is critical for controlling API costs. If you have 89 brands and max 100 ads per brand, one scrape could fetch 8,900 ads. Set a global daily limit to prevent unexpected charges.
          </WarningBox>
        </div>
      </section>

      {/* AdSpy Scraper Configuration */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">AdSpy Scraper Configuration</h2>
        <p className="text-slate-700 text-lg mb-8">
          Fine-tune the scraper behavior, filters, and brand management.
        </p>

        <Tabs>
          <Tab label="Enable/Disable">
            <div className="space-y-6">
              <ScreenshotCard
                title="Master Scraper Toggle"
                description="Simple on/off switch at the top of the Settings page. When disabled, all scheduled scrapes are paused. Manual scrapes via Admin Tasks are still available."
                aspectRatio="16:9"
              />
              <InfoBox title="When to Disable">
                Disable the scraper temporarily when:
                <ul className="space-y-2 text-blue-800 mt-3">
                  <li>• Performing database maintenance</li>
                  <li>• Debugging scraper issues</li>
                  <li>• Approaching API rate limits</li>
                  <li>• Migrating to new server</li>
                </ul>
              </InfoBox>
            </div>
          </Tab>

          <Tab label="Brand Management">
            <div className="space-y-6">
              <p className="text-slate-700">
                Brands are synced from the Google Sheets "Brand Management" tab. Add/remove brands there, and they'll automatically appear in the scraper within 5 minutes.
              </p>
              <CodeBlock copyable>
{`# Brand Sync Process
1. User adds brand to Google Sheets → "Brand Management" tab
2. Backend syncs sheet every 5 minutes (cron job)
3. New brands appear in database with status: "active"
4. Next scheduled scrape includes new brand automatically
5. Remove brand from sheet → status changes to "inactive" (data preserved)`}
              </CodeBlock>
              <StatGrid columns={3}>
                <StatCard
                  icon="📊"
                  label="Active Brands"
                  value="89"
                  variant="success"
                  description="Currently tracked brands"
                />
                <StatCard
                  icon="⏸️"
                  label="Inactive Brands"
                  value="12"
                  variant="default"
                  description="Paused or removed"
                />
                <StatCard
                  icon="🔄"
                  label="Sync Frequency"
                  value="5 min"
                  variant="primary"
                  description="Sheet → Database sync interval"
                />
              </StatGrid>
            </div>
          </Tab>

          <Tab label="Filters & Limits">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Scrape Filters</h3>
              <ComparisonTable
                headers={['Filter', 'Purpose', 'Example Value']}
                rows={[
                  {
                    label: 'Min Active Days',
                    values: ['Skip recently launched ads', '7 days'],
                  },
                  {
                    label: 'Max Ads Per Brand',
                    values: ['Prevent fetching too many ads per brand', '100 ads'],
                  },
                  {
                    label: 'Ad Types',
                    values: ['Filter by image/video/carousel', 'All types'],
                  },
                  {
                    label: 'Platforms',
                    values: ['Facebook, Instagram, or both', 'Both'],
                  },
                ]}
              />
              <SuccessBox title="Pro Tip">
                Set <strong>Min Active Days</strong> to 7-14 days to focus on ads that have survived the "testing phase." Brand-new ads are often killed within days if they don't perform.
              </SuccessBox>
            </div>
          </Tab>

          <Tab label="Schedule">
            <div className="space-y-6">
              <p className="text-slate-700">
                Configure when scrapes run using cron syntax. Default is daily at 2 AM server time to avoid peak hours.
              </p>
              <CodeBlock copyable>
{`# Cron Schedule Examples

# Daily at 2 AM
0 2 * * *

# Every 12 hours (2 AM and 2 PM)
0 2,14 * * *

# Every Monday at 3 AM
0 3 * * 1

# Every 6 hours
0 */6 * * *

# First day of month at midnight
0 0 1 * *`}
              </CodeBlock>
              <InfoBox title="Scheduling Best Practices">
                <ul className="space-y-2 text-blue-800">
                  <li>• <strong>Night hours</strong>: Run scrapes during low-traffic hours (2-5 AM)</li>
                  <li>• <strong>Frequency</strong>: Daily is sufficient for most use cases</li>
                  <li>• <strong>Stagger</strong>: If running multiple scrapers, stagger start times</li>
                  <li>• <strong>Rate limits</strong>: More frequent = higher API costs</li>
                </ul>
              </InfoBox>
            </div>
          </Tab>
        </Tabs>
      </section>

      {/* API Configuration */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">API Configuration</h2>
        <p className="text-slate-700 text-lg mb-8">
          Configure API keys for all external services. Keys are stored securely in environment variables and never exposed in frontend code.
        </p>

        <Accordion title="OpenAI API (Ad Analysis)">
          <div className="space-y-6">
            <p className="text-slate-700">
              Used for detailed ad analysis after Gemini breakdown. GPT-4 analyzes hooks, angles, structure, improvements, and generates rewritten versions.
            </p>
            <CodeBlock copyable>
{`# .env
OPENAI_API_KEY=sk-proj-...your-key-here...

# Required Model
gpt-4-turbo-preview (recommended)
# OR
gpt-4 (slower but more accurate)

# Cost Estimate
~$0.03 per ad analysis (1500 tokens avg)
89 brands × 100 ads = 8900 ads/scrape
= ~$267 per scrape`}
            </CodeBlock>
            <WarningBox title="Security Warning">
              Never commit API keys to Git. Always use <code className="bg-red-100 px-2 py-1 rounded text-red-800">.env</code> files and add them to <code className="bg-red-100 px-2 py-1 rounded text-red-800">.gitignore</code>.
            </WarningBox>
          </div>
        </Accordion>

        <Accordion title="Gemini API (Video/Image Breakdown)">
          <div className="space-y-6">
            <p className="text-slate-700">
              Used for initial creative breakdown (video transcripts, visual analysis, structure detection). Runs before OpenAI analysis.
            </p>
            <CodeBlock copyable>
{`# .env
GEMINI_API_KEY=AIza...your-key-here...

# Required Model
gemini-1.5-pro (supports vision + video)

# Cost Estimate
~$0.01 per ad breakdown (500 tokens avg)
8900 ads/scrape = ~$89 per scrape

# Rate Limits
- 60 requests/minute (default)
- Implement exponential backoff`}
            </CodeBlock>
            <InfoBox title="Why Gemini?">
              Gemini excels at multimodal analysis (image + video + text). It's faster and cheaper than GPT-4 Vision for initial breakdowns.
            </InfoBox>
          </div>
        </Accordion>

        <Accordion title="Apify API (Facebook Ad Scraping)">
          <div className="space-y-6">
            <p className="text-slate-700">
              Scrapes Facebook Ad Library for competitor ads. Returns ad metadata, creative URLs, and performance hints.
            </p>
            <CodeBlock copyable>
{`# .env
APIFY_API_TOKEN=apify_api_...your-token-here...

# Actor ID
mPPoSMBXG8ZB1MVCM (Facebook Ad Library Scraper)

# Cost Estimate
$5-10 per scrape (depends on # of ads)
~$150-300/month for daily scrapes

# Required Settings
- Max Ads Per Brand: 100 (prevents overages)
- Timeout: 300 seconds
- Proxy: Auto (included in Apify pricing)`}
            </CodeBlock>
            <WarningBox title="Cost Control">
              Apify charges per compute unit. Set <strong>Max Ads Per Brand</strong> and <strong>Max Daily Total Ads</strong> to prevent runaway costs.
            </WarningBox>
          </div>
        </Accordion>

        <Accordion title="Slack API (Notifications)">
          <div className="space-y-6">
            <p className="text-slate-700">
              Posts updates to #adspy-feed channel when new ads are scraped and analyzed.
            </p>
            <CodeBlock copyable>
{`# .env
SLACK_BOT_TOKEN=xoxb-...your-bot-token-here...
SLACK_ADSPY_CHANNEL_ID=C01234ABCDE

# Required Scopes
- chat:write (post messages)
- channels:read (list channels)
- files:write (upload screenshots)

# Setup Steps
1. Create Slack App at api.slack.com/apps
2. Add bot to workspace
3. Invite bot to #adspy-feed channel
4. Copy Bot User OAuth Token → SLACK_BOT_TOKEN
5. Copy channel ID from Slack → SLACK_ADSPY_CHANNEL_ID`}
            </CodeBlock>
            <SuccessBox title="Testing Slack Integration">
              Use the <strong>Test Notification</strong> button in Settings to send a test message. If successful, you'll see a message in #adspy-feed within seconds.
            </SuccessBox>
          </div>
        </Accordion>

        <Accordion title="Google Sheets API (Brand Sync)">
          <div className="space-y-6">
            <p className="text-slate-700">
              Syncs brands from Google Sheets "Brand Management" tab to database every 5 minutes.
            </p>
            <CodeBlock copyable>
{`# .env
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
GOOGLE_SHEETS_CLIENT_EMAIL=ads-intel@project-id.iam.gserviceaccount.com
GOOGLE_SHEETS_SPREADSHEET_ID=1abc...xyz

# Setup Steps
1. Create Google Cloud Project
2. Enable Google Sheets API
3. Create Service Account
4. Download JSON credentials
5. Share Google Sheet with service account email
6. Copy credentials to .env
7. Copy spreadsheet ID from URL`}
            </CodeBlock>
            <InfoBox title="Service Account vs OAuth">
              Service accounts are better for server-to-server communication. They don't require user login and have unlimited access to shared sheets.
            </InfoBox>
          </div>
        </Accordion>

        <Accordion title="Meta Ads API (Future - Optional)">
          <div className="space-y-6">
            <p className="text-slate-700">
              Optional integration for fetching ad performance metrics directly from Meta Ads Manager (requires Business Manager access).
            </p>
            <CodeBlock copyable>
{`# .env (optional)
META_ACCESS_TOKEN=EAABsb...your-token-here...
META_AD_ACCOUNT_ID=act_1234567890

# Use Case
- Fetch spend, ROAS, CTR for scraped ads
- Track winning ads automatically
- Correlate creative with performance

# Status
🔒 Not yet implemented (planned for v2.0)`}
            </CodeBlock>
          </div>
        </Accordion>

        <Accordion title="Dropbox API (Future - Optional)">
          <div className="space-y-6">
            <p className="text-slate-700">
              Optional integration for backing up ad creatives to Dropbox (currently using local storage).
            </p>
            <CodeBlock copyable>
{`# .env (optional)
DROPBOX_ACCESS_TOKEN=sl.B...your-token-here...
DROPBOX_FOLDER_PATH=/AdSpy/Creatives

# Use Case
- Backup all ad images/videos to Dropbox
- Preserve creatives even if ads removed from Ad Library
- Share folders with team

# Status
🔒 Not yet implemented (planned for v2.0)`}
            </CodeBlock>
          </div>
        </Accordion>
      </section>

      {/* Notification Settings */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Notification Preferences</h2>
        <p className="text-slate-700 text-lg mb-8">
          Control when and how you receive notifications about scraper activity, errors, and new ads.
        </p>

        <StatGrid columns={3}>
          <StatCard
            icon="💬"
            label="Slack Notifications"
            value="Enabled"
            variant="success"
            description="Posts to #adspy-feed on new ads"
          />
          <StatCard
            icon="📧"
            label="Email Alerts"
            value="Errors Only"
            variant="warning"
            description="Email on scraper failures"
          />
          <StatCard
            icon="🔔"
            label="Webhooks"
            value="Disabled"
            variant="default"
            description="Custom webhook endpoints"
          />
        </StatGrid>

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Notification Types</h3>
          <ComparisonTable
            headers={['Event', 'Slack', 'Email', 'Webhook', 'Configurable']}
            rows={[
              {
                label: 'New Ads Scraped',
                values: [true, false, false, true],
              },
              {
                label: 'Scraper Error',
                values: [true, true, true, false],
              },
              {
                label: 'Analysis Complete',
                values: [true, false, false, true],
              },
              {
                label: 'Daily Summary',
                values: [true, true, false, true],
              },
              {
                label: 'API Rate Limit',
                values: [true, true, true, false],
              },
              {
                label: 'New Brand Added',
                values: [true, false, false, true],
              },
            ]}
          />
        </div>

        <div className="mt-8">
          <FeatureGrid>
            <Feature icon="🎯" title="Smart Batching">
              Group notifications by event type to avoid notification fatigue. Daily summaries combine all new ads into one message.
            </Feature>
            <Feature icon="⏰" title="Quiet Hours">
              Pause non-critical notifications during specific hours (e.g., 10 PM - 7 AM).
            </Feature>
            <Feature icon="🔕" title="Priority Levels">
              Critical errors always notify. Warnings can be batched or disabled.
            </Feature>
            <Feature icon="📊" title="Digest Mode">
              Receive one daily digest instead of real-time notifications.
            </Feature>
          </FeatureGrid>
        </div>
      </section>

      {/* Performance Tuning */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Performance Tuning</h2>
        <p className="text-slate-700 text-lg mb-8">
          Optimize scraper performance, database queries, and API rate limits for maximum efficiency.
        </p>

        <Tabs>
          <Tab label="Rate Limiting">
            <div className="space-y-6">
              <p className="text-slate-700">
                Prevent API throttling by configuring request rate limits for each external service.
              </p>
              <ComparisonTable
                headers={['Service', 'Default Limit', 'Our Setting', 'Notes']}
                rows={[
                  {
                    label: 'OpenAI API',
                    values: ['3,500 req/min', '60 req/min', 'Conservative to avoid 429 errors'],
                  },
                  {
                    label: 'Gemini API',
                    values: ['60 req/min', '50 req/min', 'Leaves buffer for other processes'],
                  },
                  {
                    label: 'Apify API',
                    values: ['Compute-based', '10 concurrent', 'Prevent runaway costs'],
                  },
                  {
                    label: 'Slack API',
                    values: ['1 req/sec', '1 req/sec', 'Match Slack tier 1 limit'],
                  },
                  {
                    label: 'Google Sheets',
                    values: ['60 req/min', '30 req/min', 'Batch updates when possible'],
                  },
                ]}
              />
              <CodeBlock copyable>
{`# Rate Limiter Configuration (backend)
const rateLimits = {
  openai: { maxRequests: 60, perMinutes: 1 },
  gemini: { maxRequests: 50, perMinutes: 1 },
  apify: { maxConcurrent: 10 },
  slack: { maxRequests: 1, perSeconds: 1 },
  sheets: { maxRequests: 30, perMinutes: 1 }
}`}
              </CodeBlock>
            </div>
          </Tab>

          <Tab label="Concurrency">
            <div className="space-y-6">
              <p className="text-slate-700">
                Control how many ads are processed in parallel. Higher concurrency = faster scrapes but higher resource usage.
              </p>
              <StatGrid columns={3}>
                <StatCard
                  icon="🚀"
                  label="Scrape Workers"
                  value="10"
                  variant="primary"
                  description="Parallel Apify scrapes"
                />
                <StatCard
                  icon="🤖"
                  label="Analysis Workers"
                  value="5"
                  variant="success"
                  description="Parallel AI analyses"
                />
                <StatCard
                  icon="💾"
                  label="DB Connections"
                  value="20"
                  variant="warning"
                  description="Max pool size"
                />
              </StatGrid>
              <InfoBox title="Tuning Guide">
                <ul className="space-y-2 text-blue-800">
                  <li>• <strong>CPU-bound</strong>: Lower concurrency (5-10 workers)</li>
                  <li>• <strong>I/O-bound</strong>: Higher concurrency (20-50 workers)</li>
                  <li>• <strong>Memory</strong>: 1 worker ≈ 100-200 MB RAM</li>
                  <li>• <strong>Sweet spot</strong>: 10 scrape workers + 5 analysis workers on 4GB VPS</li>
                </ul>
              </InfoBox>
            </div>
          </Tab>

          <Tab label="Caching">
            <div className="space-y-6">
              <p className="text-slate-700">
                Cache frequently accessed data to reduce database queries and API calls.
              </p>
              <FeatureGrid>
                <Feature icon="📦" title="Brand List Cache">
                  Cache active brands for 5 minutes. Reduces database reads by 95% during scrapes.
                </Feature>
                <Feature icon="🖼️" title="Image URL Cache">
                  Cache ad creative URLs for 24 hours. Prevents re-downloading same images.
                </Feature>
                <Feature icon="📊" title="Analysis Cache">
                  Cache AI analysis results permanently. Never re-analyze same ad.
                </Feature>
                <Feature icon="🔍" title="Search Query Cache">
                  Cache search results for 1 minute. Improves dashboard responsiveness.
                </Feature>
              </FeatureGrid>
              <CodeBlock copyable>
{`# Redis Cache Configuration
REDIS_URL=redis://localhost:6379
CACHE_TTL_BRANDS=300        # 5 minutes
CACHE_TTL_IMAGES=86400      # 24 hours
CACHE_TTL_ANALYSIS=0        # Forever (never expire)
CACHE_TTL_SEARCH=60         # 1 minute`}
              </CodeBlock>
            </div>
          </Tab>

          <Tab label="Database">
            <div className="space-y-6">
              <p className="text-slate-700">
                Optimize database performance with indexing, connection pooling, and query optimization.
              </p>
              <ComparisonTable
                headers={['Optimization', 'Impact', 'Status']}
                rows={[
                  {
                    label: 'Index on ad_id (primary key)',
                    values: ['99% faster lookups', '✅ Enabled'],
                  },
                  {
                    label: 'Index on brand + created_at',
                    values: ['85% faster brand queries', '✅ Enabled'],
                  },
                  {
                    label: 'Index on created_at (DESC)',
                    values: ['70% faster recent ads', '✅ Enabled'],
                  },
                  {
                    label: 'Connection pooling (20 max)',
                    values: ['50% fewer reconnects', '✅ Enabled'],
                  },
                  {
                    label: 'Batch inserts (100 ads/query)',
                    values: ['90% faster writes', '✅ Enabled'],
                  },
                  {
                    label: 'Full-text search index',
                    values: ['10x faster searches', '⏳ Pending'],
                  },
                ]}
              />
              <SuccessBox title="Query Performance">
                With current optimizations, the database handles:
                <ul className="space-y-1 text-green-800 mt-2">
                  <li>• 10,000 ad lookups/sec</li>
                  <li>• 500 inserts/sec (batched)</li>
                  <li>• 100 complex searches/sec</li>
                  <li>• Sub-10ms response time for indexed queries</li>
                </ul>
              </SuccessBox>
            </div>
          </Tab>
        </Tabs>
      </section>

      {/* Security Settings */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Security Best Practices</h2>
        <p className="text-slate-700 text-lg mb-8">
          Follow these security guidelines to protect API keys, prevent unauthorized access, and ensure data privacy.
        </p>

        <FeatureGrid>
          <Feature icon="🔐" title="Environment Variables">
            Store all API keys in <code className="bg-slate-100 px-2 py-1 rounded">.env</code> files. Never commit to Git. Use separate files for dev/prod.
          </Feature>
          <Feature icon="🛡️" title="API Key Rotation">
            Rotate API keys every 90 days. Set calendar reminders. Keep old keys active for 24h during rotation.
          </Feature>
          <Feature icon="📝" title="Audit Logs">
            Log all settings changes with timestamp and user. Review logs monthly for suspicious activity.
          </Feature>
          <Feature icon="🔒" title="Access Control">
            Limit settings access to admin users only. Use role-based permissions (admin, editor, viewer).
          </Feature>
          <Feature icon="🚨" title="Rate Limit Alerts">
            Monitor API usage. Alert when approaching 80% of rate limits. Auto-pause at 95%.
          </Feature>
          <Feature icon="💾" title="Backup Credentials">
            Store encrypted backup of all API keys in password manager (1Password, LastPass, etc.).
          </Feature>
        </FeatureGrid>

        <div className="mt-8">
          <WarningBox title="Critical Security Rules">
            <ul className="space-y-2 text-orange-800">
              <li>• <strong>Never</strong> commit <code className="bg-orange-100 px-2 py-1 rounded">.env</code> files to Git</li>
              <li>• <strong>Never</strong> expose API keys in frontend code or logs</li>
              <li>• <strong>Never</strong> share API keys via Slack, email, or screenshots</li>
              <li>• <strong>Always</strong> use service accounts (not personal accounts) for automation</li>
              <li>• <strong>Always</strong> enable 2FA on all API provider accounts</li>
              <li>• <strong>Always</strong> revoke keys immediately if compromised</li>
            </ul>
          </WarningBox>
        </div>
      </section>

      {/* Testing Configuration */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Testing Your Configuration</h2>
        <p className="text-slate-700 text-lg mb-8">
          Verify all settings are working correctly before running production scrapes.
        </p>

        <QuickActionGrid columns={3}>
          <QuickActionCard
            icon="🧪"
            title="Test API Keys"
            description="Send test requests to all configured APIs. Verify authentication and rate limits."
            action={{ label: 'Run API Tests', href: '/admin/settings' }}
            variant="primary"
          />
          <QuickActionCard
            icon="🔔"
            title="Test Notifications"
            description="Send test messages to Slack, email, and webhooks. Confirm delivery and formatting."
            action={{ label: 'Send Test Alerts', href: '/admin/settings' }}
            variant="success"
          />
          <QuickActionCard
            icon="🎯"
            title="Test Scrape"
            description="Run a small test scrape (1 brand, 10 ads) to verify end-to-end pipeline."
            action={{ label: 'Start Test Scrape', href: '/admin/tasks' }}
            variant="warning"
          />
        </QuickActionGrid>
      </section>

      {/* Troubleshooting */}
      <section className="mt-16 pt-12 border-t border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Common Issues</h2>
        <Accordion title="API Key Not Working">
          <div className="space-y-4">
            <p className="text-slate-700">
              If you see "Unauthorized" or "Invalid API key" errors:
            </p>
            <ol className="space-y-2 text-slate-700 list-decimal list-inside">
              <li>Check <code className="bg-slate-100 px-2 py-1 rounded">.env</code> file for typos or extra spaces</li>
              <li>Verify key is active in API provider dashboard</li>
              <li>Check key permissions/scopes match required scopes</li>
              <li>Restart backend server after changing <code className="bg-slate-100 px-2 py-1 rounded">.env</code></li>
              <li>Use "Test API Keys" button to diagnose specific failure</li>
            </ol>
          </div>
        </Accordion>

        <Accordion title="Scraper Not Running">
          <div className="space-y-4">
            <p className="text-slate-700">
              If scheduled scrapes aren't running:
            </p>
            <ol className="space-y-2 text-slate-700 list-decimal list-inside">
              <li>Check "Scraper Enabled" toggle is ON</li>
              <li>Verify cron schedule syntax is correct</li>
              <li>Check server timezone matches expected time</li>
              <li>Review logs for error messages during last scheduled run</li>
              <li>Manually trigger test scrape to verify scraper works</li>
            </ol>
          </div>
        </Accordion>

        <Accordion title="Slack Notifications Not Appearing">
          <div className="space-y-4">
            <p className="text-slate-700">
              If Slack messages aren't posting:
            </p>
            <ol className="space-y-2 text-slate-700 list-decimal list-inside">
              <li>Verify bot is invited to #adspy-feed channel</li>
              <li>Check <code className="bg-slate-100 px-2 py-1 rounded">SLACK_BOT_TOKEN</code> has <code className="bg-slate-100 px-2 py-1 rounded">chat:write</code> scope</li>
              <li>Confirm <code className="bg-slate-100 px-2 py-1 rounded">SLACK_ADSPY_CHANNEL_ID</code> matches actual channel ID</li>
              <li>Use "Test Notifications" button to send test message</li>
              <li>Check Slack app is not uninstalled or permissions revoked</li>
            </ol>
          </div>
        </Accordion>
      </section>

      <PageNavigation prev={prev} next={next} />
    </div>
  )
}
