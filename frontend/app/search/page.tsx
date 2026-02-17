import { SearchInterface } from '@/components/search/search-interface'

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black">
          Search Ads
        </h1>
        <p className="mt-2 text-gray-600">
          Search through scraped ads by keywords, hooks, angles, structures, and more.
        </p>
      </div>

      <SearchInterface />
    </div>
  )
}
