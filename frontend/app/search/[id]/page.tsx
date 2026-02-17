import { getAdById } from '@/lib/api'
import { AdDetail } from '@/components/search/ad-detail'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdDetailPage({ params }: PageProps) {
  const { id } = await params

  try {
    const ad = await getAdById(id)
    return <AdDetail ad={ad} />
  } catch (error) {
    notFound()
  }
}
