import { Metadata } from 'next'
import { PageHeader } from '@/components/docs/PageHeader'
import { Breadcrumbs } from '@/components/docs/Breadcrumbs'
import { PageNavigation } from '@/components/docs/PageNavigation'
import { StatCard, StatGrid } from '@/components/docs/StatCard'
import { ScreenshotCard } from '@/components/docs/ScreenshotCard'
import { Tabs, Tab } from '@/components/docs/Tabs'
import { Accordion } from '@/components/docs/Accordion'
import { InfoBox, WarningBox, SuccessBox } from '@/components/docs/CalloutBox'
import { CodeBlock } from '@/components/docs/CodeBlock'
import { FeatureGrid, Feature } from '@/components/docs/FeatureCard'
import { QuickActionCard, QuickActionGrid } from '@/components/docs/QuickActionCard'
import { ShortcutList } from '@/components/docs/KeyboardShortcut'
import { getPageNavigation } from '@/lib/docs-config'

export const metadata: Metadata = {
  title: 'Tips & Best Practices - AdSpy Tool Documentation',
  description: 'Power user tips, optimization strategies, and workflow best practices',
}

export default function TipsPage() {
  const { prev, next } = getPageNavigation('/docs/reference/tips')

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Reference', href: '/docs/reference' }, { label: 'Tips & Best Practices' }]} />
      <PageHeader
        title="Tips & Best Practices"
        description="Master advanced techniques, optimize workflows, and become a power user"
        icon="💡"
      />

      {/* Power User Essentials */}
      <section className="mt-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Power User Essentials</h2>
        <p className="text-slate-700 text-lg mb-8">
          Level up your ad intelligence game with these battle-tested strategies from daily users.
        </p>

        <FeatureGrid>
          <Feature icon="🔍" title="Save Complex Searches">
            Instead of re-typing <code className="bg-slate-100 px-2 py-1 rounded">(hook:urgency OR "limited time") AND brand:Nike</code> every time, bookmark search URLs or save them in a note.
          </Feature>
          <Feature icon="📊" title="Export Before Major Changes">
            Always export ads to CSV before bulk operations (deleting old brands, archiving). CSV = safety net.
          </Feature>
          <Feature icon="🎯" title="Weekly Review Ritual">
            Every Monday, review last week's new ads. Look for emerging patterns (new hooks, angles, formats). Document findings.
          </Feature>
          <Feature icon="⏰" title="Off-Hours Scraping">
            Schedule heavy scrapes (all brands) at 2-5 AM to avoid rate limits during work hours.
          </Feature>
          <Feature icon="🏷️" title="Tag System">
            Use brand descriptions in Google Sheets to tag brands (e.g., "DTC", "SaaS", "Ecommerce") for better filtering.
          </Feature>
          <Feature icon="📸" title="Screenshot Winners">
            When you find a killer ad, screenshot it + save the analysis. Ad Library deletes ads; screenshots last forever.
          </Feature>
        </FeatureGrid>
      </section>

      {/* Search Mastery */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Search Mastery</h2>
        <p className="text-slate-700 text-lg mb-8">
          Advanced search techniques that reveal hidden insights and patterns.
        </p>

        <Tabs>
          <Tab label="Finding Patterns">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Search Workflows for Common Tasks</h3>

              <Accordion title="Finding Winning Hooks">
                <CodeBlock copyable>
{`# Urgency hooks
hook:urgency OR "limited time" OR "ending soon" OR "last chance"

# Social proof hooks
hook:social OR "join 10,000" OR "trusted by" OR "as seen on"

# Curiosity hooks
hook:curiosity OR "secret" OR "surprising" OR "never told"

# Problem-aware hooks
hook:problem OR "struggling with" OR "tired of" OR "frustrated"

# Result-oriented hooks
hook:result OR "in 30 days" OR "without" OR "guaranteed"`}
                </CodeBlock>
              </Accordion>

              <Accordion title="Identifying Angles">
                <CodeBlock copyable>
{`# Emotional angles
angle:emotional AND (structure:storytelling OR structure:testimonial)

# Logic/proof angles
angle:logical AND (proof OR case-study OR research)

# Exclusive/scarcity angles
angle:scarcity OR "exclusive" OR "members only" OR "limited"

# Transformation angles
angle:transformation AND ("before and after" OR "results" OR "journey")`}
                </CodeBlock>
              </Accordion>

              <Accordion title="Format-Specific Searches">
                <CodeBlock copyable>
{`# UGC-style ads
(ugc OR "user generated" OR selfie OR testimonial) AND format:video

# Authority figure ads
(expert OR doctor OR founder OR celebrity) AND format:talking-head

# Product demo ads
(demo OR tutorial OR "how to" OR walkthrough) AND format:video

# Carousel ads with specific hooks
format:carousel AND hook:comparison`}
                </CodeBlock>
              </Accordion>
            </div>
          </Tab>

          <Tab label="Competitor Intel">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Competitive Research Queries</h3>

              <SuccessBox title="Weekly Competitor Check">
                Run these searches every Monday to stay updated on competitor activity.
              </SuccessBox>

              <Accordion title="New Creatives (Last 7 Days)">
                <p className="text-slate-700 mb-3">
                  Find what competitors launched recently (likely their current winners):
                </p>
                <CodeBlock copyable>
{`# Use dashboard filters
Brand: [Competitor Name]
Date Range: Last 7 days
Sort by: Newest first

# Then search within results
search: (sale OR promo OR launch OR new)`}
                </CodeBlock>
              </Accordion>

              <Accordion title="Long-Running Ads">
                <p className="text-slate-700 mb-3">
                  Ads running for 30+ days are likely profitable winners:
                </p>
                <CodeBlock copyable>
{`# Use date filter
Brand: [Competitor]
Date Range: 30-90 days ago

# If ad still shows in recent scrapes = still running = winner
# Compare to recent scrapes to confirm`}
                </CodeBlock>
              </Accordion>

              <Accordion title="Format Breakdown">
                <p className="text-slate-700 mb-3">
                  See which formats competitors favor:
                </p>
                <CodeBlock copyable>
{`# Manual count or export CSV
Brand: Nike
Export all ads → Open in Excel → PivotTable by "Format"

# Result: 45% video, 35% image, 20% carousel
# Insight: Nike invests heavily in video`}
                </CodeBlock>
              </Accordion>
            </div>
          </Tab>

          <Tab label="Trend Analysis">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Spotting Industry Trends</h3>

              <InfoBox title="Trend Spotting Workflow">
                <ol className="space-y-2 text-blue-800 list-decimal list-inside">
                  <li>Export last 90 days of ads across 5-10 brands</li>
                  <li>Analyze hooks + angles in Excel (word frequency, themes)</li>
                  <li>Look for spikes in specific keywords (e.g., "AI", "free shipping")</li>
                  <li>Cross-reference with industry news / seasonality</li>
                  <li>Document trends in a weekly report</li>
                </ol>
              </InfoBox>

              <Accordion title="Seasonal Pattern Detection">
                <CodeBlock copyable>
{`# Holiday prep (Sep-Nov)
search: (holiday OR christmas OR gift OR black-friday)
Date: Last 90 days
Group by brand → See who starts earliest

# Back-to-school (Jul-Aug)
search: (school OR college OR student OR semester)

# Summer (May-Jul)
search: (summer OR vacation OR beach OR travel)`}
                </CodeBlock>
              </Accordion>

              <Accordion title="Emerging Format Trends">
                <p className="text-slate-700 mb-3">
                  Track new creative formats before they saturate:
                </p>
                <CodeBlock copyable>
{`# Recent examples (2024-2025)
- "iPhone notes app" style ads
- "Google search bar" mockups
- AI-generated spokesperson videos
- Side-by-side comparison carousels

# Search strategy
Export last 30 days → Manually review 50 ads
Look for unusual visual patterns
Screenshot + tag for future reference`}
                </CodeBlock>
              </Accordion>
            </div>
          </Tab>

          <Tab label="Advanced Operators">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Boolean Logic Mastery</h3>

              <Accordion title="Complex AND/OR/NOT Combinations">
                <CodeBlock copyable>
{`# Find emotional storytelling ads WITHOUT sales language
(angle:emotional AND structure:storytelling) NOT (sale OR discount OR promo)

# Urgency hooks from specific brands
(hook:urgency OR "limited time") AND (brand:Nike OR brand:Adidas)

# Video ads with captions but NO voiceover
format:video AND captions NOT voiceover

# Problem-aware ads with proof elements
hook:problem AND (testimonial OR case-study OR "proven")`}
                </CodeBlock>
              </Accordion>

              <Accordion title="Wildcard Wizardry">
                <CodeBlock copyable>
{`# Find all discount variations
*discount* OR *sale* OR *promo*

# Match plural forms
free* → free, freedom, freestyle, freebie

# Partial brand matches
nik* → Nike, Nikon
ad* → Adidas, Adobe, Adroll

# Combine with NOT to exclude false positives
nik* NOT nikon → Only Nike`}
                </CodeBlock>
              </Accordion>

              <Accordion title="Phrase Matching Tips">
                <CodeBlock copyable>
{`# Exact CTA phrases
"shop now" OR "buy now" OR "learn more" OR "get started"

# Common taglines
"just do it" OR "think different" OR "impossible is nothing"

# Specific pain points
"tired of" OR "struggling with" OR "wish you could"

# Combine exact phrases with wildcards
"limited time" AND offer* → "limited time offer", "limited time offers"`}
                </CodeBlock>
              </Accordion>
            </div>
          </Tab>
        </Tabs>
      </section>

      {/* Workflow Optimization */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Workflow Optimization</h2>
        <p className="text-slate-700 text-lg mb-8">
          Work smarter, not harder. These workflows save hours per week.
        </p>

        <QuickActionGrid columns={3}>
          <QuickActionCard
            icon="📋"
            title="Monday Morning Ritual"
            description="Start week with competitor review → Export last 7 days → Look for new patterns → Document insights → Share with team."
            action={{ label: 'View Workflow', href: '/docs/users/workflows' }}
            variant="primary"
          />
          <QuickActionCard
            icon="🎯"
            title="Creative Inspiration Flow"
            description="Need ad ideas? Search similar products → Filter by recent → Export top 20 → Screenshot winners → Extract patterns → Brainstorm."
            action={{ label: 'View Workflow', href: '/docs/users/workflows' }}
            variant="success"
          />
          <QuickActionCard
            icon="📊"
            title="Client Reporting Prep"
            description="Weekly client report → Filter their industry → Export CSV → PivotTable by brand/format → Chart trends → Screenshot examples."
            action={{ label: 'View Workflow', href: '/docs/users/workflows' }}
            variant="warning"
          />
        </QuickActionGrid>

        <div className="mt-8">
          <Accordion title="Template: Weekly Competitive Brief">
            <div className="space-y-6">
              <p className="text-slate-700">
                Save this as a Google Doc template and fill it out every Monday:
              </p>
              <CodeBlock copyable>
{`# Weekly Competitive Intelligence Brief
Week of: [Date]

## Top 5 Competitors Monitored
1. [Brand] - [# new ads] - [Notable changes]
2. [Brand] - [# new ads] - [Notable changes]
...

## New Ad Formats Spotted
- [Format description + screenshot link]
- [Format description + screenshot link]

## Trending Hooks/Angles
- [Hook/Angle] - Seen in [X] ads across [Y] brands
- Example: [Link to best example]

## Seasonal/Timely Observations
- [Any holiday, event, or seasonal patterns]

## Recommended Actions
1. [Action item based on findings]
2. [Action item based on findings]

## Next Week's Focus
- [What to watch for next week]`}
              </CodeBlock>
              <InfoBox title="Time Investment">
                This takes 30-45 minutes weekly but saves hours of random browsing. Structured {'>'} ad-hoc.
              </InfoBox>
            </div>
          </Accordion>

          <Accordion title="Bulk Operations Best Practices">
            <div className="space-y-6">
              <h4 className="font-semibold text-slate-900 mb-3">Before Bulk Changes</h4>
              <ol className="space-y-2 text-slate-700 list-decimal list-inside">
                <li>✅ <strong>Backup database</strong>: <code className="bg-slate-100 px-2 py-1 rounded">pg_dump creative_os {">"} backup_before_bulk.sql</code></li>
                <li>✅ <strong>Export affected data to CSV</strong> (so you can restore manually if needed)</li>
                <li>✅ <strong>Test on 1-2 records first</strong> to verify logic is correct</li>
                <li>✅ <strong>Run during off-hours</strong> (2-5 AM) to avoid blocking real users</li>
                <li>✅ <strong>Monitor logs</strong> during operation: <code className="bg-slate-100 px-2 py-1 rounded">pm2 logs ads-intel</code></li>
              </ol>

              <WarningBox title="Never Bulk Delete Without Backup">
                One wrong query can delete thousands of ads. Always backup first. Recovery takes hours; backup takes 30 seconds.
              </WarningBox>
            </div>
          </Accordion>
        </div>
      </section>

      {/* Performance Optimization */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Performance Optimization</h2>
        <p className="text-slate-700 text-lg mb-8">
          Keep your system fast and responsive even with 10,000+ ads.
        </p>

        <Tabs>
          <Tab label="Database">
            <div className="space-y-6">
              <FeatureGrid>
                <Feature icon="🔍" title="Index Everything Searchable">
                  If you search by it frequently, index it. Common: brand_id, scraped_at, ad_creative_body (full-text).
                </Feature>
                <Feature icon="🧹" title="VACUUM Weekly">
                  <code className="bg-slate-100 px-2 py-1 rounded">vacuumdb -U postgres -z creative_os</code> reclaims space and updates statistics. Run every Sunday.
                </Feature>
                <Feature icon="📊" title="Analyze Query Plans">
                  Slow query? Add <code className="bg-slate-100 px-2 py-1 rounded">EXPLAIN ANALYZE</code> to see bottlenecks. Look for "Seq Scan" = add index.
                </Feature>
                <Feature icon="💾" title="Archive Old Data">
                  Move ads {">"} 1 year old to archive table. Keeps main table fast. See Admin Tasks → Database Cleanup.
                </Feature>
              </FeatureGrid>

              <div className="mt-6">
                <h4 className="font-semibold text-slate-900 mb-3">Recommended Indexes</h4>
                <CodeBlock copyable>
{`-- Core indexes (already exist)
CREATE INDEX idx_adspy_ads_ad_id ON adspy_ads(ad_id);
CREATE INDEX idx_adspy_ads_brand_id ON adspy_ads(brand_id);
CREATE INDEX idx_adspy_ads_scraped_at ON adspy_ads(scraped_at DESC);

-- Performance boost indexes (add these)
CREATE INDEX idx_adspy_ads_brand_scraped ON adspy_ads(brand_id, scraped_at DESC);
CREATE INDEX idx_adspy_ads_body_trgm ON adspy_ads USING gin(ad_creative_body gin_trgm_ops);

-- Full-text search (for advanced search)
CREATE INDEX idx_adspy_ads_fts ON adspy_ads USING gin(
  to_tsvector('english', COALESCE(ad_creative_body, '') || ' ' || COALESCE(hook_analysis, ''))
);`}
                </CodeBlock>
              </div>
            </div>
          </Tab>

          <Tab label="Scraping">
            <div className="space-y-6">
              <h4 className="font-semibold text-slate-900 mb-3">Scraper Performance Tips</h4>

              <Accordion title="Reduce API Costs">
                <ul className="space-y-2 text-slate-700 list-disc list-inside">
                  <li><strong>Lower Max Ads Per Brand</strong>: 100 → 50 saves 50% on Apify costs</li>
                  <li><strong>Increase Min Active Days</strong>: 7 → 14 days filters out short-lived test ads</li>
                  <li><strong>Dedup aggressively</strong>: Enable "Skip Already Scraped" to avoid re-analyzing same ads</li>
                  <li><strong>Pause inactive brands</strong>: If brand hasn't launched new ads in 90 days, pause scraping</li>
                </ul>
              </Accordion>

              <Accordion title="Speed Up Scrapes">
                <ul className="space-y-2 text-slate-700 list-disc list-inside">
                  <li><strong>Increase concurrency</strong>: Settings → Performance → Scrape Workers (10 → 20)</li>
                  <li><strong>Use faster Apify actors</strong>: Some Apify actors are optimized for speed vs cost</li>
                  <li><strong>Batch database inserts</strong>: Insert 100 ads/query instead of 1 ad/query (10x faster)</li>
                  <li><strong>Skip optional fields</strong>: If you don't use link_description, don't scrape it</li>
                </ul>
              </Accordion>

              <Accordion title="Rate Limit Prevention">
                <CodeBlock copyable>
{`# Backend: Implement rate limiter with Bottleneck
import Bottleneck from 'bottleneck';

const openaiLimiter = new Bottleneck({
  minTime: 1000,  // 1 req/sec = 60/min (safe for free tier)
  maxConcurrent: 5
});

const geminiLimiter = new Bottleneck({
  minTime: 4000,  // 15 req/min = ~4s between requests
  maxConcurrent: 3
});

// Wrap API calls
const analysis = await openaiLimiter.schedule(() => callOpenAI(ad));`}
                </CodeBlock>
              </Accordion>
            </div>
          </Tab>

          <Tab label="Frontend">
            <div className="space-y-6">
              <FeatureGrid>
                <Feature icon="⚡" title="Paginate Everything">
                  Never load 1000 ads at once. Use pagination: 20-50 ads per page. Dashboard already does this.
                </Feature>
                <Feature icon="🖼️" title="Lazy Load Images">
                  Use Next.js Image component with lazy loading. Images load as you scroll, not all at once.
                </Feature>
                <Feature icon="💾" title="Cache Search Results">
                  Implement Redis cache for search results (TTL 60s). Reduces database hits by 90%.
                </Feature>
                <Feature icon="📉" title="Limit Search Results">
                  Cap search results at 100-200 ads. If users need more, they should refine their query.
                </Feature>
              </FeatureGrid>

              <InfoBox title="Browser Performance">
                Users on slower devices? Dashboard filters → "Show 10 per page" instead of default 20. Faster load = better UX.
              </InfoBox>
            </div>
          </Tab>

          <Tab label="Monitoring">
            <div className="space-y-6">
              <h4 className="font-semibold text-slate-900 mb-3">What to Monitor</h4>

              <StatGrid columns={3}>
                <StatCard
                  icon="📊"
                  label="Query Performance"
                  value="Monitor"
                  variant="primary"
                  description="Slow queries > 1s? Add indexes or optimize."
                />
                <StatCard
                  icon="💾"
                  label="Database Size"
                  value="Monitor"
                  variant="success"
                  description="Growing fast? Archive old data."
                />
                <StatCard
                  icon="🔄"
                  label="Scraper Success Rate"
                  value="Monitor"
                  variant="warning"
                  description="< 90%? Check API errors."
                />
              </StatGrid>

              <Accordion title="Weekly Health Check Script">
                <p className="text-slate-700 mb-3">
                  Run this script every Monday to catch issues early:
                </p>
                <CodeBlock copyable>
{`#!/bin/bash
# weekly-health-check.sh

echo "=== AdSpy Weekly Health Check ==="
echo ""

echo "1. Database Size:"
psql -U postgres creative_os -c "SELECT pg_size_pretty(pg_database_size('creative_os'));"

echo ""
echo "2. Row Counts:"
psql -U postgres creative_os -c "SELECT COUNT(*) as total_ads FROM adspy_ads;"
psql -U postgres creative_os -c "SELECT COUNT(*) as active_brands FROM adspy_brands WHERE active = true;"

echo ""
echo "3. Recent Scrapes (Last 7 Days):"
psql -U postgres creative_os -c "
  SELECT brand_name, COUNT(*) as ads_scraped
  FROM adspy_ads
  WHERE scraped_at > NOW() - INTERVAL '7 days'
  GROUP BY brand_name
  ORDER BY ads_scraped DESC
  LIMIT 10;
"

echo ""
echo "4. Disk Usage:"
df -h | grep /dev/

echo ""
echo "5. PM2 Status:"
pm2 status

echo ""
echo "=== Health Check Complete ==="`}
                </CodeBlock>
              </Accordion>
            </div>
          </Tab>
        </Tabs>
      </section>

      {/* Security Best Practices */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Security Best Practices</h2>
        <p className="text-slate-700 text-lg mb-8">
          Protect your data, API keys, and system access with these security measures.
        </p>

        <Tabs>
          <Tab label="API Keys">
            <div className="space-y-6">
              <WarningBox title="API Key Security Rules">
                <ul className="space-y-2 text-orange-800">
                  <li>❌ <strong>Never</strong> commit .env to Git (add to .gitignore)</li>
                  <li>❌ <strong>Never</strong> log API keys (even partially)</li>
                  <li>❌ <strong>Never</strong> share keys via Slack, email, or screenshots</li>
                  <li>✅ <strong>Always</strong> use environment variables, never hardcode</li>
                  <li>✅ <strong>Always</strong> rotate keys every 90 days</li>
                  <li>✅ <strong>Always</strong> store backup in password manager (1Password, LastPass)</li>
                </ul>
              </WarningBox>

              <Accordion title="API Key Rotation Procedure">
                <ol className="space-y-2 text-slate-700 list-decimal list-inside">
                  <li>Generate new key in API provider dashboard</li>
                  <li>Add new key to .env as <code className="bg-slate-100 px-2 py-1 rounded">OPENAI_API_KEY_NEW</code></li>
                  <li>Test with new key: <code className="bg-slate-100 px-2 py-1 rounded">curl -H "Authorization: Bearer $OPENAI_API_KEY_NEW" ...</code></li>
                  <li>If successful, replace old key: <code className="bg-slate-100 px-2 py-1 rounded">OPENAI_API_KEY=$OPENAI_API_KEY_NEW</code></li>
                  <li>Restart backend: <code className="bg-slate-100 px-2 py-1 rounded">pm2 restart ads-intel</code></li>
                  <li>Verify scraper works with new key</li>
                  <li>Delete old key from API dashboard (after 24h grace period)</li>
                  <li>Update backup in password manager</li>
                </ol>
              </Accordion>

              <InfoBox title="Set Rotation Reminders">
                Add recurring calendar event: "Rotate API Keys" every 90 days. Takes 15 minutes, prevents security breaches.
              </InfoBox>
            </div>
          </Tab>

          <Tab label="Access Control">
            <div className="space-y-6">
              <h4 className="font-semibold text-slate-900 mb-3">Recommended Access Levels</h4>

              <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm my-6">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Permissions</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Example Users</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-200">
                    <td className="px-6 py-4 font-medium text-slate-900">Admin</td>
                    <td className="px-6 py-4 text-sm text-slate-600">Full access (settings, brands, scraping, database)</td>
                    <td className="px-6 py-4 text-sm text-slate-600">CTO, Lead Dev</td>
                  </tr>
                  <tr className="border-t border-slate-200">
                    <td className="px-6 py-4 font-medium text-slate-900">Editor</td>
                    <td className="px-6 py-4 text-sm text-slate-600">View ads, search, export, add brands</td>
                    <td className="px-6 py-4 text-sm text-slate-600">Marketing Manager</td>
                  </tr>
                  <tr className="border-t border-slate-200">
                    <td className="px-6 py-4 font-medium text-slate-900">Viewer</td>
                    <td className="px-6 py-4 text-sm text-slate-600">View ads, search only (no export, no admin)</td>
                    <td className="px-6 py-4 text-sm text-slate-600">Junior Marketer, Intern</td>
                  </tr>
                </tbody>
              </table>

              <WarningBox title="Principle of Least Privilege">
                Give users the minimum access needed for their role. Don't make everyone an admin "just in case."
              </WarningBox>
            </div>
          </Tab>

          <Tab label="Data Protection">
            <div className="space-y-6">
              <FeatureGrid>
                <Feature icon="🔒" title="Encrypt Database Backups">
                  Use <code className="bg-slate-100 px-2 py-1 rounded">gpg</code> to encrypt SQL dumps before uploading to cloud storage.
                </Feature>
                <Feature icon="🌐" title="HTTPS Only">
                  Use SSL/TLS for all web traffic. Free with Let's Encrypt. No excuses for HTTP in 2025.
                </Feature>
                <Feature icon="🛡️" title="Firewall Rules">
                  Only allow SSH (port 22) from your IP. Block all other inbound traffic except HTTPS (443).
                </Feature>
                <Feature icon="📝" title="Audit Logs">
                  Log all admin actions (brand changes, settings updates, manual scrapes) with timestamp + user.
                </Feature>
              </FeatureGrid>

              <Accordion title="Encrypting Database Backups">
                <CodeBlock copyable>
{`# Backup + encrypt in one command
pg_dump -U postgres creative_os | gzip | gpg --symmetric --cipher-algo AES256 -o backup_encrypted_\$(date +%Y%m%d).sql.gz.gpg

# Enter passphrase when prompted (store in password manager!)

# To restore (decrypt + decompress + import)
gpg --decrypt backup_encrypted_20250118.sql.gz.gpg | gunzip | psql -U postgres creative_os`}
                </CodeBlock>
                <InfoBox title="Why Encrypt?">
                  Backups contain competitor research data. If cloud storage gets breached, encryption prevents data theft.
                </InfoBox>
              </Accordion>
            </div>
          </Tab>
        </Tabs>
      </section>

      {/* Keyboard Shortcuts */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Keyboard Shortcuts</h2>
        <p className="text-slate-700 text-lg mb-8">
          Speed up your workflow with these time-saving shortcuts.
        </p>

        <Tabs>
          <Tab label="Dashboard">
            <ShortcutList
              shortcuts={[
                { keys: ['Cmd', 'K'], description: 'Open quick search' },
                { keys: ['Escape'], description: 'Close search / modal' },
                { keys: ['Arrow Down'], description: 'Scroll to next ad' },
                { keys: ['Arrow Up'], description: 'Scroll to previous ad' },
                { keys: ['Enter'], description: 'Open selected ad details' },
                { keys: ['Cmd', 'F'], description: 'Find in current page' },
                { keys: ['Cmd', 'R'], description: 'Refresh current page' },
                { keys: ['Cmd', 'Shift', 'R'], description: 'Hard refresh (clear cache)' },
              ]}
            />
          </Tab>

          <Tab label="Search">
            <ShortcutList
              shortcuts={[
                { keys: ['Cmd', 'K'], description: 'Focus search bar' },
                { keys: ['Cmd', 'Enter'], description: 'Submit search' },
                { keys: ['Cmd', 'Backspace'], description: 'Clear search' },
                { keys: ['Tab'], description: 'Navigate between filters' },
                { keys: ['Shift', 'Tab'], description: 'Navigate backwards' },
              ]}
            />
          </Tab>

          <Tab label="Admin">
            <ShortcutList
              shortcuts={[
                { keys: ['Cmd', 'S'], description: 'Save settings' },
                { keys: ['Cmd', 'Shift', 'S'], description: 'Save & restart' },
                { keys: ['Cmd', 'E'], description: 'Export visible data' },
                { keys: ['Cmd', 'L'], description: 'View live logs' },
              ]}
            />
          </Tab>
        </Tabs>

        <InfoBox title="Pro Tip: Custom Shortcuts">
          Use browser extensions like Vimium or Surfingkeys to add custom keyboard shortcuts for your most common actions.
        </InfoBox>
      </section>

      {/* Automation Ideas */}
      <section className="mt-16 pt-12 border-t border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Automation Ideas</h2>
        <p className="text-slate-700 text-lg mb-8">
          Set-it-and-forget-it automations that save hours per week.
        </p>

        <FeatureGrid>
          <Feature icon="📧" title="Daily Digest Email">
            Cron job sends you a daily email with new ad count, top brands, and interesting patterns. Never miss a trend.
          </Feature>
          <Feature icon="🔔" title="Slack Alert on Keywords">
            Trigger Slack notification when ads contain specific keywords (e.g., "AI", "Black Friday"). Real-time monitoring.
          </Feature>
          <Feature icon="📊" title="Weekly Report Generation">
            Auto-generate PDF report every Monday with charts, top ads, competitor breakdown. Email to client/team.
          </Feature>
          <Feature icon="🔄" title="Auto-Archive Old Ads">
            Cron job moves ads {">"} 1 year old to archive table. Keeps database lean without manual intervention.
          </Feature>
          <Feature icon="💾" title="Nightly Backups">
            Automated daily database backup at 3 AM. Uploads to S3/Dropbox. Deletes backups {">"} 30 days old.
          </Feature>
          <Feature icon="🧹" title="Weekly Cleanup">
            Automated VACUUM, log rotation, cache clearing every Sunday at 4 AM. System stays fast.
          </Feature>
        </FeatureGrid>

        <div className="mt-8">
          <Accordion title="Example: Daily Digest Cron Job">
            <CodeBlock copyable>
{`#!/bin/bash
# daily-digest.sh

# Get yesterday's stats
NEW_ADS=$(psql -U postgres creative_os -t -c "
  SELECT COUNT(*) FROM adspy_ads WHERE scraped_at > NOW() - INTERVAL '24 hours';
")

TOP_BRANDS=$(psql -U postgres creative_os -t -c "
  SELECT brand_name, COUNT(*) as count
  FROM adspy_ads
  WHERE scraped_at > NOW() - INTERVAL '24 hours'
  GROUP BY brand_name
  ORDER BY count DESC
  LIMIT 5;
")

# Send email
echo "Subject: AdSpy Daily Digest

New ads in last 24h: $NEW_ADS

Top brands:
$TOP_BRANDS

View dashboard: http://your-domain.com/dashboard
" | sendmail your-email@example.com

# Add to crontab: 0 9 * * * /opt/ads-intel/scripts/daily-digest.sh`}
            </CodeBlock>
          </Accordion>
        </div>
      </section>

      <PageNavigation prev={prev} next={next} />
    </div>
  )
}
