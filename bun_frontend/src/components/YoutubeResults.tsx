import YoutubeResultCard from "./YoutubeResultCard"
import { YoutubeResult } from "@/features/youtube/youtubeSchema"

type Props = {
  results: YoutubeResult[]
}

const YoutubeResults = ({ results }: Props) => {
  if (results.length === 0) return null

  return (
    <div className="mt-4 w-full max-w-xl space-y-3">
      {results.map((item, index) => (
        <YoutubeResultCard key={index} result={item} />
      ))}
    </div>
  )
}

export default YoutubeResults
