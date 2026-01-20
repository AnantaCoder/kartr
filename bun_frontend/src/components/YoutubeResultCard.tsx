import { YoutubeResult } from "@/features/youtube/youtubeSchema"
import dummyimg from "../assets/auth/analytics_img2.png";


type Props = {
  result: YoutubeResult
}

const YoutubeResultCard = ({ result }: Props) => {
  return (
     <div className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md">
      
      {/* THUMBNAIL */}
      <div className="w-full bg-gray-100">
        <img
          src={dummyimg}
          alt={result.video_title}
          className="w-full object-cover"
        />
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-3 text-base text-gray-800">
        
        {/* TITLE */}
        <p className="text-center text-base font-semibold leading-snug">
          {result.video_title}
        </p>

        {/* DETAILS */}
        <div className="space-y-2 text-left">
          
          <p>
            <span className="font-bold">Creator:</span>{" "}
            <span className="text-gray-900">{result.creator_name}</span>
          </p>

          <p>
            <span className="font-bold">Published:</span>{" "}
            <span className="text-gray-900">{result.published_at}</span>
          </p>

          <p>
            <span className="font-bold">Industry:</span>{" "}
            <span className="text-gray-900">{result.creator_industry}</span>
          </p>

          {result.sponsors.length > 0 && (
            <div>
              <p className="font-bold">Sponsors:</p>
              <ul className="ml-6 list-disc text-gray-900 space-y-1">
                {result.sponsors.map((sponsor, index) => (
                  <li key={index}>{sponsor}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default YoutubeResultCard
