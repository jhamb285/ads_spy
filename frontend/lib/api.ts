import { Brand, Ad, OutreachCampaign, OutreachLead, OutreachContact } from './types'

// Re-export types for convenience
export type { Brand, Ad, OutreachCampaign, OutreachLead, OutreachContact } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1002'

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

// Brand API
export async function getBrands(activeOnly?: boolean): Promise<Brand[]> {
  const query = activeOnly ? '?active=true' : ''
  return fetchAPI(`/api/brands${query}`)
}

export async function addBrand(data: {
  avatar: string
  brand_name: string
}): Promise<Brand> {
  return fetchAPI('/api/brands', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateBrand(
  id: number,
  data: Partial<{
    avatar: string
    brand_name: string
    active: boolean
  }>
): Promise<Brand> {
  return fetchAPI(`/api/brands/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteBrand(id: number): Promise<{ success: boolean }> {
  return fetchAPI(`/api/brands/${id}`, {
    method: 'DELETE',
  })
}

// Ad API
export async function searchAds(query: string, limit?: number): Promise<Ad[]> {
  const params = new URLSearchParams({ q: query })
  if (limit) params.append('limit', limit.toString())
  return fetchAPI(`/api/ads/search?${params.toString()}`)
}

export interface SearchFilters {
  query?: string
  brand?: string
  dateFrom?: string
  dateTo?: string
  adType?: 'video' | 'image' | 'all'
  isActive?: boolean
  limit?: number
  offset?: number
}

export interface AdCount {
  total: number
  videos: number
  images: number
}

export async function getAds(filters?: SearchFilters): Promise<Ad[]> {
  const params = new URLSearchParams()
  if (filters?.query) params.append('query', filters.query)
  if (filters?.brand) params.append('brand', filters.brand)
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)
  if (filters?.adType) params.append('adType', filters.adType)
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))
  if (filters?.limit) params.append('limit', String(filters.limit))
  if (filters?.offset) params.append('offset', String(filters.offset))

  const queryString = params.toString()
  return fetchAPI(`/api/ads${queryString ? `?${queryString}` : ''}`)
}

export async function getAdCount(filters?: SearchFilters): Promise<AdCount> {
  const params = new URLSearchParams()
  if (filters?.query) params.append('query', filters.query)
  if (filters?.brand) params.append('brand', filters.brand)
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters?.dateTo) params.append('dateTo', filters.dateTo)
  if (filters?.adType) params.append('adType', filters.adType)
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive))

  const queryString = params.toString()
  return fetchAPI(`/api/ads/count${queryString ? `?${queryString}` : ''}`)
}

export async function getBrandNames(): Promise<string[]> {
  return fetchAPI('/api/brands/names')
}

export async function getAdById(id: string): Promise<Ad> {
  return fetchAPI(`/api/ads/${id}`)
}

/**
 * Convert an external image URL to a proxied URL through our API.
 * This caches images locally so expired Facebook CDN URLs still work.
 */
export function getProxiedImageUrl(url: string | null | undefined): string {
  if (!url) return '/placeholder-image.svg'
  // Don't proxy local/relative URLs
  if (url.startsWith('/') || url.startsWith('data:')) return url
  return `${API_BASE_URL}/api/images/proxy?url=${encodeURIComponent(url)}`
}

// Outreach Pipeline API
export async function createCampaign(data: {
  name?: string
  industry: string
  city: string
  max_places?: number
}): Promise<OutreachCampaign> {
  return fetchAPI('/api/outreach/campaigns', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getCampaigns(): Promise<OutreachCampaign[]> {
  return fetchAPI('/api/outreach/campaigns')
}

export async function getCampaign(id: number): Promise<OutreachCampaign> {
  return fetchAPI(`/api/outreach/campaigns/${id}`)
}

export async function getCampaignLeads(
  id: number,
  params?: { status?: string; page?: number; limit?: number }
): Promise<{ leads: OutreachLead[]; total: number }> {
  const query = new URLSearchParams()
  if (params?.status) query.set('status', params.status)
  if (params?.page) query.set('page', String(params.page))
  if (params?.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return fetchAPI(`/api/outreach/campaigns/${id}/leads${qs ? `?${qs}` : ''}`)
}

export async function updateOutreachLead(
  id: number,
  data: Partial<{ fb_ads_url: string; google_ads_url: string; fb_page_url: string }>
): Promise<OutreachLead> {
  return fetchAPI(`/api/outreach/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function discoverSocials(campaignId: number): Promise<{ id: number; status: string }> {
  return fetchAPI(`/api/outreach/campaigns/${campaignId}/discover-socials`, {
    method: 'POST',
  })
}

export async function analyzeCampaign(campaignId: number): Promise<{ id: number; status: string }> {
  return fetchAPI(`/api/outreach/campaigns/${campaignId}/analyze`, {
    method: 'POST',
  })
}

export async function enrichCampaign(campaignId: number): Promise<{ id: number; status: string }> {
  return fetchAPI(`/api/outreach/campaigns/${campaignId}/enrich`, {
    method: 'POST',
  })
}

export async function getCampaignContacts(
  campaignId: number,
  params?: { lead_id?: number; seniority?: string; page?: number; limit?: number }
): Promise<{ contacts: OutreachContact[]; total: number }> {
  const query = new URLSearchParams()
  if (params?.lead_id) query.set('lead_id', String(params.lead_id))
  if (params?.seniority) query.set('seniority', params.seniority)
  if (params?.page) query.set('page', String(params.page))
  if (params?.limit) query.set('limit', String(params.limit))
  const qs = query.toString()
  return fetchAPI(`/api/outreach/campaigns/${campaignId}/contacts${qs ? `?${qs}` : ''}`)
}
