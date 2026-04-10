'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { searchAds, Ad } from '@/lib/api'
import { SearchBar } from './search-bar'
import { AdResultsGrid } from './ad-results-grid'
import { Skeleton } from '@/components/ui/skeleton'
import { AdDetailModal } from '@/components/ads/ad-detail-modal'

export function SearchInterface() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const { data: results, error, isLoading } = useSWR(
    debouncedQuery ? ['search', debouncedQuery] : null,
    () => searchAds(debouncedQuery)
  )

  function viewAdDetails(ad: Ad) {
    setSelectedAd(ad)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <SearchBar query={query} onQueryChange={setQuery} />

      {!debouncedQuery ? (
        <div className="rounded-lg border border-black/10 p-12 text-center">
          <p className="text-gray-500">
            Enter a search query to find ads by keywords, hooks, angles, or structures.
          </p>
        </div>
      ) : isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-12 text-center">
          <p className="text-red-600">Failed to search ads: {error.message}</p>
        </div>
      ) : (
        <AdResultsGrid
          results={results || []}
          query={debouncedQuery}
          onAdClick={viewAdDetails}
        />
      )}

      <AdDetailModal
        ad={selectedAd}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  )
}
