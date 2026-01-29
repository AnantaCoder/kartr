/**
 * VideoStudio Component
 * Interactive AI Studio for generating videos and posting to Bluesky
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Video, MessageSquare, Copy, Loader2, Wand2, RefreshCw, Send, CheckCircle, Smartphone, Play } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

interface GeneratedVideo {
    video_url: string;
    video_filename: string;
    prompt: string;
    storyboard?: string;
}

const VideoStudio: React.FC = () => {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);
    const [generatedCaption, setGeneratedCaption] = useState<string>('');
    const [postSuccess, setPostSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Bluesky Connect Modal State
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [blueskyHandle, setBlueskyHandle] = useState('');
    const [blueskyPassword, setBlueskyPassword] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectError, setConnectError] = useState<string | null>(null);

    const handleGenerateVideo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setError(null);
        setGeneratedVideo(null);
        setGeneratedCaption('');
        setPostSuccess(false);

        try {
            const response = await apiClient.post('/videos/generate', {
                prompt,
                use_cached_storyboard: true
            });

            if (response.data.success && response.data.video_url) {
                setGeneratedVideo({
                    video_url: response.data.video_url, // /api/videos/stream/{filename}
                    video_filename: response.data.video_filename,
                    prompt: prompt,
                    storyboard: response.data.storyboard
                });
            } else {
                setError(response.data.error || 'Failed to generate video');
            }
        } catch (err: any) {
            console.error('Video generation error:', err);
            // Handle rate limit specifically
            if (err.response?.status === 429) {
                setError("Rate limit reached (3 videos/min). Please wait a moment.");
            } else {
                setError(err.response?.data?.detail || 'An error occurred while generating the video');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateCaption = async () => {
        if (!generatedVideo) return;

        setIsGeneratingCaption(true);
        setGeneratedCaption('');
        try {
            const captionPrompt = `Write a short, engaging social media caption for a video.
            Video Context: ${generatedVideo.prompt}.
            Constraint: Under 280 characters. Include 2-3 hashtags.`;

            const response = await apiClient.post('/chat/quick', {
                message: captionPrompt
            });

            if (response.data.success && response.data.assistant_message) {
                setGeneratedCaption(response.data.assistant_message.content);
            } else {
                setError('Failed to generate caption');
            }
        } catch (err: any) {
            console.error('Caption generation error:', err);
            setError(err.response?.data?.detail || 'An error occurred while generating the caption');
        } finally {
            setIsGeneratingCaption(false);
        }
    };

    const handlePostToBluesky = async () => {
        if (!generatedVideo || !generatedCaption) return;

        setIsPosting(true);
        setPostSuccess(false);
        try {
            const formData = new FormData();
            formData.append('text', generatedCaption);
            // Pass the filename, backend will resolve path from VIDEOS_DIR
            formData.append('video_path', generatedVideo.video_filename);

            const response = await apiClient.post('/bluesky/post', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setPostSuccess(true);
                setTimeout(() => setPostSuccess(false), 3000);
            } else {
                if (response.data.message && (response.data.message.includes("not linked") || response.data.message.includes("connect your account"))) {
                    setShowConnectModal(true);
                    return;
                }
                setError(response.data.message || 'Failed to post to Bluesky');
            }
        } catch (err: any) {
            console.error('Posting error:', err);
            const status = err.response?.status;
            const detail = err.response?.data?.detail || '';

            if (status === 400 && (detail.includes('not linked') || detail.includes('connect your account'))) {
                setShowConnectModal(true);
                return;
            }
            setError(detail || 'Failed to post to social media.');
        } finally {
            setIsPosting(false);
        }
    };

    const handleConnectBluesky = async () => {
        if (!blueskyHandle || !blueskyPassword) return;

        setIsConnecting(true);
        setConnectError(null);
        try {
            const response = await apiClient.post('/bluesky/connect', {
                identifier: blueskyHandle,
                password: blueskyPassword
            });

            if (response.data.success) {
                setShowConnectModal(false);
                setBlueskyPassword('');
                // Auto-retry posting
                handlePostToBluesky();
            } else {
                setConnectError(response.data.message || "Failed to connect account");
            }
        } catch (err: any) {
            console.error("Connect error:", err);
            setConnectError(err.response?.data?.detail || "Failed to verify credentials.");
        } finally {
            setIsConnecting(false);
        }
    };

    const copyCaption = () => {
        if (generatedCaption) {
            navigator.clipboard.writeText(generatedCaption);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left Column: Controls */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                            <Video className="w-8 h-8 text-blue-400" />
                            AI Video Studio
                        </h2>
                        <p className="text-gray-400">
                            Generate short, cinematic AI videos from text prompts.
                        </p>
                    </div>

                    <form onSubmit={handleGenerateVideo} className="space-y-6 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Video Prompt</label>
                            <Textarea
                                placeholder="Describe the video... e.g. A cyberpunk city street in rain at night, neon lights reflecting on puddles, cinematic 4k"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="min-h-[120px] bg-white/10 border-white/20 text-white placeholder:text-gray-500 resize-none"
                            />
                            <p className="text-xs text-gray-500">Video generation typically takes 1-2 minutes.</p>
                        </div>

                        <Button
                            type="submit"
                            disabled={isGenerating || !prompt.trim()}
                            className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Generating Video...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-2" />
                                    Generate Video
                                </>
                            )}
                        </Button>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        {postSuccess && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-200 text-sm flex items-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Successfully posted to Bluesky!
                            </motion.div>
                        )}
                    </form>

                    {/* Caption Section */}
                    <AnimatePresence>
                        {generatedVideo && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-blue-400" />
                                        AI Caption
                                    </h3>
                                    {!generatedCaption && (
                                        <Button
                                            onClick={handleGenerateCaption}
                                            disabled={isGeneratingCaption}
                                            variant="outline"
                                            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                                        >
                                            {isGeneratingCaption ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Caption'}
                                        </Button>
                                    )}
                                </div>

                                {generatedCaption ? (
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <Textarea
                                                value={generatedCaption}
                                                onChange={(e) => setGeneratedCaption(e.target.value)}
                                                className="min-h-[100px] p-4 pr-12 rounded-xl bg-black/30 text-gray-200 text-sm leading-relaxed border border-white/5 resize-none focus:ring-1 focus:ring-blue-500/50"
                                                placeholder="Caption..."
                                            />
                                            <button
                                                onClick={copyCaption}
                                                className="absolute top-2 right-2 p-2 rounded-lg bg-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 z-10"
                                                title="Copy"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <div className="text-xs text-right mt-1 text-gray-500">
                                                {generatedCaption.length}/300 characters
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-2 gap-4">
                                            <Button
                                                onClick={handleGenerateCaption}
                                                variant="ghost"
                                                size="sm"
                                                className="text-gray-400 hover:text-white"
                                                disabled={isGeneratingCaption}
                                            >
                                                <RefreshCw className={`w-3 h-3 mr-2 ${isGeneratingCaption ? 'animate-spin' : ''}`} />
                                                Regenerate
                                            </Button>

                                            <Button
                                                onClick={handlePostToBluesky}
                                                disabled={isPosting}
                                                className="bg-[#0085ff] hover:bg-[#0060df] text-white shadow-lg shadow-blue-500/20"
                                            >
                                                {isPosting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Posting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="w-4 h-4 mr-2" />
                                                        Post to Bluesky
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">
                                        Generate a video, then create a caption.
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Right Column: Preview */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative lg:h-[600px] flex flex-col"
                >
                    <div className="flex-1 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md overflow-hidden flex items-center justify-center relative p-1">
                        {isGenerating ? (
                            <div className="text-center space-y-4">
                                <div className="relative w-24 h-24 mx-auto">
                                    <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-pulse" />
                                    <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin" />
                                    <Video className="absolute inset-0 m-auto w-8 h-8 text-blue-400 animate-pulse" />
                                </div>
                                <p className="text-blue-300 font-medium animate-pulse">Rendering video...</p>
                                <p className="text-xs text-gray-500 max-w-[200px] mx-auto">This may take 1-2 minutes.</p>
                            </div>
                        ) : generatedVideo ? (
                            <div className="w-full h-full flex flex-col">
                                <video
                                    src={(() => {
                                        const baseUrl = apiClient.defaults.baseURL || '';
                                        // If base URL ends with /api and path starts with /api, remove one /api
                                        if (baseUrl.endsWith('/api') && generatedVideo.video_url.startsWith('/api')) {
                                            return `${baseUrl.slice(0, -4)}${generatedVideo.video_url}`;
                                        }
                                        return `${baseUrl}${generatedVideo.video_url}`;
                                    })()}
                                    controls
                                    className="w-full h-full object-contain rounded-xl"
                                    autoPlay
                                    loop
                                />
                                {generatedVideo.storyboard && (
                                    <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-lg text-xs text-gray-300 max-h-32 overflow-y-auto">
                                        <p className="font-semibold text-white mb-1">Storyboard:</p>
                                        <p className="whitespace-pre-wrap">{generatedVideo.storyboard}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center space-y-4 p-8">
                                <div className="w-20 h-20 mx-auto rounded-2xl bg-white/5 flex items-center justify-center">
                                    <Video className="w-10 h-10 text-gray-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white/50">No Video Generated</h3>
                                    <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
                                        Enter a prompt and click Generate to create an AI video.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Bluesky Connect Modal */}
            <Dialog open={showConnectModal} onOpenChange={setShowConnectModal}>
                <DialogContent className="sm:max-w-[425px] bg-[#1a1f2e] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-blue-400" />
                            Connect Bluesky
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Your account isn't linked yet. Connect it now to enable one-click posting!
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Bluesky Handle</label>
                            <Input
                                placeholder="username.bsky.social"
                                value={blueskyHandle}
                                onChange={(e) => setBlueskyHandle(e.target.value)}
                                className="bg-white/10 border-white/20 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">App Password</label>
                            <Input
                                type="password"
                                placeholder="xxxx-xxxx-xxxx-xxxx"
                                value={blueskyPassword}
                                onChange={(e) => setBlueskyPassword(e.target.value)}
                                className="bg-white/10 border-white/20 text-white"
                            />
                            <p className="text-xs text-gray-500">
                                Generate an App Password in Bluesky Settings {'>'} App Passwords
                            </p>
                        </div>
                        {connectError && (
                            <div className="p-3 rounded-lg bg-red-500/20 text-red-200 text-sm border border-red-500/30">
                                {connectError}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowConnectModal(false)}
                            className="border-white/10 hover:bg-white/10 text-gray-300"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConnectBluesky}
                            className="bg-[#0085ff] hover:bg-[#0060df] text-white"
                            disabled={isConnecting || !blueskyHandle || !blueskyPassword}
                        >
                            {isConnecting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                "Connect & Post"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default VideoStudio;
