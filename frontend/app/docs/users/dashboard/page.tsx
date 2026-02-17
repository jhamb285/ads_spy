import { Metadata } from 'next'
import { PageHeader } from '@/components/docs/PageHeader'
import { Breadcrumbs } from '@/components/docs/Breadcrumbs'
import { PageNavigation } from '@/components/docs/PageNavigation'
import { StatCard, StatGrid } from '@/components/docs/StatCard'
import { ScreenshotCard } from '@/components/docs/ScreenshotCard'
import { Tabs, Tab } from '@/components/docs/Tabs'
import { Steps, Step } from '@/components/docs/StepCard'
import { InfoBox, SuccessBox } from '@/components/docs/CalloutBox'
import { ShortcutList } from '@/components/docs/KeyboardShortcut'
import { QuickActionCard, QuickActionGrid } from '@/components/docs/QuickActionCard'
import { CodeBlock } from '@/components/docs/CodeBlock'
import { getPageNavigation } from '@/lib/docs-config'

export const metadata: Metadata = {
  title: 'Dashboard Guide - AdSpy Tool Documentation',
  description: 'Learn how to use the Dashboard to view and filter ads',
}

export default function DashboardGuidePage() {
  const { prev, next } = getPageNavigation('/docs/users/dashboard')

  return (
    <div>
      <Breadcrumbs items={[{ label: 'For Users', href: '/docs/users' }, { label: 'Dashboard' }]} />
      <PageHeader title="Dashboard Guide" description="Master the Dashboard to view, filter, and analyze competitor ads" icon="📊" />

      {/* Overview Stats */}
      <section className="mt-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Dashboard Capabilities</h2>
        <StatGrid columns={4}>
          <StatCard
            icon="👁️"
            label="Ad Viewing"
            value="Unlimited"
            variant="primary"
            description="Browse all scraped ads"
          />
          <StatCard
            icon="🔍"
            label="Search Filters"
            value="10+"
            variant="success"
            description="Filter by multiple criteria"
          />
          <StatCard
            icon="📥"
            label="Export Formats"
            value="CSV"
            variant="warning"
            description="Download ad data"
          />
          <StatCard
            icon="🎯"
            label="AI Analysis"
            value="Full"
            variant="default"
            description="Complete breakdowns"
          />
        </StatGrid>
      </section>

      {/* Page Layout */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Page Layout</h2>
        <ScreenshotCard
          title="Dashboard Overview"
          description="The dashboard consists of four main areas: header with stats, filter bar, ad grid with thumbnails, and pagination controls. Each ad card shows the creative, brand, date, and a 'View Details' button."
          caption="Tip: Click any ad card to see the full AI analysis including hooks, angles, and creative structure."
        />
        <InfoBox title="Quick Access">
          Access the dashboard at: <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">/dashboard</code>
        </InfoBox>
      </section>

      {/* Filtering Ads */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Filtering Ads</h2>
        <p className="text-slate-700 text-lg mb-8">
          The Dashboard offers powerful filtering to help you find exactly what you're looking for.
          Combine multiple filters to narrow down results.
        </p>

        <Tabs>
          <Tab label="By Brand">
            <div className="space-y-6">
              <ScreenshotCard
                title="Brand Filter"
                description="Select one or multiple brands from the dropdown. The filter shows all tracked brands with ad counts. You can select all brands or narrow to specific competitors."
                aspectRatio="16:9"
              />
              <Steps>
                <Step number={1} title="Open Brand Dropdown">
                  Click the "All Brands" button in the filter bar to reveal the dropdown.
                </Step>
                <Step number={2} title="Select Brands">
                  Click individual brand names to filter. Selected brands appear as blue chips.
                </Step>
                <Step number={3} title="Apply Filter">
                  The ad grid updates instantly as you select/deselect brands.
                </Step>
              </Steps>
            </div>
          </Tab>

          <Tab label="By Date Range">
            <div className="space-y-6">
              <ScreenshotCard
                title="Date Range Picker"
                description="Filter ads by when they were scraped. Choose from preset ranges (Last 7 days, Last 30 days, Last 90 days) or select custom start/end dates."
                aspectRatio="16:9"
              />
              <InfoBox title="Date Filter Tips">
                <ul className="space-y-2 text-blue-800">
                  <li>• "Last 7 days" shows the most recent ads</li>
                  <li>• "Last 30 days" is great for monthly trends</li>
                  <li>• Custom range useful for specific campaigns</li>
                  <li>• Dates are based on when ads were scraped, not when they went live</li>
                </ul>
              </InfoBox>
            </div>
          </Tab>

          <Tab label="By Ad Type">
            <div className="space-y-6">
              <ScreenshotCard
                title="Ad Type Filter"
                description="Filter by image ads, video ads, or carousel ads. Each type has unique analysis features. Video ads include transcript analysis, image ads focus on visual elements."
                aspectRatio="16:9"
              />
              <StatGrid columns={3}>
                <StatCard icon="🖼️" label="Image Ads" value="Most Common" variant="primary" description="Static image creatives" />
                <StatCard icon="🎥" label="Video Ads" value="High Engagement" variant="success" description="Video creatives with sound" />
                <StatCard icon="🎠" label="Carousel Ads" value="Multi-Image" variant="warning" description="Multiple images in sequence" />
              </StatGrid>
            </div>
          </Tab>

          <Tab label="Combined Filters">
            <div className="space-y-6">
              <ScreenshotCard
                title="Multi-Filter Example"
                description="Combine brand + date + type filters to find very specific ads. Example: Nike video ads from last 7 days. All filters work together seamlessly."
                aspectRatio="16:9"
              />
              <CodeBlock copyable>
                Example: Filter for Nike OR Adidas + Last 30 Days + Video Ads Only
Result: Shows only video ads from these two brands in the past month
              </CodeBlock>
            </div>
          </Tab>
        </Tabs>
      </section>

      {/* Viewing Ad Details */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Viewing Ad Details</h2>
        <p className="text-slate-700 text-lg mb-8">
          Click any ad card's "View Details" button to see the full AI-powered analysis.
        </p>

        <Steps>
          <Step number={1} title="Click View Details">
            On the dashboard grid, click the "View Details" button on any ad card. This opens the ad detail page with complete analysis.
          </Step>
          <Step number={2} title="Review AI Breakdown">
            <div className="mt-4">
              <ScreenshotCard
                title="Ad Detail Page"
                description="The detail page shows the full creative at the top, followed by AI analysis sections: Hook Analysis, Angle Identification, Creative Structure, Why It Works, Improvements, and Rewritten Ad."
                aspectRatio="4:3"
              />
            </div>
          </Step>
          <Step number={3} title="Analyze Insights">
            <div className="space-y-4 mt-4">
              <InfoBox title="What You'll See">
                <ul className="space-y-2 text-blue-800">
                  <li><strong>Creative Breakdown:</strong> Full analysis of the ad creative</li>
                  <li><strong>Transcript:</strong> (Video ads only) Full transcript of dialogue</li>
                  <li><strong>Hook Analysis:</strong> What grabs attention in the first 3 seconds</li>
                  <li><strong>Angle:</strong> The persuasion strategy (emotion, logic, urgency, etc.)</li>
                  <li><strong>Structure:</strong> How the ad is organized (problem-solution, storytelling, etc.)</li>
                  <li><strong>Why It Works:</strong> Explanation of effectiveness</li>
                  <li><strong>Improvements:</strong> Suggested optimizations</li>
                  <li><strong>Rewritten for Your Offer:</strong> Adapted version for your product/service</li>
                </ul>
              </InfoBox>
            </div>
          </Step>
        </Steps>

        <SuccessBox title="Pro Tip">
          Open multiple ad detail pages in new tabs (right-click → Open in New Tab) to compare ads side-by-side.
        </SuccessBox>
      </section>

      {/* Search Functionality */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Search Functionality</h2>
        <p className="text-slate-700 text-lg mb-8">
          Use the search bar to find ads containing specific keywords in the ad body, headline, or description.
        </p>

        <ScreenshotCard
          title="Search Bar"
          description="The search bar appears at the top of the dashboard. Type keywords and press Enter. Results update instantly to show matching ads."
          aspectRatio="16:9"
        />

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Search Examples</h3>
          <CodeBlock copyable>
# Simple keyword search
"discount" → finds all ads mentioning discounts

# Multiple keywords (OR logic)
"sale promotion" → finds ads with "sale" OR "promotion"

# Phrase search
"limited time offer" → finds exact phrase

# Brand-specific search
Use brand filter + keyword for targeted results
          </CodeBlock>
        </div>

        <InfoBox title="Search Tips">
          <ul className="space-y-2 text-blue-800">
            <li>• Search is case-insensitive</li>
            <li>• Searches across ad body, headline, and description</li>
            <li>• Combine with filters for powerful queries</li>
            <li>• For advanced search, use the dedicated <a href="/docs/users/search" className="underline font-semibold">Search & Discovery</a> page</li>
          </ul>
        </InfoBox>
      </section>

      {/* Keyboard Shortcuts */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Keyboard Shortcuts</h2>
        <p className="text-slate-700 text-lg mb-8">
          Speed up your workflow with these keyboard shortcuts:
        </p>

        <ShortcutList
          shortcuts={[
            { keys: ['Cmd', 'K'], description: 'Open search bar' },
            { keys: ['Escape'], description: 'Close search bar' },
            { keys: ['Arrow Down'], description: 'Scroll down through ads' },
            { keys: ['Arrow Up'], description: 'Scroll up through ads' },
            { keys: ['Enter'], description: 'Open selected ad details' },
            { keys: ['Cmd', 'F'], description: 'Find in page (browser)' },
          ]}
        />
      </section>

      {/* Export & Share */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Export & Share</h2>
        <p className="text-slate-700 text-lg mb-8">
          Export ad data for analysis in other tools or share with your team.
        </p>

        <QuickActionGrid columns={3}>
          <QuickActionCard
            icon="📥"
            title="Export to CSV"
            description="Download all visible ads (with current filters applied) as a CSV file for Excel/Google Sheets analysis."
            action={{ label: 'Export Data', href: '/dashboard' }}
            variant="primary"
          />
          <QuickActionCard
            icon="📋"
            title="Copy to Clipboard"
            description="Copy ad details to clipboard for quick pasting into Slack, Notion, or other tools."
            action={{ label: 'Copy Data', href: '/dashboard' }}
            variant="success"
          />
          <QuickActionCard
            icon="📊"
            title="Share via Slack"
            description="Send ad analysis directly to your team's Slack channel (if configured)."
            action={{ label: 'Share to Slack', href: '/dashboard' }}
            variant="warning"
          />
        </QuickActionGrid>
      </section>

      {/* Next Steps */}
      <section className="mt-16 pt-12 border-t border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">What's Next?</h2>
        <QuickActionGrid columns={2}>
          <QuickActionCard
            icon="🔍"
            title="Master Advanced Search"
            description="Learn powerful search operators, boolean logic, and saved searches for deep competitor research."
            action={{ label: 'View Search Guide', href: '/docs/users/search' }}
            variant="primary"
          />
          <QuickActionCard
            icon="🎯"
            title="Explore Common Workflows"
            description="Follow step-by-step guides for typical tasks like finding winning hooks, tracking trends, and analyzing angles."
            action={{ label: 'View Workflows', href: '/docs/users/workflows' }}
            variant="success"
          />
        </QuickActionGrid>
      </section>

      <PageNavigation prev={prev} next={next} />
    </div>
  )
}
