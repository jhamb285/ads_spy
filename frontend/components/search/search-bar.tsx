'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

interface SearchBarProps {
  query: string
  onQueryChange: (query: string) => void
}

export function SearchBar({ query, onQueryChange }: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search ads by keywords, hooks, angles, structures..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>
      <Button type="submit" size="lg">
        Search
      </Button>
    </form>
  )
}
