import { Metadata } from 'next'
import { PageHeader } from '@/components/docs/PageHeader'
import { Breadcrumbs } from '@/components/docs/Breadcrumbs'
import { PageNavigation } from '@/components/docs/PageNavigation'
import { StatCard, StatGrid } from '@/components/docs/StatCard'
import { Steps, Step } from '@/components/docs/StepCard'
import { Tabs, Tab } from '@/components/docs/Tabs'
import { Accordion } from '@/components/docs/Accordion'
import { InfoBox, WarningBox, SuccessBox } from '@/components/docs/CalloutBox'
import { ComparisonTable } from '@/components/docs/ComparisonTable'
import { CodeBlock } from '@/components/docs/CodeBlock'
import { FeatureGrid, Feature } from '@/components/docs/FeatureCard'
import { getPageNavigation } from '@/lib/docs-config'

export const metadata: Metadata = {
  title: 'Troubleshooting - AdSpy Tool Documentation',
  description: 'Diagnostic procedures and solutions for common errors and system issues',
}

export default function TroubleshootingPage() {
  const { prev, next } = getPageNavigation('/docs/reference/troubleshooting')

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Reference', href: '/docs/reference' }, { label: 'Troubleshooting' }]} />
      <PageHeader
        title="Troubleshooting"
        description="Diagnostic procedures, error solutions, and system recovery guides"
        icon="🔧"
      />

      {/* Quick Diagnostic */}
      <section className="mt-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Quick Health Check</h2>
        <p className="text-slate-700 text-lg mb-8">
          Run these checks first to identify the issue category before diving into specific solutions.
        </p>

        <StatGrid columns={4}>
          <StatCard
            icon="🔄"
            label="Scraper Running?"
            value="Check"
            variant="primary"
            description="pm2 status ads-intel"
          />
          <StatCard
            icon="💾"
            label="Database Up?"
            value="Check"
            variant="success"
            description="psql -U postgres -c 'SELECT 1'"
          />
          <StatCard
            icon="🌐"
            label="API Keys Valid?"
            value="Check"
            variant="warning"
            description="Test with /admin/settings"
          />
          <StatCard
            icon="📊"
            label="Recent Errors?"
            value="Check"
            variant="danger"
            description="pm2 logs ads-intel --err"
          />
        </StatGrid>

        <div className="mt-8">
          <Steps>
            <Step number={1} title="Check System Status">
              Run <code className="bg-slate-100 px-2 py-1 rounded">pm2 status</code> to verify all processes are running (status: online).
            </Step>
            <Step number={2} title="Review Recent Logs">
              Check last 50 lines: <code className="bg-slate-100 px-2 py-1 rounded">pm2 logs ads-intel --lines 50</code>
            </Step>
            <Step number={3} title="Test Database Connection">
              Verify PostgreSQL: <code className="bg-slate-100 px-2 py-1 rounded">psql -U postgres creative_os -c "SELECT COUNT(*) FROM adspy_ads;"</code>
            </Step>
            <Step number={4} title="Identify Error Category">
              Match your issue to one of the categories below and follow specific troubleshooting steps.
            </Step>
          </Steps>
        </div>
      </section>

      {/* Error Categories */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Error Categories</h2>
        <p className="text-slate-700 text-lg mb-8">
          Most issues fall into these 12 categories. Click each to see diagnostic steps and solutions.
        </p>

        <Accordion title="1. Scraper Not Running">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Symptoms</h4>
              <ul className="space-y-2 text-slate-700 list-disc list-inside">
                <li>No new ads appearing in dashboard</li>
                <li>Last scrape timestamp {">"} 24 hours ago</li>
                <li>Slack #adspy-feed silent for days</li>
                <li><code className="bg-slate-100 px-2 py-1 rounded">pm2 status</code> shows "stopped" or "errored"</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Diagnostic Steps</h4>
              <CodeBlock copyable>
{`# Check PM2 status
pm2 status

# If stopped, check error logs
pm2 logs ads-intel --err --lines 100

# Check if process crashed
pm2 describe ads-intel

# Review system resources
free -h        # Memory
df -h          # Disk space
top            # CPU usage`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Common Causes & Solutions</h4>
              <ComparisonTable
                headers={['Cause', 'Solution', 'Prevention']}
                rows={[
                  {
                    label: 'Process crashed',
                    values: [
                      'pm2 restart ads-intel',
                      'Enable auto-restart in ecosystem.config.js'
                    ]
                  },
                  {
                    label: 'Out of memory',
                    values: [
                      'Increase max_memory_restart in PM2 config',
                      'Monitor memory usage, optimize queries'
                    ]
                  },
                  {
                    label: 'Unhandled exception',
                    values: [
                      'Check logs, fix code bug, redeploy',
                      'Add try-catch blocks, improve error handling'
                    ]
                  },
                  {
                    label: 'Cron job disabled',
                    values: [
                      'Check crontab: crontab -l',
                      'Re-enable: crontab -e'
                    ]
                  }
                ]}
              />
            </div>

            <SuccessBox title="Quick Fix">
              90% of scraper issues resolve with: <code className="bg-green-100 px-2 py-1 rounded text-green-800">pm2 restart ads-intel && pm2 logs ads-intel</code>
            </SuccessBox>
          </div>
        </Accordion>

        <Accordion title="2. Database Connection Errors">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Error Messages</h4>
              <CodeBlock copyable>
{`ECONNREFUSED 127.0.0.1:5432
connect ECONNREFUSED
Error: Connection terminated unexpectedly
FATAL: password authentication failed
FATAL: database "creative_os" does not exist
could not connect to server: Connection refused`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Diagnostic Checklist</h4>
              <Steps>
                <Step number={1} title="Verify PostgreSQL is Running">
                  <CodeBlock copyable>
{`# Check status
sudo systemctl status postgresql

# If not running, start it
sudo systemctl start postgresql

# Enable on boot
sudo systemctl enable postgresql`}
                  </CodeBlock>
                </Step>
                <Step number={2} title="Test Connection Manually">
                  <CodeBlock copyable>
{`# Test with psql
psql -U postgres -d creative_os -c "SELECT 1;"

# If fails, check credentials
cat /opt/ads-intel/.env | grep DATABASE_URL`}
                  </CodeBlock>
                </Step>
                <Step number={3} title="Check Connection String">
                  <CodeBlock copyable>
{`# Correct format
DATABASE_URL=postgresql://username:password@localhost:5432/creative_os

# Common mistakes
❌ postgresql://localhost:5432/creative_os  # Missing credentials
❌ postgres://...                           # Wrong protocol
❌ postgresql://user@localhost/db           # Missing port`}
                  </CodeBlock>
                </Step>
              </Steps>
            </div>

            <WarningBox title="If Using Supabase">
              Connection string format is different:
              <code className="bg-orange-100 px-2 py-1 rounded block mt-2 text-orange-800">
                postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
              </code>
            </WarningBox>
          </div>
        </Accordion>

        <Accordion title="3. API Authentication Failures">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Error Messages by API</h4>
              <ComparisonTable
                headers={['API', 'Error', 'Fix']}
                rows={[
                  {
                    label: 'OpenAI',
                    values: [
                      'Incorrect API key provided',
                      'Verify OPENAI_API_KEY in .env starts with sk-proj- or sk-'
                    ]
                  },
                  {
                    label: 'Gemini',
                    values: [
                      'API key not valid',
                      'Check GEMINI_API_KEY format (starts with AIza)'
                    ]
                  },
                  {
                    label: 'Apify',
                    values: [
                      'Authentication failed',
                      'Verify APIFY_API_TOKEN format (starts with apify_api_)'
                    ]
                  },
                  {
                    label: 'Slack',
                    values: [
                      'invalid_auth',
                      'Regenerate bot token, update SLACK_BOT_TOKEN'
                    ]
                  },
                  {
                    label: 'Google Sheets',
                    values: [
                      'Invalid credentials',
                      'Re-download service account JSON, update .env'
                    ]
                  }
                ]}
              />
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">How to Verify API Keys</h4>
              <Tabs>
                <Tab label="OpenAI">
                  <CodeBlock copyable>
{`# Test OpenAI key
curl https://api.openai.com/v1/models \\
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Should return JSON with model list
# If error, key is invalid or expired`}
                  </CodeBlock>
                </Tab>
                <Tab label="Gemini">
                  <CodeBlock copyable>
{`# Test Gemini key
curl "https://generativelanguage.googleapis.com/v1/models?key=$GEMINI_API_KEY"

# Should return available models
# If 400/403, key is invalid`}
                  </CodeBlock>
                </Tab>
                <Tab label="Slack">
                  <CodeBlock copyable>
{`# Test Slack token
curl https://slack.com/api/auth.test \\
  -H "Authorization: Bearer $SLACK_BOT_TOKEN"

# Should return {"ok": true, ...}
# If {"ok": false}, token invalid`}
                  </CodeBlock>
                </Tab>
              </Tabs>
            </div>

            <InfoBox title="After Fixing API Keys">
              Always restart the backend after updating .env:
              <code className="bg-blue-100 px-2 py-1 rounded block mt-2 text-blue-800">
                pm2 restart ads-intel
              </code>
            </InfoBox>
          </div>
        </Accordion>

        <Accordion title="4. API Rate Limiting (429 Errors)">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Understanding 429 Errors</h4>
              <p className="text-slate-700 mb-4">
                <strong>429 Too Many Requests</strong> means you've exceeded the API provider's rate limit. The scraper should auto-retry, but persistent 429s indicate configuration issues.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Rate Limits by Service</h4>
              <ComparisonTable
                headers={['API', 'Default Limit', 'Our Setting', 'Upgrade Option']}
                rows={[
                  {
                    label: 'OpenAI (Free)',
                    values: ['3 req/min', '2 req/min', 'Pay-as-you-go: 3,500 req/min']
                  },
                  {
                    label: 'OpenAI (Tier 1)',
                    values: ['500 req/min', '60 req/min', 'Tier 2: 5,000 req/min']
                  },
                  {
                    label: 'Gemini (Free)',
                    values: ['15 req/min', '10 req/min', 'Paid: 60 req/min']
                  },
                  {
                    label: 'Apify',
                    values: ['Compute-based', '10 concurrent', 'Scale plan: Unlimited']
                  },
                  {
                    label: 'Slack (Tier 1)',
                    values: ['1 req/sec', '1 req/sec', 'Enterprise: Higher limits']
                  }
                ]}
              />
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Solutions</h4>
              <Steps>
                <Step number={1} title="Reduce Concurrency">
                  <p className="text-slate-700 mt-2">Lower parallel workers in Settings → Performance → Concurrency</p>
                </Step>
                <Step number={2} title="Add Delays">
                  <CodeBlock copyable>
{`// In backend code, add delay between requests
await sleep(1000); // 1 second delay

// Or use rate limiter
import Bottleneck from 'bottleneck';
const limiter = new Bottleneck({ minTime: 1000 }); // 1 req/sec`}
                  </CodeBlock>
                </Step>
                <Step number={3} title="Upgrade API Tier">
                  <p className="text-slate-700 mt-2">If scraping {">"}100 ads/day, upgrade to paid tier for higher limits</p>
                </Step>
              </Steps>
            </div>

            <WarningBox title="Temporary Rate Limit Bans">
              If you hit rate limits repeatedly, some APIs (OpenAI) may temporarily ban your account for 1-24 hours. Wait it out or use a different API key.
            </WarningBox>
          </div>
        </Accordion>

        <Accordion title="5. Slack Notifications Not Working">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Common Issues</h4>
              <ComparisonTable
                headers={['Issue', 'Check', 'Fix']}
                rows={[
                  {
                    label: 'Bot not in channel',
                    values: [
                      'Open #adspy-feed, check member list',
                      'Invite bot: /invite @AdSpy-Bot'
                    ]
                  },
                  {
                    label: 'Wrong channel ID',
                    values: [
                      'Right-click channel → Copy Link → Extract ID from URL',
                      'Update SLACK_ADSPY_CHANNEL_ID in .env'
                    ]
                  },
                  {
                    label: 'Missing scopes',
                    values: [
                      'Check api.slack.com/apps → OAuth & Permissions',
                      'Add chat:write, channels:read, files:write'
                    ]
                  },
                  {
                    label: 'Token expired',
                    values: [
                      'Test token with curl (see API auth section)',
                      'Regenerate in Slack app settings'
                    ]
                  }
                ]}
              />
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Get Channel ID</h4>
              <CodeBlock copyable>
{`# Method 1: Right-click channel → View channel details → Copy ID

# Method 2: Use Slack API
curl https://slack.com/api/conversations.list \\
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \\
  | jq '.channels[] | select(.name=="adspy-feed") | .id'

# Should output: C01234ABCDE`}
              </CodeBlock>
            </div>

            <SuccessBox title="Test Slack Integration">
              Use Settings → Notifications → "Test Slack" button to send a test message. If successful, you'll see it in #adspy-feed within seconds.
            </SuccessBox>
          </div>
        </Accordion>

        <Accordion title="6. Scraper Runs But No Ads Scraped">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Possible Causes</h4>
              <FeatureGrid>
                <Feature icon="🚫" title="All Ads Already Scraped">
                  Deduplication working correctly. Check "Skip Already Scraped" setting.
                </Feature>
                <Feature icon="📅" title="Min Active Days Filter">
                  Ads too new ({"<"}7 days). Lower threshold in Settings → Filters.
                </Feature>
                <Feature icon="🔍" title="Apify Not Finding Ads">
                  Brand URL incorrect or brand has no active ads. Verify on facebook.com/ads/library.
                </Feature>
                <Feature icon="🔒" title="Apify Timeout">
                  Increase timeout in Settings → Apify → Timeout (default 300s).
                </Feature>
              </FeatureGrid>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Diagnostic Query</h4>
              <CodeBlock copyable>
{`-- Check recent scrapes
SELECT
  brand_name,
  COUNT(*) as ads_scraped,
  MAX(scraped_at) as last_scrape
FROM adspy_ads
WHERE scraped_at > NOW() - INTERVAL '7 days'
GROUP BY brand_name
ORDER BY last_scrape DESC;

-- If 0 results, no ads scraped in last week
-- Check Apify logs for errors`}
              </CodeBlock>
            </div>

            <InfoBox title="Test Single Brand">
              Manually scrape one known-active brand (e.g., Nike) from Brands page → "Scrape Now". If this succeeds, issue is with automation, not scraping itself.
            </InfoBox>
          </div>
        </Accordion>

        <Accordion title="7. Search Not Returning Results">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Troubleshooting Steps</h4>
              <Steps>
                <Step number={1} title="Verify Ads Exist in Database">
                  <CodeBlock copyable>
{`-- Count total ads
SELECT COUNT(*) FROM adspy_ads;

-- If 0, no ads scraped yet
-- If > 0, search logic issue`}
                  </CodeBlock>
                </Step>
                <Step number={2} title="Test Direct SQL Search">
                  <CodeBlock copyable>
{`-- Search for "discount" (should match your UI search)
SELECT COUNT(*) FROM adspy_ads
WHERE
  ad_creative_body ILIKE '%discount%' OR
  hook_analysis ILIKE '%discount%';

-- If returns results, UI/API issue
-- If returns 0, ads don't contain search term`}
                  </CodeBlock>
                </Step>
                <Step number={3} title="Check API Logs">
                  <CodeBlock copyable>
{`# Search backend logs for search endpoint
pm2 logs ads-intel | grep "/api/search"

# Look for errors or empty results`}
                  </CodeBlock>
                </Step>
              </Steps>
            </div>

            <WarningBox title="Case Sensitivity">
              Search should be case-insensitive (ILIKE). If using = or LIKE, searches will fail. Verify backend uses ILIKE for PostgreSQL.
            </WarningBox>
          </div>
        </Accordion>

        <Accordion title="8. Frontend Not Loading (White Screen)">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Common Causes</h4>
              <ComparisonTable
                headers={['Symptom', 'Cause', 'Solution']}
                rows={[
                  {
                    label: 'Blank white page',
                    values: ['Build error or missing files', 'npm run build, check for errors']
                  },
                  {
                    label: '404 Not Found',
                    values: ['Next.js dev server not running', 'npm run dev (development) or check port']
                  },
                  {
                    label: 'Network error',
                    values: ['API backend not reachable', 'Verify API URL in .env.local']
                  },
                  {
                    label: 'Console errors',
                    values: ['JavaScript errors', 'Open DevTools → Console, read error']
                  }
                ]}
              />
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Diagnostic Steps</h4>
              <Steps>
                <Step number={1} title="Check Browser Console">
                  Open DevTools (F12) → Console tab. Look for red error messages.
                </Step>
                <Step number={2} title="Verify Dev Server Running">
                  <CodeBlock copyable>
{`# Should see "Ready" message
cd /opt/ads-intel/frontend
npm run dev

# Check http://localhost:3000`}
                  </CodeBlock>
                </Step>
                <Step number={3} title="Check Network Tab">
                  DevTools → Network → Reload page. Look for failed requests (red).
                </Step>
                <Step number={4} title="Clear Browser Cache">
                  Hard reload: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
                </Step>
              </Steps>
            </div>
          </div>
        </Accordion>

        <Accordion title="9. Performance Issues (Slow Queries)">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Symptoms</h4>
              <ul className="space-y-2 text-slate-700 list-disc list-inside">
                <li>Dashboard takes {">"} 5 seconds to load</li>
                <li>Search hangs for 10+ seconds</li>
                <li>Database queries timeout</li>
                <li>High CPU usage on VPS</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Quick Fixes</h4>
              <Tabs>
                <Tab label="Check Indexes">
                  <CodeBlock copyable>
{`-- Verify indexes exist
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'adspy_ads';

-- Should have indexes on: id, ad_id, brand_id, scraped_at
-- If missing, recreate indexes (see Admin Tasks → DB Maintenance)`}
                  </CodeBlock>
                </Tab>
                <Tab label="Optimize Queries">
                  <CodeBlock copyable>
{`-- Find slow queries
SELECT
  query,
  calls,
  mean_exec_time,
  total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Add EXPLAIN ANALYZE to slow queries
EXPLAIN ANALYZE
SELECT * FROM adspy_ads WHERE brand_id = 5;`}
                  </CodeBlock>
                </Tab>
                <Tab label="VACUUM Database">
                  <CodeBlock copyable>
{`# Reclaim space and update statistics
vacuumdb -U postgres -z -v creative_os

# Full vacuum (locks tables, use off-hours)
vacuumdb -U postgres --full creative_os`}
                  </CodeBlock>
                </Tab>
              </Tabs>
            </div>

            <InfoBox title="Long-Term Solution">
              Enable connection pooling (pg-pool) and implement Redis caching for frequently accessed data (brand lists, recent ads).
            </InfoBox>
          </div>
        </Accordion>

        <Accordion title="10. Out of Disk Space">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Check Disk Usage</h4>
              <CodeBlock copyable>
{`# Overall disk usage
df -h

# Largest directories
du -h --max-depth=1 /opt/ads-intel | sort -hr | head -10

# Database size
SELECT pg_size_pretty(pg_database_size('creative_os'));

# PM2 logs size
du -h ~/.pm2/logs`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Cleanup Actions</h4>
              <Steps>
                <Step number={1} title="Rotate PM2 Logs">
                  <CodeBlock copyable>
{`# Install PM2 log rotation module
pm2 install pm2-logrotate

# Configure rotation (keep 7 days, max 100MB per file)
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 7`}
                  </CodeBlock>
                </Step>
                <Step number={2} title="Archive Old Ads">
                  <CodeBlock copyable>
{`-- Move ads older than 1 year to archive table
CREATE TABLE adspy_ads_archive AS
SELECT * FROM adspy_ads WHERE scraped_at < NOW() - INTERVAL '1 year';

DELETE FROM adspy_ads WHERE scraped_at < NOW() - INTERVAL '1 year';

VACUUM FULL adspy_ads;`}
                  </CodeBlock>
                </Step>
                <Step number={3} title="Delete Old Backups">
                  <CodeBlock copyable>
{`# Keep only last 30 days of backups
find /backups -name "*.sql.gz" -mtime +30 -delete`}
                  </CodeBlock>
                </Step>
              </Steps>
            </div>

            <WarningBox title="Emergency: System at 100% Disk">
              If disk is completely full, PostgreSQL and PM2 will fail. Free up space immediately:
              <code className="bg-orange-100 px-2 py-1 rounded block mt-2 text-orange-800">
                sudo journalctl --vacuum-time=3d && pm2 flush
              </code>
            </WarningBox>
          </div>
        </Accordion>

        <Accordion title="11. Memory Leaks / High RAM Usage">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Check Memory Usage</h4>
              <CodeBlock copyable>
{`# System memory
free -h

# Per-process memory
pm2 monit

# Detailed process stats
ps aux | grep node | sort -k4 -r | head -5`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Solutions</h4>
              <ComparisonTable
                headers={['Cause', 'Detection', 'Fix']}
                rows={[
                  {
                    label: 'Memory leak in code',
                    values: [
                      'Memory usage grows over time',
                      'Profile with --inspect, fix leaks, restart'
                    ]
                  },
                  {
                    label: 'Too many concurrent jobs',
                    values: [
                      'pm2 monit shows multiple high-RAM processes',
                      'Reduce concurrency in Settings'
                    ]
                  },
                  {
                    label: 'Large result sets',
                    values: [
                      'Queries return thousands of rows',
                      'Add LIMIT to queries, paginate results'
                    ]
                  },
                  {
                    label: 'No max memory restart',
                    values: [
                      'Process never restarts',
                      'Set max_memory_restart in PM2 config'
                    ]
                  }
                ]}
              />
            </div>

            <SuccessBox title="Quick Fix">
              Add automatic restart on memory threshold:
              <CodeBlock copyable>
{`// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'ads-intel',
    max_memory_restart: '1G',  // Restart at 1GB
    // ...
  }]
}`}
              </CodeBlock>
            </SuccessBox>
          </div>
        </Accordion>

        <Accordion title="12. Google Sheets Sync Failing">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Common Errors</h4>
              <CodeBlock copyable>
{`Error: No access, permission denied
Error: Unable to parse range
Error: The caller does not have permission
Error: Quota exceeded for quota metric`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Fixes by Error</h4>
              <ComparisonTable
                headers={['Error', 'Cause', 'Solution']}
                rows={[
                  {
                    label: 'No access',
                    values: [
                      'Service account not invited to sheet',
                      'Share sheet with service account email'
                    ]
                  },
                  {
                    label: 'Permission denied',
                    values: [
                      'Service account has View-only access',
                      'Change to Editor permissions'
                    ]
                  },
                  {
                    label: 'Unable to parse range',
                    values: [
                      'Sheet name or range incorrect',
                      'Verify sheet name matches exactly (case-sensitive)'
                    ]
                  },
                  {
                    label: 'Quota exceeded',
                    values: [
                      'Too many API requests (100/100s limit)',
                      'Reduce sync frequency, batch updates'
                    ]
                  }
                ]}
              />
            </div>

            <InfoBox title="Verify Credentials">
              Test Google Sheets connection:
              <CodeBlock copyable>
{`# In backend, add test endpoint
GET /api/test/sheets

# Should return sheet metadata
# If error, credentials are wrong`}
              </CodeBlock>
            </InfoBox>
          </div>
        </Accordion>
      </section>

      {/* Emergency Procedures */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Emergency Procedures</h2>
        <p className="text-slate-700 text-lg mb-8">
          When things go catastrophically wrong, follow these nuclear options.
        </p>

        <Tabs>
          <Tab label="System Down">
            <div className="space-y-6">
              <WarningBox title="⚠️ Full System Failure">
                Use this only when nothing else works and system is completely unresponsive.
              </WarningBox>
              <Steps>
                <Step number={1} title="Stop All Processes">
                  <CodeBlock copyable>
{`pm2 kill
sudo systemctl stop postgresql`}
                  </CodeBlock>
                </Step>
                <Step number={2} title="Check System Resources">
                  <CodeBlock copyable>
{`# If disk full, free space immediately
df -h
sudo journalctl --vacuum-time=1d
sudo apt clean

# If RAM full, clear cache
sudo sync && echo 3 | sudo tee /proc/sys/vm/drop_caches`}
                  </CodeBlock>
                </Step>
                <Step number={3} title="Restart Services">
                  <CodeBlock copyable>
{`sudo systemctl start postgresql
pm2 resurrect
pm2 logs ads-intel`}
                  </CodeBlock>
                </Step>
                <Step number={4} title="Verify Recovery">
                  <p className="text-slate-700 mt-2">Check dashboard loads, test manual scrape, review logs for errors.</p>
                </Step>
              </Steps>
            </div>
          </Tab>

          <Tab label="Database Corrupted">
            <div className="space-y-6">
              <WarningBox title="⚠️ Critical: Data Loss Risk">
                Only use if database is unrecoverable. Always try backups first.
              </WarningBox>
              <Steps>
                <Step number={1} title="Attempt Restore from Backup">
                  <CodeBlock copyable>
{`# List available backups
ls -lh /backups/*.sql.gz

# Restore most recent
gunzip -c /backups/adspy_20250117.sql.gz | psql -U postgres creative_os`}
                  </CodeBlock>
                </Step>
                <Step number={2} title="If No Backups: Rebuild Schema">
                  <CodeBlock copyable>
{`# Drop and recreate database
psql -U postgres -c "DROP DATABASE creative_os;"
psql -U postgres -c "CREATE DATABASE creative_os;"

# Run migrations
cd /opt/ads-intel
npm run migrate`}
                  </CodeBlock>
                </Step>
                <Step number={3} title="Rescrape All Brands">
                  <p className="text-slate-700 mt-2">Go to Admin → Manual Actions → "Scrape All Brands" to repopulate database.</p>
                </Step>
              </Steps>
            </div>
          </Tab>

          <Tab label="Complete Reinstall">
            <div className="space-y-6">
              <WarningBox title="⚠️ Last Resort">
                This wipes everything and starts fresh. Only use if system is beyond repair.
              </WarningBox>
              <Steps>
                <Step number={1} title="Backup Data">
                  <CodeBlock copyable>
{`# Backup database
pg_dump -U postgres creative_os > emergency_backup.sql

# Backup .env
cp /opt/ads-intel/.env ~/env_backup.txt`}
                  </CodeBlock>
                </Step>
                <Step number={2} title="Remove Everything">
                  <CodeBlock copyable>
{`pm2 kill
sudo rm -rf /opt/ads-intel
psql -U postgres -c "DROP DATABASE creative_os;"`}
                  </CodeBlock>
                </Step>
                <Step number={3} title="Fresh Install">
                  <p className="text-slate-700 mt-2">Follow <a href="/guide/01-SETUP-PROJECT1.md" className="text-blue-600 underline">Setup Guide</a> from scratch.</p>
                </Step>
                <Step number={4} title="Restore Data">
                  <CodeBlock copyable>
{`# Restore .env
cp ~/env_backup.txt /opt/ads-intel/.env

# Restore database
psql -U postgres creative_os < emergency_backup.sql`}
                  </CodeBlock>
                </Step>
              </Steps>
            </div>
          </Tab>
        </Tabs>
      </section>

      {/* Getting Help */}
      <section className="mt-16 pt-12 border-t border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">When to Escalate</h2>
        <p className="text-slate-700 text-lg mb-8">
          If you've tried everything above and issue persists, gather this information before seeking help:
        </p>

        <FeatureGrid>
          <Feature icon="📋" title="Error Logs">
            <code className="bg-slate-100 px-2 py-1 rounded text-sm">pm2 logs ads-intel --lines 200 {">"} error_report.txt</code>
          </Feature>
          <Feature icon="💾" title="Database State">
            <code className="bg-slate-100 px-2 py-1 rounded text-sm">psql -U postgres creative_os -c "\\dt+" {">"} db_state.txt</code>
          </Feature>
          <Feature icon="⚙️" title="System Info">
            <code className="bg-slate-100 px-2 py-1 rounded text-sm">pm2 info ads-intel {">"} pm2_info.txt</code>
          </Feature>
          <Feature icon="🔧" title="Environment">
            <code className="bg-slate-100 px-2 py-1 rounded text-sm">env | grep -E "(NODE|DATABASE|API)" {">"} env_vars.txt</code>
          </Feature>
        </FeatureGrid>

        <div className="mt-8">
          <InfoBox title="Support Checklist">
            Before contacting support, include:
            <ul className="space-y-2 text-blue-800 mt-3">
              <li>✅ Full error message (copy-paste, not screenshot)</li>
              <li>✅ Steps to reproduce the issue</li>
              <li>✅ What you've tried already</li>
              <li>✅ System specs (VPS RAM, disk, OS version)</li>
              <li>✅ Recent changes (code updates, config changes)</li>
            </ul>
          </InfoBox>
        </div>
      </section>

      <PageNavigation prev={prev} next={next} />
    </div>
  )
}
