import React, { useState } from "react";
import Header from "../components/Header.tsx";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { fetchYoutubeResults } from "../features/auth/slices/youtubeSlice.ts";
import type { RootState, AppDispatch } from "../app/store.ts";
import YoutubeResults from "../components/YoutubeResults.tsx";
import BackgroundVideo from "../components/BackgroundVideo.jsx";

const YouTubeAnalysis: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { results, loading, error } = useSelector(
    (state: RootState) => state.youtube
  );

  const [videoUrl, setVideoUrl] = useState("");

  const handleSearch = () => {
    if (!videoUrl) return;
    dispatch(fetchYoutubeResults(videoUrl));
  };

  return (
    <>
      <BackgroundVideo />
      <Header />

      <motion.section
        className="relative flex flex-col items-center justify-center text-center px-6 py-28
                   overflow-hidden min-h-[100dvh]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* BACKGROUND GLOW */}
        <div className="absolute -top-32 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-500/20 blur-3xl" />

        {/* Title */}
        <h1 className="text-3xl md:text-4xl text-white font-semibold leading-tight">
          AI-Powered YouTube
          <span className="text-purple-900"> Creator</span> &
          <span className="text-purple-900"> Sponsor</span> Insights
        </h1>

        {/* Subtitle */}
        <p className="mt-3 max-w-xl text-gray-400 text-sm md:text-base">
          Instantly analyze YouTube videos to discover sponsorships,
          brand presence, audience quality, and growth signals.
        </p>

        {/* Search Box */}
        <motion.div
          className="mt-10 flex w-full max-w-xl items-center gap-2 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="relative flex-1 ">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Paste YouTube video URL"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="pl-9 h-11 rounded-lg
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
              AI is analyzing video data…
            </p>
          )}

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          {!loading && results.length > 0 && (
            <div className="rounded-2xl border border-white/10
                            bg-white/5 backdrop-blur-xl p-6">
              <YoutubeResults results={results} />
            </div>
          )}

          {!loading && results.length === 0 && !error && (
            <p className="text-sm text-gray-500 text-center">
              Start by pasting a YouTube video URL
            </p>
          )}
        </div>
      </motion.section>
    </>
  );
};

export default YouTubeAnalysis;
