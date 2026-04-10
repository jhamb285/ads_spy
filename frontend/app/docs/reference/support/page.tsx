import { PageHeader } from '@/components/docs/PageHeader'
import { Breadcrumbs } from '@/components/docs/Breadcrumbs'
import { InfoBox, SuccessBox, WarningBox } from '@/components/docs/CalloutBox'
import { QuickActionCard } from '@/components/docs/QuickActionCard'
import { Accordion } from '@/components/docs/Accordion'
import { Tabs, Tab } from '@/components/docs/Tabs'
import { Timeline, TimelineItem } from '@/components/docs/Timeline'
import { FeatureGrid, Feature } from '@/components/docs/FeatureCard'
import { Steps, Step } from '@/components/docs/StepCard'
import { CodeBlock } from '@/components/docs/CodeBlock'
import { PageNavigation } from '@/components/docs/PageNavigation'
import { getPageNavigation } from '@/lib/docs-config'

export default function SupportPage() {
  const { prev, next } = getPageNavigation('/docs/reference/support')

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Reference', href: '/docs/reference' }, { label: 'Support & Resources' }]} />

      <PageHeader
        title="Support & Resources"
        description="Get help, access documentation, explore external resources, and stay updated with the latest changes and roadmap"
        icon="🆘"
      />

      {/* Quick Support */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickActionCard
            icon="📚"
            title="Documentation"
            description="Browse complete user and admin guides"
            action={{ label: "View Docs", href: "/docs" }}
          />
          <QuickActionCard
            icon="🔧"
            title="Troubleshooting"
            description="Diagnose and fix common issues"
            action={{ label: "View Guide", href: "/docs/reference/troubleshooting" }}
          />
          <QuickActionCard
            icon="💡"
            title="Tips & Tricks"
            description="Power user techniques and shortcuts"
            action={{ label: "Learn More", href: "/docs/reference/tips" }}
          />
          <QuickActionCard
            icon="⚙️"
            title="System Settings"
            description="Configure scraping, APIs, and integrations"
            action={{ label: "Open Settings", href: "/docs/admin/settings" }}
          />
        </div>
      </section>

      {/* Getting Help */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Getting Help</h2>
        <InfoBox>
          <p className="font-semibold mb-2">Before Reaching Out:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Check the <a href="/docs/reference/troubleshooting" className="text-blue-600 hover:underline">Troubleshooting Guide</a></li>
            <li>Search the FAQ below</li>
            <li>Review recent <a href="#changelog" className="text-blue-600 hover:underline">Changelog</a> for known issues</li>
            <li>Check system logs: <code className="bg-slate-100 px-2 py-1 rounded">pm2 logs ads-intel</code></li>
          </ul>
        </InfoBox>

        <div className="mt-6">
          <Steps>
            <Step number={1} title="Check Documentation">
              Browse the complete documentation site. Use the search feature to find specific topics. Most common issues are already documented.
            </Step>
            <Step number={2} title="Review System Status">
              <CodeBlock copyable>
{`# Check all services
pm2 status

# Check database connection
psql $DATABASE_URL -c "SELECT 1;"

# Check recent logs
pm2 logs ads-intel --lines 50`}
              </CodeBlock>
            </Step>
            <Step number={3} title="Gather Information">
              <p className="text-slate-700 mb-3">Before contacting support, collect:</p>
              <ul className="space-y-2 text-slate-700 list-disc list-inside">
                <li>Error message (full stack trace if available)</li>
                <li>Timestamp of issue</li>
                <li>Steps to reproduce</li>
                <li>Environment details (Node version, OS, database version)</li>
                <li>Recent changes (code updates, config changes, API key rotation)</li>
              </ul>
            </Step>
            <Step number={4} title="Contact Support">
              <p className="text-slate-700 mb-3">Reach out via:</p>
              <ul className="space-y-2 text-slate-700 list-disc list-inside">
                <li><strong>Slack</strong>: Post in #adspy-feed with @mention</li>
                <li><strong>Email</strong>: support@your-domain.com (if configured)</li>
                <li><strong>GitHub Issues</strong>: For feature requests or bug reports</li>
              </ul>
            </Step>
          </Steps>
        </div>
      </section>

      {/* Documentation Index */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Documentation Index</h2>
        <p className="text-slate-700 mb-6">Complete sitemap of all available documentation pages:</p>

        <div className="space-y-4">
          <Accordion title="Getting Started">
            <ul className="space-y-2 text-slate-700">
              <li>
                <a href="/docs" className="text-blue-600 hover:underline font-medium">
                  Introduction
                </a>
                <span className="text-slate-500 ml-2">— Overview of AdSpy Intelligence Tool</span>
              </li>
              <li>
                <a href="/docs/users/dashboard" className="text-blue-600 hover:underline font-medium">
                  Dashboard Guide
                </a>
                <span className="text-slate-500 ml-2">— Understanding your dashboard and metrics</span>
              </li>
            </ul>
          </Accordion>

          <Accordion title="User Guides">
            <ul className="space-y-2 text-slate-700">
              <li>
                <a href="/docs/users/search" className="text-blue-600 hover:underline font-medium">
                  Search & Discovery
                </a>
                <span className="text-slate-500 ml-2">— Advanced search techniques and filters</span>
              </li>
              <li>
                <a href="/docs/users/workflows" className="text-blue-600 hover:underline font-medium">
                  Common Workflows
                </a>
                <span className="text-slate-500 ml-2">— Step-by-step guides for daily tasks</span>
              </li>
            </ul>
          </Accordion>

          <Accordion title="Admin Guides">
            <ul className="space-y-2 text-slate-700">
              <li>
                <a href="/docs/admin/settings" className="text-blue-600 hover:underline font-medium">
                  Settings & Configuration
                </a>
                <span className="text-slate-500 ml-2">— System setup, API keys, integrations</span>
              </li>
              <li>
                <a href="/docs/admin/tasks" className="text-blue-600 hover:underline font-medium">
                  Admin Tasks
                </a>
                <span className="text-slate-500 ml-2">— Monitoring, maintenance, and troubleshooting</span>
              </li>
            </ul>
          </Accordion>

          <Accordion title="Reference">
            <ul className="space-y-2 text-slate-700">
              <li>
                <a href="/docs/reference/troubleshooting" className="text-blue-600 hover:underline font-medium">
                  Troubleshooting
                </a>
                <span className="text-slate-500 ml-2">— Diagnose and fix common issues</span>
              </li>
              <li>
                <a href="/docs/reference/tips" className="text-blue-600 hover:underline font-medium">
                  Tips & Best Practices
                </a>
                <span className="text-slate-500 ml-2">— Power user strategies and optimization</span>
              </li>
              <li>
                <a href="/docs/reference/support" className="text-blue-600 hover:underline font-medium">
                  Support & Resources
                </a>
                <span className="text-slate-500 ml-2">— This page</span>
              </li>
            </ul>
          </Accordion>

          <Accordion title="External Guides">
            <p className="text-slate-700 mb-3">Additional setup guides (if available in <code className="bg-slate-100 px-2 py-1 rounded">/guide</code> directory):</p>
            <ul className="space-y-2 text-slate-700">
              <li>• <strong>Setup Guide</strong> — Initial installation and configuration</li>
              <li>• <strong>Google Sheets Setup</strong> — Integrating Google Sheets for brand management</li>
              <li>• <strong>VPS Deployment</strong> — Production deployment instructions</li>
              <li>• <strong>Local Demo Walkthrough</strong> — Testing locally before deployment</li>
              <li>• <strong>Client Submission</strong> — Handoff checklist</li>
            </ul>
          </Accordion>
        </div>
      </section>

      {/* External Resources */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">External Resources</h2>
        <Tabs>
          <Tab label="API Providers">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Required API Services</h3>

              <Accordion title="OpenAI (GPT-4)">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Purpose</h4>
                    <p className="text-slate-700">
                      Used for detailed ad analysis, creative breakdown, hook identification, and rewriting ads for your offer.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Links</h4>
                    <ul className="space-y-1 text-slate-700">
                      <li>• <a href="https://platform.openai.com/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI API Documentation</a></li>
                      <li>• <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">API Key Management</a></li>
                      <li>• <a href="https://platform.openai.com/usage" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Usage Dashboard</a></li>
                      <li>• <a href="https://help.openai.com/en/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Help Center</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Rate Limits</h4>
                    <p className="text-slate-700">
                      Tier 1: 500 RPM, 10,000 TPM | Tier 2: 5,000 RPM, 100,000 TPM
                    </p>
                  </div>
                </div>
              </Accordion>

              <Accordion title="Google Gemini">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Purpose</h4>
                    <p className="text-slate-700">
                      Optional alternative to OpenAI for ad analysis. Supports multimodal inputs (text + images).
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Links</h4>
                    <ul className="space-y-1 text-slate-700">
                      <li>• <a href="https://ai.google.dev/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Gemini API Documentation</a></li>
                      <li>• <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">API Key Management</a></li>
                      <li>• <a href="https://ai.google.dev/pricing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Pricing & Limits</a></li>
                    </ul>
                  </div>
                </div>
              </Accordion>

              <Accordion title="Apify (Facebook Ads Scraper)">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Purpose</h4>
                    <p className="text-slate-700">
                      Scrapes Facebook Ad Library for competitor ads. Returns ad creative, body text, links, images, videos, and metadata.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Links</h4>
                    <ul className="space-y-1 text-slate-700">
                      <li>• <a href="https://apify.com/apify/facebook-ads-scraper" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook Ads Scraper Actor</a></li>
                      <li>• <a href="https://console.apify.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Apify Console</a></li>
                      <li>• <a href="https://docs.apify.com/api/v2" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Apify API Documentation</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Recommended Plan</h4>
                    <p className="text-slate-700">
                      Starter Plan ($49/month) provides 100 actor hours, sufficient for 50-100 brands daily.
                    </p>
                  </div>
                </div>
              </Accordion>

              <Accordion title="Slack">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Purpose</h4>
                    <p className="text-slate-700">
                      Sends real-time notifications to #adspy-feed channel with ad analysis results. Supports bot mode for URL-based scraping.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Links</h4>
                    <ul className="space-y-1 text-slate-700">
                      <li>• <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Slack App Management</a></li>
                      <li>• <a href="https://slack.dev/bolt-js" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Bolt.js Framework Docs</a></li>
                      <li>• <a href="https://api.slack.com/methods" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Slack API Methods</a></li>
                    </ul>
                  </div>
                </div>
              </Accordion>

              <Accordion title="Google Sheets">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Purpose</h4>
                    <p className="text-slate-700">
                      Optional two-way brand sync. Manage brands in Google Sheets and sync to database automatically.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Links</h4>
                    <ul className="space-y-1 text-slate-700">
                      <li>• <a href="https://developers.google.com/sheets/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Sheets API Documentation</a></li>
                      <li>• <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
                      <li>• <a href="https://theoephraim.github.io/node-google-spreadsheet/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">node-google-spreadsheet Docs</a></li>
                    </ul>
                  </div>
                </div>
              </Accordion>
            </div>
          </Tab>

          <Tab label="Tools & Technologies">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Development & Deployment Tools</h3>

              <Accordion title="Node.js & TypeScript">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Purpose</h4>
                    <p className="text-slate-700">
                      Backend runtime (Node.js) and type-safe language (TypeScript) for the scraping and analysis engine.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Links</h4>
                    <ul className="space-y-1 text-slate-700">
                      <li>• <a href="https://nodejs.org/en/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Node.js Documentation</a></li>
                      <li>• <a href="https://www.typescriptlang.org/docs/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">TypeScript Documentation</a></li>
                    </ul>
                  </div>
                </div>
              </Accordion>

              <Accordion title="PM2 (Process Manager)">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Purpose</h4>
                    <p className="text-slate-700">
                      Production process manager for Node.js. Handles auto-restart, log management, and clustering.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Links</h4>
                    <ul className="space-y-1 text-slate-700">
                      <li>• <a href="https://pm2.keymetrics.io/docs/usage/quick-start/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">PM2 Quick Start</a></li>
                      <li>• <a href="https://pm2.keymetrics.io/docs/usage/application-declaration/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ecosystem Config</a></li>
                      <li>• <a href="https://pm2.keymetrics.io/docs/usage/log-management/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Log Management</a></li>
                    </ul>
                  </div>
                </div>
              </Accordion>

              <Accordion title="PostgreSQL">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Purpose</h4>
                    <p className="text-slate-700">
                      Primary database for storing ads, brands, analysis data. Supports full-text search and JSONB for structured data.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Links</h4>
                    <ul className="space-y-1 text-slate-700">
                      <li>• <a href="https://www.postgresql.org/docs/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">PostgreSQL Documentation</a></li>
                      <li>• <a href="https://node-postgres.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">node-postgres (pg) Docs</a></li>
                      <li>• <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Docs (managed Postgres)</a></li>
                    </ul>
                  </div>
                </div>
              </Accordion>

              <Accordion title="Next.js & React">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Purpose</h4>
                    <p className="text-slate-700">
                      Frontend framework (Next.js 16 with App Router) for admin UI, brand management, and search interface.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Links</h4>
                    <ul className="space-y-1 text-slate-700">
                      <li>• <a href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Next.js Documentation</a></li>
                      <li>• <a href="https://react.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">React Documentation</a></li>
                      <li>• <a href="https://tailwindcss.com/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Tailwind CSS Docs</a></li>
                    </ul>
                  </div>
                </div>
              </Accordion>
            </div>
          </Tab>

          <Tab label="Communities">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Community Resources</h3>

              <FeatureGrid>
                <Feature icon="💬" title="Slack Community">
                  Internal #adspy-feed channel for team collaboration, ad notifications, and troubleshooting.
                </Feature>
                <Feature icon="📖" title="GitHub Discussions">
                  Share feedback, request features, report bugs, and discuss improvements with the development team.
                </Feature>
                <Feature icon="🎓" title="Knowledge Base">
                  Internal wiki with runbooks, troubleshooting guides, and best practices (if configured).
                </Feature>
                <Feature icon="🌐" title="Stack Overflow">
                  Search <code className="bg-slate-100 px-2 py-1 rounded">[node.js] [postgresql]</code> or <code className="bg-slate-100 px-2 py-1 rounded">[openai-api]</code> for technical questions.
                </Feature>
                <Feature icon="🐛" title="Issue Tracker">
                  Report bugs, track feature requests, view release notes in GitHub Issues (if repository is available).
                </Feature>
                <Feature icon="📧" title="Mailing List">
                  Subscribe to announcements for major updates, security patches, and breaking changes (if configured).
                </Feature>
              </FeatureGrid>
            </div>
          </Tab>
        </Tabs>
      </section>

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>

        <div className="space-y-4">
          <Accordion title="How often does the scraper run?">
            <p className="text-slate-700 mb-3">
              By default, the scraper runs <strong>once per day at 9 AM</strong> (configured in cron job or PM2 scheduler).
            </p>
            <p className="text-slate-700 mb-3">
              You can change the schedule by editing the cron expression in <code className="bg-slate-100 px-2 py-1 rounded">ecosystem.config.js</code> or your system crontab.
            </p>
            <CodeBlock copyable>
{`# Run every 6 hours
0 */6 * * * cd /opt/ads-intel && node dist/main.js

# Run daily at 9 AM
0 9 * * * cd /opt/ads-intel && node dist/main.js`}
            </CodeBlock>
          </Accordion>

          <Accordion title="Can I scrape multiple brands at once?">
            <p className="text-slate-700 mb-3">
              Yes. The scraper processes all <strong>active</strong> brands in your database. You can manage brands via:
            </p>
            <ul className="space-y-2 text-slate-700 list-disc list-inside">
              <li><strong>Admin UI</strong>: <code className="bg-slate-100 px-2 py-1 rounded">/brands</code> page (add/edit/toggle)</li>
              <li><strong>Google Sheets</strong>: Two-way sync with "Brands" tab (if configured)</li>
              <li><strong>Database</strong>: Direct SQL inserts into <code className="bg-slate-100 px-2 py-1 rounded">adspy_brands</code> table</li>
            </ul>
          </Accordion>

          <Accordion title="What happens if the scraper fails?">
            <p className="text-slate-700 mb-3">
              PM2 automatically restarts the process if it crashes. Error logs are available via:
            </p>
            <CodeBlock copyable>
{`# View last 100 error lines
pm2 logs ads-intel --err --lines 100

# Monitor logs in real-time
pm2 logs ads-intel`}
            </CodeBlock>
            <p className="text-slate-700 mt-3">
              Common causes: API rate limits, network issues, invalid API keys. See <a href="/docs/reference/troubleshooting" className="text-blue-600 hover:underline">Troubleshooting Guide</a> for diagnostics.
            </p>
          </Accordion>

          <Accordion title="How do I add a new brand?">
            <p className="text-slate-700 mb-3">
              Three methods (choose one):
            </p>
            <ol className="space-y-3 text-slate-700 list-decimal list-inside">
              <li>
                <strong>Admin UI</strong> (easiest): Navigate to <code className="bg-slate-100 px-2 py-1 rounded">/brands</code>, click "Add Brand", fill in form (avatar, brand name, Facebook page URL), save.
              </li>
              <li>
                <strong>Google Sheets</strong>: Add row in "Brands" tab with avatar, brand_name, page_url. Sync happens automatically on next scrape.
              </li>
              <li>
                <strong>SQL</strong>:
                <CodeBlock copyable>
{`INSERT INTO adspy_brands (avatar, brand_name, page_url, active)
VALUES ('skincare', 'Glow Labs', 'https://www.facebook.com/glowlabs', true);`}
                </CodeBlock>
              </li>
            </ol>
          </Accordion>

          <Accordion title="How do I search for specific ad patterns?">
            <p className="text-slate-700 mb-3">
              Use the <code className="bg-slate-100 px-2 py-1 rounded">/search</code> page with advanced filters:
            </p>
            <ul className="space-y-2 text-slate-700 list-disc list-inside">
              <li><strong>Keyword Search</strong>: Searches ad body, hook, angle, structure</li>
              <li><strong>Brand Filter</strong>: Dropdown to filter by specific brand</li>
              <li><strong>Date Range</strong>: Filter by scrape date</li>
              <li><strong>Boolean Operators</strong>: Use AND, OR, NOT (e.g., "urgency AND discount NOT free")</li>
            </ul>
            <p className="text-slate-700 mt-3">
              See <a href="/docs/users/search" className="text-blue-600 hover:underline">Search & Discovery Guide</a> for advanced techniques.
            </p>
          </Accordion>

          <Accordion title="Can I export search results to CSV?">
            <p className="text-slate-700 mb-3">
              Yes. Search page includes "Export CSV" button that downloads results with all fields (ad body, breakdown, URL, timestamp).
            </p>
            <p className="text-slate-700">
              Alternatively, export directly from database:
            </p>
            <CodeBlock copyable>
{`psql $DATABASE_URL -c "
  COPY (SELECT * FROM adspy_ads WHERE scraped_at > NOW() - INTERVAL '7 days')
  TO '/tmp/ads_export.csv' CSV HEADER;"`}
            </CodeBlock>
          </Accordion>

          <Accordion title="How do I update API keys?">
            <p className="text-slate-700 mb-3">
              Update <code className="bg-slate-100 px-2 py-1 rounded">.env</code> file on your VPS, then restart the backend:
            </p>
            <CodeBlock copyable>
{`# Edit .env
nano /opt/ads-intel/backend/.env

# Update keys
OPENAI_API_KEY=sk-new-key-here
GEMINI_API_KEY=new-gemini-key-here

# Restart backend
pm2 restart ads-intel`}
            </CodeBlock>
            <WarningBox>
              <p className="font-semibold mb-2">Security Note:</p>
              <p>Never commit API keys to Git. Store in .env only, add .env to .gitignore.</p>
            </WarningBox>
          </Accordion>

          <Accordion title="What's the difference between Gemini and OpenAI analysis?">
            <p className="text-slate-700 mb-3">
              Both analyze ads, but with different strengths:
            </p>
            <ul className="space-y-2 text-slate-700 list-disc list-inside">
              <li><strong>OpenAI (GPT-4)</strong>: More detailed analysis, better at creative rewriting, supports Vision API for image analysis</li>
              <li><strong>Gemini (1.5 Pro)</strong>: Faster, cheaper, multimodal by default (text + images), good for initial breakdown</li>
            </ul>
            <p className="text-slate-700 mt-3">
              Recommended: Use Gemini for initial breakdown, OpenAI for detailed analysis and rewriting.
            </p>
          </Accordion>

          <Accordion title="Can I customize the Slack notification format?">
            <p className="text-slate-700 mb-3">
              Yes. Edit <code className="bg-slate-100 px-2 py-1 rounded">src/slack.ts</code> to modify message structure, add/remove sections, change formatting.
            </p>
            <p className="text-slate-700 mb-3">
              Example: Add custom field to Slack message:
            </p>
            <CodeBlock copyable>
{`// In src/slack.ts
export function formatAdMessage(ad: any, analysis: any) {
  return {
    blocks: [
      // ... existing blocks
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: \`*Custom Field:* \${analysis.custom_field}\`
        }
      }
    ]
  };
}`}
            </CodeBlock>
            <p className="text-slate-700 mt-3">
              Restart backend after changes: <code className="bg-slate-100 px-2 py-1 rounded">pm2 restart ads-intel</code>
            </p>
          </Accordion>
        </div>
      </section>

      {/* Changelog */}
      <section id="changelog" className="mt-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Changelog</h2>
        <p className="text-slate-700 mb-6">Recent updates and version history:</p>

        <Timeline>
          <TimelineItem
            icon="📚"
            time="January 18, 2026"
            title="v1.3.0 - Complete Documentation System"
            description={
              <ul className="space-y-1 text-slate-700 list-disc list-inside">
                <li>Added comprehensive documentation site (7 pages, 3,400+ lines)</li>
                <li>Created 8 premium interactive components</li>
                <li>Live Help page accessible from navbar</li>
                <li>UI User Guide with 8 sections and 7 workflows</li>
              </ul>
            }
            status="current"
          />

          <TimelineItem
            icon="✨"
            time="January 17, 2026"
            title="v1.2.0 - UI Complete"
            description={
              <ul className="space-y-1 text-slate-700 list-disc list-inside">
                <li>Completed Admin UI (brand management with CRUD)</li>
                <li>Completed Search UI (advanced filters, export CSV)</li>
                <li>Added UI → Slack + Sheets sync</li>
                <li>Multi-page brand support (pagination)</li>
                <li>Deployed to VPS (http://178.156.213.149:1001)</li>
              </ul>
            }
          />

          <TimelineItem
            icon="🗄️"
            time="January 15, 2026"
            title="v1.1.0 - Database Migration"
            description={
              <ul className="space-y-1 text-slate-700 list-disc list-inside">
                <li>Migrated from JSON to PostgreSQL storage</li>
                <li>Added Gemini AI integration</li>
                <li>Implemented Google Sheets two-way sync</li>
                <li>Added PM2 process management</li>
                <li>Database deduplication logic</li>
                <li>89 default brands pre-configured</li>
              </ul>
            }
          />

          <TimelineItem
            icon="🚀"
            time="January 10, 2026"
            title="v1.0.0 - Initial Release"
            description={
              <ul className="space-y-1 text-slate-700 list-disc list-inside">
                <li>Core scraping engine with Apify</li>
                <li>OpenAI analysis integration</li>
                <li>Slack bot and notifications</li>
                <li>Video transcription (Whisper)</li>
                <li>Image analysis (GPT-4 Vision)</li>
                <li>JSON-based ad storage</li>
              </ul>
            }
          />
        </Timeline>
      </section>

      {/* Roadmap */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Roadmap</h2>
        <p className="text-slate-700 mb-6">Planned features and improvements:</p>

        <SuccessBox>
          <p className="font-semibold mb-2">✅ Current Milestone: Full Production Deployment</p>
          <p>All core features complete. Focus now on API key configuration and end-to-end testing.</p>
        </SuccessBox>

        <div className="mt-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Upcoming Features</h3>
          <FeatureGrid>
            <Feature icon="📊" title="Analytics Dashboard">
              Visual charts for ad trends, brand activity, top hooks, and scraping metrics.
            </Feature>
            <Feature icon="🔔" title="Smart Notifications">
              AI-powered alerts for high-performing competitor ads, new ad patterns, and anomalies.
            </Feature>
            <Feature icon="🎯" title="Auto-Tagging">
              Automatic categorization of ads by vertical, offer type, format, and awareness level.
            </Feature>
            <Feature icon="🔗" title="Creative OS Integration">
              Link AdSpy ads directly to main Creative OS production ads as references.
            </Feature>
            <Feature icon="📈" title="Trend Analysis">
              Weekly/monthly trend reports on hook patterns, angle shifts, and creative strategies.
            </Feature>
            <Feature icon="🤖" title="AI Recommendations">
              Claude-powered suggestions: "Try this hook for your next ad" based on winning patterns.
            </Feature>
          </FeatureGrid>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Future Enhancements</h3>
          <ul className="space-y-3 text-slate-700">
            <li className="flex items-start">
              <span className="text-slate-400 mr-3">•</span>
              <div>
                <strong>Multi-Platform Support</strong> — Extend beyond Facebook to Instagram, TikTok, YouTube, LinkedIn
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-slate-400 mr-3">•</span>
              <div>
                <strong>A/B Test Planning</strong> — Auto-generate test variations based on competitor patterns
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-slate-400 mr-3">•</span>
              <div>
                <strong>Collaborative Features</strong> — Team annotations, ad ratings, shared collections
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-slate-400 mr-3">•</span>
              <div>
                <strong>API Access</strong> — RESTful API for programmatic access to ad data and analysis
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-slate-400 mr-3">•</span>
              <div>
                <strong>Browser Extension</strong> — One-click scrape and analyze while browsing Facebook Ad Library
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* Community & Contributing */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Community & Contributing</h2>

        <InfoBox>
          <p className="font-semibold mb-2">Open for Contributions</p>
          <p>
            We welcome bug reports, feature requests, and code contributions. Please follow the guidelines below to ensure smooth collaboration.
          </p>
        </InfoBox>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">How to Contribute</h3>
            <ol className="space-y-3 text-slate-700 list-decimal list-inside">
              <li>
                <strong>Bug Reports</strong>: Open an issue in GitHub with:
                <ul className="ml-6 mt-2 space-y-1 list-disc list-inside">
                  <li>Clear description of the issue</li>
                  <li>Steps to reproduce</li>
                  <li>Expected vs actual behavior</li>
                  <li>System details (Node version, OS, database version)</li>
                  <li>Relevant error logs</li>
                </ul>
              </li>
              <li>
                <strong>Feature Requests</strong>: Submit a detailed proposal including:
                <ul className="ml-6 mt-2 space-y-1 list-disc list-inside">
                  <li>Use case and problem statement</li>
                  <li>Proposed solution</li>
                  <li>Expected impact</li>
                  <li>Alternative approaches considered</li>
                </ul>
              </li>
              <li>
                <strong>Code Contributions</strong>:
                <ul className="ml-6 mt-2 space-y-1 list-disc list-inside">
                  <li>Fork the repository</li>
                  <li>Create feature branch: <code className="bg-slate-100 px-2 py-1 rounded">git checkout -b feature/my-feature</code></li>
                  <li>Write clean, documented code</li>
                  <li>Add tests where applicable</li>
                  <li>Submit pull request with clear description</li>
                </ul>
              </li>
            </ol>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Code Style Guidelines</h3>
            <ul className="space-y-2 text-slate-700 list-disc list-inside">
              <li>Use TypeScript with strict mode enabled</li>
              <li>Follow existing code formatting (ESLint + Prettier)</li>
              <li>Add JSDoc comments for public functions</li>
              <li>Use async/await over promises where possible</li>
              <li>Handle errors gracefully with try/catch</li>
              <li>Write descriptive commit messages (conventional commits preferred)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Testing Guidelines</h3>
            <p className="text-slate-700 mb-3">Before submitting:</p>
            <CodeBlock copyable>
{`# Run linter
npm run lint

# Run tests (if configured)
npm test

# Build project
npm run build

# Test locally
npm run dev`}
            </CodeBlock>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Community Channels</h3>
            <ul className="space-y-2 text-slate-700">
              <li>• <strong>Slack</strong>: #adspy-feed (for internal team collaboration)</li>
              <li>• <strong>GitHub Issues</strong>: Bug reports and feature requests</li>
              <li>• <strong>GitHub Discussions</strong>: General questions and ideas</li>
              <li>• <strong>Email</strong>: support@your-domain.com (for private inquiries)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <PageNavigation prev={prev} next={next} />
    </div>
  )
}
