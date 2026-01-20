export type Sponsor = {
  [key: string]: any
}

export type YoutubeResult = {
  video_title: string
  channel_name: string
  creator_name: string
  creator_industry: string
  published_at: string
  sponsors: Sponsor[]
}
