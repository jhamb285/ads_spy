'use client'

import { useState } from 'react'
import { Ad } from '@/lib/types'
import { getProxiedImageUrl } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import {
  Copy,
  Check,
  ExternalLink,
  Video,
  Image as ImageIcon,
  Calendar,
  Hash,
  Eye
} from 'lucide-react'
import { toast } from 'sonner'

interface AdDetailModalProps {
  ad: Ad | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdDetailModal({ ad, open, onOpenChange }: AdDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!ad) return null

  async function copyToClipboard(text: string, fieldName: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      toast.success(`Copied ${fieldName}`)

      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  function CopyButton({ text, fieldName }: { text: string; fieldName: string }) {
    const isCopied = copiedField === fieldName

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => copyToClipboard(text, fieldName)}
        className="h-8 transition-all hover:bg-gray-100"
      >
        {isCopied ? (
          <Check className="h-4 w-4 text-green-600 animate-in zoom-in-50 duration-200" />
        ) : (
          <Copy className="h-4 w-4 text-gray-600 hover:text-black" />
        )}
      </Button>
    )
  }

  function TextField({
    label,
    value,
    fieldName
  }: {
    label: string
    value: string | null
    fieldName: string
  }) {
    if (!value) return null

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            {label}
          </h3>
          <CopyButton text={value} fieldName={fieldName} />
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{value}</p>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <DialogTitle className="text-2xl">
                {ad.brand_name || 'Unknown Brand'}
              </DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {ad.ad_id}
                </Badge>
                {ad.is_active && <Badge className="bg-green-500">Active</Badge>}
                {!ad.is_active && <Badge variant="secondary">Inactive</Badge>}
                {ad.ad_type === 'video' && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Video className="h-3 w-3" />
                    Video Ad
                  </Badge>
                )}
                {ad.ad_type === 'image' && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    Image Ad
                  </Badge>
                )}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(ad.scraped_at).toLocaleDateString()}
                </Badge>
              </DialogDescription>
            </div>

            {ad.ad_url && (
              <a
                href={ad.ad_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View on Facebook
                </Button>
              </a>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="content" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Ad Content</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="media">Media & Assets</TabsTrigger>
          </TabsList>

          {/* Tab 1: Ad Content */}
          <TabsContent value="content" className="space-y-6 mt-6">
            <TextField
              label="Ad Body Text"
              value={ad.ad_creative_body}
              fieldName="Ad Body"
            />

            <TextField
              label="Link Title"
              value={ad.ad_creative_link_title}
              fieldName="Link Title"
            />

            <TextField
              label="Link Caption"
              value={ad.ad_creative_link_caption}
              fieldName="Link Caption"
            />

            <TextField
              label="Link Description"
              value={ad.ad_creative_link_description}
              fieldName="Link Description"
            />

            {ad.transcript && (
              <TextField
                label="Video Transcript"
                value={ad.transcript}
                fieldName="Transcript"
              />
            )}

            {ad.image_description && (
              <TextField
                label="Image Description (AI-Generated)"
                value={ad.image_description}
                fieldName="Image Description"
              />
            )}
          </TabsContent>

          {/* Tab 2: Analysis */}
          <TabsContent value="analysis" className="space-y-6 mt-6">
            <TextField
              label="Hook Analysis"
              value={ad.hook_analysis}
              fieldName="Hook Analysis"
            />

            <TextField
              label="Angle Identification"
              value={ad.angle_analysis}
              fieldName="Angle Analysis"
            />

            <TextField
              label="Structure Explanation"
              value={ad.structure_analysis}
              fieldName="Structure Analysis"
            />

            <TextField
              label="Why It Works"
              value={ad.why_it_works}
              fieldName="Why It Works"
            />

            <TextField
              label="How to Improve"
              value={ad.improvements}
              fieldName="Improvements"
            />

            <TextField
              label="Rewritten Ad"
              value={ad.rewritten_ad}
              fieldName="Rewritten Ad"
            />

            {ad.gemini_breakdown && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Gemini Creative Breakdown
                  </h3>
                  <CopyButton
                    text={JSON.stringify(ad.gemini_breakdown, null, 2)}
                    fieldName="Gemini Breakdown"
                  />
                </div>
                <Card>
                  <CardContent className="p-4">
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                      {JSON.stringify(ad.gemini_breakdown, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Tab 3: Media & Assets */}
          <TabsContent value="media" className="space-y-6 mt-6">
            {ad.video_url && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Video
                </h3>
                <Card>
                  <CardContent className="p-4">
                    <video
                      controls
                      className="w-full rounded-lg"
                      src={ad.video_url}
                    >
                      Your browser does not support the video tag.
                    </video>
                    <div className="mt-3 flex items-center gap-2">
                      <CopyButton text={ad.video_url} fieldName="Video URL" />
                      <a
                        href={ad.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Open Video URL
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {ad.image_url && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Image
                </h3>
                <Card>
                  <CardContent className="p-4">
                    <img
                      src={getProxiedImageUrl(ad.image_url)}
                      alt="Ad Creative"
                      className="w-full rounded-lg"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src = '/placeholder-image.svg';
                        target.className = 'w-full rounded-lg bg-gray-200 p-4';
                      }}
                    />
                    <div className="mt-3 flex items-center gap-2">
                      <CopyButton text={ad.image_url} fieldName="Image URL" />
                      <a
                        href={ad.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Open Image URL
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {ad.ad_creative_url && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Ad Creative URL
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={ad.ad_creative_url}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50"
                  />
                  <CopyButton text={ad.ad_creative_url} fieldName="Creative URL" />
                </div>
              </div>
            )}

            {ad.ad_snapshot_url && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Ad Snapshot URL
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={ad.ad_snapshot_url}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50"
                  />
                  <CopyButton text={ad.ad_snapshot_url} fieldName="Snapshot URL" />
                  <a
                    href={ad.ad_snapshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Metadata
              </h3>
              <div className="grid gap-3 md:grid-cols-2 text-sm">
                {ad.page_name && (
                  <div>
                    <span className="text-gray-500">Page Name:</span>{' '}
                    <span className="font-medium">{ad.page_name}</span>
                  </div>
                )}
                {ad.page_id && (
                  <div>
                    <span className="text-gray-500">Page ID:</span>{' '}
                    <span className="font-medium">{ad.page_id}</span>
                  </div>
                )}
                {ad.ad_delivery_start_time && (
                  <div>
                    <span className="text-gray-500">Started:</span>{' '}
                    <span className="font-medium">
                      {new Date(ad.ad_delivery_start_time).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {ad.analyzed_at && (
                  <div>
                    <span className="text-gray-500">Analyzed:</span>{' '}
                    <span className="font-medium">
                      {new Date(ad.analyzed_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
