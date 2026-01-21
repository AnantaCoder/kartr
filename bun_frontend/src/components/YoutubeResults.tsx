import React from "react"
import type { YoutubeResult } from "@/features/auth/schemas/youtubeSchema"
import YoutubeResultCard from "./YoutubeResultCard"

interface Props {
  results: YoutubeResult[]
}

const YoutubeResults: React.FC<Props> = ({ results }) => {
  if (results.length === 0) {
    return <p className="text-sm text-gray-500 text-center">No results found</p>
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map((result) => (
        <YoutubeResultCard key={result.video_id} result={result} />
      ))}
    </div>
  )
}

export default YoutubeResults
