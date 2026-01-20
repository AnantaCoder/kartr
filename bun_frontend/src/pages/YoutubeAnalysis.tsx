import React from "react";
import Header from "../components/Header.tsx";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import analyticsImg from "../assets/auth/analytics_img2.png";
import { useDispatch, useSelector } from "react-redux"
import { fetchYoutubeResults } from "../features/auth/youtubeSlice.ts"
import type { RootState, AppDispatch } from "@/store"
import  YoutubeResult  from "@/features/youtubeSchema"
import YoutubeResults from "../components/YoutubeResults.tsx";



const YouTubeAnalysis: React.FC = () => {
  // ✅ REDUX SETUP
  const dispatch = useDispatch<AppDispatch>()
  const { results, loading, error } = useSelector(
    (state: RootState) => state.youtube
  )

  const handleSearch = () => {
    dispatch(fetchYoutubeResults("mrbeast"))
  }

  return (
    <>
      <Header />

      <motion.section
    className="relative flex flex-col items-center justify-center text-center px-6 py-28
               overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    {/* BACKGROUND GLOW */}
    <div className="absolute -top-32 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-500/20 blur-3xl" />

    {/* Illustration Card */}
    <motion.div
      className="relative mb-10 rounded-2xl border border-white/10
                 bg-white/5 backdrop-blur-xl shadow-2xl p-4"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <img
        src={analyticsImg}
        alt="Analyze YouTube Channel"
        className="md:w-[520px] w-full max-w-[700px]
                   rounded-xl opacity-95 pointer-events-none"
      />

      {/* AI STATUS */}
      <div className="absolute -top-4 left-6 rounded-full
                      bg-rose-300 px-4 py-1 text-xs
                      text-black border border-white/10">
        AI is analyzing creators & sponsors
      </div>
    </motion.div>

    {/* Title */}
    <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
      AI-Powered YouTube
      <span className="text-indigo-400"> Creator</span> &
      <span className="text-purple-400"> Sponsor</span> Insights
    </h1>

    {/* Subtitle */}
    <p className="mt-3 max-w-xl text-gray-400 text-sm md:text-base">
      Instantly analyze YouTube channels to discover sponsorships,
      brand presence, audience quality, and growth signals.
    </p>

    {/* Search Box */}
    <motion.div
      className="mt-10 flex w-full max-w-xl items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2
                           h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search channel or paste YouTube URL"
          className="pl-9 h-11 rounded-md
                     bg-white/5 border-grey/50
                     text-white placeholder:text-gray-400
                     focus:ring-indigo-500"
        />
      </div>

      <Button
        onClick={handleSearch}
        className="h-11 px-6 bg-indigo-500 hover:bg-indigo-600"
      >
        Analyze
      </Button>
    </motion.div>

    {/* RESULTS SLOT */}
    <div className="mt-12 w-full max-w-5xl">
      {loading && (
        <p className="text-sm text-gray-400 text-center">
          AI is analyzing channel data…
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500 text-center">
          {error}
        </p>
      )}

      {!loading && results.length > 0 && (
        <div className="rounded-2xl border border-white/10
                        bg-white/5 backdrop-blur-xl p-6">
          <YoutubeResults results={results} />
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <p className="text-sm text-gray-500 text-center">
          Start by searching a YouTube channel
        </p>
      )}
    </div>
  </motion.section>    </>
  )
}


export default YouTubeAnalysis;
