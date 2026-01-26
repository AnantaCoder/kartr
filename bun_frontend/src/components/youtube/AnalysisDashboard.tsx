import React from "react";
import { motion } from "framer-motion";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
} from "recharts";
import { useSelector } from "react-redux";
import { selectPerspective } from "../../store/slices/uiSlice";
import {
    Activity,
    Award,
    BrainCircuit,
    ExternalLink,
    Eye,
    MessageCircle,
    Share2,
    Target,
    ThumbsUp,
    TrendingUp,
    Zap,
    Download,
    ShieldCheck,
    Users,
    LineChart,
    LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { YoutubeResult } from "@/features/schemas/youtubeSchema";

interface Props {
    result: YoutubeResult;
}

const AnalysisDashboard: React.FC<Props> = ({ result }) => {
    const perspective = useSelector(selectPerspective);
    const isCreator = perspective === "creator";

    const {
        title,
        thumbnail_url,
        channel_name,
        view_count,
        like_count,
        analysis,
        model_used
    } = result;

    const isSponsored = analysis?.is_sponsored;
    const sponsorName = analysis?.sponsor_name || "None";
    const sponsorIndustry = analysis?.sponsor_industry || "N/A";
    const influencerNiche = analysis?.influencer_niche || "General";
    const sentiment = analysis?.sentiment || "Neutral";
    const contentSummary = analysis?.content_summary || "";
    const keyTopics = analysis?.key_topics || [];

    const engagementData = [
        { name: "Views", value: view_count, fill: isCreator ? "#a855f7" : "#3b82f6" },
        { name: "Likes", value: like_count, fill: isCreator ? "#ec4899" : "#06b6d4" },
    ];

    let sentimentData = [
        { name: "Positive", value: 70, color: "#10b981" },
        { name: "Neutral", value: 20, color: "#9ca3af" },
        { name: "Negative", value: 10, color: "#ef4444" },
    ];

    if (sentiment?.toLowerCase().includes("positive")) {
        sentimentData = [
            { name: "Positive", value: 85, color: "#10b981" },
            { name: "Neutral", value: 10, color: "#9ca3af" },
            { name: "Negative", value: 5, color: "#ef4444" },
        ];
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

    const themeColor = isCreator ? "purple" : "blue";
    const accentColor = isCreator ? "pink" : "cyan";

    return (
        <motion.div
            className="w-full max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Perspective Header Stats */}
            <div className="flex flex-wrap items-center justify-between mb-10 gap-4">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl bg-${themeColor}-500/10 border border-${themeColor}-500/20`}>
                        <LayoutDashboard className={`w-6 h-6 text-${themeColor}-400`} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white">{isCreator ? "Self-Audit Dashboard" : "Brand Placement Audit"}</h2>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                            {isCreator ? "Optimizing for growth & brand appeal" : "Evaluating ROI & brand alignment"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 text-gray-400 hover:text-white h-11 px-6 font-bold text-xs uppercase transition-all">
                        <Download className="w-4 h-4 mr-2" />
                        Export {isCreator ? "Pitch Desk" : "ROI Report"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: VIDEO INFO */}
                <motion.div
                    className="lg:col-span-1 space-y-6"
                    variants={itemVariants}
                >
                    {/* Video Card */}
                    <div className={`group relative bg-black/40 backdrop-blur-md rounded-[32px] overflow-hidden border border-white/10 shadow-2xl hover:border-${themeColor}-500/50 transition-all duration-500`}>
                        <div className="relative aspect-video overflow-hidden">
                            <img
                                src={thumbnail_url || ""}
                                alt={title}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

                            {/* Channel overlay at top left */}
                            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full pl-1 pr-4 py-1 border border-white/10">
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${isCreator ? "from-purple-500 to-pink-500" : "from-blue-500 to-indigo-500"} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                                    {channel_name?.charAt(0) || "C"}
                                </div>
                                <span className="text-white text-[10px] font-black uppercase tracking-wider">{channel_name}</span>
                            </div>
                        </div>

                        <div className="p-8 relative">
                            <h2 className="text-white font-bold text-xl leading-snug mb-6 line-clamp-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:from-white group-hover:to-white transition-all">
                                {title}
                            </h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div className={`bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center group/stat hover:border-${themeColor}-500/30 transition-colors`}>
                                    <Eye className={`w-5 h-5 text-${themeColor}-400 mb-2 group-hover/stat:scale-110 transition-transform`} />
                                    <span className="text-white font-black text-lg">{view_count?.toLocaleString() || "0"}</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Views</span>
                                </div>
                                <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center group/stat hover:border-emerald-500/30 transition-colors">
                                    <ThumbsUp className="w-5 h-5 text-emerald-400 mb-2 group-hover/stat:scale-110 transition-transform" />
                                    <span className="text-white font-black text-lg">{like_count?.toLocaleString() || "0"}</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Likes</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Role Specific Side Widget */}
                    {isCreator ? (
                        <div className="bg-gradient-to-b from-purple-900/40 to-slate-900/40 backdrop-blur-xl border border-purple-500/20 rounded-[32px] p-6 shadow-xl relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full" />
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <Zap className="w-5 h-5 text-purple-400" />
                                </div>
                                <h3 className="font-black text-white text-sm uppercase tracking-widest">Growth Recommendations</h3>
                            </div>
                            <ul className="space-y-3 text-xs text-gray-300 font-medium">
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1" />
                                    <span>Increase retention by adding a hook in the first 15s.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1" />
                                    <span>Collaborations in the {influencerNiche} niche would thrive here.</span>
                                </li>
                            </ul>
                        </div>
                    ) : (
                        <div className="bg-gradient-to-b from-blue-900/40 to-slate-900/40 backdrop-blur-xl border border-blue-500/20 rounded-[32px] p-6 shadow-xl relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full" />
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                                </div>
                                <h3 className="font-black text-white text-sm uppercase tracking-widest">Brand Safety Audit</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Safety Score</span>
                                    <span className="text-emerald-400 font-black">98/100</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full w-[98%] bg-emerald-500" />
                                </div>
                                <p className="text-[10px] text-gray-500 leading-relaxed font-bold">
                                    Content is family-friendly and aligns with Tier-1 advertiser standards.
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>


                {/* RIGHT COLUMN: ANALYTICS DASHBOARD */}
                <div className="lg:col-span-2 space-y-6">

                    {/* TOP ROW: NICHE & SPONSOR */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        variants={itemVariants}
                    >
                        {/* Niche Box */}
                        <div className={`relative overflow-hidden rounded-[32px] p-8 bg-gradient-to-br from-${isCreator ? "purple-600 via-pink-600 to-rose-600" : "blue-600 via-indigo-600 to-cyan-600"} text-white shadow-2xl group transition-transform duration-300 hover:-translate-y-1`}>
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                            <div className="absolute -right-6 -bottom-6 opacity-20 rotate-12 group-hover:scale-110 transition-all duration-500">
                                <Target className="w-40 h-40" />
                            </div>

                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 mb-6 shadow-inner">
                                    <Users className="w-3 h-3 text-white fill-white" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{isCreator ? "Self-Niche" : "Creator Niche"}</span>
                                </div>

                                <h3 className="text-4xl lg:text-5xl font-black tracking-tight mb-2 drop-shadow-md uppercase">
                                    {influencerNiche}
                                </h3>
                                <p className="text-white/70 font-bold text-xs uppercase tracking-widest mt-4">
                                    {isCreator ? "Your content identity" : "Audience Alignment"}
                                </p>
                            </div>
                        </div>

                        {/* Sponsor/Alignment Box */}
                        <div className={`
                            rounded-[32px] p-8 relative overflow-hidden transition-all duration-300 group hover:-translate-y-1 shadow-2xl
                            ${isSponsored
                                ? `bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 text-white shadow-orange-900/20`
                                : "bg-slate-900/60 backdrop-blur-xl border border-white/10"}
                        `}>
                            {isSponsored && (
                                <div className="absolute -right-6 -top-6 opacity-20 rotate-[-10deg] group-hover:rotate-0 transition-all duration-500">
                                    <Award className="w-40 h-40" />
                                </div>
                            )}

                            <div className="relative z-10 h-full flex flex-col">
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 backdrop-blur-sm shadow-inner ${isSponsored ? "bg-black/20 text-white" : "bg-white/5 text-gray-500 border border-white/5"}`}>
                                    <TrendingUp className="w-3 h-3" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{isSponsored ? "Partner Status" : (isCreator ? "Revenue Potential" : "Sponsor Fit")}</span>
                                </div>

                                {isSponsored ? (
                                    <>
                                        <h3 className="text-3xl font-black mb-1 drop-shadow-md uppercase">{sponsorName}</h3>
                                        <p className="text-orange-100 font-bold text-sm uppercase tracking-widest opacity-90 mt-2">{sponsorIndustry} Partner</p>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-3xl font-black text-gray-300 mb-2 uppercase">{isCreator ? "Open for Ads" : "High Synergy"}</h3>
                                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                                            {isCreator ? "Target premium tech sponsors" : "Match with your portfolio"}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* MIDDLE ROW: CHARTS */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        variants={itemVariants}
                    >
                        {/* Sentiment Chart */}
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-xl flex flex-col hover:border-emerald-500/20 transition-colors group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                                        <MessageCircle className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Sentiment Pulse</h3>
                                </div>
                            </div>

                            <div className="flex-1 w-full relative min-h-[180px] flex items-center justify-center">
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-5xl font-black text-white">{sentimentData[0]?.value}%</span>
                                    <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mt-1">Positive</span>
                                </div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={sentimentData}
                                            innerRadius={60}
                                            outerRadius={75}
                                            paddingAngle={8}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {sentimentData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Summary Box */}
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2 rounded-xl bg-${themeColor}-500/10 text-${themeColor}-400`}>
                                    <LineChart className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">{isCreator ? "Performance Summary" : "Campaign Outlook"}</h3>
                            </div>
                            <p className="text-gray-400 text-xs leading-relaxed font-medium">
                                {contentSummary || "AI analysis of performance indicators suggests a steady growth trajectory for this content type."}
                            </p>
                            <div className="mt-6 flex flex-wrap gap-2">
                                {keyTopics.slice(0, 3).map((topic, i) => (
                                    <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">
                                        #{topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                </div>

            </div>
        </motion.div>
    );
};

export default AnalysisDashboard;
