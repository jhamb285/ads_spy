'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getCampaigns, createCampaign } from '@/lib/api'
import type { OutreachCampaign } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

function getStatusVariant(status: string): BadgeVariant {
  if (status === 'error') return 'destructive'
  if (status.endsWith('ing')) return 'secondary'
  return 'default'
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    created: 'Created',
    scraping: 'Scraping...',
    scraped: 'Scraped',
    discovering_socials: 'Finding Socials...',
    socials_done: 'Socials Done',
    analyzing: 'Analyzing...',
    analyzed: 'Analyzed',
    enriching: 'Enriching...',
    enriched: 'Enriched',
    error: 'Error',
  }
  return labels[status] ?? status
}

function hasActiveProcessing(campaigns: OutreachCampaign[]): boolean {
  return campaigns.some((c) => c.status.endsWith('ing'))
}

export default function OutreachPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<OutreachCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    industry: '',
    city: '',
    max_places: 50,
  })
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchCampaigns = async () => {
    try {
      const data = await getCampaigns()
      setCampaigns(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  // Poll every 5s while any campaign is processing
  useEffect(() => {
    if (hasActiveProcessing(campaigns)) {
      pollRef.current = setInterval(fetchCampaigns, 5000)
    } else {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
      }
    }
  }, [campaigns])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.industry.trim() || !formData.city.trim()) return

    setSubmitting(true)
    try {
      const campaign = await createCampaign({
        industry: formData.industry.trim(),
        city: formData.city.trim(),
        max_places: formData.max_places,
      })
      toast.success('Campaign created — scraping has started')
      setDialogOpen(false)
      setFormData({ industry: '', city: '', max_places: 50 })
      router.push(`/outreach/${campaign.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create campaign')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">
            Outreach Pipeline
          </h1>
          <p className="mt-2 text-gray-600">
            Scrape local businesses, discover social presence, analyze ad activity, and enrich contacts.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Outreach Campaign</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Input
                  id="industry"
                  placeholder="e.g., Dentist, HVAC, Auto Repair"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="e.g., Austin TX, London UK"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_places">Max Places</Label>
                <Input
                  id="max_places"
                  type="number"
                  min={1}
                  max={500}
                  value={formData.max_places}
                  onChange={(e) =>
                    setFormData({ ...formData, max_places: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-gray-500">Maximum number of businesses to scrape (1–500)</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Campaign'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <div className="p-8 text-center text-gray-500 text-sm">Loading campaigns...</div>
          )}

          {error && (
            <div className="p-8 text-center text-red-600 text-sm">
              Failed to load campaigns: {error}
            </div>
          )}

          {!loading && !error && campaigns.length === 0 && (
            <div className="p-12 text-center text-gray-500 text-sm">
              No campaigns yet. Create your first campaign to get started.
            </div>
          )}

          {!loading && !error && campaigns.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                  <TableHead className="text-right">Contacts</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow
                    key={campaign.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => router.push(`/outreach/${campaign.id}`)}
                  >
                    <TableCell className="font-medium">
                      {campaign.name ?? `${campaign.industry} — ${campaign.city}`}
                    </TableCell>
                    <TableCell className="text-gray-600">{campaign.industry}</TableCell>
                    <TableCell className="text-gray-600">{campaign.city}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(campaign.status)}>
                        {getStatusLabel(campaign.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{campaign.total_leads}</TableCell>
                    <TableCell className="text-right tabular-nums">{campaign.total_contacts}</TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
