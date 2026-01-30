import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import BackgroundVideo from "../components/common/BackgroundVideo";
import { motion } from "framer-motion";
import { Search, AlertCircle, Loader2, Youtube, Lock, Upload, FileVideo } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSelector, useDispatch } from "react-redux";
import { fetchYoutubeResults, clearResults, analyzeVideoFile } from "../store/slices/youtubeSlice";
import { selectPerspective } from "../store/slices/uiSlice";
import type { RootState, AppDispatch } from "../store/store";
import YoutubeResults from "../components/youtube/YoutubeResults";
import { useAppSelector } from "../store/hooks";
import { selectIsAuthenticated, selectAuthInitialized } from "../store/slices/authSlice";

const YouTubeAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const perspective = useSelector(selectPerspective);
  const { results, loading, error } = useSelector(
    (state: RootState) => state.youtube
  );

  const isCreator = perspective === "creator";
  // Auth check
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectAuthInitialized);
  const [videoUrl, setVideoUrl] = useState("");

  const handleSearch = () => {
    if (!videoUrl.trim()) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/YoutubeAnalysis' } });
      return;
    }
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

  // Show loading while checking auth
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

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
        <div className={`absolute -top-32 -z-10 h-[500px] w-[500px] rounded-full blur-[120px] ${isCreator ? "bg-purple-600/10" : "bg-blue-600/10"}`} />

        {/* Icon */}
        <motion.div
          key={perspective}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          className={`inline-flex items-center justify-center w-20 h-20 rounded-[28px] shadow-2xl mb-8 ${isCreator ? "bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-500/30" : "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30"}`}
        >
          <Youtube className="w-10 h-10 text-white" />
        </motion.div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl text-white font-black leading-tight mb-4">
          {isCreator ? "Creator " : "Brand "}
          <span className={isCreator ? "text-purple-400" : "text-blue-400"}>
            Deep Dive
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-3 max-w-2xl text-gray-400 text-base md:text-lg leading-relaxed">
          {isCreator
            ? "Audit your content performance, analyze audience sentiment, and optimize your videos for maximum growth and sponsorship appeal."
            : "Instantly evaluate creator alignment, brand-safety scores, and sponsorship history to make data-driven partnership decisions."
          }
        </p>

        {/* Tabs & Search Box */}
        <motion.div
          className="mt-12 flex flex-col w-full max-w-2xl gap-4 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 p-1 rounded-xl">
              <TabsTrigger value="link" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">
                <Youtube className="w-4 h-4 mr-2" />
                Analyze Link
              </TabsTrigger>
              <TabsTrigger value="upload" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">
                <Upload className="w-4 h-4 mr-2" />
                Upload Video
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="mt-0">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-5 h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors z-10" />
                <textarea
                  placeholder={isCreator
                    ? "Paste video URLs, Channel ID, or Channel Link..."
                    : "Paste YouTube URLs, Channel ID, or Channel Link..."}
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleSearch();
                    }
                  }}
                  className="w-full pl-12 pr-4 py-4 min-h-[120px] rounded-2xl
                             bg-white/5 border border-white/10
                             text-white placeholder:text-gray-500
                             focus:ring-2 focus:ring-purple-500 focus:outline-none
                             transition-all shadow-inner resize-none"
                />
                <div className="absolute right-4 bottom-4 text-[10px] text-gray-500">
                  Press Ctrl + Enter to run
                </div>
              </div>

              <Button
                onClick={handleSearch}
                disabled={loading || !videoUrl.trim()}
                className={`w-full mt-4 h-14 px-8 rounded-2xl font-bold shadow-2xl transition-all cursor-pointer disabled:opacity-50 ${isCreator ? "bg-purple-600 hover:bg-purple-700 shadow-purple-500/20" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"}`}
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  `Run AI Audit (${videoUrl.split(/[,\n]/).filter(u => u.trim()).length} links)`
                )}
              </Button>
            </TabsContent>

            <TabsContent value="upload" className="mt-0">
              <div
                className="relative flex flex-col items-center justify-center w-full min-h-[200px] rounded-2xl border-2 border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-colors p-8 cursor-pointer group"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type === 'video/mp4') {
                    const formData = new FormData();
                    formData.append('file', file);
                    dispatch(analyzeVideoFile(formData));
                  }
                }}
              >
                <input
                  type="file"
                  accept="video/mp4"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append('file', file);
                      dispatch(analyzeVideoFile(formData));
                    }
                  }}
                />

                {loading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                    <p className="text-white font-medium">Analyzing Video...</p>
                    <p className="text-gray-400 text-sm mt-2">This may take a minute</p>
                  </div>
                ) : (
                  <>
                    <div className="p-4 rounded-full bg-white/5 mb-4 group-hover:bg-white/10 transition-colors">
                      <FileVideo className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="text-lg text-white font-medium mb-1">Drag & drop video file</p>
                    <p className="text-gray-400 text-sm">or click to browse (MP4 only)</p>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Quick Examples */}
        {!loading && results.length === 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mr-2">Try examples:</span>
            {[
              { label: "MKBHD (Tech)", url: "https://www.youtube.com/watch?v=123" },
              { label: "MrBeast (Viral)", url: "https://www.youtube.com/watch?v=456" },
              { label: "Ali Abdaal (Productivity)", url: "https://www.youtube.com/watch?v=789" }
            ].map((ex, i) => (
              <button
                key={i}
                onClick={() => setVideoUrl(ex.url)}
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-xs text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                {ex.label}
              </button>
            ))}
          </div>
        )}

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
      </motion.section >

      <Footer />
    </>
  );
};

export default YouTubeAnalysis;
