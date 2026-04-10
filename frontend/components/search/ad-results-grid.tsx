'use client'

import { Ad } from '@/lib/types'
import { AdCard } from './ad-card'

interface AdResultsGridProps {
  results: Ad[]
  query: string
  onAdClick: (ad: Ad) => void
}

export function AdResultsGrid({ results, query, onAdClick }: AdResultsGridProps) {
  if (results.length === 0) {
    return (
      <div className="rounded-lg border border-black/10 p-12 text-center">
        <p className="text-gray-500">
          No ads found matching <strong>"{query}"</strong>. Try a different search term.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Found <strong>{results.length}</strong> {results.length === 1 ? 'ad' : 'ads'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {results.map((ad) => (
          <AdCard key={ad.id} ad={ad} onClick={onAdClick} />
        ))}
      </div>
    </div>
  )
}
