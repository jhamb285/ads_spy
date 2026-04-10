'use client'

import { Ad } from '@/lib/types'
import { getProxiedImageUrl } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { CopyButton } from './copy-button'
import { ExternalLink, Calendar, Tag } from 'lucide-react'
import Link from 'next/link'

interface AdDetailProps {
  ad: Ad
}

export function AdDetail({ ad }: AdDetailProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Link href="/search">
            <Button variant="ghost" size="sm" className="mb-2">
              ← Back to Search
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-black">
              {ad.ad_creative_link_title || 'Ad Details'}
            </h1>
            <Badge variant={ad.is_active ? 'default' : 'secondary'}>
              {ad.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          {ad.brand_name && (
            <p className="text-lg text-gray-600">{ad.brand_name}</p>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          <span>ID: {ad.ad_id}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Scraped: {formatDate(ad.scraped_at)}</span>
        </div>
        {ad.ad_url && (
          <a
            href={ad.ad_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            View Original Ad
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {/* Creative Image */}
      {(ad.image_url || ad.video_url) && (
        <Card className="overflow-hidden border-black/10">
          <CardHeader>
            <CardTitle>Ad Creative</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={getProxiedImageUrl(ad.image_url)}
              alt={ad.brand_name || 'Ad creative'}
              className="w-full max-w-2xl rounded-lg"
              onError={(e) => {
                const target = e.currentTarget;
                target.src = '/placeholder-image.svg';
                target.className = 'w-full max-w-2xl rounded-lg bg-gray-200 p-4';
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="breakdown" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="copy">Ad Copy</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        {/* Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-4">
          {ad.hook_analysis && (
            <Card className="border-black/10">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>Hook Analysis</CardTitle>
                  <CopyButton text={ad.hook_analysis} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700">{ad.hook_analysis}</p>
              </CardContent>
            </Card>
          )}

          {ad.angle_analysis && (
            <Card className="border-black/10">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>Angle Analysis</CardTitle>
                  <CopyButton text={ad.angle_analysis} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700">{ad.angle_analysis}</p>
              </CardContent>
            </Card>
          )}

          {ad.structure_analysis && (
            <Card className="border-black/10">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>Structure Analysis</CardTitle>
                  <CopyButton text={ad.structure_analysis} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700">{ad.structure_analysis}</p>
              </CardContent>
            </Card>
          )}

          {!ad.hook_analysis && !ad.angle_analysis && !ad.structure_analysis && (
            <Card className="border-black/10">
              <CardContent className="py-12 text-center text-gray-500">
                No breakdown analysis available for this ad.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Copy Tab */}
        <TabsContent value="copy" className="space-y-4">
          {ad.ad_creative_body && (
            <Card className="border-black/10">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>Ad Body</CardTitle>
                  <CopyButton text={ad.ad_creative_body} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700">{ad.ad_creative_body}</p>
              </CardContent>
            </Card>
          )}

          {ad.ad_creative_link_caption && (
            <Card className="border-black/10">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>Link Caption</CardTitle>
                  <CopyButton text={ad.ad_creative_link_caption} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700">{ad.ad_creative_link_caption}</p>
              </CardContent>
            </Card>
          )}

          {ad.ad_creative_link_description && (
            <Card className="border-black/10">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>Link Description</CardTitle>
                  <CopyButton text={ad.ad_creative_link_description} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700">{ad.ad_creative_link_description}</p>
              </CardContent>
            </Card>
          )}

          {ad.transcript && (
            <Card className="border-black/10">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>Video Transcript</CardTitle>
                  <CopyButton text={ad.transcript} />
                </div>
                <CardDescription>
                  Automatically generated from video audio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700">{ad.transcript}</p>
              </CardContent>
            </Card>
          )}

          {!ad.ad_creative_body && !ad.transcript && (
            <Card className="border-black/10">
              <CardContent className="py-12 text-center text-gray-500">
                No ad copy available.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          {ad.why_it_works && (
            <Card className="border-black/10">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>Why It Works</CardTitle>
                  <CopyButton text={ad.why_it_works} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700">{ad.why_it_works}</p>
              </CardContent>
            </Card>
          )}

          {ad.improvements && (
            <Card className="border-black/10">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>Suggested Improvements</CardTitle>
                  <CopyButton text={ad.improvements} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700">{ad.improvements}</p>
              </CardContent>
            </Card>
          )}

          {ad.rewritten_ad && (
            <Card className="border-black/10">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>Rewritten for Your Offer</CardTitle>
                  <CopyButton text={ad.rewritten_ad} />
                </div>
                <CardDescription>
                  AI-adapted version for your product/service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700">{ad.rewritten_ad}</p>
              </CardContent>
            </Card>
          )}

          {!ad.why_it_works && !ad.improvements && !ad.rewritten_ad && (
            <Card className="border-black/10">
              <CardContent className="py-12 text-center text-gray-500">
                No analysis available for this ad.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
