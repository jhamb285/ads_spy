'use client'

import { Ad } from '@/lib/types'
import { getProxiedImageUrl } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'

interface AdCardProps {
  ad: Ad
  onClick: (ad: Ad) => void
}

export function AdCard({ ad, onClick }: AdCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div onClick={() => onClick(ad)}>
      <Card className="h-full transition-all hover:shadow-lg cursor-pointer border-black/10">
        {(ad.image_url || ad.video_url) && (
          <div className="relative w-full h-48 bg-gray-100">
            <img
              src={getProxiedImageUrl(ad.image_url)}
              alt={ad.brand_name || 'Ad creative'}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.src = '/placeholder-image.svg';
                target.className = 'w-full h-full object-contain bg-gray-200 p-4';
              }}
            />
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {ad.brand_name && (
                <CardDescription className="truncate">
                  {ad.brand_name}
                </CardDescription>
              )}
              <CardTitle className="text-lg line-clamp-2">
                {ad.ad_creative_link_title || ad.ad_creative_body || 'Untitled Ad'}
              </CardTitle>
            </div>
            <Badge variant={ad.is_active ? 'default' : 'secondary'}>
              {ad.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {ad.ad_creative_body && (
            <p className="text-sm text-gray-600 line-clamp-3">
              {ad.ad_creative_body}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-black/5">
            <span>{formatDate(ad.scraped_at)}</span>
            <span className="flex items-center gap-1">
              View Details
              <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
