'use client'

import { useState, useEffect } from 'react'
import { Ad, getAds, getAdCount, getBrandNames, SearchFilters, AdCount } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Search, Filter, ChevronLeft, ChevronRight, Video, Image as ImageIcon, ExternalLink } from 'lucide-react'
import { AdDetailModal } from '@/components/ads/ad-detail-modal'

export default function Dashboard() {
  const [ads, setAds] = useState<Ad[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [count, setCount] = useState<AdCount>({ total: 0, videos: 0, images: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Filter state
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    brand: '',
    dateFrom: '',
    dateTo: '',
    adType: 'all',
    isActive: undefined,
    limit: 20,
    offset: 0,
  })

  // Pagination
  const currentPage = Math.floor((filters.offset || 0) / (filters.limit || 20)) + 1
  const totalPages = Math.ceil(count.total / (filters.limit || 20))

  // Fetch brands on mount
  useEffect(() => {
    loadBrands()
  }, [])

  // Fetch ads when filters change
  useEffect(() => {
    loadAds()
  }, [filters])

  async function loadBrands() {
    try {
      const brandNames = await getBrandNames()
      setBrands(brandNames)
    } catch (err) {
      console.error('Failed to load brands:', err)
    }
  }

  async function loadAds() {
    try {
      setLoading(true)
      setError(null)

      // Clean up filters (remove empty strings)
      const cleanFilters: SearchFilters = {
        ...filters,
        query: filters.query || undefined,
        brand: filters.brand || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      }

      const [adsData, countData] = await Promise.all([
        getAds(cleanFilters),
        getAdCount(cleanFilters),
      ])

      setAds(adsData)
      setCount(countData)
    } catch (err) {
      console.error('Failed to load ads:', err)
      setError(err instanceof Error ? err.message : 'Failed to load ads')
    } finally {
      setLoading(false)
    }
  }

  function updateFilter(key: keyof SearchFilters, value: any) {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0, // Reset to first page when filters change
    }))
  }

  function nextPage() {
    if (currentPage < totalPages) {
      setFilters(prev => ({
        ...prev,
        offset: (prev.offset || 0) + (prev.limit || 20),
      }))
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      setFilters(prev => ({
        ...prev,
        offset: Math.max(0, (prev.offset || 0) - (prev.limit || 20)),
      }))
    }
  }

  function viewAdDetails(ad: Ad) {
    setSelectedAd(ad)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-black">
          Ad Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Browse and analyze all scraped ads with advanced filters
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Ads</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div className="text-3xl font-bold text-black">{count.total}</div>
            )}
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Video Ads</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div className="text-3xl font-bold text-black">{count.videos}</div>
            )}
          </CardContent>
        </Card>
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Image Ads</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div className="text-3xl font-bold text-black">{count.images}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-black/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search Query */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search ads..."
                  value={filters.query || ''}
                  onChange={(e) => updateFilter('query', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Brand</label>
              <Select value={filters.brand || 'all'} onValueChange={(val) => updateFilter('brand', val === 'all' ? '' : val)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ad Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Ad Type</label>
              <Select value={filters.adType || 'all'} onValueChange={(val) => updateFilter('adType', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select
                value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'}
                onValueChange={(val) => updateFilter('isActive', val === 'all' ? undefined : val === 'active')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">From Date</label>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
              />
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">To Date</label>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="border-black/10">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg">
              {loading ? 'Loading...' : `${count.total} Ad${count.total !== 1 ? 's' : ''} Found`}
            </CardTitle>

            {/* Pagination Controls */}
            {!loading && count.total > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 hidden sm:inline">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600 sm:hidden px-3 py-2">
                    {currentPage}/{totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className="transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-800 border border-red-200">
              {error}
            </div>
          )}

          {loading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-4 w-64" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-16 w-full" />
                      <div className="grid gap-3 md:grid-cols-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && !error && ads.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No ads found. Try adjusting your filters.
            </div>
          )}

          {!loading && !error && ads.length > 0 && (
            <div className="space-y-4">
              {ads.map((ad) => (
                <Card
                  key={ad.id}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer border-black/10 hover:border-black/20"
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg text-black">
                              {ad.brand_name || 'Unknown Brand'}
                            </h3>
                            {ad.is_active && <Badge variant="default" className="bg-green-500">Active</Badge>}
                            {!ad.is_active && <Badge variant="secondary">Inactive</Badge>}
                            {ad.ad_type === 'video' && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Video className="h-3 w-3" />
                                Video
                              </Badge>
                            )}
                            {ad.ad_type === 'image' && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <ImageIcon className="h-3 w-3" />
                                Image
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            ID: {ad.ad_id} • Scraped: {new Date(ad.scraped_at).toLocaleDateString()}
                          </p>
                        </div>

                        {ad.ad_url && (
                          <a
                            href={ad.ad_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            View Ad
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>

                      {/* Ad Tags - Compact Summary */}
                      <div className="flex flex-wrap gap-2">
                        {/* Media Type Badge */}
                        {ad.ad_creative_url && (
                          <Badge variant="default" className="bg-blue-100 text-blue-700 border-blue-200">
                            {ad.ad_creative_url.includes('.mp4') || ad.transcript ? '🎥 Video' : '🖼️ Image'}
                          </Badge>
                        )}

                        {/* Hook Type Badge */}
                        {ad.hook_analysis && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                            🎣 {ad.hook_analysis.split(/[:.,-]/)[0].substring(0, 30)}
                            {ad.hook_analysis.split(/[:.,-]/)[0].length > 30 ? '...' : ''}
                          </Badge>
                        )}

                        {/* Angle Badge */}
                        {ad.angle_analysis && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                            📐 {ad.angle_analysis.split(/[:.,-]/)[0].substring(0, 30)}
                            {ad.angle_analysis.split(/[:.,-]/)[0].length > 30 ? '...' : ''}
                          </Badge>
                        )}

                        {/* Structure Badge */}
                        {ad.structure_analysis && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                            🏗️ {ad.structure_analysis.split(/[:.,-]/)[0].substring(0, 30)}
                            {ad.structure_analysis.split(/[:.,-]/)[0].length > 30 ? '...' : ''}
                          </Badge>
                        )}

                        {/* Brand Badge */}
                        {ad.brand_name && (
                          <Badge variant="outline" className="bg-gray-50">
                            🏢 {ad.brand_name}
                          </Badge>
                        )}

                        {/* Date Badge */}
                        {ad.scraped_at && (
                          <Badge variant="outline" className="bg-gray-50 text-gray-600">
                            📅 {new Date(ad.scraped_at).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full transition-colors hover:bg-black hover:text-white"
                          onClick={() => viewAdDetails(ad)}
                        >
                          View Full Analysis
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Pagination */}
      {!loading && count.total > 0 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <span className="text-sm text-gray-600 px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={nextPage}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Ad Detail Modal */}
      <AdDetailModal
        ad={selectedAd}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  )
}
