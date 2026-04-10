'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { getBrands } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BrandTable } from './brand-table'
import { AddBrandDialog } from './add-brand-dialog'
import { Search, Plus } from 'lucide-react'

type FilterType = 'all' | 'active' | 'inactive'

export function BrandList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')

  const { data: brands, error, mutate } = useSWR('brands', () => getBrands())

  const filteredBrands = brands
    ?.filter((brand) => {
      // Filter by status
      if (filter === 'active') return brand.active
      if (filter === 'inactive') return !brand.active
      return true
    })
    .filter((brand) => {
      // Filter by search query
      return (
        brand.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.avatar.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load brands: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  if (!brands) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const activeCount = brands?.filter((b) => b.active).length || 0
  const inactiveCount = brands?.filter((b) => !b.active).length || 0

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All ({brands?.length || 0})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'active'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            filter === 'inactive'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Inactive ({inactiveCount})
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Brand
        </Button>
      </div>

      <BrandTable brands={filteredBrands || []} onUpdate={mutate} />

      <AddBrandDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={mutate}
      />
    </div>
  )
}
