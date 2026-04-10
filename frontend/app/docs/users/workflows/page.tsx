import { Metadata } from 'next'
import { PageHeader } from '@/components/docs/PageHeader'
import { Breadcrumbs } from '@/components/docs/Breadcrumbs'
import { PageNavigation } from '@/components/docs/PageNavigation'
import { QuickActionCard, QuickActionGrid } from '@/components/docs/QuickActionCard'
import { Steps, Step } from '@/components/docs/StepCard'
import { Timeline, TimelineItem } from '@/components/docs/Timeline'
import { ScreenshotCard } from '@/components/docs/ScreenshotCard'
import { CodeBlock } from '@/components/docs/CodeBlock'
import { Tabs, Tab } from '@/components/docs/Tabs'
import { InfoBox, SuccessBox, WarningBox } from '@/components/docs/CalloutBox'
import { StatCard, StatGrid } from '@/components/docs/StatCard'
import { getPageNavigation } from '@/lib/docs-config'

export const metadata: Metadata = {
  title: 'Common Workflows - AdSpy Tool Documentation',
  description: 'Step-by-step guides for common tasks and workflows',
}

export default function WorkflowsPage() {
  const { prev, next } = getPageNavigation('/docs/users/workflows')

  return (
    <div>
      <Breadcrumbs items={[{ label: 'For Users', href: '/docs/users' }, { label: 'Common Workflows' }]} />
      <PageHeader
        title="Common Workflows"
        description="Step-by-step guides for accomplishing common tasks efficiently"
        icon="🎯"
      />

      {/* Quick Access to Workflows */}
      <section className="mt-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Choose Your Workflow</h2>
        <p className="text-slate-700 text-lg mb-8">
          Jump to the workflow that matches your current task. Each guide includes screenshots, examples, and best practices.
        </p>

        <QuickActionGrid columns={3}>
          <QuickActionCard
            icon="🎣"
            title="Finding Winning Hooks"
            description="Discover high-performing hooks and attention-grabbing opening lines from competitor ads"
            action={{ label: 'Start Workflow', href: '#workflow-hooks' }}
            variant="primary"
          />
          <QuickActionCard
            icon="📊"
            title="Tracking Brand Performance"
            description="Monitor competitor activity, ad frequency, and creative patterns over time"
            action={{ label: 'Start Workflow', href: '#workflow-tracking' }}
            variant="success"
          />
          <QuickActionCard
            icon="📥"
            title="Exporting Ad Data"
            description="Export ads with full analysis to CSV for reporting or team collaboration"
            action={{ label: 'Start Workflow', href: '#workflow-export' }}
            variant="warning"
          />
          <QuickActionCard
            icon="🎨"
            title="Analyzing Ad Angles"
            description="Identify persuasion strategies and angles competitors use most successfully"
            action={{ label: 'Start Workflow', href: '#workflow-angles' }}
            variant="primary"
          />
          <QuickActionCard
            icon="🔔"
            title="Monitoring New Ads"
            description="Set up notifications and daily checks to stay on top of competitor launches"
            action={{ label: 'Start Workflow', href: '#workflow-monitoring' }}
            variant="success"
          />
          <QuickActionCard
            icon="🏢"
            title="Industry Research"
            description="Research multiple competitors in your industry to find common patterns"
            action={{ label: 'Start Workflow', href: '#workflow-research' }}
            variant="warning"
          />
        </QuickActionGrid>
      </section>

      {/* Workflow 1: Finding Winning Hooks */}
      <section id="workflow-hooks" className="mt-20 scroll-mt-20">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-5xl">🎣</span>
          <h2 className="text-4xl font-bold text-slate-900">Workflow 1: Finding Winning Hooks</h2>
        </div>
        <p className="text-slate-700 text-lg mb-8">
          Hooks are the first 3 seconds of your ad - the make-or-break moment. This workflow helps you discover what works.
        </p>

        <InfoBox title="Goal">
          Find 10-15 high-performing hooks from competitor ads that you can adapt for your own campaigns.
        </InfoBox>

        <Steps>
          <Step number={1} title="Search for Hook Patterns">
            <p className="mb-4">Use the Search page with these queries:</p>
            <CodeBlock copyable>
{`# Urgency-based hooks
hook:urgency OR "limited time" OR "ending soon" OR "last chance"

# Pattern interrupt hooks
hook:pattern OR "wait" OR "stop" OR "attention"

# Question-based hooks
hook:question OR "are you" OR "do you" OR "what if"`}
            </CodeBlock>
          </Step>

          <Step number={2} title="Filter for Your Industry">
            <p className="mb-3">Narrow results to relevant competitors:</p>
            <ul className="space-y-2 text-slate-700">
              <li>• Use brand filter to select 3-5 top competitors</li>
              <li>• Filter by "Last 30 days" to see recent hooks</li>
              <li>• Focus on video ads for the strongest hooks</li>
            </ul>
          </Step>

          <Step number={3} title="Analyze Hook Analysis">
            <div className="space-y-4 mt-4">
              <ScreenshotCard
                title="Hook Analysis Section"
                description="Each ad detail page includes an AI-generated Hook Analysis section. Review this to understand why the hook works, what emotion it triggers, and how it captures attention."
                aspectRatio="16:9"
              />
              <p className="text-slate-700">Look for patterns across multiple ads:</p>
              <ul className="space-y-2 text-slate-700 mt-3">
                <li>• Do they use numbers? ("3 simple steps", "47% faster")</li>
                <li>• Do they address pain points directly?</li>
                <li>• Do they use urgency or scarcity?</li>
                <li>• Do they ask provocative questions?</li>
              </ul>
            </div>
          </Step>

          <Step number={4} title="Document Your Findings">
            <p className="mb-3">Create a swipe file:</p>
            <CodeBlock copyable>
{`Export Method 1: Copy to Spreadsheet
- Open each ad detail
- Copy hook text + analysis
- Paste into Google Sheets with columns: Hook | Why It Works | Brand | Date

Export Method 2: Use CSV Export
- Filter ads with winning hooks
- Export to CSV from dashboard
- Sort by hook effectiveness`}
            </CodeBlock>
          </Step>

          <Step number={5} title="Adapt for Your Offer">
            <p className="mb-3">Use the "Rewritten Ad" section in each ad detail as inspiration. Modify hooks to fit your:</p>
            <ul className="space-y-2 text-slate-700">
              <li>• Product/service (change what you're selling)</li>
              <li>• Target audience (change who you're talking to)</li>
              <li>• Brand voice (formal vs casual, etc.)</li>
            </ul>
          </Step>
        </Steps>

        <SuccessBox title="Expected Outcome">
          You should have 10-15 hook variations categorized by type (urgency, pattern interrupt, question, social proof) ready to test in your own ads.
        </SuccessBox>
      </section>

      {/* Workflow 2: Tracking Brand Performance */}
      <section id="workflow-tracking" className="mt-20 scroll-mt-20">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-5xl">📊</span>
          <h2 className="text-4xl font-bold text-slate-900">Workflow 2: Tracking Brand Performance</h2>
        </div>
        <p className="text-slate-700 text-lg mb-8">
          Monitor competitor activity over time to spot trends, creative shifts, and new campaign launches.
        </p>

        <Timeline>
          <TimelineItem
            icon="📅"
            time="Day 1"
            title="Baseline Snapshot"
            description={
              <div>
                <p className="mb-3">Take an initial snapshot of competitor activity:</p>
                <ul className="space-y-2 text-slate-600">
                  <li>1. Go to Dashboard → Filter by brand</li>
                  <li>2. Set date range to "Last 30 days"</li>
                  <li>3. Note total ad count, common themes, creative formats</li>
                  <li>4. Export to CSV and save as "Baseline_[Date].csv"</li>
                </ul>
              </div>
            }
            status="completed"
          />

          <TimelineItem
            icon="🔄"
            time="Weekly"
            title="Check for New Ads"
            description={
              <div>
                <p className="mb-3">Every Monday, repeat the process:</p>
                <ul className="space-y-2 text-slate-600">
                  <li>1. Filter by "Last 7 days"</li>
                  <li>2. Review new ads - are they testing new hooks/angles?</li>
                  <li>3. Compare ad count to previous week (increase/decrease?)</li>
                  <li>4. Document any major creative shifts</li>
                </ul>
              </div>
            }
            status="current"
          />

          <TimelineItem
            icon="📈"
            time="Monthly"
            title="Trend Analysis"
            description={
              <div>
                <p className="mb-3">End of each month analysis:</p>
                <ul className="space-y-2 text-slate-600">
                  <li>1. Compare to baseline - what changed?</li>
                  <li>2. Identify most frequent ad formats (image vs video)</li>
                  <li>3. Note seasonal patterns (holidays, sales periods)</li>
                  <li>4. Update your own ad strategy based on insights</li>
                </ul>
              </div>
            }
            status="upcoming"
          />
        </Timeline>

        <InfoBox title="Pro Tip">
          Set a recurring calendar reminder for Monday mornings to check for new ads. Consistency is key for trend spotting.
        </InfoBox>
      </section>

      {/* Workflow 3: Exporting Ad Data */}
      <section id="workflow-export" className="mt-20 scroll-mt-20">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-5xl">📥</span>
          <h2 className="text-4xl font-bold text-slate-900">Workflow 3: Exporting Ad Data</h2>
        </div>
        <p className="text-slate-700 text-lg mb-8">
          Export ads with full AI analysis for team sharing, client reports, or offline analysis.
        </p>

        <Tabs>
          <Tab label="Quick Export">
            <Steps>
              <Step number={1} title="Apply Filters">
                On the Dashboard, filter ads to show only what you want to export (specific brands, date range, ad type).
              </Step>
              <Step number={2} title="Click Export">
                Click the "Export to CSV" button in the top-right corner.
              </Step>
              <Step number={3} title="Open in Spreadsheet">
                Open the downloaded CSV in Excel or Google Sheets. It includes all visible ads with full analysis.
              </Step>
            </Steps>
          </Tab>

          <Tab label="Custom Export">
            <div className="space-y-6">
              <p className="text-slate-700">For more control over exported data:</p>
              <Steps>
                <Step number={1} title="Use Search">
                  Search for specific keywords or patterns you want to export.
                </Step>
                <Step number={2} title="Combine Filters">
                  Layer multiple filters (brand + date + keyword + ad type) to get ultra-specific results.
                </Step>
                <Step number={3} title="Review Results">
                  Verify the ad grid shows exactly what you want before exporting.
                </Step>
                <Step number={4} title="Export & Format">
                  Export to CSV, then format in spreadsheet software for your specific use case (report, swipe file, etc.).
                </Step>
              </Steps>
            </div>
          </Tab>

          <Tab label="What's Included">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">CSV Export Contains:</h3>
              <StatGrid columns={3}>
                <StatCard icon="📝" label="Ad Content" value="Full" description="Body, headline, description" />
                <StatCard icon="🤖" label="AI Analysis" value="Complete" description="Hook, angle, structure, improvements" />
                <StatCard icon="📊" label="Metadata" value="All" description="Brand, date, type, URL" />
              </StatGrid>
              <CodeBlock copyable>
{`CSV Columns:
- ad_id
- brand_name
- ad_creative_body
- ad_creative_link_title
- ad_creative_link_description
- hook_analysis
- angle_analysis
- structure_analysis
- why_it_works
- improvements
- rewritten_ad
- scraped_at
- ad_url`}
              </CodeBlock>
            </div>
          </Tab>
        </Tabs>
      </section>

      {/* Workflow 4: Analyzing Ad Angles */}
      <section id="workflow-angles" className="mt-20 scroll-mt-20">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-5xl">🎨</span>
          <h2 className="text-4xl font-bold text-slate-900">Workflow 4: Analyzing Ad Angles</h2>
        </div>
        <p className="text-slate-700 text-lg mb-8">
          Understand the persuasion strategies (angles) competitors use and identify what works in your market.
        </p>

        <Tabs>
          <Tab label="Emotional Angles">
            <div className="space-y-6">
              <p className="text-slate-700 mb-4">Search for ads using emotional triggers:</p>
              <CodeBlock copyable>
{`angle:emotional OR angle:desire OR angle:fear

Common patterns:
- Fear of missing out (FOMO)
- Desire for status/belonging
- Fear of loss or failure
- Hope for transformation`}
              </CodeBlock>
              <ScreenshotCard
                title="Emotional Angle Example"
                description="Ads with emotional angles appeal to feelings rather than logic. Look for words like 'imagine', 'feel', 'transform', 'finally'."
                aspectRatio="16:9"
              />
            </div>
          </Tab>

          <Tab label="Logical Angles">
            <div className="space-y-6">
              <p className="text-slate-700 mb-4">Search for ads using facts and logic:</p>
              <CodeBlock copyable>
{`angle:logical OR angle:benefit OR angle:feature

Common patterns:
- Data and statistics (47% faster, 3x results)
- Step-by-step explanations
- Feature comparisons
- ROI calculations`}
              </CodeBlock>
              <InfoBox title="When to Use Logic">
                Logical angles work best for B2B, expensive products, or audiences in the research phase of buying.
              </InfoBox>
            </div>
          </Tab>

          <Tab label="Urgency Angles">
            <div className="space-y-6">
              <p className="text-slate-700 mb-4">Search for ads creating time pressure:</p>
              <CodeBlock copyable>
{`angle:urgency OR "limited time" OR "ending soon" OR "only [number] left"

Common patterns:
- Countdown timers
- Limited stock warnings
- Seasonal deadlines
- Early-bird pricing`}
              </CodeBlock>
              <WarningBox title="Use Urgency Ethically">
                Only use urgency if it's genuine. Fake scarcity damages trust and brand reputation long-term.
              </WarningBox>
            </div>
          </Tab>

          <Tab label="Social Proof">
            <div className="space-y-6">
              <p className="text-slate-700 mb-4">Search for ads leveraging trust signals:</p>
              <CodeBlock copyable>
{`"customer" OR "review" OR "testimonial" OR "trusted by" OR "[number] people"

Common patterns:
- Customer testimonials
- User-generated content
- Expert endorsements
- Large numbers (10,000+ customers)`}
              </CodeBlock>
            </div>
          </Tab>
        </Tabs>
      </section>

      {/* Workflow 5 & 6 - Condensed */}
      <section id="workflow-monitoring" className="mt-20 scroll-mt-20">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-5xl">🔔</span>
          <h2 className="text-4xl font-bold text-slate-900">Workflow 5: Monitoring New Ads</h2>
        </div>

        <Steps>
          <Step number={1} title="Enable Slack Notifications">
            If configured, new ads automatically post to #adspy-feed Slack channel. Check this daily for instant updates.
          </Step>
          <Step number={2} title="Set Dashboard as Homepage">
            Bookmark the Dashboard with "Last 7 days" filter. Check it every morning to see new arrivals.
          </Step>
          <Step number={3} title="Create Saved Searches">
            Save searches for specific competitors or themes, then re-run weekly to catch new matches.
          </Step>
        </Steps>
      </section>

      <section id="workflow-research" className="mt-20 scroll-mt-20">
        <div className="flex items-center gap-4 mb-8">
          <span className="text-5xl">🏢</span>
          <h2 className="text-4xl font-bold text-slate-900">Workflow 6: Industry Research</h2>
        </div>

        <Steps>
          <Step number={1} title="Add 10-15 Competitors">
            Use the Brands page to add all major players in your industry.
          </Step>
          <Step number={2} title="Wait for First Scrape">
            Allow 24-48 hours for the system to scrape ads from all brands.
          </Step>
          <Step number={3} title="Identify Common Patterns">
            <p className="mb-3">Search across all brands for:</p>
            <ul className="space-y-2 text-slate-700">
              <li>• Most common hooks (pattern analysis)</li>
              <li>• Most common angles (emotional vs logical)</li>
              <li>• Most common formats (video vs image)</li>
              <li>• Most common CTAs ("Shop Now" vs "Learn More")</li>
            </ul>
          </Step>
          <Step number={4} title="Spot Market Gaps">
            Find angles or hooks that NO competitor is using - these are opportunities for differentiation.
          </Step>
        </Steps>
      </section>

      <PageNavigation prev={prev} next={next} />
    </div>
  )
}
