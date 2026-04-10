import { BrandList } from '@/components/brands/brand-list'

export default function BrandsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black">
          Brand Management
        </h1>
        <p className="mt-2 text-gray-600">
          Add and manage brands to track. The system automatically scrapes and analyzes ads daily.
        </p>
      </div>

      <BrandList />
    </div>
  )
}
