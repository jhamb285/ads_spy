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

export interface OutreachCampaign {
  id: number
  name: string | null
  industry: string
  city: string
  max_places: number
  status: string
  error_message: string | null
  total_leads: number
  total_with_fb: number
  total_analyzed: number
  total_contacts: number
  created_at: string
  updated_at: string
}

export interface OutreachLead {
  id: number
  campaign_id: number
  place_id: string | null
  name: string
  address: string | null
  phone: string | null
  website: string | null
  rating: number | null
  reviews_count: number
  category_name: string | null
  fb_page_url: string | null
  fb_ads_url: string | null
  google_ads_url: string | null
  analysis_id: string | null
  status: string
  raw_data: any
  created_at: string
  updated_at: string
}

export interface OutreachContact {
  id: number
  lead_id: number
  campaign_id: number
  full_name: string | null
  email: string | null
  title: string | null
  seniority: string | null
  linkedin_url: string | null
  company_name: string | null
  company_linkedin_url: string | null
  email_status: string
  lead_name?: string
  raw_data: any
  created_at: string
}
