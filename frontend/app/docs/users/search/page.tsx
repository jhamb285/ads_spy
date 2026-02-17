import { Metadata } from 'next'
import { PageHeader } from '@/components/docs/PageHeader'
import { Breadcrumbs } from '@/components/docs/Breadcrumbs'
import { PageNavigation } from '@/components/docs/PageNavigation'
import { StatCard, StatGrid } from '@/components/docs/StatCard'
import { ScreenshotCard } from '@/components/docs/ScreenshotCard'
import { Accordion } from '@/components/docs/Accordion'
import { CodeBlock } from '@/components/docs/CodeBlock'
import { ComparisonTable } from '@/components/docs/ComparisonTable'
import { Timeline, TimelineItem } from '@/components/docs/Timeline'
import { InfoBox, SuccessBox, WarningBox } from '@/components/docs/CalloutBox'
import { FeatureGrid, Feature } from '@/components/docs/FeatureCard'
import { getPageNavigation } from '@/lib/docs-config'

export const metadata: Metadata = {
  title: 'Search & Discovery - AdSpy Tool Documentation',
  description: 'Master advanced search techniques for powerful competitor research',
}

export default function SearchGuidePage() {
  const { prev, next} = getPageNavigation('/docs/users/search')

  return (
    <div>
      <Breadcrumbs items={[{ label: 'For Users', href: '/docs/users' }, { label: 'Search & Discovery' }]} />
      <PageHeader
        title="Search & Discovery"
        description="Master advanced search techniques to uncover competitor insights and winning ad patterns"
        icon="🔍"
      />

      {/* Search Overview */}
      <section className="mt-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Search Capabilities</h2>
        <StatGrid columns={4}>
          <StatCard
            icon="📝"
            label="Searchable Fields"
            value="5"
            variant="primary"
            description="Body, headline, description, hook, angle"
          />
          <StatCard
            icon="🎯"
            label="Search Operators"
            value="8+"
            variant="success"
            description="Boolean, phrase, wildcard, field-specific"
          />
          <StatCard
            icon="⚡"
            label="Speed"
            value="< 100ms"
            variant="warning"
            description="Instant results with database indexing"
          />
          <StatCard
            icon="💾"
            label="Saved Searches"
            value="Unlimited"
            variant="default"
            description="Save and reuse complex queries"
          />
        </StatGrid>
      </section>

      {/* Basic Search */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Basic Search</h2>
        <p className="text-slate-700 text-lg mb-8">
          The simplest way to find ads is by typing keywords into the search bar. The system searches across multiple fields simultaneously.
        </p>

        <ScreenshotCard
          title="Search Bar Location"
          description="The search bar is prominently displayed at the top of the Dashboard and Search pages. Type any keyword and press Enter to see results instantly."
          aspectRatio="16:9"
        />

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Basic Search Examples</h3>
          <CodeBlock copyable>
{`# Single keyword
discount

# Multiple keywords (searches for ads containing ANY of these words)
sale promotion offer

# Case-insensitive (automatically)
DISCOUNT = discount = Discount

# Numbers and special characters
50% off
$100`}
          </CodeBlock>
        </div>

        <InfoBox title="How Basic Search Works">
          When you type keywords, the system searches across:
          <ul className="space-y-2 text-blue-800 mt-3">
            <li>• <strong>Ad Body:</strong> Main ad copy text</li>
            <li>• <strong>Headline:</strong> Ad title/headline</li>
            <li>• <strong>Link Description:</strong> Landing page description</li>
            <li>• <strong>Hook Analysis:</strong> AI-generated hook breakdown</li>
            <li>• <strong>Angle Analysis:</strong> AI-identified persuasion angle</li>
          </ul>
        </InfoBox>
      </section>

      {/* Advanced Search */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Advanced Search Techniques</h2>
        <p className="text-slate-700 text-lg mb-8">
          Use advanced operators to create precise, powerful searches that uncover exactly what you're looking for.
        </p>

        <Accordion title="Boolean Operators (AND, OR, NOT)">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">AND Operator</h4>
              <p className="text-slate-700 mb-3">
                Finds ads that contain ALL specified keywords. Use when you want to narrow results.
              </p>
              <CodeBlock copyable>
{`# Both words must appear
discount AND limited

# Multiple AND conditions
summer AND sale AND clearance

# Result: Only ads mentioning all three terms`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">OR Operator</h4>
              <p className="text-slate-700 mb-3">
                Finds ads containing ANY of the specified keywords. Use when you want to broaden results.
              </p>
              <CodeBlock copyable>
{`# Either word can appear
sale OR discount OR promotion

# Result: Ads mentioning any of these terms`}
              </CodeBlock>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">NOT Operator</h4>
              <p className="text-slate-700 mb-3">
                Excludes ads containing specified keywords. Use to filter out unwanted results.
              </p>
              <CodeBlock copyable>
{`# Find sale ads but exclude Black Friday
sale NOT "Black Friday"

# Result: Sale ads that don't mention Black Friday`}
              </CodeBlock>
            </div>
          </div>
        </Accordion>

        <Accordion title="Phrase Matching (Exact Quotes)">
          <div className="space-y-6">
            <p className="text-slate-700">
              Use double quotes to search for exact phrases. This is powerful for finding specific hooks, taglines, or CTA text.
            </p>
            <CodeBlock copyable>
{`# Exact phrase
"limited time offer"

# Multiple exact phrases (OR logic)
"buy now" OR "shop now" OR "get started"

# Exact phrase + additional keywords
"free shipping" AND checkout`}
            </CodeBlock>

            <SuccessBox title="Pro Tip">
              Phrase matching is perfect for finding ads that copied a specific hook or CTA. If you see a winning pattern, search for the exact phrase to find similar ads.
            </SuccessBox>
          </div>
        </Accordion>

        <Accordion title="Wildcard Searches (* and ?)">
          <div className="space-y-6">
            <p className="text-slate-700">
              Wildcards let you search for partial words or variations. Use * for multiple characters, ? for single character.
            </p>
            <CodeBlock copyable>
{`# Asterisk (*) - replaces multiple characters
dis* → matches discount, discounts, discover, distribution

# Question mark (?) - replaces single character
sh?p → matches shop, ship

# Combined wildcards
*sale* → matches presale, wholesale, salesforce, etc.

# Prefix matching
free* → matches free, freedom, freestyle, freebie`}
            </CodeBlock>

            <WarningBox title="Wildcard Performance">
              Leading wildcards (*sale) can be slow on large datasets. Prefer trailing wildcards (sale*) when possible for better performance.
            </WarningBox>
          </div>
        </Accordion>
      </section>

      {/* Search Tips */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Search Optimization Tips</h2>
        <FeatureGrid>
          <Feature icon="🎯" title="Start Specific, Then Broaden">
            Begin with precise queries. If you get too few results, gradually remove constraints or add OR operators.
          </Feature>
          <Feature icon="📝" title="Use Quotes for Phrases">
            Exact phrase matching ("limited time offer") is more accurate than separate keywords (limited time offer).
          </Feature>
          <Feature icon="🔄" title="Combine Filters + Search">
            Use dashboard filters (brand, date, type) alongside search for ultra-targeted results.
          </Feature>
          <Feature icon="💡" title="Search Hook & Angle Fields">
            The AI analysis fields (hook:, angle:) often reveal patterns not visible in ad copy alone.
          </Feature>
        </FeatureGrid>
      </section>

      {/* Common Search Patterns */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Common Search Patterns</h2>
        <p className="text-slate-700 text-lg mb-8">
          Proven search queries for common competitive research tasks.
        </p>

        <ComparisonTable
          headers={['Use Case', 'Search Query', 'What It Finds']}
          rows={[
            {
              label: 'Finding urgency hooks',
              values: [
                'hook:urgency OR "limited time" OR "ending soon"',
                'Ads using time-pressure tactics',
              ],
            },
            {
              label: 'Competitor CTAs',
              values: [
                'brand:Nike AND ("shop now" OR "buy now")',
                'Nike ads with specific CTAs',
              ],
            },
            {
              label: 'Emotional storytelling',
              values: [
                'angle:emotional AND structure:storytelling',
                'Ads combining emotion + story format',
              ],
            },
            {
              label: 'Discount strategies',
              values: [
                '(50% OR free OR "buy one get one") NOT clearance',
                'Discount ads excluding clearance',
              ],
            },
          ]}
        />
      </section>

      <PageNavigation prev={prev} next={next} />
    </div>
  )
}
