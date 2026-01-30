
export type Sponsor = {
  name?: string
  industry?: string
}

export type YoutubeAnalysis = {
  is_sponsored?: boolean
  sponsor_name?: string
  sponsor_industry?: string
  influencer_niche?: string
  content_summary?: string
  sentiment?: string
  key_topics?: string[]
  error?: string
}

export type Recommendation = {
  name: string
  industry?: string
  fit_score: number
  reason: string
  handle?: string
  subscribers?: string
  engagement_rate?: number
}

export type YoutubeResult = {
  video_id: string

  title: string
  description?: string

  thumbnail_url?: string

  view_count?: number
  like_count?: number

  channel_name?: string
  creator_name?: string
  creator_industry?: string


  sponsors?: Sponsor[]

  analysis?: YoutubeAnalysis
  recommendations?: Recommendation[]
  model_used?: string
}
