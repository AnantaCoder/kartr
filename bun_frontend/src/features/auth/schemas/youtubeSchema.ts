
export type Sponsor = {
  name?: string
  industry?: string
}

export type YoutubeAnalysis = {
  is_sponsored?: boolean
  sponsor_name?: string
  sponsor_industry?: string
  influencer_niche?: string
  key_topics?: string[]
  error?: string
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
}