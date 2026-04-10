'use client'

import { useEffect, useState } from 'react'

interface Section {
  id: string
  title: string
  level: number
}

interface DocsClientProps {
  sections: Section[]
  htmlContent: string
}

export default function DocsClient({ sections, htmlContent }: DocsClientProps) {
  const [activeSection, setActiveSection] = useState<string>('')

  useEffect(() => {
    // Intersection Observer for active section highlighting
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -80% 0px' }
    )

    // Observe all h2 and h3 elements
    const headings = document.querySelectorAll('h2, h3')
    headings.forEach((heading) => observer.observe(heading))

    return () => {
      headings.forEach((heading) => observer.unobserve(heading))
    }
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Documentation</h1>
              <p className="text-xs text-slate-500">AdSpy Tool User Guide</p>
            </div>
          </div>
          <a
            href="/"
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            ← Back to App
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar Navigation */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 flex-shrink-0 overflow-y-auto border-r border-slate-200 bg-white/50 backdrop-blur-sm p-6 lg:block">
          <div className="space-y-1">
            <div className="mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Table of Contents
              </h2>
            </div>
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`block w-full text-left rounded-md px-3 py-2 text-sm transition-all ${
                  section.level === 2 ? 'font-medium' : 'pl-6 text-slate-600'
                } ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-500'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-6 py-8 lg:px-12">
          <div className="mx-auto max-w-4xl">
            <div
              className="docs-content space-y-8"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {/* Footer */}
            <div className="mt-20 border-t border-slate-200 pt-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 p-8 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Need Help?</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    If you can't find what you're looking for, contact support or return to the dashboard.
                  </p>
                </div>
                <a
                  href="/"
                  className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl hover:scale-105"
                >
                  Go to Dashboard
                </a>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Quick Links */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 flex-shrink-0 overflow-y-auto p-6 xl:block">
          <div className="space-y-6">
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Quick Links
              </h3>
              <div className="space-y-2">
                <a
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <span className="text-blue-500">→</span> Dashboard
                </a>
                <a
                  href="/brands"
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <span className="text-blue-500">→</span> Manage Brands
                </a>
                <a
                  href="/search"
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <span className="text-blue-500">→</span> Search Ads
                </a>
                <a
                  href="/settings"
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <span className="text-blue-500">→</span> Settings
                </a>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border border-blue-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-2">
                Version Info
              </h3>
              <p className="text-sm font-semibold text-slate-800">v1.0</p>
              <p className="text-xs text-slate-600 mt-1">Updated Jan 18, 2026</p>
            </div>

            <div className="rounded-lg bg-green-50 p-4 border border-green-200">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-green-700 mb-2">
                Status
              </h3>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">All Systems Operational</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <style jsx global>{`
        .docs-content h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 1rem;
          line-height: 1.2;
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .docs-content h2 {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1e293b;
          margin-top: 4rem;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 3px solid #e2e8f0;
          position: relative;
          scroll-margin-top: 5rem;
        }

        .docs-content h2::before {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 60px;
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
        }

        .docs-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #334155;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          scroll-margin-top: 5rem;
        }

        .docs-content p {
          color: #475569;
          line-height: 1.8;
          margin: 1.5rem 0;
          font-size: 1rem;
        }

        .docs-content strong {
          color: #1e293b;
          font-weight: 600;
        }

        .docs-content ul {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
          list-style: none;
        }

        .docs-content ul li {
          position: relative;
          padding-left: 1.75rem;
          margin: 0.875rem 0;
          color: #475569;
          line-height: 1.75;
        }

        .docs-content ul li::before {
          content: '●';
          position: absolute;
          left: 0;
          color: #3b82f6;
          font-weight: bold;
        }

        .docs-content ol {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
          counter-reset: item;
          list-style: none;
        }

        .docs-content ol li {
          position: relative;
          padding-left: 2rem;
          margin: 1rem 0;
          color: #475569;
          line-height: 1.75;
          counter-increment: item;
        }

        .docs-content ol li::before {
          content: counter(item) ".";
          position: absolute;
          left: 0;
          color: #3b82f6;
          font-weight: 700;
          font-size: 1.1em;
        }

        .docs-content code {
          background: #f1f5f9;
          color: #e11d48;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-family: 'Monaco', 'Menlo', monospace;
          border: 1px solid #e2e8f0;
        }

        .docs-content pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1.5rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 2rem 0;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          border: 1px solid #334155;
        }

        .docs-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
          border: none;
          font-size: 0.875rem;
        }

        .docs-content a {
          color: #3b82f6;
          font-weight: 500;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: all 0.2s;
        }

        .docs-content a:hover {
          color: #2563eb;
          border-bottom-color: #3b82f6;
        }

        .docs-content blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #64748b;
          background: #f8fafc;
          padding: 1.25rem 1.5rem;
          border-radius: 0 0.5rem 0.5rem 0;
        }

        .docs-content hr {
          border: none;
          height: 2px;
          background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
          margin: 3rem 0;
        }

        /* Success/Info/Warning/Error boxes */
        .docs-content p:has(> strong:first-child) {
          padding: 1.25rem 1.5rem;
          border-radius: 0.75rem;
          margin: 2rem 0;
          border-left: 4px solid;
        }

        /* Detect context by keywords */
        .docs-content p:has(> strong:contains("Success")),
        .docs-content p:has(> strong:contains("✅")),
        .docs-content p:has(> strong:contains("Complete")) {
          background: #f0fdf4;
          border-left-color: #22c55e;
        }

        .docs-content p:has(> strong:contains("Warning")),
        .docs-content p:has(> strong:contains("⚠️")),
        .docs-content p:has(> strong:contains("Note")) {
          background: #fefce8;
          border-left-color: #eab308;
        }

        .docs-content p:has(> strong:contains("Error")),
        .docs-content p:has(> strong:contains("❌")),
        .docs-content p:has(> strong:contains("Important")) {
          background: #fef2f2;
          border-left-color: #ef4444;
        }

        .docs-content p:has(> strong:contains("Info")),
        .docs-content p:has(> strong:contains("ℹ️")),
        .docs-content p:has(> strong:contains("Tip")) {
          background: #eff6ff;
          border-left-color: #3b82f6;
        }

        /* Table styling */
        .docs-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
          border-radius: 0.75rem;
          overflow: hidden;
        }

        .docs-content th {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .docs-content td {
          padding: 1rem;
          border-top: 1px solid #e2e8f0;
          color: #475569;
        }

        .docs-content tr:hover {
          background: #f8fafc;
        }

        /* Checkbox styling */
        .docs-content p:contains("✅") {
          color: #16a34a;
          font-weight: 500;
        }

        .docs-content p:contains("☐") {
          color: #64748b;
        }
      `}</style>
    </div>
  )
}
