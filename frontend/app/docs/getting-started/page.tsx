import { Metadata } from 'next'
import Image from 'next/image'
import { PageHeader } from '@/components/docs/PageHeader'
import { Breadcrumbs } from '@/components/docs/Breadcrumbs'
import { PageNavigation } from '@/components/docs/PageNavigation'
import { Steps, Step } from '@/components/docs/StepCard'
import { InfoBox, SuccessBox } from '@/components/docs/CalloutBox'
import { FeatureGrid, Feature } from '@/components/docs/FeatureCard'
import { CodeBlock } from '@/components/docs/CodeBlock'
import { getPageNavigation } from '@/lib/docs-config'

export const metadata: Metadata = {
  title: 'Getting Started - AdSpy Tool Documentation',
  description: 'Quick start guide for the AdSpy Tool',
}

export default function GettingStartedPage() {
  const { prev, next } = getPageNavigation('/docs/getting-started')

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Getting Started' }]} />

      <PageHeader
        title="Getting Started"
        description="Get up and running with the AdSpy Tool in just 5 minutes"
        icon="🚀"
      />

      {/* Quick Info */}
      <InfoBox title="What is AdSpy Tool?">
        AdSpy Tool automatically scrapes, analyzes, and tracks competitor Facebook ads across multiple brands.
        It provides AI-powered breakdowns of hooks, angles, and creative structures to inspire your own ad campaigns.
      </InfoBox>

      {/* Main Sections */}
      <div className="space-y-12 mt-12">
        {/* Accessing the Application */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Accessing the Application</h2>
          <p className="text-slate-700 mb-6 text-lg leading-relaxed">
            The application is accessible at:
          </p>
          <CodeBlock copyable>
http://178.156.213.149:1001
          </CodeBlock>

          <FeatureGrid>
            <Feature icon="📊" title="Dashboard">
              View and filter all scraped ads with powerful search
            </Feature>
            <Feature icon="🏷️" title="Brands">
              Manage brands and Facebook pages to track
            </Feature>
            <Feature icon="🔍" title="Search">
              Search through your entire ad archive
            </Feature>
            <Feature icon="⚙️" title="Settings">
              Configure global scraping settings
            </Feature>
          </FeatureGrid>
        </section>

        {/* First-Time Setup */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">First-Time Setup</h2>
          <p className="text-slate-700 mb-8 text-lg leading-relaxed">
            Follow these steps to configure your AdSpy Tool for the first time:
          </p>

          <Steps>
            <Step number={1} title="Visit the Application">
              <p className="mb-3">Open your browser and navigate to:</p>
              <CodeBlock copyable>
http://178.156.213.149:1001
              </CodeBlock>
            </Step>

            <Step number={2} title="Configure Settings">
              <p className="mb-4">Go to <strong>Settings</strong> page and configure:</p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1">•</span>
                  <div>
                    <strong>Enable AdSpy Scraper:</strong> Turn ON to start scraping ads
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1">•</span>
                  <div>
                    <strong>Max Ads Per Brand:</strong> Set to 10 (default) or customize
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1">•</span>
                  <div>
                    <strong>Max Daily Ads:</strong> Set to 50 (default) or customize
                  </div>
                </li>
              </ul>
            </Step>

            <Step number={3} title="Add Your First Brand">
              <p className="mb-4">Navigate to <strong>Brands</strong> page and:</p>
              <ol className="space-y-2 text-slate-700 list-decimal list-inside">
                <li>Click the <strong className="text-green-600">Add Brand</strong> button</li>
                <li>Fill in brand name and Facebook page URL</li>
                <li>Toggle <strong>Active</strong> to ON</li>
                <li>Click <strong>Add Brand</strong></li>
              </ol>
            </Step>

            <Step number={4} title="Wait for First Scrape">
              <p className="mb-3">
                The scraper runs daily via cron job. You can also manually trigger it if configured.
              </p>
              <InfoBox>
                Scraping happens automatically every 24 hours. Check back the next day to see results!
              </InfoBox>
            </Step>

            <Step number={5} title="View Results">
              <p className="mb-4">Once ads are scraped, you can:</p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1">•</span>
                  View all ads in <strong>Dashboard</strong>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1">•</span>
                  Search by keywords in <strong>Search</strong> page
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1">•</span>
                  Click <strong>View Details</strong> to see AI analysis
                </li>
              </ul>
            </Step>
          </Steps>

          <SuccessBox title="Setup Complete!">
            You're all set! The system will now automatically scrape and analyze ads from your tracked brands.
          </SuccessBox>
        </section>

        {/* Navigation Tour */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Navigation Tour</h2>
          <p className="text-slate-700 mb-8 text-lg leading-relaxed">
            Familiarize yourself with the main sections of the application:
          </p>

          <div className="space-y-6">
            <div className="bg-slate-50 border-l-4 border-slate-600 p-6 rounded-r-lg">
              <h3 className="text-xl font-bold text-slate-900 mb-2">📊 Dashboard</h3>
              <p className="text-slate-700 mb-3">Your central hub for viewing all scraped ads</p>
              <ul className="space-y-1 text-slate-600 text-sm">
                <li>• Filter by brand, date, ad type</li>
                <li>• Search across all ad content</li>
                <li>• View detailed AI breakdowns</li>
              </ul>
            </div>

            <div className="bg-slate-50 border-l-4 border-slate-600 p-6 rounded-r-lg">
              <h3 className="text-xl font-bold text-slate-900 mb-2">🏷️ Brands</h3>
              <p className="text-slate-700 mb-3">Manage which brands and pages to track</p>
              <ul className="space-y-1 text-slate-600 text-sm">
                <li>• Add/edit/delete brands</li>
                <li>• Manage multiple pages per brand</li>
                <li>• Set brand-specific scraping limits</li>
              </ul>
            </div>

            <div className="bg-slate-50 border-l-4 border-slate-600 p-6 rounded-r-lg">
              <h3 className="text-xl font-bold text-slate-900 mb-2">🔍 Search</h3>
              <p className="text-slate-700 mb-3">Powerful keyword search across your ad archive</p>
              <ul className="space-y-1 text-slate-600 text-sm">
                <li>• Search ad body, hooks, angles, structures</li>
                <li>• Find relevant competitor strategies</li>
                <li>• Export search results</li>
              </ul>
            </div>

            <div className="bg-slate-50 border-l-4 border-slate-600 p-6 rounded-r-lg">
              <h3 className="text-xl font-bold text-slate-900 mb-2">⚙️ Settings</h3>
              <p className="text-slate-700 mb-3">Configure global scraping behavior</p>
              <ul className="space-y-1 text-slate-600 text-sm">
                <li>• Enable/disable scraper</li>
                <li>• Set max ads per brand</li>
                <li>• Configure daily ad limits</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Interface Preview */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Application Interface</h2>
          <p className="text-slate-700 mb-8 text-lg leading-relaxed">
            Here's what the AdSpy Tool interface looks like:
          </p>
          <div className="border border-slate-200 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/screenshots/docs-getting-started.png"
              alt="AdSpy Tool Interface"
              width={1920}
              height={1080}
              className="w-full h-auto"
              priority
            />
          </div>
        </section>

        {/* Next Steps */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">What's Next?</h2>
          <FeatureGrid>
            <Feature icon="📚" title="Learn the Dashboard">
              Explore filtering, searching, and viewing ad details
            </Feature>
            <Feature icon="🎯" title="Common Workflows">
              Follow step-by-step guides for typical tasks
            </Feature>
            <Feature icon="🔧" title="Admin Tasks">
              Learn advanced brand management and monitoring
            </Feature>
            <Feature icon="💡" title="Tips & Best Practices">
              Optimize your ad intelligence workflow
            </Feature>
          </FeatureGrid>
        </section>
      </div>

      <PageNavigation prev={prev} next={next} />
    </div>
  )
}
