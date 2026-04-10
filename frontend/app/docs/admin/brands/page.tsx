import { Metadata } from 'next'
import { PageHeader } from '@/components/docs/PageHeader'
import { Breadcrumbs } from '@/components/docs/Breadcrumbs'
import { PageNavigation } from '@/components/docs/PageNavigation'
import { Steps, Step } from '@/components/docs/StepCard'
import { InfoBox, SuccessBox, WarningBox } from '@/components/docs/CalloutBox'
import { FeatureGrid, Feature } from '@/components/docs/FeatureCard'
import { CodeBlock } from '@/components/docs/CodeBlock'
import { Tabs, Tab } from '@/components/docs/Tabs'
import { Accordion } from '@/components/docs/Accordion'
import { Badge } from '@/components/docs/Badge'
import { getPageNavigation } from '@/lib/docs-config'

export const metadata: Metadata = {
  title: 'Brand Management - AdSpy Tool Documentation',
  description: 'Complete guide to managing brands in the AdSpy Tool',
}

export default function BrandManagementPage() {
  const { prev, next } = getPageNavigation('/docs/admin/brands')

  return (
    <div>
      <Breadcrumbs items={[
        { label: 'For Admins', href: '/docs/admin' },
        { label: 'Brand Management' }
      ]} />

      <PageHeader
        title="Brand Management"
        description="Manage which brands and Facebook pages to track for competitor ad intelligence"
        icon="🏷️"
      />

      {/* Quick Access */}
      <InfoBox>
        Access brand management at: <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">/brands</code>
      </InfoBox>

      {/* Feature Overview */}
      <section className="mt-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">What You Can Do</h2>
        <FeatureGrid>
          <Feature icon="➕" title="Add Brands">
            Track new brands and their Facebook pages
          </Feature>
          <Feature icon="✏️" title="Edit Brands">
            Update brand details and settings
          </Feature>
          <Feature icon="📄" title="Multi-Page Support">
            Track multiple Facebook pages per brand
          </Feature>
          <Feature icon="⚙️" title="Custom Settings">
            Override global scraping limits per brand
          </Feature>
        </FeatureGrid>
      </section>

      {/* Page Layout */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Page Layout</h2>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Badge color="blue">Filter Tabs</Badge>
            <span className="text-slate-700">All / Active / Inactive (with counts)</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge color="purple">Search Bar</Badge>
            <span className="text-slate-700">Search brands by name or avatar</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge color="green">Add Brand Button</Badge>
            <span className="text-slate-700">Opens brand creation dialog</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge color="gray">Brand Table</Badge>
            <span className="text-slate-700">Avatar, Name, Status, Actions (Pages, Settings, Edit, Delete)</span>
          </div>
        </div>
      </section>

      {/* Adding a Brand */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Adding a New Brand</h2>

        <Steps>
          <Step number={1} title="Open Add Brand Dialog">
            Click the <Badge color="green">Add Brand</Badge> button in the top-right corner
          </Step>

          <Step number={2} title="Fill Required Fields">
            <div className="space-y-4 mt-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="font-semibold text-slate-900 mb-1">Brand Name <span className="text-red-500">*</span></div>
                <div className="text-sm text-slate-600">Full brand name (e.g., "Nike", "Adidas")</div>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="font-semibold text-slate-900 mb-1">Page URL <span className="text-red-500">*</span></div>
                <div className="text-sm text-slate-600">Facebook page URL</div>
                <CodeBlock copyable>
https://facebook.com/nike
                </CodeBlock>
              </div>
              <div className="border-l-4 border-slate-300 pl-4">
                <div className="font-semibold text-slate-900 mb-1">Avatar <span className="text-slate-400">(optional)</span></div>
                <div className="text-sm text-slate-600">Emoji or category (e.g., "🏃 Sports", "💄 Beauty")</div>
              </div>
              <div className="border-l-4 border-slate-300 pl-4">
                <div className="font-semibold text-slate-900 mb-1">Active Toggle</div>
                <div className="text-sm text-slate-600">Turn ON to start tracking immediately</div>
              </div>
            </div>
          </Step>

          <Step number={3} title="Submit">
            Click <Badge color="green">Add Brand</Badge> to save
          </Step>
        </Steps>

        <SuccessBox title="Auto-Actions After Adding">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✅</span>
              <span>Brand added to database</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">📢</span>
              <span>Slack notification sent to <code className="bg-green-100 px-2 py-1 rounded">#adspy-feed</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">📊</span>
              <span>Google Sheets automatically updated</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">🔄</span>
              <span>Table refreshes with new brand</span>
            </li>
          </ul>
        </SuccessBox>
      </section>

      {/* Common Tasks */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Common Tasks</h2>

        <Tabs>
          <Tab label="Edit Brand">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900">How to Edit a Brand</h3>
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">1.</span>
                  <div>Find brand in table</div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">2.</span>
                  <div>Click <strong>Edit icon</strong> (pencil icon)</div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">3.</span>
                  <div>Update fields: Avatar, Brand Name, Active status, Min Active Days</div>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">4.</span>
                  <div>Click <Badge color="blue">Update Brand</Badge></div>
                </li>
              </ol>
              <InfoBox>
                Changes automatically sync to Slack and Google Sheets
              </InfoBox>
            </div>
          </Tab>

          <Tab label="Manage Pages">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900">Multi-Page Support</h3>
              <p className="text-slate-700">Many brands have multiple Facebook pages. Track them all!</p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-3">Steps:</h4>
                <ol className="space-y-2 text-blue-800">
                  <li>1. Click <strong>Pages icon</strong> (blue file icon) on brand row</li>
                  <li>2. Click <strong>Add Page</strong> in the dialog</li>
                  <li>3. Enter Facebook page URL</li>
                  <li>4. Toggle Active ON</li>
                  <li>5. Click <strong>Add Page</strong></li>
                </ol>
              </div>

              <h4 className="font-semibold text-slate-900 mt-6">Use Cases:</h4>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  Nike has regional pages (Nike USA, Nike UK, Nike Australia) → Track all
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  Brand rebr ands to new page → Add new page, deactivate old
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  Temporary pause on specific page → Toggle inactive
                </li>
              </ul>
            </div>
          </Tab>

          <Tab label="Custom Settings">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900">Brand-Specific Settings</h3>
              <p className="text-slate-700">Override global scraping limits for specific brands</p>

              <Accordion title="How to Set Custom Settings">
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="font-bold text-purple-600">1.</span>
                    <div>Click <strong>Settings icon</strong> (purple gear) on brand row</div>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-purple-600">2.</span>
                    <div>Toggle <strong>Use Custom Settings</strong> ON</div>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-purple-600">3.</span>
                    <div>Set custom values for Max Ads Per Scrape and Max Daily Ads</div>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-purple-600">4.</span>
                    <div>Click <Badge color="purple">Save Settings</Badge></div>
                  </li>
                </ol>
              </Accordion>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="font-semibold text-green-900 mb-2">High-Value Brand</div>
                  <div className="text-sm text-green-800">Set Max Ads to <strong>50</strong> (vs global 10)</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="font-semibold text-yellow-900 mb-2">Low-Priority Brand</div>
                  <div className="text-sm text-yellow-800">Set Max Ads to <strong>3</strong> (vs global 10)</div>
                </div>
              </div>
            </div>
          </Tab>

          <Tab label="Delete Brand">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900">Deleting a Brand</h3>

              <WarningBox title="Caution: This Action Cannot Be Undone">
                Deleting a brand will remove:
                <ul className="mt-3 space-y-1">
                  <li>• The brand record from database</li>
                  <li>• All associated Facebook pages</li>
                  <li>• Brand settings and overrides</li>
                </ul>
                <p className="mt-3 font-semibold">Historical ads are preserved in the database.</p>
              </WarningBox>

              <h4 className="font-semibold text-slate-900 mt-6">Steps to Delete:</h4>
              <ol className="space-y-2 text-slate-700">
                <li>1. Find brand in table</li>
                <li>2. Click <strong>Delete icon</strong> (red trash icon)</li>
                <li>3. Confirm deletion in dialog</li>
                <li>4. Brand removed immediately</li>
              </ol>
            </div>
          </Tab>
        </Tabs>
      </section>

      {/* Best Practices */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
            <h3 className="font-bold text-blue-900 mb-2">✅ DO</h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li>• Use descriptive avatars for easy identification</li>
              <li>• Enable high-value brands immediately</li>
              <li>• Set custom limits for important brands</li>
              <li>• Add all regional pages for global brands</li>
            </ul>
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-lg">
            <h3 className="font-bold text-red-900 mb-2">❌ DON'T</h3>
            <ul className="space-y-2 text-red-800 text-sm">
              <li>• Delete brands unless absolutely necessary</li>
              <li>• Use same page URL for multiple brands</li>
              <li>• Set extremely high limits (causes rate limits)</li>
              <li>• Forget to check Slack notifications</li>
            </ul>
          </div>
        </div>
      </section>

      <PageNavigation prev={prev} next={next} />
    </div>
  )
}
