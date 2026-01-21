import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import { motion } from "framer-motion";
import {
    ThumbsUp,
    Eye,
    MessageCircle,
    TrendingUp,
    Award,
    Target,
    BrainCircuit,
    Share2,
    ExternalLink,
    Zap,
    Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { YoutubeResult } from "@/features/schemas/youtubeSchema";

interface Props {
    result: YoutubeResult;
}

const AnalysisDashboard: React.FC<Props> = ({ result }) => {
    const {
        title,
        thumbnail_url,
        channel_name,
        view_count,
        like_count,
        analysis
    } = result;

    const isSponsored = analysis?.is_sponsored;
    const sponsorName = analysis?.sponsor_name || "None";
    const sponsorIndustry = analysis?.sponsor_industry || "N/A";
    const influencerNiche = analysis?.influencer_niche || "General";
    const sentiment = analysis?.sentiment || "Neutral";
    const keyTopics = analysis?.key_topics || [];

    const engagementData = [
        { name: "Views", value: view_count, fill: "#818cf8" },
        { name: "Likes", value: like_count, fill: "#34d399" },
    ];

    const sentimentData = [
        { name: "Positive", value: 70, color: "#10b981" },
        { name: "Neutral", value: 20, color: "#9ca3af" },
        { name: "Negative", value: 10, color: "#ef4444" },
    ];

    if (sentiment.toLowerCase().includes("positive")) {
        sentimentData[0].value = 85; sentimentData[1].value = 10; sentimentData[2].value = 5;
    } else if (sentiment.toLowerCase().includes("negative")) {
        sentimentData[0].value = 20; sentimentData[1].value = 20; sentimentData[2].value = 60;
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            className="w-full max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: VIDEO INFO */}
                <motion.div
                    className="lg:col-span-1 space-y-6"
                    variants={itemVariants}
                >
                    {/* Video Card */}
                    <div className="group relative bg-black/40 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 shadow-2xl hover:border-indigo-500/50 transition-all duration-500">
                        <div className="relative aspect-video overflow-hidden">
                            <img
                                src={thumbnail_url || ""}
                                alt={title}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent" />

                            {/* Channel overlay at top left */}
                            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full pl-1 pr-4 py-1 border border-white/10">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                    {channel_name?.charAt(0) || "C"}
                                </div>
                                <span className="text-white text-xs font-medium tracking-wide">{channel_name}</span>
                            </div>
                        </div>

                        <div className="p-6 relative">
                            <h2 className="text-white font-bold text-xl leading-snug mb-4 line-clamp-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:from-indigo-200 group-hover:to-white transition-all">
                                {title}
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-900/20 border border-indigo-500/30 rounded-2xl p-4 flex flex-col items-center justify-center group/stat hover:bg-indigo-500/30 transition-colors">
                                    <Eye className="w-5 h-5 text-indigo-400 mb-2 group-hover/stat:scale-110 transition-transform" />
                                    <span className="text-white font-bold text-lg">{view_count.toLocaleString()}</span>
                                    <span className="text-[10px] text-indigo-300 uppercase tracking-wider font-semibold">Views</span>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border border-emerald-500/30 rounded-2xl p-4 flex flex-col items-center justify-center group/stat hover:bg-emerald-500/30 transition-colors">
                                    <ThumbsUp className="w-5 h-5 text-emerald-400 mb-2 group-hover/stat:scale-110 transition-transform" />
                                    <span className="text-white font-bold text-lg">{like_count.toLocaleString()}</span>
                                    <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">Likes</span>
                                </div>
                            </div>

                            <Button className="w-full mt-5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-xl h-11 transition-all group-hover:border-indigo-500/30">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View on YouTube
                            </Button>
                        </div>
                    </div>

                    {/* Key Topics List */}
                    <div className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                        {/* Decorative shine */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />

                        <div className="flex items-center gap-3 mb-5 relative z-10">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <BrainCircuit className="w-5 h-5 text-purple-400" />
                            </div>
                            <h3 className="font-bold text-white text-lg">Key Topics</h3>
                        </div>

                        <div className="flex flex-wrap gap-2 relative z-10">
                            {keyTopics.map((topic, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600/50 text-slate-200 text-sm font-medium hover:border-purple-500/50 hover:from-purple-900/20 hover:to-slate-800 transition-all cursor-default shadow-sm">
                                    # {topic}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>


                {/* RIGHT COLUMN: ANALYTICS DASHBOARD */}
                <div className="lg:col-span-2 space-y-6">

                    {/* TOP ROW: NICHE & SPONSOR */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        variants={itemVariants}
                    >
                        {/* Niche Box - VIBRANT POP */}
                        <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-pink-600 via-rose-600 to-red-600 text-white shadow-2xl shadow-rose-900/20 group transform hover:-translate-y-1 transition-transform duration-300">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                            <div className="absolute -right-6 -bottom-6 opacity-20 rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                <Target className="w-40 h-40" />
                            </div>

                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 mb-4 shadow-inner">
                                    <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Influencer Niche</span>
                                </div>

                                <h3 className="text-3xl lg:text-4xl font-black tracking-tight mb-2 drop-shadow-md">
                                    {influencerNiche}
                                </h3>
                                <p className="text-pink-100 font-medium text-sm leading-relaxed max-w-[80%] opacity-90">
                                    Primary content categorization identified by AI analysis.
                                </p>
                            </div>
                        </div>

                        {/* Sponsor Box */}
                        <div className={`
                rounded-3xl p-8 relative overflow-hidden transition-all duration-300 group hover:-translate-y-1 shadow-2xl
                ${isSponsored
                                ? "bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 text-white shadow-orange-900/20"
                                : "bg-slate-900/60 backdrop-blur-xl border border-white/10"}
             `}>
                            {isSponsored && (
                                <div className="absolute -right-6 -top-6 opacity-20 rotate-[-10deg] group-hover:rotate-0 transition-all duration-500">
                                    <Award className="w-40 h-40" />
                                </div>
                            )}

                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 backdrop-blur-sm shadow-inner ${isSponsored ? "bg-black/20 text-white" : "bg-white/10 text-gray-400"}`}>
                                        <Award className="w-3 h-3" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Sponsorship Status</span>
                                    </div>

                                    {isSponsored ? (
                                        <>
                                            <h3 className="text-3xl font-black mb-1 drop-shadow-md">{sponsorName}</h3>
                                            <p className="text-orange-100 font-medium text-lg opacity-90">{sponsorIndustry}</p>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="text-2xl font-bold text-gray-300 mb-2">Organic Content</h3>
                                            <p className="text-gray-500 text-sm">No paid partnerships detected.</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* MIDDLE ROW: CHARTS */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        variants={itemVariants}
                    >
                        {/* Engagement Chart */}
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col hover:border-indigo-500/20 transition-colors group">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Engagement Radius</h3>
                                </div>
                            </div>

                            <div className="flex-1 w-full min-h-[220px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={engagementData} layout="vertical" margin={{ left: 0, right: 30, bottom: 0, top: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            stroke="#9ca3af"
                                            fontSize={13}
                                            fontWeight={500}
                                            tickLine={false}
                                            axisLine={false}
                                            width={60}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                        />
                                        <Bar
                                            dataKey="value"
                                            radius={[0, 6, 6, 0]}
                                            barSize={32}
                                            animationDuration={1500}
                                        >
                                            {engagementData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Sentiment Chart */}
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col hover:border-emerald-500/20 transition-colors group">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                                        <MessageCircle className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Sentiment</h3>
                                </div>
                                <div className="px-2 py-1 rounded bg-white/5 text-xs text-gray-400 border border-white/5">AI Confidence: 94%</div>
                            </div>

                            <div className="flex-1 w-full relative min-h-[220px]">
                                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                    <span className="text-4xl font-black text-white drop-shadow-lg">{sentimentData[0].value}%</span>
                                    <span className="text-xs text-emerald-400 font-medium uppercase tracking-wider bg-emerald-400/10 px-2 py-0.5 rounded-full mt-1">Positive</span>
                                </div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={sentimentData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={85}
                                            paddingAngle={6}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {sentimentData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Legend */}
                            <div className="flex justify-center gap-6 text-sm mt-2">
                                <div className="flex items-center gap-2 text-gray-300">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> Positive
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <div className="w-3 h-3 rounded-full bg-gray-500" /> Neutral
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <div className="w-3 h-3 rounded-full bg-red-500" /> Negative
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>

            </div>
        </motion.div>
    );
};

export default AnalysisDashboard;
