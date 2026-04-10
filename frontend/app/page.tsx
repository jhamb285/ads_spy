import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Search, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-black">
          AdSpy Tool
        </h1>
        <p className="text-lg text-gray-600">
          Self-hosted competitor ad intelligence platform. Scrape, analyze, and learn from competitor ads.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-black/10 hover:shadow-lg transition-shadow">
          <CardHeader>
            <Database className="h-8 w-8 mb-2 text-black" />
            <CardTitle>Brand Management</CardTitle>
            <CardDescription>
              Add and manage brands to track. View scraping history and performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/brands">
              <Button className="w-full">
                Manage Brands
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-black/10 hover:shadow-lg transition-shadow">
          <CardHeader>
            <TrendingUp className="h-8 w-8 mb-2 text-black" />
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>
              Browse all ads with advanced filters and detailed analytics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button className="w-full">
                View Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-black/10 hover:shadow-lg transition-shadow">
          <CardHeader>
            <Search className="h-8 w-8 mb-2 text-black" />
            <CardTitle>Search Ads</CardTitle>
            <CardDescription>
              Quick search through scraped ads by keywords, hooks, angles, and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/search">
              <Button className="w-full" variant="outline">
                Search Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black text-white border-black">
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription className="text-gray-400">
            Get started with AdSpy Tool in 3 simple steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black text-sm font-bold">
                1
              </span>
              <div>
                <p className="font-medium">Add Brands</p>
                <p className="text-sm text-gray-400">
                  Go to Brand Management and add Facebook pages you want to track
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black text-sm font-bold">
                2
              </span>
              <div>
                <p className="font-medium">Scrape Ads</p>
                <p className="text-sm text-gray-400">
                  The system automatically scrapes and analyzes ads daily
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black text-sm font-bold">
                3
              </span>
              <div>
                <p className="font-medium">Search & Learn</p>
                <p className="text-sm text-gray-400">
                  Search ads, analyze breakdowns, and learn what works
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
