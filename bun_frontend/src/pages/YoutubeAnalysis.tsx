import React, { useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import BackgroundVideo from "../components/common/BackgroundVideo";
import { motion } from "framer-motion";
import { Search, AlertCircle, Loader2, Youtube } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { fetchYoutubeResults, clearResults } from "../store/slices/youtubeSlice";
import type { RootState, AppDispatch } from "../store/store";
import YoutubeResults from "../features/youtube/components/YoutubeResults";

const YouTubeAnalysis: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { results, loading, error } = useSelector(
    (state: RootState) => state.youtube
  );

  const [videoUrl, setVideoUrl] = useState("");

  const handleSearch = () => {
    if (!videoUrl.trim()) return;
    dispatch(fetchYoutubeResults(videoUrl.trim()));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setVideoUrl("");
    dispatch(clearResults());
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

        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 shadow-lg shadow-red-500/30 mb-6"
        >
          <Youtube className="w-8 h-8 text-white" />
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl text-white font-semibold leading-tight">
          AI-Powered YouTube
          <span className="text-purple-400"> Creator</span> &
          <span className="text-pink-400"> Sponsor</span> Insights
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
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Paste YouTube video URL (e.g., https://youtube.com/watch?v=...)"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 h-12 rounded-xl
                         bg-white/10 border-white/20
                         text-white placeholder:text-gray-400
                         focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         transition-all"
            />
          </div>

          <Button
            onClick={handleSearch}
            disabled={loading || !videoUrl.trim()}
            className="h-12 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Analyze"
            )}
          </Button>
        </motion.div>

        {/* RESULTS SLOT */}
        <div className="mt-6 w-full max-w-7xl">
          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3 py-8"
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" />
              </div>
              <p className="text-sm text-gray-400">
                AI is analyzing video content...
              </p>
              <p className="text-xs text-gray-500">
                This may take a few seconds
              </p>
            </motion.div>
          )}

          {/* Error State */}
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3 py-6 px-4 rounded-2xl bg-red-500/10 border border-red-500/30"
            >
              <AlertCircle className="w-8 h-8 text-red-400" />
              <div className="text-center">
                <p className="text-sm text-red-400 font-medium">Analysis Failed</p>
                <p className="text-xs text-red-300 mt-1">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="mt-2 border-red-500/50 text-red-400 hover:bg-red-500/10 cursor-pointer"
              >
                Try Again
              </Button>
            </motion.div>
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Analysis Results</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  Clear
                </Button>
              </div>
              <YoutubeResults results={results} />
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && results.length === 0 && !error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-500 text-center py-8"
            >
              Paste a YouTube video URL above to get AI-powered insights
            </motion.p>
          )}
        </div>
      </motion.section>

      <Footer />
    </>
  );
};

export default YouTubeAnalysis;
