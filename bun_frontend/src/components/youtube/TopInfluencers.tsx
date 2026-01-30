
import React from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Star, ExternalLink, Award } from 'lucide-react';

interface Influencer {
    name: string;
    handle: string;
    engagement_rate: number;
    subscribers: string;
    score: number;
}

interface TopInfluencersProps {
    influencers: Influencer[];
    niche: string;
    themeColor: string;
}

const TopInfluencers: React.FC<TopInfluencersProps> = ({ influencers, niche, themeColor }) => {
    return (
        <div className="mt-12 space-y-8">
            <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl bg-${themeColor}-500/10 border border-${themeColor}-500/20 text-${themeColor}-400`}>
                    <Users className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-wider">Top {niche} Creators</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-emerald-400">Perfect alignment for your brand</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {influencers.map((influencer, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group relative bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 hover:border-emerald-500/30 transition-all duration-500 shadow-2xl overflow-hidden"
                    >
                        {/* Status Badge */}
                        <div className="absolute top-6 right-6 p-2 bg-emerald-500/10 rounded-full">
                            <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                        </div>

                        <div className="flex flex-col items-center text-center mb-8">
                            <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-${themeColor}-500 to-${themeColor}-800 flex items-center justify-center text-3xl font-black text-white mb-4 border-4 border-white/5`}>
                                {influencer.name.charAt(0)}
                            </div>
                            <h4 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors">
                                {influencer.name}
                            </h4>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                                {influencer.handle}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/5 rounded-2xl p-4 text-center">
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Eng. Rate</p>
                                <p className="text-lg font-black text-white">{influencer.engagement_rate}%</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 text-center">
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Followers</p>
                                <p className="text-lg font-black text-white">{influencer.subscribers}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 mb-8">
                            <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-emerald-400" />
                                <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Alignment Score</span>
                            </div>
                            <span className="text-lg font-black text-emerald-400">{influencer.score}%</span>
                        </div>

                        <button className="w-full py-4 rounded-[24px] bg-white/5 border border-white/10 text-white font-black text-[11px] uppercase tracking-widest group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-all flex items-center justify-center gap-3">
                            Partner Now
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default TopInfluencers;
