import { Metadata } from 'next'
import { PageHeader } from '@/components/docs/PageHeader'
import { Breadcrumbs } from '@/components/docs/Breadcrumbs'
import { PageNavigation } from '@/components/docs/PageNavigation'
import { StatCard, StatGrid } from '@/components/docs/StatCard'
import { ScreenshotCard } from '@/components/docs/ScreenshotCard'
import { Steps, Step } from '@/components/docs/StepCard'
import { Tabs, Tab } from '@/components/docs/Tabs'
import { Accordion } from '@/components/docs/Accordion'
import { InfoBox, WarningBox, SuccessBox } from '@/components/docs/CalloutBox'
import { ComparisonTable } from '@/components/docs/ComparisonTable'
import { CodeBlock } from '@/components/docs/CodeBlock'
import { FeatureGrid, Feature } from '@/components/docs/FeatureCard'
import { QuickActionCard, QuickActionGrid } from '@/components/docs/QuickActionCard'
import { Timeline, TimelineItem } from '@/components/docs/Timeline'
import { getPageNavigation } from '@/lib/docs-config'

export const metadata: Metadata = {
  title: 'Admin Tasks - AdSpy Tool Documentation',
  description: 'Daily monitoring, manual scraping, logs, database maintenance, and troubleshooting',
}

export default function TasksPage() {
  const { prev, next } = getPageNavigation('/docs/admin/tasks')

  return (
    <div>
      <Breadcrumbs items={[{ label: 'For Admins', href: '/docs/admin' }, { label: 'Admin Tasks' }]} />
      <PageHeader
        title="Admin Tasks"
        description="Daily monitoring, manual scraping, logs, database maintenance, and troubleshooting procedures"
        icon="📋"
      />

      {/* Admin Dashboard */}
      <section className="mt-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Admin Dashboard</h2>
        <StatGrid columns={4}>
          <StatCard
            icon="🔄"
            label="Scraper Status"
            value="Running"
            trend="Last run 2h ago"
            variant="success"
            description="Daily scrape at 2 AM completed successfully"
          />
          <StatCard
            icon="📊"
            label="Ads Scraped Today"
            value="324"
            trend="+12% from yesterday"
            trendDirection="up"
            variant="primary"
            description="89 active brands scraped"
          />
          <StatCard
            icon="💾"
            label="Database Size"
            value="2.4 GB"
            trend="4,892 total ads"
            variant="warning"
            description="19% of available storage"
          />
          <StatCard
            icon="⚠️"
            label="Errors (24h)"
            value="3"
            trend="2 API rate limits, 1 timeout"
            trendDirection="down"
            variant="danger"
            description="All auto-retried successfully"
          />
        </StatGrid>

        <ScreenshotCard
          title="Admin Control Panel"
          description="The admin control panel shows real-time scraper status, recent activity, error logs, and quick action buttons. Access it at /admin or click 'Admin' in the navbar."
          caption="Tip: Bookmark the admin panel for quick access during daily checks."
          aspectRatio="16:9"
        />
      </section>

      {/* Daily Monitoring */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Daily Monitoring Routine</h2>
        <p className="text-slate-700 text-lg mb-8">
          Perform these checks every morning to ensure the system is healthy and scraping correctly.
        </p>

        <Timeline>
          <TimelineItem
            icon="☕"
            time="9:00 AM"
            title="Morning Check-In"
            description={
              <div>
                <p className="mb-3">Start your day by reviewing overnight scraper activity:</p>
                <ol className="space-y-2 list-decimal list-inside text-slate-700">
                  <li>Open admin panel and check "Scraper Status" card</li>
                  <li>Verify "Last run" timestamp is within 24 hours</li>
                  <li>Check "Ads Scraped Today" matches expected volume (200-500)</li>
                  <li>Review "Errors (24h)" - should be &lt; 10</li>
                  <li>Quick scan of Slack #adspy-feed for new ads</li>
                </ol>
              </div>
            }
            status="completed"
          />
          <TimelineItem
            icon="🔍"
            time="9:15 AM"
            title="Review Error Logs"
            description={
              <div>
                <p className="mb-3">If errors &gt; 5, investigate root causes:</p>
                <ul className="space-y-2 list-disc list-inside text-slate-700">
                  <li>Click "View Logs" button in admin panel</li>
                  <li>Filter by "Error" level</li>
                  <li>Group by error type (API rate limit, timeout, auth failure)</li>
                  <li>Check if errors auto-resolved via retry logic</li>
                  <li>Document recurring errors for further investigation</li>
                </ul>
              </div>
            }
            status="current"
          />
          <TimelineItem
            icon="📈"
            time="9:30 AM"
            title="Check Brand Health"
            description={
              <div>
                <p className="mb-3">Ensure all brands scraped successfully:</p>
                <ul className="space-y-2 list-disc list-inside text-slate-700">
                  <li>Go to /brands page</li>
                  <li>Sort by "Last Scraped" column (ascending)</li>
                  <li>Flag brands with "Last Scraped" &gt; 48h ago</li>
                  <li>Check if brand is still active (not paused/removed)</li>
                  <li>Manually trigger scrape for stale brands</li>
                </ul>
              </div>
            }
            status="upcoming"
          />
        </Timeline>

        <div className="mt-8">
          <SuccessBox title="Daily Checklist Summary">
            If all green:
            <ul className="space-y-1 text-green-800 mt-2">
              <li>✅ Scraper status: Running</li>
              <li>✅ Ads scraped: 200-500</li>
              <li>✅ Errors: &lt; 10</li>
              <li>✅ All brands scraped within 24h</li>
              <li>✅ Slack notifications working</li>
            </ul>
            <p className="mt-3 font-semibold">You're good to go! Check back tomorrow.</p>
          </SuccessBox>
        </div>
      </section>

      {/* Manual Scraping */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Manual Scraping</h2>
        <p className="text-slate-700 text-lg mb-8">
          Trigger manual scrapes when you need immediate data or want to test a specific brand.
        </p>

        <Tabs>
          <Tab label="Single Brand">
            <div className="space-y-6">
              <Steps>
                <Step number={1} title="Navigate to Brands Page">
                  Go to <code className="bg-slate-100 px-2 py-1 rounded">/brands</code> or click "Brands" in navbar.
                </Step>
                <Step number={2} title="Find Target Brand">
                  Use search bar or scroll to find the brand you want to scrape. Click the "..." menu button on the right.
                </Step>
                <Step number={3} title="Click 'Scrape Now'">
                  <div className="mt-4">
                    <ScreenshotCard
                      title="Scrape Now Button"
                      description="Click 'Scrape Now' in the dropdown menu. A modal will confirm the action and show estimated time (1-3 minutes)."
                      aspectRatio="16:9"
                    />
                  </div>
                </Step>
                <Step number={4} title="Monitor Progress">
                  <div className="mt-4">
                    <p className="text-slate-700 mb-3">Watch the progress indicator:</p>
                    <ul className="space-y-2 text-slate-700 list-disc list-inside">
                      <li>🔄 Scraping ads from Facebook...</li>
                      <li>🤖 Analyzing with Gemini...</li>
                      <li>🧠 Generating detailed breakdowns...</li>
                      <li>💬 Posting to Slack...</li>
                      <li>✅ Done! 47 ads scraped.</li>
                    </ul>
                  </div>
                </Step>
              </Steps>
              <InfoBox title="When to Use">
                <ul className="space-y-2 text-blue-800">
                  <li>• Testing new brand addition</li>
                  <li>• Brand hasn't been scraped in 48+ hours</li>
                  <li>• Client requests immediate competitor research</li>
                  <li>• Debugging scraper issues</li>
                </ul>
              </InfoBox>
            </div>
          </Tab>

          <Tab label="All Brands">
            <div className="space-y-6">
              <WarningBox title="Use Sparingly">
                Scraping all brands manually can take 1-2 hours and consume significant API credits. Only use when absolutely necessary (e.g., after system downtime).
              </WarningBox>
              <Steps>
                <Step number={1} title="Access Admin Panel">
                  Go to <code className="bg-slate-100 px-2 py-1 rounded">/admin</code> and scroll to "Manual Actions" section.
                </Step>
                <Step number={2} title="Click 'Scrape All Brands'">
                  <div className="mt-4">
                    <p className="text-slate-700 mb-3">A confirmation modal appears with details:</p>
                    <CodeBlock copyable>
{`Scrape All Brands?

This will scrape ads from all 89 active brands.

Estimated time: 90-120 minutes
Estimated cost: $150-300 (API usage)

Are you sure?

[Cancel] [Confirm & Start]`}
                    </CodeBlock>
                  </div>
                </Step>
                <Step number={3} title="Monitor in Real-Time">
                  <div className="mt-4">
                    <p className="text-slate-700 mb-3">A progress dashboard shows live updates:</p>
                    <StatGrid columns={3}>
                      <StatCard icon="✅" label="Completed" value="34/89" variant="success" description="38% done" />
                      <StatCard icon="🔄" label="In Progress" value="5/89" variant="primary" description="Nike, Adidas, ..." />
                      <StatCard icon="⏳" label="Pending" value="50/89" variant="default" description="56% remaining" />
                    </StatGrid>
                  </div>
                </Step>
              </Steps>
              <InfoBox title="Pro Tip">
                Run "Scrape All Brands" during off-hours (late night) to avoid rate limiting during peak usage.
              </InfoBox>
            </div>
          </Tab>

          <Tab label="Custom Scrape">
            <div className="space-y-6">
              <p className="text-slate-700">
                Scrape a custom list of brands (useful for specific client requests or testing subsets).
              </p>
              <Steps>
                <Step number={1} title="Go to Admin Panel">
                  Navigate to <code className="bg-slate-100 px-2 py-1 rounded">/admin</code> → "Custom Scrape" tab.
                </Step>
                <Step number={2} title="Select Brands">
                  <div className="mt-4">
                    <ScreenshotCard
                      title="Multi-Select Brand List"
                      description="Check boxes next to brands you want to scrape. Use filters to find brands quickly (e.g., 'Last scraped > 7 days ago')."
                      aspectRatio="16:9"
                    />
                  </div>
                </Step>
                <Step number={3} title="Configure Options">
                  <div className="mt-4">
                    <ComparisonTable
                      headers={['Option', 'Default', 'Description']}
                      rows={[
                        { label: 'Max Ads Per Brand', values: ['100', 'Override global setting'] },
                        { label: 'Skip Already Scraped', values: ['Yes', 'Skip ads already in database'] },
                        { label: 'Send Slack Notifications', values: ['Yes', 'Post results to #adspy-feed'] },
                        { label: 'Priority', values: ['Normal', 'High priority skips queue'] },
                      ]}
                    />
                  </div>
                </Step>
                <Step number={4} title="Start Scrape">
                  Click "Start Custom Scrape" and monitor progress in the dashboard.
                </Step>
              </Steps>
            </div>
          </Tab>

          <Tab label="Via API">
            <div className="space-y-6">
              <p className="text-slate-700">
                Trigger scrapes programmatically via REST API (useful for integrations or automation).
              </p>
              <CodeBlock copyable>
{`# Scrape single brand
curl -X POST http://localhost:3000/api/scrape \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "brandId": 123,
    "maxAds": 50
  }'

# Scrape multiple brands
curl -X POST http://localhost:3000/api/scrape/bulk \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "brandIds": [123, 456, 789],
    "maxAdsPerBrand": 100
  }'

# Scrape all brands
curl -X POST http://localhost:3000/api/scrape/all \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
              </CodeBlock>
              <InfoBox title="API Key">
                Generate an API key in <code className="bg-blue-100 px-2 py-1 rounded">Settings → API Keys</code>. Store securely and rotate every 90 days.
              </InfoBox>
            </div>
          </Tab>
        </Tabs>
      </section>

      {/* Viewing Logs */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Viewing & Analyzing Logs</h2>
        <p className="text-slate-700 text-lg mb-8">
          Logs are your best friend for troubleshooting issues and understanding system behavior.
        </p>

        <FeatureGrid>
          <Feature icon="📋" title="Application Logs">
            View real-time backend logs: <code className="bg-slate-100 px-2 py-1 rounded">pm2 logs ads-intel</code>
          </Feature>
          <Feature icon="❌" title="Error Logs">
            Filter errors only: <code className="bg-slate-100 px-2 py-1 rounded">pm2 logs ads-intel --err</code>
          </Feature>
          <Feature icon="📊" title="Scraper Logs">
            Dedicated scraper log file: <code className="bg-slate-100 px-2 py-1 rounded">tail -f logs/scraper.log</code>
          </Feature>
          <Feature icon="🔍" title="Search Logs">
            Grep for patterns: <code className="bg-slate-100 px-2 py-1 rounded">pm2 logs ads-intel | grep "API rate limit"</code>
          </Feature>
        </FeatureGrid>

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Log Levels</h3>
          <ComparisonTable
            headers={['Level', 'Color', 'Description', 'Action Required']}
            rows={[
              {
                label: 'DEBUG',
                values: ['Gray', 'Verbose details for developers', 'None (informational)'],
              },
              {
                label: 'INFO',
                values: ['Blue', 'Normal operations (scrape started, ad saved)', 'None (informational)'],
              },
              {
                label: 'WARN',
                values: ['Yellow', 'Potential issues (rate limit approaching)', 'Monitor if recurring'],
              },
              {
                label: 'ERROR',
                values: ['Red', 'Failures (API timeout, auth error)', 'Investigate immediately'],
              },
              {
                label: 'FATAL',
                values: ['Red Bold', 'Critical failures (database down)', 'Fix ASAP, system halted'],
              },
            ]}
          />
        </div>

        <div className="mt-8">
          <Accordion title="Common Log Patterns">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Success Pattern</h4>
                <CodeBlock copyable>
{`[2025-01-18 14:32:15] INFO: Scraping brand: Nike
[2025-01-18 14:32:47] INFO: Fetched 89 ads from Apify
[2025-01-18 14:33:12] INFO: Analyzing 89 ads with Gemini
[2025-01-18 14:35:28] INFO: Detailed analysis complete (OpenAI)
[2025-01-18 14:35:31] INFO: Saved 89 ads to database
[2025-01-18 14:35:34] INFO: Posted 5 top ads to Slack
[2025-01-18 14:35:35] INFO: ✅ Nike scrape complete (89 ads, 3m 20s)`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-3">API Rate Limit Pattern</h4>
                <CodeBlock copyable>
{`[2025-01-18 14:42:17] WARN: OpenAI rate limit approaching (58/60 req/min)
[2025-01-18 14:42:19] ERROR: OpenAI API error: 429 Too Many Requests
[2025-01-18 14:42:19] INFO: Retry attempt 1/3 in 5 seconds...
[2025-01-18 14:42:24] INFO: Retry successful, continuing...`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Critical Error Pattern</h4>
                <CodeBlock copyable>
{`[2025-01-18 14:55:03] ERROR: Database connection failed
[2025-01-18 14:55:03] ERROR: Error: connect ECONNREFUSED 127.0.0.1:5432
[2025-01-18 14:55:03] FATAL: Cannot proceed without database, halting scraper`}
                </CodeBlock>
              </div>
            </div>
          </Accordion>

          <Accordion title="Log File Locations">
            <div className="space-y-4">
              <CodeBlock copyable>
{`# PM2 logs (auto-rotated)
~/.pm2/logs/ads-intel-out.log         # stdout
~/.pm2/logs/ads-intel-error.log       # stderr

# Application logs (in project directory)
/opt/ads-intel/logs/scraper.log       # Scraper activity
/opt/ads-intel/logs/api.log           # API requests
/opt/ads-intel/logs/errors.log        # Errors only
/opt/ads-intel/logs/cron.log          # Cron job output

# System logs (VPS-level)
/var/log/syslog                       # System events
/var/log/nginx/access.log             # Web server access
/var/log/nginx/error.log              # Web server errors`}
              </CodeBlock>
            </div>
          </Accordion>
        </div>
      </section>

      {/* Database Maintenance */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Database Maintenance</h2>
        <p className="text-slate-700 text-lg mb-8">
          Keep your database healthy with regular maintenance tasks and backups.
        </p>

        <Tabs>
          <Tab label="Backups">
            <div className="space-y-6">
              <Steps>
                <Step number={1} title="Manual Backup">
                  <div className="mt-4">
                    <CodeBlock copyable>
{`# Backup entire database
pg_dump -U postgres creative_os > backup_\$(date +%Y%m%d).sql

# Backup specific tables
pg_dump -U postgres -t adspy_ads -t adspy_brands creative_os > adspy_backup.sql

# Compressed backup (saves space)
pg_dump -U postgres creative_os | gzip > backup_\$(date +%Y%m%d).sql.gz`}
                    </CodeBlock>
                  </div>
                </Step>
                <Step number={2} title="Automated Daily Backups">
                  <div className="mt-4">
                    <p className="text-slate-700 mb-3">Add to crontab:</p>
                    <CodeBlock copyable>
{`# Run daily at 3 AM
0 3 * * * pg_dump -U postgres creative_os | gzip > /backups/adspy_\$(date +\%Y\%m\%d).sql.gz

# Keep only last 30 days
0 4 * * * find /backups -name "adspy_*.sql.gz" -mtime +30 -delete`}
                    </CodeBlock>
                  </div>
                </Step>
                <Step number={3} title="Restore from Backup">
                  <div className="mt-4">
                    <CodeBlock copyable>
{`# Restore from SQL file
psql -U postgres creative_os < backup_20250118.sql

# Restore from compressed backup
gunzip -c backup_20250118.sql.gz | psql -U postgres creative_os`}
                    </CodeBlock>
                  </div>
                </Step>
              </Steps>
              <WarningBox title="Backup Best Practices">
                <ul className="space-y-2 text-orange-800">
                  <li>• Store backups on separate server or cloud storage (S3, Dropbox)</li>
                  <li>• Test restore process monthly</li>
                  <li>• Keep 30 daily backups + 12 monthly backups</li>
                  <li>• Encrypt backups if they contain sensitive data</li>
                </ul>
              </WarningBox>
            </div>
          </Tab>

          <Tab label="Optimization">
            <div className="space-y-6">
              <p className="text-slate-700">
                Run these commands weekly to maintain optimal database performance.
              </p>
              <Accordion title="VACUUM (Cleanup Dead Rows)">
                <div className="space-y-4">
                  <p className="text-slate-700">
                    Reclaim storage and improve query speed by removing dead rows from deleted/updated records.
                  </p>
                  <CodeBlock copyable>
{`# Analyze + vacuum all tables
vacuumdb -U postgres -z creative_os

# Verbose output (see what's happening)
vacuumdb -U postgres -z -v creative_os

# Full vacuum (more aggressive, locks tables)
vacuumdb -U postgres --full creative_os`}
                  </CodeBlock>
                  <InfoBox title="When to Run">
                    Run VACUUM weekly or after deleting large amounts of data (e.g., archiving old ads).
                  </InfoBox>
                </div>
              </Accordion>

              <Accordion title="REINDEX (Rebuild Indexes)">
                <div className="space-y-4">
                  <p className="text-slate-700">
                    Rebuild indexes to fix bloat and improve query performance.
                  </p>
                  <CodeBlock copyable>
{`# Reindex all tables
reindexdb -U postgres creative_os

# Reindex specific table
psql -U postgres creative_os -c "REINDEX TABLE adspy_ads;"`}
                  </CodeBlock>
                  <InfoBox title="When to Run">
                    Run REINDEX monthly or if queries are slower than usual.
                  </InfoBox>
                </div>
              </Accordion>

              <Accordion title="ANALYZE (Update Statistics)">
                <div className="space-y-4">
                  <p className="text-slate-700">
                    Update table statistics to help query planner optimize queries.
                  </p>
                  <CodeBlock copyable>
{`# Analyze all tables
psql -U postgres creative_os -c "ANALYZE;"

# Analyze specific table
psql -U postgres creative_os -c "ANALYZE adspy_ads;"`}
                  </CodeBlock>
                  <InfoBox title="When to Run">
                    Run ANALYZE daily (automatic) or manually after bulk inserts/deletes.
                  </InfoBox>
                </div>
              </Accordion>
            </div>
          </Tab>

          <Tab label="Cleanup">
            <div className="space-y-6">
              <p className="text-slate-700">
                Remove old data to keep database size manageable.
              </p>
              <WarningBox title="⚠️ Destructive Actions">
                These commands permanently delete data. Always backup before running cleanup queries.
              </WarningBox>
              <Accordion title="Archive Old Ads">
                <div className="space-y-4">
                  <CodeBlock copyable>
{`-- Archive ads older than 1 year
CREATE TABLE adspy_ads_archive AS
SELECT * FROM adspy_ads
WHERE scraped_at < NOW() - INTERVAL '1 year';

-- Verify count before deletion
SELECT COUNT(*) FROM adspy_ads WHERE scraped_at < NOW() - INTERVAL '1 year';

-- Delete from main table
DELETE FROM adspy_ads WHERE scraped_at < NOW() - INTERVAL '1 year';

-- Vacuum to reclaim space
VACUUM FULL adspy_ads;`}
                  </CodeBlock>
                </div>
              </Accordion>

              <Accordion title="Remove Duplicate Ads">
                <div className="space-y-4">
                  <CodeBlock copyable>
{`-- Find duplicates by ad_id
SELECT ad_id, COUNT(*)
FROM adspy_ads
GROUP BY ad_id
HAVING COUNT(*) > 1;

-- Keep only newest duplicate
DELETE FROM adspy_ads
WHERE id NOT IN (
  SELECT MAX(id)
  FROM adspy_ads
  GROUP BY ad_id
);`}
                  </CodeBlock>
                </div>
              </Accordion>

              <Accordion title="Clean Up Inactive Brands">
                <div className="space-y-4">
                  <CodeBlock copyable>
{`-- Find brands not scraped in 90+ days
SELECT brand_name, last_scraped_at
FROM adspy_brands
WHERE last_scraped_at < NOW() - INTERVAL '90 days';

-- Set to inactive (preserves data)
UPDATE adspy_brands
SET active = false
WHERE last_scraped_at < NOW() - INTERVAL '90 days';

-- Delete if truly obsolete
DELETE FROM adspy_brands
WHERE last_scraped_at < NOW() - INTERVAL '180 days'
AND active = false;`}
                  </CodeBlock>
                </div>
              </Accordion>
            </div>
          </Tab>

          <Tab label="Monitoring">
            <div className="space-y-6">
              <p className="text-slate-700">
                Monitor database health with these queries.
              </p>
              <Accordion title="Database Size">
                <div className="space-y-4">
                  <CodeBlock copyable>
{`-- Total database size
SELECT pg_size_pretty(pg_database_size('creative_os'));

-- Size per table
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;`}
                  </CodeBlock>
                </div>
              </Accordion>

              <Accordion title="Row Counts">
                <div className="space-y-4">
                  <CodeBlock copyable>
{`-- Count rows per table
SELECT
  schemaname,
  tablename,
  n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Specific table count
SELECT COUNT(*) FROM adspy_ads;`}
                  </CodeBlock>
                </div>
              </Accordion>

              <Accordion title="Active Connections">
                <div className="space-y-4">
                  <CodeBlock copyable>
{`-- Active connections
SELECT
  count(*) AS total_connections,
  state,
  usename
FROM pg_stat_activity
GROUP BY state, usename;

-- Kill idle connections (if too many)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
AND state_change < NOW() - INTERVAL '1 hour';`}
                  </CodeBlock>
                </div>
              </Accordion>
            </div>
          </Tab>
        </Tabs>
      </section>

      {/* Quick Actions */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Quick Action Shortcuts</h2>
        <p className="text-slate-700 text-lg mb-8">
          Common admin tasks accessible with one click.
        </p>

        <QuickActionGrid columns={3}>
          <QuickActionCard
            icon="🔄"
            title="Restart Scraper"
            description="Restart the PM2 process if scraper is stuck or behaving unexpectedly."
            action={{ label: 'Restart Now', href: '/admin/tasks' }}
            variant="warning"
          />
          <QuickActionCard
            icon="📋"
            title="View Live Logs"
            description="Stream real-time logs in your browser without SSH access."
            action={{ label: 'Open Logs', href: '/admin/logs' }}
            variant="primary"
          />
          <QuickActionCard
            icon="💾"
            title="Backup Database"
            description="Trigger immediate database backup and download SQL file."
            action={{ label: 'Backup Now', href: '/admin/tasks' }}
            variant="success"
          />
          <QuickActionCard
            icon="🧹"
            title="Clear Cache"
            description="Clear all cached data (brand lists, search results, API responses)."
            action={{ label: 'Clear Cache', href: '/admin/tasks' }}
            variant="default"
          />
          <QuickActionCard
            icon="📊"
            title="Export All Ads"
            description="Download complete ad database as CSV for external analysis."
            action={{ label: 'Export CSV', href: '/admin/export' }}
            variant="primary"
          />
          <QuickActionCard
            icon="⚙️"
            title="Run Health Check"
            description="Test all API integrations, database connection, and Slack notifications."
            action={{ label: 'Run Check', href: '/admin/tasks' }}
            variant="success"
          />
        </QuickActionGrid>
      </section>

      <PageNavigation prev={prev} next={next} />
    </div>
  )
}
