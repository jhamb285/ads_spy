'use client'

import { use, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  getCampaign,
  getCampaignLeads,
  getCampaignContacts,
  updateOutreachLead,
  discoverSocials,
  analyzeCampaign,
  enrichCampaign,
} from '@/lib/api'
import type { OutreachCampaign, OutreachLead, OutreachContact } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

const PIPELINE_STEPS = ['Scraping', 'Socials', 'Analysis', 'Enrichment'] as const
const PAGE_SIZE = 50

type StepState = 'pending' | 'active' | 'done'

function getPipelineStates(status: string): StepState[] {
  const map: Record<string, StepState[]> = {
    created:             ['pending', 'pending', 'pending', 'pending'],
    scraping:            ['active',  'pending', 'pending', 'pending'],
    scraped:             ['done',    'pending', 'pending', 'pending'],
    discovering_socials: ['done',    'active',  'pending', 'pending'],
    socials_done:        ['done',    'done',    'pending', 'pending'],
    analyzing:           ['done',    'done',    'active',  'pending'],
    analyzed:            ['done',    'done',    'done',    'pending'],
    enriching:           ['done',    'done',    'done',    'active' ],
    enriched:            ['done',    'done',    'done',    'done'   ],
    error:               ['pending', 'pending', 'pending', 'pending'],
  }
  return map[status] ?? ['pending', 'pending', 'pending', 'pending']
}

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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PipelineProgress({ status }: { status: string }) {
  const states = getPipelineStates(status)
  return (
    <div className="flex items-center gap-0">
      {PIPELINE_STEPS.map((step, i) => {
        const state = states[i]
        const isLast = i === PIPELINE_STEPS.length - 1
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
                  state === 'done' && 'border-green-500 bg-green-50',
                  state === 'active' && 'border-blue-500 bg-blue-50',
                  state === 'pending' && 'border-gray-200 bg-white'
                )}
              >
                {state === 'done' && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {state === 'active' && (
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                )}
                {state === 'pending' && (
                  <Circle className="h-5 w-5 text-gray-300" />
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  state === 'done' && 'text-green-600',
                  state === 'active' && 'text-blue-600',
                  state === 'pending' && 'text-gray-400'
                )}
              >
                {step}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  'h-0.5 w-12 mx-1 mb-5',
                  states[i + 1] === 'pending' ? 'bg-gray-200' : 'bg-green-400'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

interface EditableCellProps {
  leadId: number
  field: 'fb_ads_url' | 'google_ads_url'
  initialValue: string | null
}

function EditableCell({ leadId, field, initialValue }: EditableCellProps) {
  const [value, setValue] = useState(initialValue ?? '')
  const [saving, setSaving] = useState(false)

  const handleBlur = async () => {
    const trimmed = value.trim()
    if (trimmed === (initialValue ?? '')) return
    setSaving(true)
    try {
      await updateOutreachLead(leadId, { [field]: trimmed || null })
    } catch {
      toast.error('Failed to save URL')
      setValue(initialValue ?? '')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      disabled={saving}
      placeholder="—"
      className="h-7 text-xs w-36 min-w-0"
    />
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ id: string }>
}

export default function CampaignDetailPage(props: PageProps) {
  const params = use(props.params)
  const campaignId = Number(params.id)
  const router = useRouter()

  const [campaign, setCampaign] = useState<OutreachCampaign | null>(null)
  const [leads, setLeads] = useState<OutreachLead[]>([])
  const [leadsTotal, setLeadsTotal] = useState(0)
  const [leadsPage, setLeadsPage] = useState(1)
  const [contacts, setContacts] = useState<OutreachContact[]>([])
  const [contactsTotal, setContactsTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchCampaign = useCallback(async () => {
    try {
      const data = await getCampaign(campaignId)
      setCampaign(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaign')
    }
  }, [campaignId])

  const fetchLeads = useCallback(async (page = 1) => {
    try {
      const data = await getCampaignLeads(campaignId, { page, limit: PAGE_SIZE })
      setLeads(data.leads)
      setLeadsTotal(data.total)
    } catch {
      // Non-fatal — campaign error already shown
    }
  }, [campaignId])

  const fetchContacts = useCallback(async () => {
    try {
      const data = await getCampaignContacts(campaignId, { limit: 200 })
      setContacts(data.contacts)
      setContactsTotal(data.total)
    } catch {
      // Non-fatal
    }
  }, [campaignId])

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([fetchCampaign(), fetchLeads(1), fetchContacts()])
      setLoading(false)
    }
    init()
  }, [fetchCampaign, fetchLeads, fetchContacts])

  // Re-fetch leads when page changes
  useEffect(() => {
    if (!loading) fetchLeads(leadsPage)
  }, [leadsPage]) // eslint-disable-line react-hooks/exhaustive-deps

  // Poll while processing
  useEffect(() => {
    if (!campaign) return
    if (campaign.status.endsWith('ing')) {
      pollRef.current = setInterval(async () => {
        await fetchCampaign()
        await fetchLeads(leadsPage)
        await fetchContacts()
      }, 5000)
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
  }, [campaign?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  const runAction = async (
    label: string,
    key: string,
    fn: () => Promise<unknown>
  ) => {
    setActionLoading(key)
    try {
      await fn()
      toast.success(`${label} started`)
      await fetchCampaign()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to start ${label}`)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500 text-sm">
        Loading campaign...
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/outreach')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>{error ?? 'Campaign not found'}</span>
        </div>
      </div>
    )
  }

  const status = campaign.status
  const isProcessing = status.endsWith('ing')
  const campaignName = campaign.name ?? `${campaign.industry} — ${campaign.city}`
  const totalLeadsPages = Math.ceil(leadsTotal / PAGE_SIZE)

  const canDiscoverSocials = ['scraped', 'socials_done', 'analyzed', 'enriched'].includes(status)
  const canAnalyze = ['socials_done', 'analyzed', 'enriched'].includes(status)
  const canEnrich = ['analyzed', 'enriched'].includes(status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/outreach')}
          className="mt-1 shrink-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-black truncate">
              {campaignName}
            </h1>
            <Badge variant={getStatusVariant(status)}>
              {getStatusLabel(status)}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {campaign.city} &middot; max {campaign.max_places} places &middot;{' '}
            {campaign.total_leads} leads &middot; {campaign.total_contacts} contacts
          </p>
        </div>
      </div>

      {/* Error message */}
      {status === 'error' && campaign.error_message && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{campaign.error_message}</span>
        </div>
      )}

      {/* Pipeline progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pipeline Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <PipelineProgress status={status} />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="leads">
        <TabsList>
          <TabsTrigger value="leads">Leads ({leadsTotal})</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({contactsTotal})</TabsTrigger>
          <TabsTrigger value="analysis">Analysis ({campaign.total_analyzed})</TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------------------- */}
        {/* LEADS TAB                                                        */}
        {/* ---------------------------------------------------------------- */}
        <TabsContent value="leads" className="space-y-4 mt-4">
          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              disabled={!canDiscoverSocials || isProcessing || actionLoading !== null}
              onClick={() =>
                runAction('Discover Socials', 'socials', () => discoverSocials(campaignId))
              }
            >
              {actionLoading === 'socials' && (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              )}
              Auto-Discover Socials
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!canAnalyze || isProcessing || actionLoading !== null}
              onClick={() =>
                runAction('Analysis', 'analyze', () => analyzeCampaign(campaignId))
              }
            >
              {actionLoading === 'analyze' && (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              )}
              Run Analysis
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!canEnrich || isProcessing || actionLoading !== null}
              onClick={() =>
                runAction('Enrichment', 'enrich', () => enrichCampaign(campaignId))
              }
            >
              {actionLoading === 'enrich' && (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              )}
              Enrich Leads
            </Button>
          </div>

          {leads.length === 0 ? (
            <div className="rounded-lg border border-gray-200 p-12 text-center text-sm text-gray-500">
              {isProcessing ? 'Scraping in progress — leads will appear here shortly.' : 'No leads found.'}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                    <TableHead className="text-right">Reviews</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>FB Page</TableHead>
                    <TableHead>FB Ads URL</TableHead>
                    <TableHead>Google Ads URL</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium whitespace-nowrap max-w-[180px] truncate">
                        {lead.name}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate">
                        {lead.website ? (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {lead.website.replace(/^https?:\/\//, '')}
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {lead.phone ?? <span className="text-gray-400">—</span>}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {lead.rating != null ? lead.rating.toFixed(1) : '—'}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {lead.reviews_count}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 whitespace-nowrap max-w-[140px] truncate">
                        {lead.category_name ?? '—'}
                      </TableCell>
                      <TableCell>
                        {lead.fb_page_url ? (
                          <a
                            href={lead.fb_page_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Page
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <EditableCell
                          leadId={lead.id}
                          field="fb_ads_url"
                          initialValue={lead.fb_ads_url}
                        />
                      </TableCell>
                      <TableCell>
                        <EditableCell
                          leadId={lead.id}
                          field="google_ads_url"
                          initialValue={lead.google_ads_url}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {lead.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalLeadsPages > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Page {leadsPage} of {totalLeadsPages} &middot; {leadsTotal} leads total
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={leadsPage === 1}
                  onClick={() => setLeadsPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={leadsPage === totalLeadsPages}
                  onClick={() => setLeadsPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        {/* CONTACTS TAB                                                     */}
        {/* ---------------------------------------------------------------- */}
        <TabsContent value="contacts" className="mt-4">
          {contacts.length === 0 ? (
            <div className="rounded-lg border border-gray-200 p-12 text-center text-sm text-gray-500">
              No contacts found. Run enrichment to discover decision-makers.
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Seniority</TableHead>
                    <TableHead>LinkedIn</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Lead</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {contact.full_name ?? <span className="text-gray-400">—</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {contact.email ? (
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {contact.email}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {contact.title ?? <span className="text-gray-400">—</span>}
                      </TableCell>
                      <TableCell>
                        {contact.seniority ? (
                          <Badge variant="outline" className="text-xs">
                            {contact.seniority}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {contact.linkedin_url ? (
                          <a
                            href={contact.linkedin_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline text-xs"
                          >
                            Profile
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700 max-w-[160px] truncate">
                        {contact.company_name ?? <span className="text-gray-400">—</span>}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {contact.lead_name ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {contactsTotal > 200 && (
                <p className="p-3 text-xs text-gray-500 border-t border-gray-100">
                  Showing first 200 of {contactsTotal} contacts.
                </p>
              )}
            </div>
          )}
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        {/* ANALYSIS TAB                                                     */}
        {/* ---------------------------------------------------------------- */}
        <TabsContent value="analysis" className="mt-4">
          {leads.length === 0 ? (
            <div className="rounded-lg border border-gray-200 p-12 text-center text-sm text-gray-500">
              No leads yet.
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>FB Page</TableHead>
                    <TableHead>Analysis ID</TableHead>
                    <TableHead>Analyzed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads
                    .filter((lead) => lead.fb_page_url || lead.analysis_id)
                    .map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>
                          {lead.fb_page_url ? (
                            <a
                              href={lead.fb_page_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline text-xs"
                            >
                              {lead.fb_page_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                            </a>
                          ) : (
                            <span className="text-gray-400 text-xs">No FB page found</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-gray-600">
                          {lead.analysis_id ?? <span className="text-gray-400">—</span>}
                        </TableCell>
                        <TableCell>
                          {lead.analysis_id ? (
                            <Badge variant="default" className="text-xs">Yes</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-gray-400">No</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {leads.filter((l) => l.fb_page_url || l.analysis_id).length === 0 && (
                <div className="p-12 text-center text-sm text-gray-500">
                  No leads with Facebook pages yet. Run socials discovery first.
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
