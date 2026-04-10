import { Brand, Ad } from './types'

// Re-export types for convenience
export type { Brand, Ad } from './types'

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
