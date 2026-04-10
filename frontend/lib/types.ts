export interface Brand {
  id: number
  avatar: string
  brand_name: string
  active: boolean
  min_active_days: number
  max_ads_override: number | null
  max_daily_ads_override: number | null
  use_overrides: boolean
  created_at: string
  updated_at: string
}

export interface Ad {
  id: number
  ad_id: string
  brand_id: number | null
  brand_name: string | null
  ad_url: string | null
  ad_creative_url: string | null
  ad_creative_link_title: string | null
  ad_creative_link_caption: string | null
  ad_creative_link_description: string | null
  ad_creative_body: string | null
  ad_snapshot_url: string | null
  ad_delivery_start_time: string | null
  page_id: string | null
  page_name: string | null
  transcript: string | null
  image_description: string | null
  image_url: string | null
  video_url: string | null
  gemini_breakdown: any
  hook_analysis: string | null
  angle_analysis: string | null
  structure_analysis: string | null
  why_it_works: string | null
  improvements: string | null
  rewritten_ad: string | null
  is_active: boolean
  ad_type?: 'video' | 'image'
  scraped_at: string
  analyzed_at: string | null
  created_at: string
}
