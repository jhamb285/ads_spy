import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <AlertCircle className="h-12 w-12 text-gray-400" />
      <h2 className="text-2xl font-bold text-black">Ad Not Found</h2>
      <p className="text-gray-600">
        The ad you're looking for doesn't exist or has been removed.
      </p>
      <Link href="/search">
        <Button>Back to Search</Button>
      </Link>
    </div>
  )
}
