import { Metadata } from 'next'
import Link from 'next/link'
import { FeatureGrid, Feature } from '@/components/docs/FeatureCard'
import { InfoBox } from '@/components/docs/CalloutBox'
import { docsNav } from '@/lib/docs-config'

export const metadata: Metadata = {
  title: 'Guide - AdSpy Tool',
  description: 'Complete guide for the AdSpy Tool',
}

export default function DocsHomePage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-6xl">📚</span>
          <div>
            <h1 className="text-5xl font-bold text-slate-900 mb-2">
              AdSpy Tool Guide
            </h1>
            <p className="text-xl text-slate-600">
              Everything you need to master the AdSpy Tool
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <InfoBox title="New here?">
        Start with our{' '}
        <Link href="/docs/getting-started" className="text-slate-900 hover:underline font-medium">
          Getting Started Guide
        </Link>{' '}
        to set up and learn the basics in just 5 minutes.
      </InfoBox>

      {/* Main Sections Grid */}
      <div className="mt-12 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {docsNav.map((section) => (
            <Link
              key={section.path}
              href={section.children && section.children.length > 0 ? section.children[0].path : section.path}
              className="group bg-white border border-slate-200 rounded-xl p-8 hover:shadow-xl hover:border-slate-300 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="text-5xl group-hover:scale-110 transition-transform">
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">
                    {section.title}
                  </h3>
                  {section.children && section.children.length > 0 ? (
                    <ul className="space-y-1.5 mt-4">
                      {section.children.map((child) => (
                        <li key={child.path} className="text-sm text-slate-600 flex items-center gap-2">
                          <span className="text-slate-400">→</span>
                          {child.title}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-600 text-sm">Quick start guide and initial setup</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular Topics */}
      <div className="mt-16 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Popular Topics</h2>
        <FeatureGrid>
          <Feature icon="➕" title="Adding Brands">
            Learn how to add and manage brands to track
          </Feature>
          <Feature icon="🔍" title="Searching Ads">
            Discover powerful search features to find relevant ads
          </Feature>
          <Feature icon="⚙️" title="Configuring Settings">
            Customize scraping limits and global settings
          </Feature>
          <Feature icon="🔧" title="Troubleshooting">
            Solutions to common issues and errors
          </Feature>
        </FeatureGrid>
      </div>

      {/* Additional Resources */}
      <div className="mt-16 pt-12 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="font-semibold text-slate-900 mb-2">Quick Start</h3>
            <p className="text-sm text-slate-600 mb-4">Get up and running in 5 minutes</p>
            <Link href="/docs/getting-started" className="text-slate-900 hover:underline text-sm font-medium">
              View Guide →
            </Link>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">💡</div>
            <h3 className="font-semibold text-slate-900 mb-2">Tips & Tricks</h3>
            <p className="text-sm text-slate-600 mb-4">Best practices for power users</p>
            <Link href="/docs/reference/tips" className="text-slate-900 hover:underline text-sm font-medium">
              Learn More →
            </Link>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">🆘</div>
            <h3 className="font-semibold text-slate-900 mb-2">Get Help</h3>
            <p className="text-sm text-slate-600 mb-4">Need assistance? We're here</p>
            <Link href="/docs/reference/support" className="text-slate-900 hover:underline text-sm font-medium">
              Contact Support →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
